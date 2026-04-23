import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import Login from "./pages/Login";
import CampaignList from "./pages/CampaignList";
import CampaignNew from "./pages/CampaignNew";
import CampaignDetail from "./pages/CampaignDetail";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/campaigns"
        element={
          <RequireAuth>
            <CampaignList />
          </RequireAuth>
        }
      />
      <Route
        path="/campaigns/new"
        element={
          <RequireAuth>
            <CampaignNew />
          </RequireAuth>
        }
      />
      <Route
        path="/campaigns/:id"
        element={
          <RequireAuth>
            <CampaignDetail />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/campaigns" replace />} />
    </Routes>
  );
}
