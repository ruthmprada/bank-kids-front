import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import DashboardParent from "./pages/DashboardParent";
import DashboardChild from "./pages/DashboardChild";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicLayout from "./layouts/PublicLayout";
import NotFound from "./pages/NotFound";
import TransactionDetail from "./pages/TransactionDetail";

function App() {
  return (
    <Routes>

      {/* 🌐 RUTAS PÚBLICAS */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* 🔒 DASHBOARD PARENT */}
      <Route
        path="/parent"
        element={
          <ProtectedRoute role="parent">
            <DashboardParent />
          </ProtectedRoute>
        }
      />

      {/* 🔒 DASHBOARD CHILD */}
      <Route
        path="/child"
        element={
          <ProtectedRoute role="child">
            <DashboardChild />
          </ProtectedRoute>
        }
      />

      {/* 🔒 DETALLE TRANSACCIÓN */}
      <Route
        path="/transaction/:id"
        element={
          <ProtectedRoute roles={["parent", "child"]}>
            <TransactionDetail />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;