import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Admin from "./components/Admin";
import FileUpload from "./components/FileUpload";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("jwt_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login Page */}
        <Route
          path="/login"
          element={
            <Login
              onLogin={() => {
                window.location.href = "/";
              }}
            />
          }
        />

        {/* Protected Admin Page */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* Protected File Upload Page */}
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <FileUpload />
            </ProtectedRoute>
          }
        />

        {/* Any unknown URL */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;