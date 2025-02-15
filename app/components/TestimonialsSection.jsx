'use client';
import { useState, useEffect } from 'react';
import { FaStar, FaChevronLeft, FaChevronRight, FaQuoteRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    name: "Sarah Mitchell",
    role: "Adventure Enthusiast",
    rating: 5,
    text: "The attention to detail in planning our trek through Nepal was exceptional. Every accommodation, guide, and experience was carefully curated to create unforgettable memories.",
    location: "United Kingdom",
    gradient: "from-blue-500/10 to-purple-500/10"
  },
  {
    id: 2,
    name: "David Chen",
    role: "Food & Culture Explorer",
    rating: 5,
    text: "From street food tours in Bangkok to cooking classes in Kyoto, every moment was authentic and immersive. This wasn't just travel, it was a cultural revelation.",
    location: "Canada",
    gradient: "from-emerald-500/10 to-teal-500/10"
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    role: "Solo Traveler",
    rating: 5,
    text: "As a solo female traveler, safety and experience were my top priorities. They exceeded my expectations with their personalized approach and 24/7 support.",
    location: "Spain",
    gradient: "from-rose-500/10 to-orange-500/10"
  }
];

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setActiveIndex((prev) => (prev + newDirection + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="mb-24 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20">
          {/* Left side - Title */}
          <div className="w-full md:w-1/3 text-left relative">
            <div className="absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-gradient-to-br from-rose-500/10 to-orange-500/10 rounded-full blur-2xl" />
            
            <h4 className="text-indigo-600 font-semibold mb-3 uppercase tracking-wider text-sm">
              Testimonials
            </h4>
            <h2 className="text-4xl md:text-5xl font-russo text-gray-900 mb-6 leading-tight">
              What Our Travelers Say
            </h2>
            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={() => paginate(-1)}
                className="w-12 h-12 rounded-full border-2 border-gray-900/10 flex items-center justify-center text-gray-700 hover:bg-gray-900 hover:text-white transition-all duration-300"
              >
                <FaChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => paginate(1)}
                className="w-12 h-12 rounded-full border-2 border-gray-900/10 flex items-center justify-center text-gray-700 hover:bg-gray-900 hover:text-white transition-all duration-300"
              >
                <FaChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right side - Testimonial */}
          <div className="w-full md:w-2/3 relative min-h-[350px] flex items-center">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl shadow-sm" />
            <div className={`absolute inset-0 bg-gradient-to-br ${testimonials[activeIndex].gradient} rounded-3xl transition-all duration-500`} />
            
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);
                  if (swipe < -swipeConfidenceThreshold) {
                    paginate(1);
                  } else if (swipe > swipeConfidenceThreshold) {
                    paginate(-1);
                  }
                }}
                className="absolute w-full px-6 md:px-8 py-8 md:py-10"
              >
                <div className="text-center md:text-left relative">
                  {/* Quote Icon */}
                  <FaQuoteRight className="absolute top-0 right-0 text-gray-900/5 text-6xl md:text-8xl" />
                  
                  {/* Rating */}
                  <div className="flex gap-1.5 mb-6 justify-center md:justify-start">
                    {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-500 text-lg" />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-lg md:text-2xl text-gray-900 font-light leading-relaxed mb-6 md:mb-8 relative z-10">
                    "{testimonials[activeIndex].text}"
                  </blockquote>

                  {/* Author */}
                  <div className="relative z-10">
                    <p className="font-semibold text-gray-900 text-base md:text-lg mb-1">
                      {testimonials[activeIndex].name}
                    </p>
                    <p className="text-gray-600 text-sm md:text-base">
                      {testimonials[activeIndex].role} • {testimonials[activeIndex].location}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 