import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminPanel from "./AdminPanel/AdminPanel";
import Login from "./Login";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const authToken = localStorage.getItem("authToken");
  return authToken ? children : <Navigate to="/login" />;
};

const App = () => {
  const Navigate = useNavigate();
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
