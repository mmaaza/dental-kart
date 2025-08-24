import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';

const Hero = ({ slides = [] }) => {
  // Default slides to use if none are provided from props
  const defaultSlides = [
    {
      image: "https://images.dentalkart.com/dkart-pricecomparison/HomepageImages/Surgical-Handpiece-DT.jpg",
      link: "/category/medical-supplies"
    },
    {
      image: "https://images.dentalkart.com/dkart-pricecomparison/HomepageImages/Vasa-DT%20121.jpg",
      link: "/category/healthcare-equipment"
    },
    {
      image: "https://images.dentalkart.com/dkart-pricecomparison/HomepageImages/Intra-Vue-800uu.jpg",
      link: "/category/personal-care"
    }
  ];

  // Use provided slides or fall back to defaults
  const heroSlides = slides.length > 0 ? slides : defaultSlides;

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'start',
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollTo = useCallback(
    (index) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    setScrollSnaps(Array.from({ length: heroSlides.length }));
    emblaApi.on('select', onSelect);
    
    // Auto-play functionality
    const autoplay = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 5000);

    return () => {
      emblaApi.off('select', onSelect);
      clearInterval(autoplay);
    };
  }, [emblaApi, onSelect, heroSlides.length]);

  // If no slides available, don't render the component
  if (heroSlides.length === 0) return null;

  return (
    <section className="relative w-full h-auto md:h-[300px] bg-gray-100 overflow-hidden -mt-0 md:mt-0">
      <div className="embla h-full" ref={emblaRef}>
        <div className="embla__container h-full flex">
          {heroSlides.map((slide, index) => (
            <div className="embla__slide flex-[0_0_100%] min-w-0 relative h-full" key={index}>
              <Link to={slide.link || "#"} className="block w-full h-full">
                <img
                  src={slide.image}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-contain md:object-cover object-center"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Only show navigation arrows if there are multiple slides */}
      {heroSlides.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors duration-300 z-10"
            onClick={() => emblaApi && emblaApi.scrollPrev()}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors duration-300 z-10"
            onClick={() => emblaApi && emblaApi.scrollNext()}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-0 right-0 z-10">
            <div className="flex justify-center gap-1.5">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === selectedIndex 
                      ? 'bg-white scale-110' 
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default Hero;