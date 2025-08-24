import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useUserOrders } from '../../hooks/queries/useOrderQueries';
import { 
  Root as Card, 
  Header as CardHeader, 
  Content as CardContent, 
  Title as CardTitle, 
  Description as CardDescription 
} from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { 
  ShoppingBag, 
  Heart, 
  MapPin, 
  ArrowRight, 
  Package2, 
  ShoppingCart,
  TrendingUp,
  Calendar
} from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, link, linkText, trend, color = "primary" }) => {
  const colorClasses = {
    primary: {
      bg: "bg-primary-50",
      icon: "text-primary-600",
      text: "text-primary-700",
      button: "text-primary-600 hover:text-primary-700"
    },
    secondary: {
      bg: "bg-secondary-50", 
      icon: "text-secondary-600",
      text: "text-secondary-700",
      button: "text-secondary-600 hover:text-secondary-700"
    },
    accent: {
      bg: "bg-accent-50",
      icon: "text-accent-600", 
      text: "text-accent-700",
      button: "text-accent-600 hover:text-accent-700"
    }
  };

  const colors = colorClasses[color];

  return (
    <Card className="bg-white border border-slate-200 shadow-mobile hover:shadow-mobile-lg transition-all duration-200">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={cn("p-2 rounded-lg flex-shrink-0", colors.bg)}>
              <Icon className={cn("w-5 h-5", colors.icon)} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-mobile-small sm:text-base font-medium text-slate-900 truncate">
                {title}
              </h3>
              {trend && (
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-2xs text-green-600 font-medium">{trend}</span>
                </div>
              )}
            </div>
          </div>
          {value && (
            <div className="text-right">
              <span className="text-xl sm:text-2xl font-bold text-slate-900">
                {value}
              </span>
            </div>
          )}
        </div>
        
        {link && (
          <Link to={link} className={cn("flex items-center justify-between w-full py-2 transition-colors duration-200", colors.button)}>
            <span className="text-mobile-small font-medium">{linkText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
};

const OrderItem = ({ order }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="flex items-center justify-between py-4 px-1">
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <Package2 className="w-4 h-4 text-primary-600" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-mobile-small font-medium text-slate-900 truncate">
            Order #{order.orderNumber || order._id?.slice(-6) || order.id}
          </p>
          <div className="flex items-center mt-1 space-x-2">
            <Calendar className="w-3 h-3 text-slate-400" />
            <p className="text-2xs text-slate-500">
              {new Date(order.createdAt || order.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-3 flex-shrink-0">
        <div className="text-right">
          <p className="text-mobile-small font-semibold text-slate-900">
            Rs. {(order.totalAmount || order.total || 0).toLocaleString()}
          </p>
          <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-medium border",
            getStatusColor(order.status)
          )}>
            {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const { wishlistItems = [] } = useWishlist();
  
  // Fetch user orders with error handling
  const { 
    data: ordersData, 
    isLoading: ordersLoading, 
    error: ordersError 
  } = useUserOrders({ 
    suspense: false,
    retry: 1
  });

  const userOrders = ordersData?.orders || [];
  const recentOrders = userOrders.slice(0, 4); // Show only the 4 most recent orders

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
            <AvatarImage 
              src={currentUser?.avatar} 
              alt={currentUser?.name || 'User avatar'} 
            />
            <AvatarFallback className="bg-primary-100 text-primary-600 text-lg sm:text-xl font-semibold">
              {currentUser?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-mobile-h1 sm:text-3xl font-bold text-slate-900 truncate">
              Welcome back, {currentUser?.name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-mobile-small sm:text-base text-slate-600 mt-1">
              Manage your account and track your orders
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatsCard
          title="Total Orders"
          value={userOrders.length.toString()}
          link="/account/orders"
          linkText="View all orders"
          color="primary"
          trend={userOrders.length > 0 ? `${userOrders.filter(o => o.createdAt && new Date(o.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length} this month` : null}
          icon={ShoppingBag}
        />
        <StatsCard
          title="Wishlist Items"
          value={wishlistItems.length.toString()}
          link="/account/wishlist"
          linkText="View wishlist"
          color="secondary"
          icon={Heart}
        />
        <StatsCard
          title="Saved Addresses"
          value="0"
          link="/account/addresses"
          linkText="Manage addresses"
          color="accent"
          icon={MapPin}
        />
      </div>

      {/* Recent Orders Section */}
      <Card className="bg-white border border-slate-200 shadow-mobile">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Package2 className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-mobile-h3 sm:text-xl font-semibold text-slate-900">
                  Recent Orders
                </CardTitle>
                <CardDescription className="text-2xs sm:text-sm text-slate-600 mt-1">
                  Your latest purchases and order status
                </CardDescription>
              </div>
            </div>
            {userOrders.length > 0 && (
              <Link to="/account/orders" className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 transition-colors duration-200 text-mobile-small font-medium">
                <span>View all</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </CardHeader>
        
        <Separator className="bg-slate-200" />
        
        <CardContent className="p-0">
          {ordersLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
                <p className="text-mobile-small text-slate-600">Loading orders...</p>
              </div>
            </div>
          ) : ordersError ? (
            <div className="text-center py-12 px-4">
              <Package2 className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <p className="text-mobile-small text-slate-600 mb-2">Unable to load orders</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-3 py-2 text-mobile-small font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-200"
              >
                Try again
              </button>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-mobile-small font-medium text-slate-900 mb-2">No orders yet</h3>
              <p className="text-2xs text-slate-600 mb-4 max-w-sm mx-auto">
                Start shopping to see your orders appear here
              </p>
              <Link 
                to="/products" 
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Start Shopping</span>
              </Link>
            </div>
          ) : (
            <ScrollArea.Root className="h-auto max-h-96">
              <ScrollArea.Viewport className="w-full">
                <div className="px-4 sm:px-6">
                  {recentOrders.map((order, index) => (
                    <div key={order._id || order.id}>
                      <OrderItem order={order} />
                      {index < recentOrders.length - 1 && (
                        <Separator className="bg-slate-100" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar 
                className="flex select-none touch-none p-0.5 bg-slate-100 transition-colors duration-150 ease-out hover:bg-slate-200 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
                orientation="vertical"
              >
                <ScrollArea.Thumb className="flex-1 bg-slate-400 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Link
          to="/products"
          className="flex flex-col items-center justify-center h-auto p-4 space-y-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors duration-200"
        >
          <ShoppingCart className="w-6 h-6 text-slate-600" />
          <span className="text-2xs font-medium text-slate-700">Shop Now</span>
        </Link>
        
        <Link
          to="/account/orders"
          className="flex flex-col items-center justify-center h-auto p-4 space-y-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors duration-200"
        >
          <Package2 className="w-6 h-6 text-slate-600" />
          <span className="text-2xs font-medium text-slate-700">Track Order</span>
        </Link>
        
        <Link
          to="/account/wishlist"
          className="flex flex-col items-center justify-center h-auto p-4 space-y-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors duration-200"
        >
          <Heart className="w-6 h-6 text-slate-600" />
          <span className="text-2xs font-medium text-slate-700">Wishlist</span>
        </Link>
        
        <Link
          to="/account/settings"
          className="flex flex-col items-center justify-center h-auto p-4 space-y-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors duration-200"
        >
          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-2xs font-medium text-slate-700">Settings</span>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;