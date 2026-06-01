import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Users from './pages/Users.jsx';
import Assets from './pages/Assets.jsx';
import Assignments from './pages/Assignments.jsx';
import Materials from './pages/Materials.jsx';
import MaterialIssues from './pages/MaterialIssues.jsx';
import Inventory from './pages/Inventory.jsx';
import MyAssets from './pages/MyAssets.jsx';
import { getUser } from './services/api.js';

function ProtectedRoute({ children }) {
  return getUser() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="assets" element={<Assets />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="materials" element={<Materials />} />
        <Route path="material-issues" element={<MaterialIssues />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="my-assets" element={<MyAssets />} />
      </Route>
    </Routes>
  );
}
