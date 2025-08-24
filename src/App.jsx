import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import Layout from './components/layout/Layout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';
import VendorLayout from './components/layout/VendorLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';
import ServerErrorPage from './pages/ServerErrorPage';
import WishlistPage from './pages/account/WishlistPage';
import CartPage from './pages/CartPage';
import BrandsPage from './pages/BrandsPage'; // Client-side brands page
import BrandDetailPage from './pages/BrandDetailPage'; // Brand detail page
import AllCategoriesPage from './pages/AllCategoriesPage'; // Import the AllCategoriesPage component
// Import account pages
import DashboardPage from './pages/account/DashboardPage';
import OrdersPage from './pages/account/OrdersPage';
import OrderDetailPage from './pages/account/OrderDetailPage';
import ProfilePage from './pages/account/ProfilePage';
import SettingsPage from './pages/account/SettingsPage';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';

// Import admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import BlogPage from './pages/admin/BlogPage';
import MediaPage from './pages/admin/MediaPage';
import UsersPage from './pages/admin/UsersPage';
import CustomersPage from './pages/admin/CustomersPage';
import NotificationsPage from './pages/admin/NotificationsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import InvoicePrintPageWrapper from './pages/admin/InvoicePrintPage';
import CartsPage from './pages/admin/CartsPage';
import ProductsPage from './pages/admin/ProductsPage';
import CreateProductPage from './pages/admin/CreateProductPage';
import EditProductPage from './pages/admin/EditProductPage';
import VendorCreateProductPage from './pages/vendor/CreateProductPage';
import VendorEditVendorProductPage from './pages/vendor/EditProductPage';
import ViewProductPage from './pages/admin/ViewProductPage'; // Import the ViewProductPage component
import CategoriesPage from './pages/admin/CategoriesPage';
import AdminBrandsPage from './pages/admin/BrandsPage'; // Renamed to AdminBrandsPage
import VendorsPage from './pages/admin/VendorsPage';
import CreateVendorPage from './pages/admin/CreateVendorPage';
import VendorDetailsPage from './pages/admin/VendorDetailsPage';
import VendorEditPage from './pages/admin/VendorEditPage';
import { LoadingProvider } from './contexts/LoadingContext';
import VendorPageErrorBoundary from './components/error/VendorPageErrorBoundary';
import VendorOrdersPage from './pages/vendor/VendorOrdersPage';
import VendorOrderDetailPage from './pages/vendor/VendorOrderDetailPage';
import VendorProductsPage from './pages/vendor/ProductsPage';
import InventoryPage from './pages/vendor/InventoryPage';
import AdminSettings from './pages/admin/SettingsPage';
import HomepageSettingsPage from './pages/admin/settings/HomepageSettingsPage';
import NavigationSettingsPage from './pages/admin/settings/NavigationSettingsPage';
import SeoSettingsPage from './pages/admin/settings/SeoSettingsPage';
import SocialSettingsPage from './pages/admin/settings/SocialSettingsPage';
import ContactSettingsPage from './pages/admin/settings/ContactSettingsPage';
import EmailSettingsPage from './pages/admin/settings/EmailSettingsPage';
import AttributesSettingsPage from './pages/admin/AttributesSettingsPage';
import ReviewsPage from './pages/admin/ReviewsPage'; // Import ReviewsPage component
import AdminChatPage from './pages/admin/AdminChatPage'; // Import AdminChatPage component

// Import vendor pages
import VendorLoginPage from './pages/vendor/LoginPage';
import VendorDashboard from './pages/vendor/DashboardPage';
import VendorReportsPage from './pages/vendor/ReportsPage';
import VendorSettingsPage from './pages/vendor/SettingsPage';
import VendorForgotPasswordPage from './pages/vendor/ForgotPasswordPage';
import VendorResetPasswordPage from './pages/vendor/ResetPasswordPage';
import VendorRoute from './components/auth/VendorRoute';

// Import additional pages
import AllProductsPage from './pages/AllProductsPage';
import ProductDetailPage from './pages/ProductDetailPage'; // Import the ProductDetailPage component
import CategoryDetailPage from './pages/CategoryDetailPage'; // Import the CategoryDetailPage component
import SearchPage from './pages/SearchPage'; // Import the SearchPage component
import RadixUIShowcasePage from './pages/RadixUIShowcasePage'; // Import the Radix UI showcase page
import { CacheProvider } from './contexts/CacheContext'; // Add import for CacheProvider
import { SearchProvider } from './contexts/SearchContext'; // Add import for SearchProvider
import { WishlistProvider } from './contexts/WishlistContext'; // Import WishlistProvider
import { CartProvider } from './contexts/CartContext'; // Import CartProvider
import { ChatProvider } from './contexts/ChatContext'; // Import ChatProvider
import { NotificationProvider } from './contexts/NotificationContext'; // Import NotificationProvider
import CartCleanupNotification from './components/cart/CartCleanupNotification'; // Import cart cleanup notification
import { ChatWidget } from './components/ui'; // Import ChatWidget
import { useMetaPixelPageTracking } from './hooks/useMetaPixel'; // Import Meta Pixel hook

// Meta Pixel Page Tracker Component
function MetaPixelPageTracker() {
  useMetaPixelPageTracking();
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <CacheProvider>
          <AuthProvider>
            <MetaPixelPageTracker />
            <ChatProvider>
              <NotificationProvider>
                <WishlistProvider>
                  <CartProvider>
                    <LoadingProvider>
                      <SearchProvider>
                        <Routes>
                          {/* Main Website Routes */}
                          <Route element={<Layout />}>
                            {/* Public Routes */}
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/signup" element={<SignupPage />} />
                            <Route path="/verify-email" element={<EmailVerificationPage />} />
                            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                            <Route path="/reset-password" element={<ResetPasswordPage />} />
                            <Route path="/category/:slug" element={<CategoryDetailPage />} />
                            <Route path="/categories" element={<AllCategoriesPage />} />
                            <Route path="/product/:slug" element={<ProductDetailPage />} />
                            <Route path="/products" element={<AllProductsPage />} />
                            <Route path="/brands" element={<BrandsPage />} />
                            <Route path="/brands/:slug" element={<BrandDetailPage />} />
                            <Route path="/search" element={<SearchPage />} />
                            <Route path="/ui-showcase" element={<RadixUIShowcasePage />} />
                            
                          {/* Protected Routes */}
                          <Route 
                            path="/cart" 
                            element={
                              <PrivateRoute requireVerification={true}>
                                <CartPage />
                              </PrivateRoute>
                            } 
                          />
                          <Route 
                            path="/checkout" 
                            element={
                              <PrivateRoute requireVerification={true}>
                                <CheckoutPage />
                              </PrivateRoute>
                            } 
                          />
                          <Route 
                            path="/order-success" 
                            element={
                              <PrivateRoute requireVerification={true}>
                                <OrderSuccessPage />
                              </PrivateRoute>
                            } 
                          />

                          {/* Dashboard Routes */}
                          <Route
                            path="/account"
                            element={
                              <PrivateRoute requireVerification={true}>
                                <DashboardLayout />
                              </PrivateRoute>
                            }
                          >
                            <Route index element={<DashboardPage />} />
                            <Route path="orders" element={<OrdersPage />} />
                            <Route path="orders/:id" element={<OrderDetailPage />} />
                            <Route path="wishlist" element={<WishlistPage />} />
                            <Route path="profile" element={<ProfilePage />} />
                            <Route path="settings" element={<SettingsPage />} />
                          </Route>

                          {/* Error Routes */}
                          <Route path="/server-error" element={<ServerErrorPage />} />
                          <Route path="*" element={<NotFoundPage />} />
                        </Route>

                        {/* Admin Routes - Separate from main layout */}
                        <Route
                          path="/admin"
                          element={
                            <AdminRoute>
                              <LoadingProvider>
                                <SearchProvider>
                                  <AdminLayout />
                                </SearchProvider>
                              </LoadingProvider>
                            </AdminRoute>
                          }
                        >
                          <Route index element={<AdminDashboard />} />
                          <Route path="products" element={<ProductsPage />} />
                          <Route path="products/create" element={<CreateProductPage />} />
                          <Route path="products/:id" element={<ViewProductPage />} />
                          <Route path="products/edit/:id" element={<EditProductPage />} />
                          <Route path="categories" element={<CategoriesPage />} />
                          <Route path="brands" element={<AdminBrandsPage />} />
                          <Route path="reviews" element={<ReviewsPage />} />
                          <Route 
                            path="vendors" 
                            element={
                              <VendorPageErrorBoundary>
                                <VendorsPage />
                              </VendorPageErrorBoundary>
                            } 
                          />
                          <Route 
                            path="vendors/create" 
                            element={
                              <VendorPageErrorBoundary>
                                <CreateVendorPage />
                              </VendorPageErrorBoundary>
                            } 
                          />
                          <Route 
                            path="vendors/:vendorId" 
                            element={
                              <VendorPageErrorBoundary>
                                <VendorDetailsPage />
                              </VendorPageErrorBoundary>
                            } 
                          />
                          <Route 
                            path="vendors/edit/:vendorId" 
                            element={
                              <VendorPageErrorBoundary>
                                <VendorEditPage />
                              </VendorPageErrorBoundary>
                            } 
                          />
                          <Route path="orders" element={<AdminOrdersPage />} />
                          <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                          <Route path="carts" element={<CartsPage />} />
                          <Route path="customers" element={<CustomersPage />} />
                          <Route path="blog" element={<BlogPage />} />
                          <Route path="media" element={<MediaPage />} />
                          <Route path="users" element={<UsersPage />} />
                          <Route path="notifications" element={<NotificationsPage />} />
                          <Route path="chat" element={<AdminChatPage />} />
                          <Route path="settings" element={<AdminSettings />}>
                            <Route index element={<Navigate to="homepage" replace />} />
                            <Route path="homepage" element={<HomepageSettingsPage />} />
                            <Route path="navigation" element={<NavigationSettingsPage />} />
                            <Route path="seo" element={<SeoSettingsPage />} />
                            <Route path="social" element={<SocialSettingsPage />} />
                            <Route path="contact" element={<ContactSettingsPage />} />
                            <Route path="email" element={<EmailSettingsPage />} />
                            <Route path="attributes" element={<AttributesSettingsPage />} />
                          </Route>
                        </Route>

                        {/* Standalone Invoice Print Route - No Admin Layout */}
                        <Route
                          path="/admin/invoice-print/:id"
                          element={
                            <AdminRoute>
                              <InvoicePrintPageWrapper />
                            </AdminRoute>
                          }
                        />

                        {/* Vendor Routes */}
                        <Route path="/vendor/login" element={<VendorLoginPage />} />
                        <Route path="/vendor/forgot-password" element={<VendorForgotPasswordPage />} />
                        <Route path="/vendor/reset-password" element={<VendorResetPasswordPage />} />
                        <Route
                          path="/vendor"
                          element={
                            <VendorRoute>
                              <LoadingProvider>
                                <VendorLayout />
                              </LoadingProvider>
                            </VendorRoute>
                          }
                        >
                          <Route index element={<Navigate to="/vendor/dashboard" replace />} />
                          <Route path="dashboard" element={<VendorDashboard />} />
                          <Route path="products" element={<VendorProductsPage />} />
                          <Route path="products/create" element={<VendorCreateProductPage />} />
                          <Route path="products/edit/:id" element={<VendorEditVendorProductPage />} />
                          <Route path="products/:id" element={<ViewProductPage />} />
                          <Route path="orders" element={<VendorOrdersPage />} />
                          <Route path="orders/:id" element={<VendorOrderDetailPage />} />
                          <Route path="inventory" element={<InventoryPage />} />
                          <Route path="reports" element={<VendorReportsPage />} />
                          <Route path="profile" element={<div>Profile</div>} />
                          <Route path="settings" element={<VendorSettingsPage />} />
                        </Route>
                      </Routes>
                    </SearchProvider>
                  </LoadingProvider>
                </CartProvider>
              </WishlistProvider>
            </NotificationProvider>
          </ChatProvider>
        </AuthProvider>
      </CacheProvider>
      
      {/* Global Cart Cleanup Notification */}
      <CartCleanupNotification />
      
      <ReactQueryDevtools initialIsOpen={false} />
    </Router>
  </QueryClientProvider>
  );
}

export default App;
