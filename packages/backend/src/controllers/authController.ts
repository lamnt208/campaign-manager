import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models";
import { registerSchema, loginSchema } from "../validators/authSchemas";
import { AppError } from "../middleware/errorHandler";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body);

    const existing = await User.findOne({ where: { email: input.email } });
    if (existing) {
      throw new AppError(409, "email already registered");
    }

    const password_hash = await bcrypt.hash(input.password, 10);
    const user = await User.create({
      email: input.email,
      name: input.name,
      password_hash,
    });

    const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);

    const user = await User.findOne({ where: { email: input.email } });
    if (!user) {
      throw new AppError(401, "invalid credentials");
    }

    const valid = await bcrypt.compare(input.password, user.password_hash);
    if (!valid) {
      throw new AppError(401, "invalid credentials");
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    next(err);
  }
}
