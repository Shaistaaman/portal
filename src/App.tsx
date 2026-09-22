import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthContext";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import AdminLoginPage from "@/pages/auth/AdminLoginPage";
import AgentLoginPage from "@/pages/auth/AgentLoginPage";
import OwnerLoginPage from "@/pages/auth/OwnerLoginPage";
import PlaceholderPage from "@/pages/PlaceholderPage";
import RoleRoute from "@/routes/RoleRoute";
import AdminLayout from "@/layouts/AdminLayout";
import DashboardPage from "@/pages/admin/DashboardPage";
import UserListPage from "@/pages/admin/user-management/UserListPage";
import AddUserPage from "@/pages/admin/user-management/AddUserPage";
import EditUserPage from "@/pages/admin/user-management/EditUserPage";
import AdminPropertiesPage from "@/pages/admin/PropertiesPage";
import AdminAddPropertyPage from "@/pages/admin/AddPropertyPage";
import AdminEditPropertyPage from "@/pages/admin/EditPropertyPage";
import AdminExperiencesPage from "@/pages/admin/ExperiencesPage";
import AdminAddExperiencePage from "@/pages/admin/AddExperiencePage";
import AdminEditExperiencePage from "@/pages/admin/EditExperiencePage";
import OwnerPropertiesPage from "@/pages/owner/PropertiesPage";
import OwnerAddPropertyPage from "@/pages/owner/AddPropertyPage";
import OwnerEditPropertyPage from "@/pages/owner/EditPropertyPage";
import AgentPropertiesPage from "@/pages/agent/PropertiesPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Client-facing (reached via marketing CTAs) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/client/*"
            element={
              <RoleRoute allow={["client"]}>
                <PlaceholderPage title="Client Dashboard" />
              </RoleRoute>
            }
          />

          {/* Staff-facing, each scoped to its own login surface */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <RoleRoute allow={["admin"]}>
                <AdminLayout />
              </RoleRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="user-management" element={<UserListPage />} />
            <Route path="user-management/add-user" element={<AddUserPage />} />
            <Route
              path="user-management/edit-user/:id"
              element={<EditUserPage />}
            />
            <Route path="properties" element={<AdminPropertiesPage />} />
            <Route
              path="properties/add-property"
              element={<AdminAddPropertyPage />}
            />
            <Route
              path="properties/:id/edit"
              element={<AdminEditPropertyPage />}
            />
            <Route path="experiences" element={<AdminExperiencesPage />} />
            <Route
              path="experiences/add-experience"
              element={<AdminAddExperiencePage />}
            />
            <Route
              path="experiences/:id/edit"
              element={<AdminEditExperiencePage />}
            />
            <Route
              path="packages"
              element={<PlaceholderPage title="Packages" />}
            />
            <Route
              path="calendar"
              element={<PlaceholderPage title="Calendar" />}
            />
            <Route
              path="financial"
              element={<PlaceholderPage title="Financial" />}
            />
            <Route
              path="settings"
              element={<PlaceholderPage title="Settings" />}
            />
          </Route>

          <Route path="/agent/login" element={<AgentLoginPage />} />
          <Route
            path="/agent/dashboard"
            element={
              <RoleRoute allow={["agent"]}>
                <PlaceholderPage title="Agent Dashboard" fullScreen />
              </RoleRoute>
            }
          />
          <Route
            path="/agent/properties"
            element={
              <RoleRoute allow={["agent"]}>
                <AgentPropertiesPage />
              </RoleRoute>
            }
          />

          <Route path="/owner/login" element={<OwnerLoginPage />} />
          <Route
            path="/owner/dashboard"
            element={
              <RoleRoute allow={["owner"]}>
                <PlaceholderPage title="Owner Dashboard" fullScreen />
              </RoleRoute>
            }
          />
          <Route
            path="/owner/properties"
            element={
              <RoleRoute allow={["owner"]}>
                <OwnerPropertiesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/owner/properties/add-property"
            element={
              <RoleRoute allow={["owner"]}>
                <OwnerAddPropertyPage />
              </RoleRoute>
            }
          />
          <Route
            path="/owner/properties/:id/edit"
            element={
              <RoleRoute allow={["owner"]}>
                <OwnerEditPropertyPage />
              </RoleRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
