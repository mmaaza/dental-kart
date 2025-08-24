import { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import ProductCard from '../components/ui/ProductCard';
import ProductDetailSkeleton from '../components/ui/ProductDetailSkeleton';
import ProductDetailErrorBoundary from '../components/error/ProductDetailErrorBoundary';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useProductDetail, useRelatedProducts, useProductReviews } from '../hooks/useProductDetail';
import { SEOHead } from '../components/seo';
import { trackViewContent, formatProductData } from '../utils/metaPixel';

// Component that uses React Query and Suspense
const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Scroll to top when component mounts or slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);
  
  // Using React Query hooks
  const { data: product } = useProductDetail(slug);
  const { data: relatedProducts = [] } = useRelatedProducts(product?._id);
  const { data: reviews = [] } = useProductReviews(product?._id);
  
  // Local state for UI interactions
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart: addProductToCart, isInCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [activeTab, setActiveTab] = useState('description');
  const [currentImages, setCurrentImages] = useState([]);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Review-related state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSort, setReviewSort] = useState('newest');
  const [visibleReviews, setVisibleReviews] = useState(5);
  const [helpfulReviews, setHelpfulReviews] = useState({});
  const [reportedReviews, setReportedReviews] = useState({});
  const [filterStars, setFilterStars] = useState(0); // 0 means all stars

  // Mutations for reviews
  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      const response = await api.post(`/products/${product._id}/reviews`, reviewData);
      return response.data.data;
    },
    onSuccess: (newReview) => {
      // Update the reviews cache
      queryClient.setQueryData(['productReviews', product._id], (oldReviews) => [
        newReview,
        ...(oldReviews || [])
      ]);
      handleCloseReviewForm();
      toast.success('Your review has been submitted!');
    },
    onError: (error) => {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to submit review. Please try again.');
    },
  });

  const markHelpfulMutation = useMutation({
    mutationFn: async (reviewId) => {
      await api.post(`/reviews/${reviewId}/helpful`);
      return reviewId;
    },
    onSuccess: (reviewId) => {
      // Update the reviews cache
      queryClient.setQueryData(['productReviews', product._id], (oldReviews) =>
        oldReviews?.map(review =>
          review._id === reviewId
            ? { ...review, helpfulCount: (review.helpfulCount || 0) + 1 }
            : review
        ) || []
      );
      setHelpfulReviews(prev => ({ ...prev, [reviewId]: true }));
    },
    onError: (error) => {
      console.error('Error marking review as helpful:', error);
      toast.error('Could not mark review as helpful. Please try again.');
    },
  });

  const reportReviewMutation = useMutation({
    mutationFn: async (reviewId) => {
      await api.post(`/reviews/${reviewId}/report`);
      return reviewId;
    },
    onSuccess: (reviewId) => {
      setReportedReviews(prev => ({ ...prev, [reviewId]: true }));
      toast.success('Review has been reported. Thank you for your feedback.');
    },
    onError: (error) => {
      console.error('Error reporting review:', error);
      toast.error('Could not report review. Please try again.');
    },
  });

  // Initialize images and attributes when product data is available
  useEffect(() => {
    if (product) {
      setCurrentImages(product.images || []);
      
      // Initialize selectedAttributes with default values if available
      if (product.attributeGroups && product.attributeGroups.length > 0) {
        const initialAttributes = {};
        product.attributeGroups.forEach(group => {
          if (group.parentAttribute && group.parentAttribute.values && group.parentAttribute.values.length > 0) {
            initialAttributes[group.parentAttribute.name] = group.parentAttribute.values[0];
          }
        });
        setSelectedAttributes(initialAttributes);
      }

      // Track ViewContent event with Meta Pixel
      try {
        const productData = formatProductData({
          id: product._id,
          name: product.name,
          category: product.categories?.[0]?.name || '',
          price: product.specialOfferPrice || product.regularPrice || 0
        });
        trackViewContent(productData);
      } catch (trackingError) {
        console.warn('Meta Pixel tracking failed:', trackingError);
      }
    }
  }, [product]);

  useEffect(() => {
    if (!product || !product.hasVariantImages || !product.variants || product.variants.length === 0) return;

    const findMatchingVariant = () => {
      for (const variant of product.variants) {
        if (!variant.attributes || !variant.images) continue;

        if (Array.isArray(variant.attributes)) {
          const isMatch = variant.attributes.every(attr =>
            selectedAttributes[attr.parentName] === attr.parentValue
          );

          if (isMatch && variant.images.length > 0) {
            return variant.images;
          }
        } else if (typeof variant.attributes === 'object') {
          const isMatch = Object.entries(variant.attributes).every(
            ([key, value]) => selectedAttributes[key] === value
          );

          if (isMatch && variant.images.length > 0) {
            return variant.images;
          }
        }
      }
      return null;
    };

    const variantImages = findMatchingVariant();

    if (variantImages) {
      setCurrentImages(variantImages);
    } else {
      setCurrentImages(product.images || []);
    }
  }, [product, selectedAttributes]);

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(99, quantity + value));
    setQuantity(newQuantity);
  };

  const handleAttributeChange = (name, value) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addToCart = async () => {
    if (!product || cartLoading) return;
    
    try {
      setCartLoading(true);
      // Pass the product ID, quantity, and selectedAttributes to the addToCart function
      await addProductToCart(product._id, quantity, selectedAttributes);
      toast.success('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart. Please try again.');
    } finally {
      setCartLoading(false);
    }
  };

  const getDisplayPrice = () => {
    if (!product) return 0;

    if (product.specialOfferPrice && product.specialOfferPrice < product.regularPrice) {
      return product.specialOfferPrice;
    }

    if (product.discountValue > 0 && product.regularPrice) {
      if (product.discountType === 'percentage') {
        return product.regularPrice * (1 - product.discountValue / 100);
      } else {
        return product.regularPrice - product.discountValue;
      }
    }

    return product.regularPrice || 0;
  };

  const hasDiscount = () => {
    if (!product) return false;
    return (
      (product.discountValue > 0) ||
      (product.specialOfferPrice && product.regularPrice && product.specialOfferPrice < product.regularPrice)
    );
  };

  const getDiscountPercentage = () => {
    if (!product) return 0;

    if (product.discountType === 'percentage' && product.discountValue > 0) {
      return product.discountValue;
    }

    if (product.specialOfferPrice && product.regularPrice) {
      return Math.round(((product.regularPrice - product.specialOfferPrice) / product.regularPrice) * 100);
    }

    return 0;
  };

  const handleMouseMove = (e) => {
    if (!imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsZooming(true);
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  // Helper functions for reviews
  
  // Sort reviews based on selected sort option
  const getSortedReviews = () => {
    const filteredReviews = filterStars > 0 
      ? reviews.filter(review => Math.round(review.rating) === filterStars)
      : reviews;
      
    switch(reviewSort) {
      case 'newest':
        return [...filteredReviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return [...filteredReviews].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'highest':
        return [...filteredReviews].sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return [...filteredReviews].sort((a, b) => a.rating - b.rating);
      case 'helpful':
        return [...filteredReviews].sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
      default:
        return filteredReviews;
    }
  };

  // Handle opening the review form
  const handleOpenReviewForm = () => {
    // Check if user is authenticated by looking for token
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login page with a return URL
      toast.error('Please log in to write a review');
      navigate('/login', { state: { from: `/product/${slug}` } });
      return;
    }
    setShowReviewForm(true);
  };

  // Handle closing the review form
  const handleCloseReviewForm = () => {
    setShowReviewForm(false);
    setReviewFormData({
      rating: 5,
      title: '',
      comment: ''
    });
  };

  // Handle review form input changes
  const handleReviewFormChange = (e) => {
    const { name, value } = e.target;
    setReviewFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle star rating selection in the review form
  const handleRatingChange = (rating) => {
    setReviewFormData(prev => ({
      ...prev,
      rating
    }));
  };

  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!reviewFormData.comment.trim()) {
      toast.error('Please enter a review comment.');
      return;
    }
    
    setSubmittingReview(true);
    submitReviewMutation.mutate(reviewFormData, {
      onSettled: () => {
        setSubmittingReview(false);
      }
    });
  };

  // Handle marking a review as helpful
  const handleMarkHelpful = async (reviewId) => {
    // Prevent marking as helpful multiple times
    if (helpfulReviews[reviewId]) {
      return;
    }
    
    markHelpfulMutation.mutate(reviewId);
  };

  // Handle reporting a review
  const handleReportReview = async (reviewId) => {
    // Prevent reporting multiple times
    if (reportedReviews[reviewId]) {
      toast.info('You have already reported this review');
      return;
    }
    
    if (window.confirm('Are you sure you want to report this review as inappropriate?')) {
      reportReviewMutation.mutate(reviewId);
    }
  };

  // Handle loading more reviews
  const handleLoadMoreReviews = () => {
    setVisibleReviews(prev => prev + 5);
  };

  // Filter reviews by star rating
  const handleFilterByStars = (stars) => {
    setFilterStars(filterStars === stars ? 0 : stars);
    // Reset to show only the first 5 reviews when filter changes
    setVisibleReviews(5);
  };

  const RatingStars = ({ rating }) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(rating) ? 'text-accent-500' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 sm:ml-2 text-2xs sm:text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <>
      {product && (
        <SEOHead 
          title={`${product.name} | Medical Devices Nepal`}
          description={product.description || `Buy ${product.name} online. Quality medical devices and healthcare equipment in Nepal.`}
          image={product.images && product.images.length > 0 ? product.images[0] : ''}
          url={`${window.location.origin}/product/${product.slug}`}
          type="product"
          keywords={`${product.name}, medical devices, healthcare, Nepal, ${product.brand?.name || ''}`}
        />
      )}
      
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-2 py-2 sm:px-4 sm:py-6">
          <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4 overflow-x-auto whitespace-nowrap py-1">
            <Link to="/" className="hover:text-primary-500 transition-colors">Home</Link>
            <svg className="w-3 h-3 mx-1 sm:w-4 sm:h-4 sm:mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            <Link to="/products" className="hover:text-primary-500 transition-colors">Products</Link>
            {product.categories && product.categories.length > 0 && (
              <>
                <svg className="w-3 h-3 mx-1 sm:w-4 sm:h-4 sm:mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <Link
                  to={`/category/${product.categories[0].slug}`}
                  className="hover:text-primary-500 transition-colors"
                >
                  {product.categories[0].name}
                </Link>
              </>
            )}
            <svg className="w-3 h-3 mx-1 sm:w-4 sm:h-4 sm:mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-700 truncate">{product.name}</span>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="md:grid md:grid-cols-12 md:gap-6">
              <div className="md:col-span-4 p-2 sm:p-4 md:p-6">
                {currentImages && currentImages.length > 0 ? (
                  <div
                    className="relative"
                    ref={imageContainerRef}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Swiper
                      spaceBetween={8}
                      navigation={true}
                      thumbs={{ swiper: thumbsSwiper }}
                      modules={[FreeMode, Navigation, Thumbs]}
                      className="product-swiper-main mb-2"
                      onSlideChange={(swiper) => setActiveImageIndex(swiper.activeIndex)}
                    >
                      {currentImages.map((image, index) => (
                        <SwiperSlide key={index}>
                          <Zoom>
                            <div
                              className={`aspect-square rounded-lg overflow-hidden ${
                                isZooming && activeImageIndex === index ? 'cursor-zoom-in' : ''
                              }`}
                              style={
                                isZooming && activeImageIndex === index
                                  ? {
                                      backgroundImage: `url(${image})`,
                                      backgroundSize: '200%',
                                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                    }
                                  : {}
                              }
                            >
                              <img
                                src={image}
                                alt={`${product.name} - Image ${index + 1}`}
                                className={`w-full h-full object-cover ${
                                  isZooming && activeImageIndex === index ? 'opacity-0' : ''
                                }`}
                              />
                            </div>
                          </Zoom>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                    {currentImages.length > 1 && (
                      <Swiper
                        onSwiper={setThumbsSwiper}
                        spaceBetween={8}
                        slidesPerView="auto"
                        freeMode={true}
                        watchSlidesProgress={true}
                        modules={[FreeMode, Navigation, Thumbs]}
                        className="product-swiper-thumbs"
                      >
                        {currentImages.map((image, index) => (
                          <SwiperSlide key={index} style={{ width: 'auto' }}>
                            <div className="h-12 w-12 sm:h-16 sm:w-16 cursor-pointer border border-gray-200 rounded-md overflow-hidden hover:border-primary-500 transition-colors">
                              <img
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    )}
                    {hasDiscount() && (
                      <div className="absolute top-2 right-2 bg-secondary-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                        {getDiscountPercentage()}% OFF
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-xs sm:text-sm">No image available</span>
                  </div>
                )}
              </div>
              <div className="md:col-span-8 p-3 sm:p-4 md:p-6 border-t md:border-t-0 md:border-l border-gray-200">
                {product.brand && (
                  <div className="mb-0.5 sm:mb-1">
                    <Link
                      to={`/brands/${product.brand.slug}`}
                      className="text-xs sm:text-sm text-primary-500 hover:text-primary-600 transition-colors"
                    >
                      {product.brand.name}
                    </Link>
                  </div>
                )}
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">{product.name}</h1>
                {product.sku && (
                  <div className="text-2xs sm:text-xs text-gray-500 mb-2 sm:mb-3">
                    SKU: {product.sku}
                  </div>
                )}
                <div className="flex items-center mb-2 sm:mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">
                    Rs.{getDisplayPrice().toLocaleString()}
                  </span>
                  {hasDiscount() && (
                    <span className="ml-2 sm:ml-3 text-sm sm:text-base text-gray-500 line-through">
                      Rs.{product.regularPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                {product.stock !== undefined && (
                  <div className="mb-2 sm:mb-4">
                    {product.stock > 0 ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-2xs sm:text-xs font-medium bg-green-100 text-green-800">
                        <svg className="mr-0.5 h-1.5 w-1.5 sm:mr-1 sm:h-2 sm:w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                        In Stock ({product.stock} available)
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-2xs sm:text-xs font-medium bg-red-100 text-red-800">
                        <svg className="mr-0.5 h-1.5 w-1.5 sm:mr-1 sm:h-2 sm:w-2 text-red-400" fill="currentColor" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                        Out of Stock
                      </span>
                    )}
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 sm:pt-4">
                  {product.attributeGroups && product.attributeGroups.length > 0 && (
                    <div className="space-y-3 sm:space-y-4 mb-3 sm:mb-6">
                      {product.attributeGroups.map((group, idx) => {
                        if (!group.parentAttribute || !group.parentAttribute.name || !group.parentAttribute.values) {
                          return null;
                        }
                        return (
                          <div key={idx}>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                              {group.parentAttribute.name}
                            </label>
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              {group.parentAttribute.values.map((value, vIdx) => (
                                <button
                                  key={vIdx}
                                  type="button"
                                  onClick={() => handleAttributeChange(group.parentAttribute.name, value)}
                                  className={`px-2 py-1 sm:px-3 sm:py-1.5 text-2xs sm:text-sm border rounded-md transition-colors
                                    ${selectedAttributes[group.parentAttribute.name] === value
                                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}
                                  `}
                                >
                                  {value}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {product.attributes && product.attributes.length > 0 && product.attributes.some(attr => attr.name && attr.value) && (
                    <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-6">
                      {product.attributes.filter(attr => attr.name && attr.value).map((attr, idx) => (
                        <div key={idx} className="flex">
                          <span className="text-xs sm:text-sm font-medium text-gray-700 mr-1 sm:mr-2 w-1/3">{attr.name}:</span>
                          <span className="text-xs sm:text-sm text-gray-600">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mb-3 sm:mb-6">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                      Quantity
                    </label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-l-md bg-gray-100 flex items-center justify-center border border-gray-300 disabled:opacity-50 hover:bg-gray-200 transition-colors"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
                        className="w-10 h-8 sm:w-12 sm:h-10 text-center border-t border-b border-gray-300 text-xs sm:text-base text-gray-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(1)}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-r-md bg-gray-100 flex items-center justify-center border border-gray-300 hover:bg-gray-200 transition-colors"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-row gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={addToCart}
                      disabled={product.stock === 0 || cartLoading}
                      className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-md text-sm font-medium transition-colors duration-300 flex justify-center items-center w-full"
                    >
                      {cartLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Adding...
                        </>
                      ) : product.stock === 0 ? (
                        'Out of Stock'
                      ) : isInCart(product._id) ? (
                        'In Cart • Add More'
                      ) : (
                        'Add to Cart'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (wishlistLoading) return;
                        
                        setWishlistLoading(true);
                        try {
                          if (isInWishlist(product._id)) {
                            await removeFromWishlist(product._id);
                          } else {
                            await addToWishlist(product);
                          }
                        } catch (error) {
                          console.error('Wishlist action failed:', error);
                        } finally {
                          setWishlistLoading(false);
                        }
                      }}
                      disabled={wishlistLoading}
                      className={`w-8 h-8 sm:w-10 sm:h-10 ${
                        isInWishlist(product._id)
                          ? 'bg-primary-500 hover:bg-primary-600 text-white'
                          : 'bg-white hover:bg-gray-50 text-gray-700'
                      } border border-gray-300 rounded-md flex items-center justify-center transition duration-300 disabled:opacity-70`}
                      aria-label={isInWishlist(product._id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      {wishlistLoading ? (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill={isInWishlist(product._id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {product.estimatedDeliveryTime && (
                    <div className="mt-2 sm:mt-4 text-xs sm:text-sm text-gray-600">
                      <span className="font-medium">Estimated Delivery:</span> {product.estimatedDeliveryTime}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200">
              <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm font-medium whitespace-nowrap
                    ${activeTab === 'description'
                      ? 'text-primary-600 border-b-2 border-primary-500'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('specifications')}
                  className={`py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm font-medium whitespace-nowrap
                    ${activeTab === 'specifications'
                      ? 'text-primary-600 border-b-2 border-primary-500'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setActiveTab('packaging')}
                  className={`py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm font-medium whitespace-nowrap
                    ${activeTab === 'packaging'
                      ? 'text-primary-600 border-b-2 border-primary-500'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                >
                  Packaging
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm font-medium whitespace-nowrap
                    ${activeTab === 'reviews'
                      ? 'text-primary-600 border-b-2 border-primary-500'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                >
                  Reviews ({reviews.length})
                </button>
              </div>
              <div className="p-3 sm:p-6">
                {activeTab === 'description' && (
                  <div className="prose prose-xs sm:prose-sm max-w-none text-xs sm:text-sm text-gray-700">
                    {product.description ? (
                      <div dangerouslySetInnerHTML={{ __html: product.description }} />
                    ) : (
                      <p>No description available.</p>
                    )}
                  </div>
                )}
                {activeTab === 'specifications' && (
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <tbody className="divide-y divide-gray-200 text-xs sm:text-sm text-gray-700">
                        {product.brand && (
                          <tr>
                            <td className="py-2 sm:py-3 w-1/3 font-medium text-gray-900">Brand</td>
                            <td className="py-2 sm:py-3">{product.brand.name}</td>
                          </tr>
                        )}
                        {product.categories && product.categories.length > 0 && (
                          <tr>
                            <td className="py-2 sm:py-3 w-1/3 font-medium text-gray-900">Category</td>
                            <td className="py-2 sm:py-3">{product.categories.map(category => category.name).join(', ')}</td>
                          </tr>
                        )}
                        {product.sku && (
                          <tr>
                            <td className="py-2 sm:py-3 w-1/3 font-medium text-gray-900">SKU</td>
                            <td className="py-2 sm:py-3">{product.sku}</td>
                          </tr>
                        )}
                        {product.weight && (
                          <tr>
                            <td className="py-2 sm:py-3 w-1/3 font-medium text-gray-900">Weight</td>
                            <td className="py-2 sm:py-3">{product.weight} kg</td>
                          </tr>
                        )}
                        {product.dimensions && (product.dimensions.length || product.dimensions.width || product.dimensions.height) && (
                          <tr>
                            <td className="py-2 sm:py-3 w-1/3 font-medium text-gray-900">Dimensions</td>
                            <td className="py-2 sm:py-3">
                              {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                            </td>
                          </tr>
                        )}
                        {product.attributes && product.attributes.map((attr, idx) => (
                          <tr key={idx}>
                            <td className="py-2 sm:py-3 w-1/3 font-medium text-gray-900">{attr.name}</td>
                            <td className="py-2 sm:py-3">{attr.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {activeTab === 'packaging' && (
                  <div className="space-y-4">
                    <div className="prose prose-xs sm:prose-sm max-w-none text-xs sm:text-sm text-gray-700">
                      <div dangerouslySetInnerHTML={{ __html: product.packagingDescription || '' }} />
                    </div>
                    
                    {/* Package Document Section */}
                    {product.packageDocument && (
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Package Documentation</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                Package Document
                              </p>
                              <p className="text-xs text-gray-500">
                                Download the official package documentation
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              <a
                                href={product.packageDocument}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'reviews' && (
                  <div className="space-y-5 sm:space-y-8">
                    {/* Reviews Summary Card */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Rating Overview */}
                        <div className="flex-shrink-0 w-full md:w-56 text-center md:text-left">
                          <div className="flex flex-col md:items-start items-center">
                            <span className="text-3xl sm:text-4xl font-bold text-gray-900">{product.rating?.toFixed(1) || "0.0"}</span>
                            <div className="my-2">
                              <RatingStars rating={product.rating || 0} />
                            </div>
                            <span className="text-sm text-gray-500">Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
                          </div>
                          
                          <div className="mt-4 md:mt-6 hidden md:block">
                            <button
                              onClick={handleOpenReviewForm}
                              className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-200"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Write a Review
                            </button>
                          </div>
                        </div>
                        
                        {/* Rating Distribution */}
                        <div className="flex-grow">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Rating Distribution</h4>
                          <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => {
                              const count = reviews.filter(review => Math.round(review.rating) === star).length;
                              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                              return (
                                <div 
                                  key={star} 
                                  className="flex items-center group cursor-pointer"
                                  onClick={() => handleFilterByStars(star)}
                                >
                                  <div className="flex items-center w-16">
                                    <span className={`text-sm font-medium ${filterStars === star ? 'text-primary-600' : 'text-gray-700'}`}>{star}</span>
                                    <svg className={`w-4 h-4 mx-1 ${filterStars === star ? 'text-primary-500' : 'text-accent-400'}`} fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  </div>
                                  <div className="flex-grow mx-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                      <div 
                                        className={`h-2.5 rounded-full transition-all duration-300 group-hover:bg-primary-600 ${
                                          filterStars === star ? 'bg-primary-500' : 'bg-accent-500'
                                        }`}
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <div className="w-12 text-xs text-right text-gray-600">
                                    {count} ({percentage.toFixed(0)}%)
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {filterStars > 0 && (
                            <div className="mt-3">
                              <button 
                                onClick={() => setFilterStars(0)}
                                className="text-xs text-primary-500 hover:text-primary-600 flex items-center"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Clear filter
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-5 md:hidden">
                        <button
                          onClick={handleOpenReviewForm}
                          className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-200"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Write a Review
                        </button>
                      </div>
                    </div>

                    {/* Customer Reviews */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-gray-900">Customer Reviews</h4>
                        <div className="flex space-x-2">
                          <select
                            className="text-sm text-gray-600 border border-gray-200 rounded-md py-1 px-2"
                            value={reviewSort}
                            onChange={(e) => setReviewSort(e.target.value)}
                          >
                            <option value="newest">Most Recent</option>
                            <option value="oldest">Oldest First</option>
                            <option value="highest">Highest Rating</option>
                            <option value="lowest">Lowest Rating</option>
                            <option value="helpful">Most Helpful</option>
                          </select>
                        </div>
                      </div>

                      {reviews.length > 0 ? (
                        <div className="space-y-6">
                          {getSortedReviews().slice(0, visibleReviews).map((review) => (
                            <div key={review._id} className="bg-white rounded-lg shadow-sm p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex items-start space-x-3">
                                  <div className="bg-primary-100 rounded-full w-10 h-10 flex items-center justify-center text-primary-600 font-medium">
                                    {(review.user?.name || "Anonymous").substring(0, 1).toUpperCase()}
                                  </div>
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-900 mb-0.5">{review.user?.name || "Anonymous"}</h5>
                                    <div className="flex items-center">
                                      <div className="flex mr-2">
                                        <RatingStars rating={review.rating} />
                                      </div>
                                      <span className="text-xs text-gray-500">
                                        {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    review.rating >= 4 ? 'bg-green-100 text-green-800' : 
                                    review.rating >= 3 ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {review.rating >= 4 ? 'Recommended' : 
                                    review.rating >= 3 ? 'Neutral' : 'Not Recommended'}
                                  </span>
                                </div>
                              </div>
                              
                              {review.title && (
                                <h4 className="text-sm font-medium text-gray-900 mt-3 mb-1">{review.title}</h4>
                              )}
                              <p className="text-sm text-gray-700 whitespace-pre-line">{review.comment}</p>
                              
                              <div className="mt-3 flex items-center">
                                <button 
                                  onClick={() => handleMarkHelpful(review._id)}
                                  disabled={helpfulReviews[review._id]}
                                  className={`inline-flex items-center text-xs ${
                                    helpfulReviews[review._id] 
                                      ? 'text-primary-500 cursor-default' 
                                      : 'text-gray-500 hover:text-gray-700'
                                  }`}
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                  </svg>
                                  {helpfulReviews[review._id] ? "Marked helpful" : `Helpful (${review.helpfulCount || 0})`}
                                </button>
                                <span className="mx-2 text-gray-300">|</span>
                                <button 
                                  onClick={() => handleReportReview(review._id)}
                                  disabled={reportedReviews[review._id]}
                                  className={`inline-flex items-center text-xs ${
                                    reportedReviews[review._id] 
                                      ? 'text-gray-400 cursor-default' 
                                      : 'text-gray-500 hover:text-gray-700'
                                  }`}
                                >
                                  {reportedReviews[review._id] ? "Reported" : "Report"}
                                </button>
                              </div>
                            </div>
                          ))}
                          
                          {getSortedReviews().length > visibleReviews && (
                            <button 
                              onClick={handleLoadMoreReviews}
                              className="w-full py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Load more reviews
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                          <p className="text-sm text-gray-500 mb-4">Share your thoughts about this product with other customers</p>
                          <button
                            onClick={handleOpenReviewForm}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Write the first review
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Review Form Modal */}
                    {showReviewForm && (
                      <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                          {/* Background overlay */}
                          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                          
                          {/* Modal panel */}
                          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                              <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    Write a Review
                                  </h3>
                                  <div className="mt-4">
                                    <form onSubmit={handleSubmitReview}>
                                      {/* Star Rating Selection */}
                                      <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                        <div className="flex space-x-1">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                              key={star}
                                              type="button"
                                              onClick={() => handleRatingChange(star)}
                                              className="focus:outline-none"
                                            >
                                              <svg 
                                                className={`w-8 h-8 ${
                                                  star <= reviewFormData.rating 
                                                    ? 'text-yellow-400' 
                                                    : 'text-gray-300'
                                                }`} 
                                                fill="currentColor" 
                                                viewBox="0 0 20 20"
                                              >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                              </svg>
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                      
                                      {/* Review Title */}
                                      <div className="mb-4">
                                        <label htmlFor="review-title" className="block text-sm font-medium text-gray-700 mb-1">
                                          Title (optional)
                                        </label>
                                        <input
                                          type="text"
                                          id="review-title"
                                          name="title"
                                          value={reviewFormData.title}
                                          onChange={handleReviewFormChange}
                                          maxLength="100"
                                          className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                                          placeholder="Summarize your experience"
                                        />
                                      </div>
                                      
                                      {/* Review Comment */}
                                      <div className="mb-4">
                                        <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-1">
                                          Review <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                          id="review-comment"
                                          name="comment"
                                          value={reviewFormData.comment}
                                          onChange={handleReviewFormChange}
                                          rows="4"
                                          required
                                          className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                                          placeholder="Share your experience with this product"
                                        ></textarea>
                                      </div>
                                      
                                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                        <button
                                          type="submit"
                                          disabled={submittingReview}
                                          className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm ${
                                              submittingReview ? 'opacity-70 cursor-not-allowed' : ''
                                            }`}
                                        >
                                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={handleCloseReviewForm}
                                          disabled={submittingReview}
                                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </form>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="mt-4 sm:mt-8">
              <div className="flex justify-between items-center mb-2 sm:mb-4">
                <h2 className="text-base sm:text-xl font-bold text-gray-900">Related Products</h2>
                <Link to="/products" className="text-xs sm:text-sm text-primary-500 hover:text-primary-600">
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                {relatedProducts.slice(0, 4).map((relatedProduct) => (
                  <ProductCard key={relatedProduct._id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Main component with Suspense wrapper
const ProductDetailPage = () => {
  return (
    <ProductDetailErrorBoundary>
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetail />
      </Suspense>
    </ProductDetailErrorBoundary>
  );
};

export default ProductDetailPage;