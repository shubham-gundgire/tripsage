'use client';
import { useState, useRef, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';

// Fixed color patterns for each card
const cardPatterns = [
  'from-blue-500 to-indigo-600',
  'from-emerald-400 to-teal-500',
  'from-orange-400 to-pink-500',
  'from-purple-400 to-blue-500',
  'from-rose-400 to-red-500',
  'from-teal-400 to-cyan-500'
];

const BlogCard = ({ blog, isCenter }) => {
  return (
    <Link href={`/blogs/${blog.id}`}>
      <div className={`relative group transition-all duration-300 ${
        isCenter ? 'scale-105 md:scale-110 z-10' : 'scale-100 hover:scale-105'
      }`}>
        <div className={`relative overflow-hidden rounded-2xl ${
          isCenter ? 'h-[350px] md:h-[400px]' : 'h-[300px] md:h-[350px]'
        } shadow-lg`}>
          {/* Background Image */}
          <img
            src={blog.cover_image}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
          
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
            <span className="inline-block px-3 py-1 mb-2 md:mb-3 text-sm bg-white/20 backdrop-blur-sm rounded-full">
              {blog.category}
            </span>
            <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">{blog.title}</h3>
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm text-white/80">
                {new Date(blog.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="text-white hover:text-white/80 transition-colors text-sm md:text-base">
                Read More →
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const BlogSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(2);
  const scrollRef = useRef(null);

  // Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/blogs?limit=6');
        if (response.ok) {
          const data = await response.json();
          // Add pattern to each blog
          const blogsWithPattern = data.blogs.map((blog, index) => ({
            ...blog,
            pattern: cardPatterns[index % cardPatterns.length]
          }));
          setBlogs(blogsWithPattern);
        } else {
          console.error('Failed to fetch blogs');
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Reset active index when blogs load
  useEffect(() => {
    if (blogs.length > 0) {
      setActiveIndex(Math.min(2, Math.floor(blogs.length / 2)));
    }
  }, [blogs]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? blogs.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === blogs.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (scrollRef.current && blogs.length > 0) {
      let cardWidth = window.innerWidth >= 640 ? 300 : 280; // Base card width
      let padding = window.innerWidth >= 640 ? 8 : 4; // Padding
      let gap = window.innerWidth >= 640 ? 24 : 16; // Gap between cards
      let totalCardWidth = cardWidth + (padding * 2) + gap;
      
      const scrollPosition = activeIndex * totalCardWidth;
      scrollRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [activeIndex, blogs]);

  return (
    <section className="py-12 mb-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 px-4 md:px-6">
          <div>
            <h4 className="text-md md:text-base text-gray-600 font-opensans mb-2">Latest Updates</h4>
            <h2 className="text-4xl lg:text-5xl font-russo text-gray-900">Travel Stories & Tips</h2>
          </div>
          <Link href="/blogs" className="text-teal-600 hover:text-teal-700 font-medium mt-4 md:mt-0">
            View All Blogs →
          </Link>
        </div>

        <div className="relative">
          {/* Navigation Buttons */}
          {blogs.length > 1 && (
            <>
              <button 
                onClick={handlePrev}
                className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
              >
                <FaChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button 
                onClick={handleNext}
                className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
              >
                <FaChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </>
          )}

          {/* Blog Cards Container */}
          {isLoading ? (
            <div className="py-10 px-4">
              <div className="flex gap-4 md:gap-6 overflow-x-hidden">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="min-w-[280px] sm:min-w-[300px] px-2 py-4">
                    <div className="bg-gray-200 animate-pulse rounded-2xl h-[300px] md:h-[350px]"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : blogs.length > 0 ? (
            <div 
              ref={scrollRef}
              className="overflow-x-hidden py-10"
            >
              <div className="flex gap-4 md:gap-6 px-4 md:px-16">
                {blogs.map((blog, index) => (
                  <div 
                    key={blog.id}
                    className="min-w-[280px] sm:min-w-[300px] px-2 py-4"
                  >
                    <BlogCard 
                      blog={blog} 
                      isCenter={index === activeIndex}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-gray-500">No blogs available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BlogSection; 