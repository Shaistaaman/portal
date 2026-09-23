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
import AdminPackagesPage from "@/pages/admin/PackagesPage";
import AdminAddPackagePage from "@/pages/admin/AddPackagePage";
import AdminEditPackagePage from "@/pages/admin/EditPackagePage";
import AdminSettingsPage from "@/pages/admin/SettingsPage";
import RoleSettingsPage from "@/pages/settings/RoleSettingsPage";
import AdminBlogsPage from "@/pages/admin/BlogsPage";
import AdminAddBlogPage from "@/pages/admin/AddBlogPage";
import AdminEditBlogPage from "@/pages/admin/EditBlogPage";
import AdminCalendarPage from "@/pages/admin/CalendarPage";
import RoleCalendarPage from "@/pages/calendar/RoleCalendarPage";
import AdminFinancialPage from "@/pages/admin/FinancialPage";
import AdminAddFinancialRecordPage from "@/pages/admin/AddFinancialRecordPage";
import AdminNotificationsPage from "@/pages/admin/NotificationsPage";
import AddBookingPage from "@/pages/calendar/AddBookingPage";
import EditBookingPage from "@/pages/calendar/EditBookingPage";
import {
  StandaloneAddBookingPage,
  StandaloneEditBookingPage,
} from "@/pages/calendar/StandaloneBookingPage";
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
            path="/client/dashboard"
            element={
              <RoleRoute allow={["client"]}>
                <PlaceholderPage title="Client Dashboard" fullScreen />
              </RoleRoute>
            }
          />
          <Route
            path="/client/settings"
            element={
              <RoleRoute allow={["client"]}>
                <RoleSettingsPage role="client" />
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
            <Route path="packages" element={<AdminPackagesPage />} />
            <Route
              path="packages/add-package"
              element={<AdminAddPackagePage />}
            />
            <Route
              path="packages/:id/edit"
              element={<AdminEditPackagePage />}
            />
            <Route path="calendar" element={<AdminCalendarPage />} />
            <Route
              path="calendar/add-booking"
              element={<AddBookingPage role="admin" />}
            />
            <Route
              path="calendar/:id/edit"
              element={<EditBookingPage role="admin" />}
            />
            <Route path="financial" element={<AdminFinancialPage />} />
            <Route
              path="financial/add-file"
              element={<AdminAddFinancialRecordPage />}
            />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="blogs" element={<AdminBlogsPage />} />
            <Route path="blogs/add-blog" element={<AdminAddBlogPage />} />
            <Route path="blogs/:id/edit" element={<AdminEditBlogPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
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
          <Route
            path="/agent/calendar"
            element={
              <RoleRoute allow={["agent"]}>
                <RoleCalendarPage role="agent" />
              </RoleRoute>
            }
          />
          <Route
            path="/agent/calendar/add-booking"
            element={
              <RoleRoute allow={["agent"]}>
                <StandaloneAddBookingPage role="agent" />
              </RoleRoute>
            }
          />
          <Route
            path="/agent/calendar/:id/edit"
            element={
              <RoleRoute allow={["agent"]}>
                <StandaloneEditBookingPage role="agent" />
              </RoleRoute>
            }
          />
          <Route
            path="/agent/settings"
            element={
              <RoleRoute allow={["agent"]}>
                <RoleSettingsPage role="agent" />
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
          <Route
            path="/owner/calendar"
            element={
              <RoleRoute allow={["owner"]}>
                <RoleCalendarPage role="owner" />
              </RoleRoute>
            }
          />
          <Route
            path="/owner/calendar/add-booking"
            element={
              <RoleRoute allow={["owner"]}>
                <StandaloneAddBookingPage role="owner" />
              </RoleRoute>
            }
          />
          <Route
            path="/owner/calendar/:id/edit"
            element={
              <RoleRoute allow={["owner"]}>
                <StandaloneEditBookingPage role="owner" />
              </RoleRoute>
            }
          />
          <Route
            path="/owner/settings"
            element={
              <RoleRoute allow={["owner"]}>
                <RoleSettingsPage role="owner" />
              </RoleRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
