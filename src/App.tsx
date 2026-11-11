import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "./lib/auth";
import { AuthPage } from "./features/auth/AuthPage";
import { BoardsPage } from "./features/boards/BoardsPage";
import { BoardPage } from "./features/board/BoardPage";

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/boards" element={<RequireAuth><BoardsPage /></RequireAuth>} />
      <Route path="/boards/:boardId" element={<RequireAuth><BoardPage /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/boards" replace />} />
    </Routes>
  );
}
