import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import DailyWellness from "./pages/DailyWellness";
import ProtectedRoute from "./components/protectedRoute"
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/daily-wellness"
          element={
            <ProtectedRoute>
              <DailyWellness />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
