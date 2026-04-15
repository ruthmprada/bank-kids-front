import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import DashboardParent from "./pages/DashboardParent";
import DashboardChild from "./pages/DashboardChild";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicLayout from "./layouts/PublicLayout";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>

      {/* 🌐 RUTAS PÚBLICAS */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* 🔒 RUTAS PRIVADAS */}
      <Route
        path="/parent"
        element={
          <ProtectedRoute role="parent">
            <DashboardParent />
          </ProtectedRoute>
        }
      />

      <Route
        path="/child"
        element={
          <ProtectedRoute role="child">
            <DashboardChild />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;
