import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

export default function AnnouncementCarousel({ items, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0); // Optional, though CSS animation preferred

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (items.length <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, 10000); // 10 seconds

    return () => clearInterval(timer);
  }, [currentIndex, items.length]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]" onClick={onClose}>
      <div 
        className="relative w-[90vw] max-w-[520px] sm:max-w-[600px] md:max-w-[680px]"
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-black/70 hover:bg-black text-white rounded-full w-10 h-10 flex items-center justify-center z-10 shadow-lg"
        >
          ✕
        </button>

        {/* Carousel Container */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden relative">
          <div className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] flex items-center justify-center bg-gray-100">
            {items.map((item, index) => (
              <div
                key={item.id || index}
                onClick={onClose}
                className={`absolute inset-0 transition-opacity duration-500 ease-in-out cursor-pointer ${
                  index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <Image
                  src={item.image}
                  alt={item.title || `Slide ${index + 1}`}
                  layout="fill"
                  objectFit="contain"
                  priority={index === 0}
                />
              </div>
            ))}

            {/* Navigation Arrows */}
            {items.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center z-20 transition"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center z-20 transition"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </>
            )}
            
            {/* Pagination Dots */}
            {items.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                {items.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentIndex ? 'bg-blue-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Timebar */}
          {items.length > 1 && (
            <div className="h-1 w-full bg-gray-200 mt-0 relative overflow-hidden">
              <div 
                key={currentIndex} /* Key triggers re-render of animation */
                className="h-full bg-blue-600 animate-[progress_10s_linear]"
                style={{ width: '100%', animation: 'progress 10s linear' }}
              />
            </div>
          )}
          
          {/* Add CSS transition definition internally or as a style block */}
          <style jsx>{`
            @keyframes progress {
              0% { width: 0%; }
              100% { width: 100%; }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
