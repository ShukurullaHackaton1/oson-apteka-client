// src/App.jsx
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Login";
import LoadingSpinner from "./components/UI/LoadingSpinner";
import DebugPanel from "./components/DebugPanel";

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  // Начальная загрузка
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
        />

        <Route
          path="/*"
          element={
            isAuthenticated ? <Layout /> : <Navigate to="/login" replace />
          }
        />
      </Routes>

      {/* Debug Panel - faqat development rejimida */}
      {import.meta.env.DEV && <DebugPanel />}
    </>
  );
}

export default App;
