import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useSearch } from "../../contexts/SearchContext";
import { useContactSettings } from "../../hooks/useContactSettings";
import api from "../../services/api";
import SearchBarWithQuery from "../ui/SearchBarWithQuery";
import MobileSearchBarWithQuery from "../ui/MobileSearchBarWithQuery";
import { Button } from "../ui/button";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as Separator from "@radix-ui/react-separator";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Avatar from "@radix-ui/react-avatar";
import { 
  MdMenu, 
  MdPerson,
  MdFavorite,
  MdClose, 
  MdLogout, 
  MdShoppingCart,
  MdKeyboardArrowDown,
  MdKeyboardArrowRight,
  MdKeyboardArrowLeft,
  MdGridView,
  MdAccountCircle,
  MdFavoriteBorder,
  MdLogin,
  MdDashboard
} from "react-icons/md";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { Mail, Phone } from "lucide-react";

// Add this helper function at the top of the component
const renderCategoryWithIndentation = (category, level = 0) => {
  return (
    <React.Fragment key={category._id}>
      <Link
        to={`/category/${category.slug}`}
        className={`block px-4 py-2 hover:bg-primary-100 text-sm ${
          level > 0 ? `pl-${4 + level * 4}` : ""
        }`}
      >
        {level > 0 && "└─ "}
        {category.name}
      </Link>
      {category.children?.map((child) =>
        renderCategoryWithIndentation(child, level + 1)
      )}
    </React.Fragment>
  );
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const { currentUser, logout } = useAuth();
  const { itemCount = 0 } = useCart();
  const { searchQuery } = useSearch();
  const { contactSettings } = useContactSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const isAccountRoute = location.pathname.startsWith("/account");

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [selectedLevelIndex, setSelectedLevelIndex] = useState(0);

  // Add custom CSS for hiding scrollbars
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        
        if (response.data.data && Array.isArray(response.data.data)) {
          // Log the first category to inspect its structure
          if (response.data.data.length > 0) {
            console.log('Category structure sample:', response.data.data[0]);
          }
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSelectedCategories([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search is now handled by SearchBar component

  const handleAccountClick = () => {
    if (!currentUser) {
      navigate("/login");
    } else {
      navigate("/account");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const handleWishlistClick = (e) => {
    if (!currentUser) {
      e.preventDefault();
      // Save the intended destination
      navigate("/login", { state: { from: { pathname: "/wishlist" } } });
    }
  };

  const handleCategoryClick = (category, level, e) => {
    // Navigate to the category page
    navigate(`/category/${category.slug}`);
    
    // Close dropdown after navigation
    setIsDropdownOpen(false);
    setSelectedCategories([]);
    setSelectedLevelIndex(0);
  };

  const handleExpandSubcategory = (category, level, e) => {
    e.preventDefault();
    e.stopPropagation();

    // Update selected categories array up to the current level and add new selection
    setSelectedCategories((prev) => {
      const newSelected = [...prev.slice(0, level), category];
      return newSelected;
    });

    // Move to next level if category has children (for both mobile and desktop)
    if (category.children?.length > 0) {
      setSelectedLevelIndex(level + 1);
    }
  };

  const handleBackClick = () => {
    setSelectedLevelIndex((prev) => Math.max(0, prev - 1));
    setSelectedCategories((prev) => prev.slice(0, -1));
  };

  const getCategoriesForLevel = (level) => {
    if (level === 0) {
      return categories.filter(category => category.level === 0);
    }

    const parentCategory = selectedCategories[level - 1];
    return parentCategory?.children || [];
  };

  const getMaxLevel = () => {
    const findMaxLevel = (categories, level = 0) => {
      if (!categories || categories.length === 0) return level;

      let maxLevel = level;
      categories.forEach((category) => {
        if (category.children?.length > 0) {
          const childLevel = findMaxLevel(category.children, level + 1);
          maxLevel = Math.max(maxLevel, childLevel);
        }
      });
      return maxLevel;
    };

    return findMaxLevel(categories);
  };

  // Return array of numbers from 0 to max level found in categories
  const getLevels = () => {
    const maxLevel = getMaxLevel();
    return Array.from({ length: maxLevel + 1 }, (_, i) => i);
  };

  return (
    <header
      className={`bg-primary-500 text-white shadow-lg ${
        !isAccountRoute
          ? "sticky top-0 md:h-[72px]" // 56px for top bar + 16px for categories
          : "h-14 md:h-16"
      } z-50`}
    >
      {/* Top Navigation Bar */}
      <div className="container mx-auto px-4 h-14 md:h-16">
        <div className="flex items-center justify-between gap-2 h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img 
              src="/uploads/logo-main.png" 
              alt="Dental Kart Nepal" 
              className="h-10 md:h-12 w-auto object-contain"
            />
            {/* Desktop Text - Hidden on mobile */}
            <div className="hidden md:flex flex-col ml-2">
              <span className="text-white font-semibold text-lg leading-tight">Dental Kart</span>
              <span className="text-white/80 text-xs leading-tight">Nepal</span>
            </div>
          </Link>

          {/* Search Bar - Visible on all devices */}
          <div className="flex flex-1 mx-2 md:mx-6 max-w-2xl">
            {/* Desktop SearchBar */}
            <div className="hidden md:flex w-full">
              <SearchBarWithQuery 
                className="w-full" 
                placeholder="Search products, brands, categories..." 
              />
            </div>
            
            {/* Mobile SearchBar */}
            <div className="flex md:hidden w-full">
              <MobileSearchBarWithQuery />
            </div>
          </div>

          {/* Desktop Navigation Items */}
          <div className="hidden md:flex items-center gap-3">
            <Tooltip.Provider>
              {/* Account Avatar & Dropdown */}
              <Tooltip.Root>
                <DropdownMenu.Root>
                  <Tooltip.Trigger asChild>
                    <DropdownMenu.Trigger asChild>
                      <button className="flex items-center gap-2 px-3 py-2 text-white hover:bg-primary-600 rounded-lg transition-colors">
                        <Avatar.Root className="w-8 h-8 rounded-full overflow-hidden bg-primary-400 flex items-center justify-center">
                          <Avatar.Image 
                            src={currentUser?.photoURL || currentUser?.avatar} 
                            alt={currentUser?.displayName || "User"} 
                            className="w-full h-full object-cover"
                          />
                          <Avatar.Fallback className="w-full h-full bg-primary-400 flex items-center justify-center text-white text-sm font-medium">
                            {currentUser ? 
                              (currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U').toUpperCase() 
                              : <MdAccountCircle className="w-5 h-5" />
                            }
                          </Avatar.Fallback>
                        </Avatar.Root>
                        <div className="flex flex-col items-start text-left">
                          <span className="text-xs font-medium">
                            {currentUser ? currentUser.displayName || "Account" : "Sign In"}
                          </span>
                          <span className="text-xs opacity-75">
                            {currentUser ? "My Account" : "Login / Register"}
                          </span>
                        </div>
                        <MdKeyboardArrowDown className="w-4 h-4 opacity-70" />
                      </button>
                    </DropdownMenu.Trigger>
                  </Tooltip.Trigger>
                  
                  <Tooltip.Portal>
                    <Tooltip.Content 
                      className="bg-gray-900 text-white px-2 py-1 rounded text-xs"
                      sideOffset={5}
                    >
                      {currentUser ? "Account Menu" : "Sign in to your account"}
                      <Tooltip.Arrow className="fill-gray-900" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                  
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      className="min-w-[200px] bg-white rounded-lg shadow-lg border p-1 z-50"
                      sideOffset={5}
                    >
                      {currentUser ? (
                        <>
                          <div className="px-3 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">
                              {currentUser.displayName || "User"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {currentUser.email}
                            </p>
                          </div>
                          <DropdownMenu.Item asChild>
                            <Link
                              to="/account"
                              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                            >
                              <MdDashboard className="w-4 h-4 mr-3" />
                              Dashboard
                            </Link>
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                          <DropdownMenu.Item
                            onSelect={handleLogout}
                            className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                          >
                            <MdLogout className="w-4 h-4 mr-3" />
                            Sign Out
                          </DropdownMenu.Item>
                        </>
                      ) : (
                        <DropdownMenu.Item asChild>
                          <Link
                            to="/login"
                            className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                          >
                            <MdLogin className="w-4 h-4 mr-3" />
                            Sign In
                          </Link>
                        </DropdownMenu.Item>
                      )}
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </Tooltip.Root>

              {/* Wishlist Button */}
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Link
                    to="/account/wishlist"
                    onClick={handleWishlistClick}
                    className="relative p-2 text-white hover:bg-primary-600 rounded-lg transition-colors"
                  >
                    <MdFavoriteBorder className="w-6 h-6" />
                  </Link>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content 
                    className="bg-gray-900 text-white px-2 py-1 rounded text-xs"
                    sideOffset={5}
                  >
                    Wishlist
                    <Tooltip.Arrow className="fill-gray-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>

              {/* Cart Button */}
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Link 
                    to="/cart"
                    className="relative p-2 text-white hover:bg-primary-600 rounded-lg transition-colors"
                  >
                    <AiOutlineShoppingCart className="w-6 h-6" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-secondary-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {itemCount > 99 ? '99+' : itemCount}
                      </span>
                    )}
                  </Link>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content 
                    className="bg-gray-900 text-white px-2 py-1 rounded text-xs"
                    sideOffset={5}
                  >
                    Shopping Cart {itemCount > 0 ? `(${itemCount})` : ''}
                    <Tooltip.Arrow className="fill-gray-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>

          {/* Mobile Menu Button */}
          <Dialog.Root open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <Dialog.Trigger asChild>
              <button className="md:hidden p-2 text-white hover:bg-primary-600 rounded-md transition-colors">
                {isMenuOpen ? (
                  <MdClose className="w-6 h-6" />
                ) : (
                  <MdMenu className="w-6 h-6" />
                )}
              </button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
              <Dialog.Content className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 overflow-y-auto">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title className="text-lg font-semibold text-gray-900">
                      Menu
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                        <MdClose className="w-5 h-5" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="space-y-4">
                    {/* Mobile Navigation Links */}
                    <div className="space-y-2">
                      <Link
                        to="/products"
                        className="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <MdGridView className="w-5 h-5 mr-3" />
                        All Products
                      </Link>
                      <Link
                        to="/brands"
                        className="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <MdGridView className="w-5 h-5 mr-3" />
                        Brands
                      </Link>
                    </div>

                    <Separator.Root className="h-px bg-gray-200" />

                    {/* Account Section */}
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-3 py-3 h-auto text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          handleAccountClick();
                          setIsMenuOpen(false);
                        }}
                      >
                        <MdPerson className="w-5 h-5 mr-3" />
                        {currentUser ? "My Account" : "Login"}
                      </Button>

                      {currentUser && (
                        <Button
                          variant="ghost"
                          className="w-full justify-start px-3 py-3 h-auto text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                        >
                          <MdLogout className="w-5 h-5 mr-3" />
                          Logout
                        </Button>
                      )}

                      <Link
                        to="/account/wishlist"
                        onClick={(e) => {
                          handleWishlistClick(e);
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MdFavorite className="w-5 h-5 mr-3" />
                        Wishlist
                      </Link>

                      <Link
                        to="/cart"
                        className="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <div className="relative mr-3">
                            <AiOutlineShoppingCart className="w-5 h-5" />
                            {itemCount > 0 && (
                              <span className="absolute -top-2 -right-2 bg-secondary-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                                {itemCount}
                              </span>
                            )}
                          </div>
                          Cart {itemCount > 0 ? `(${itemCount})` : ''}
                        </div>
                      </Link>
                    </div>

                    <Separator.Root className="h-px bg-gray-200" />

                    {/* Mobile Contact Information */}
                    <div className="space-y-2">
                      <div className="px-3 py-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          Contact Us
                        </p>
                        <div className="space-y-3">
                          <a 
                            href={`mailto:${contactSettings.email}`}
                            className="flex items-center text-sm text-gray-700 hover:text-primary-600 transition-colors"
                          >
                            <Mail className="w-4 h-4 mr-3" />
                            {contactSettings.email}
                          </a>
                          <a 
                            href={`tel:${contactSettings.phone}`}
                            className="flex items-center text-sm text-gray-700 hover:text-primary-600 transition-colors"
                          >
                            <Phone className="w-4 h-4 mr-3" />
                            {contactSettings.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>

      {/* Categories Menu - Hidden in account routes */}
      {!isAccountRoute && (
        <div className="bg-primary-600 border-t border-primary-400/20 h-8">
          <div className="container mx-auto px-4 h-full">
            <NavigationMenu.Root className="relative h-full">
              <NavigationMenu.List 
                className="flex items-center h-full overflow-x-auto gap-2 md:gap-0 hide-scrollbar"
              >
                {/* Categories Dropdown */}
                <NavigationMenu.Item className="flex-shrink-0">
                  <DropdownMenu.Root open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                    <DropdownMenu.Trigger asChild>
                      <button className="flex items-center px-4 py-1 text-white hover:bg-primary-700 focus:outline-none gap-2 rounded-md transition-colors">
                        <MdGridView className="w-4 h-4" />
                        Categories
                        <MdKeyboardArrowDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        className="absolute z-10 top-full left-0 right-0 md:left-auto md:right-auto md:min-w-[320px] bg-white shadow-xl border md:rounded-lg overflow-hidden md:max-w-[90vw] min-w-[280px]"
                        style={{ maxHeight: "80vh" }}
                        sideOffset={0}
                        align="start"
                      >
                        <div className="md:flex md:flex-nowrap md:overflow-visible w-full min-h-[200px]">
                          {/* Mobile View - Single Level Navigation */}
                          <div className="md:hidden w-full">
                            {/* Current Level Display */}
                            <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center min-h-[3rem]">
                              {selectedLevelIndex > 0 && (
                                <button
                                  onClick={handleBackClick}
                                  className="mr-2 p-1 text-gray-600 hover:bg-gray-200 rounded-md transition-colors flex-shrink-0"
                                >
                                  <MdKeyboardArrowLeft className="w-4 h-4" />
                                </button>
                              )}
                              <span className="text-sm font-semibold text-gray-700 truncate">
                                {selectedLevelIndex === 0
                                  ? "Main Categories"
                                  : selectedCategories[selectedLevelIndex - 1]?.name ||
                                    "Sub Categories"}
                              </span>
                            </div>
                            
                            {/* Categories List for Current Level */}
                            <div className="py-2 max-h-[60vh] overflow-y-auto min-h-[150px]">
                              {getCategoriesForLevel(selectedLevelIndex).length > 0 ? (
                                getCategoriesForLevel(selectedLevelIndex).map((category) => (
                                  <div
                                    key={category._id}
                                    className="group hover:bg-gray-50 transition-colors"
                                  >
                                    <div className="flex items-center px-4 py-3">
                                      <button
                                        className="flex-grow text-left text-sm text-gray-700 hover:text-primary-600 font-medium group-hover:text-primary-600 transition-colors min-w-0 pr-2"
                                        onClick={(e) => handleCategoryClick(category, selectedLevelIndex, e)}
                                      >
                                        <span className="block">{category.name}</span>
                                      </button>
                                      {category.children?.length > 0 && (
                                        <button
                                          onClick={(e) => handleExpandSubcategory(category, selectedLevelIndex, e)}
                                          className="ml-2 p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                                        >
                                          <MdKeyboardArrowRight className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="px-4 py-8 text-center text-gray-500">
                                  <MdGridView className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                  <p className="text-sm">Loading categories...</p>
                                </div>
                              )}
                              
                              {/* View All Categories - only in main categories */}
                              {selectedLevelIndex === 0 && getCategoriesForLevel(selectedLevelIndex).length > 0 && (
                                <>
                                  <Separator.Root className="h-px bg-gray-200 mx-4 my-2" />
                                  <div className="px-4 py-3 hover:bg-gray-50">
                                    <Link 
                                      to="/categories" 
                                      className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                                      onClick={() => setIsDropdownOpen(false)}
                                    >
                                      <span>View All Categories</span>
                                      <MdKeyboardArrowRight className="w-4 h-4 ml-1" />
                                    </Link>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Desktop View - Multi-column Layout */}
                          <div className="hidden md:flex md:flex-nowrap md:overflow-visible min-h-[200px]">
                            {getLevels().length > 0 && getLevels().map((level) => {
                              const categoriesForLevel = getCategoriesForLevel(level);
                              if (!categoriesForLevel?.length) {
                                return null;
                              }

                              return (
                                <div
                                  key={level}
                                  className="min-w-[250px] max-w-[280px] border-r border-gray-100 last:border-r-0 flex-shrink-0 max-h-[80vh] overflow-y-auto bg-white"
                                >
                                  {/* Level Header */}
                                  <div className="p-3 bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                                    <span className="text-sm font-semibold text-gray-700">
                                      {level === 0
                                        ? "Main Categories"
                                        : selectedCategories[level - 1]?.name ||
                                          "Sub Categories"}
                                    </span>
                                  </div>

                                  {/* Categories List */}
                                  <div className="py-2">
                                    {categoriesForLevel.map((category) => (
                                      <div
                                        key={category._id}
                                        className={`group hover:bg-gray-50 transition-colors ${
                                          selectedCategories[level]?._id === category._id
                                            ? "bg-primary-50"
                                            : ""
                                        }`}
                                      >
                                        <div className="flex items-center px-4 py-2.5">
                                          <button
                                            className="flex-grow text-left text-sm text-gray-700 hover:text-primary-600 font-medium group-hover:text-primary-600 transition-colors"
                                            onClick={(e) => handleCategoryClick(category, level, e)}
                                          >
                                            {category.name}
                                          </button>
                                          {category.children?.length > 0 && (
                                            <button
                                              onClick={(e) => handleExpandSubcategory(category, level, e)}
                                              className="ml-2 p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                                            >
                                              <MdKeyboardArrowRight className="w-4 h-4" />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                    
                                    {/* View All Categories - only in main categories */}
                                    {level === 0 && (
                                      <>
                                        <Separator.Root className="h-px bg-gray-200 mx-4 my-2" />
                                        <div className="px-4 py-3 hover:bg-gray-50">
                                          <Link 
                                            to="/categories" 
                                            className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                                            onClick={() => setIsDropdownOpen(false)}
                                          >
                                            <span>View All Categories</span>
                                            <MdKeyboardArrowRight className="w-4 h-4 ml-1" />
                                          </Link>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                            
                            {/* Fallback when no categories are loaded */}
                            {getLevels().length === 0 && (
                              <div className="min-w-[280px] bg-white p-8 text-center">
                                <MdGridView className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm text-gray-500">Loading categories...</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </NavigationMenu.Item>

                {/* Other Navigation Links */}
                <NavigationMenu.Item className="flex-shrink-0">
                  <NavigationMenu.Link asChild>
                    <Link
                      to="/products"
                      className="px-4 py-1 text-sm text-white hover:bg-primary-700 transition-colors duration-200 rounded-md whitespace-nowrap"
                    >
                      All Products
                    </Link>
                  </NavigationMenu.Link>
                </NavigationMenu.Item>

                <NavigationMenu.Item className="flex-shrink-0">
                  <NavigationMenu.Link asChild>
                    <Link
                      to="/brands"
                      className="px-4 py-1 text-sm text-white hover:bg-primary-700 transition-colors duration-200 rounded-md whitespace-nowrap"
                    >
                      Brands
                    </Link>
                  </NavigationMenu.Link>
                </NavigationMenu.Item>

                {/* Desktop Contact Info - Right side */}
                <div className="ml-auto hidden md:flex items-center gap-6 text-xs text-white/80">
                  <a 
                    href={`mailto:${contactSettings.email}`}
                    className="flex items-center gap-1 hover:text-white transition-colors duration-200"
                  >
                    <Mail className="w-3 h-3" />
                    {contactSettings.email}
                  </a>
                  <a 
                    href={`tel:${contactSettings.phone}`}
                    className="flex items-center gap-1 hover:text-white transition-colors duration-200"
                  >
                    <Phone className="w-3 h-3" />
                    {contactSettings.phone}
                  </a>
                </div>
              </NavigationMenu.List>
            </NavigationMenu.Root>
          </div>
        </div>
      )}

    </header>
  );
};

export default Header;
