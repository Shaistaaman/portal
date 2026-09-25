import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthContext";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import AdminLoginPage from "@/pages/auth/AdminLoginPage";
import AgentLoginPage from "@/pages/auth/AgentLoginPage";
import OwnerLoginPage from "@/pages/auth/OwnerLoginPage";
import RoleRoute from "@/routes/RoleRoute";
import AdminLayout from "@/layouts/AdminLayout";
import OwnerLayout from "@/layouts/OwnerLayout";
import DashboardPage from "@/pages/admin/DashboardPage";
import OwnerDashboardPage from "@/pages/owner/DashboardPage";
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
import RoleSearchResultsPage from "@/pages/search/RoleSearchResultsPage";
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
import OwnerFinancialPage from "@/pages/owner/FinancialPage";
import OwnerNotificationsPage from "@/pages/owner/NotificationsPage";
import AgentPropertiesPage from "@/pages/agent/PropertiesPage";
import AgentDashboardPage from "@/pages/agent/DashboardPage";
import AgentSettingsPage from "@/pages/agent/SettingsPage";
import AgentNotificationsPage from "@/pages/agent/NotificationsPage";
import AgentFinancialPage from "@/pages/agent/FinancialPage";
import SharedPropertyDetailPage from "@/pages/shared/PropertyDetailPage";
import SharedContactInfoPage from "@/pages/shared/ContactInfoPage";
import SharedRequestExperiencePage from "@/pages/shared/RequestExperiencePage";
import AgentLayout from "@/layouts/AgentLayout";
import ClientNotificationsPage from "@/pages/client/NotificationsPage";
import ClientLayout from "@/layouts/ClientLayout";
import ClientDashboardPage from "@/pages/client/DashboardPage";
import ClientBookingsPage from "@/pages/client/BookingsPage";
import ClientWishlistPage from "@/pages/client/WishlistPage";
import ClientSettingsPage from "@/pages/client/SettingsPage";

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
            path="/client"
            element={
              <RoleRoute allow={["client"]}>
                <ClientLayout />
              </RoleRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ClientDashboardPage />} />
            <Route path="bookings" element={<ClientBookingsPage />} />
            <Route path="wishlist" element={<ClientWishlistPage />} />
            <Route path="settings" element={<ClientSettingsPage />} />
            <Route path="notifications" element={<ClientNotificationsPage />} />
            <Route path="search" element={<RoleSearchResultsPage />} />
            <Route
              path="property/:propertyId"
              element={<SharedPropertyDetailPage />}
            />
            <Route
              path="property/:propertyId/request-experience"
              element={<SharedRequestExperiencePage />}
            />
            <Route
              path="property/:propertyId/contact"
              element={<SharedContactInfoPage />}
            />
          </Route>

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
            path="/agent"
            element={
              <RoleRoute allow={["agent"]}>
                <AgentLayout />
              </RoleRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AgentDashboardPage />} />
            <Route path="properties" element={<AgentPropertiesPage />} />
            <Route
              path="calendar"
              element={<RoleCalendarPage role="agent" />}
            />
            <Route path="search" element={<RoleSearchResultsPage />} />
            <Route
              path="property/:propertyId"
              element={<SharedPropertyDetailPage />}
            />
            <Route
              path="property/:propertyId/request-experience"
              element={<SharedRequestExperiencePage />}
            />
            <Route
              path="property/:propertyId/contact"
              element={<SharedContactInfoPage />}
            />
            <Route
              path="calendar/add-booking"
              element={<StandaloneAddBookingPage role="agent" />}
            />
            <Route
              path="calendar/:id/edit"
              element={<StandaloneEditBookingPage role="agent" />}
            />
            <Route path="financial" element={<AgentFinancialPage />} />
            <Route path="settings" element={<AgentSettingsPage />} />
            <Route path="notifications" element={<AgentNotificationsPage />} />
          </Route>

          <Route path="/owner/login" element={<OwnerLoginPage />} />
          <Route
            path="/owner"
            element={
              <RoleRoute allow={["owner"]}>
                <OwnerLayout />
              </RoleRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<OwnerDashboardPage />} />
            <Route path="properties" element={<OwnerPropertiesPage />} />
            <Route
              path="properties/add-property"
              element={<OwnerAddPropertyPage />}
            />
            <Route
              path="properties/:id/edit"
              element={<OwnerEditPropertyPage />}
            />
            <Route
              path="calendar"
              element={<RoleCalendarPage role="owner" />}
            />
            <Route
              path="calendar/add-booking"
              element={<StandaloneAddBookingPage role="owner" />}
            />
            <Route
              path="calendar/:id/edit"
              element={<StandaloneEditBookingPage role="owner" />}
            />
            <Route path="financial" element={<OwnerFinancialPage />} />
            <Route path="notifications" element={<OwnerNotificationsPage />} />
            <Route
              path="settings"
              element={<RoleSettingsPage role="owner" />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
