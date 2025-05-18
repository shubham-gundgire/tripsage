'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { HiPlus } from 'react-icons/hi';
import { FaUserCircle } from 'react-icons/fa';

const BlogCard = ({ blog }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
  >
    <Link href={`/blogs/${blog.id}`}>
      <div className="relative h-64 overflow-hidden">
        <img
          src={blog.cover_image}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
            <span>{blog.category}</span>
            <span>•</span>
            <span>{blog.read_time}</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">{blog.title}</h2>
        </div>
      </div>
      <div className="p-6">
        <p className="text-gray-600 mb-4 line-clamp-2">{blog.excerpt}</p>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-500">{new Date(blog.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p className="text-sm font-medium text-gray-900">{blog.author_name}</p>
          </div>
          <div className="flex gap-2">
            {blog.tags.slice(0, 2).map((tag, index) => (
              <span 
                key={index}
                className="px-3 py-1 text-xs font-medium text-teal-600 bg-teal-50 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

export default function BlogsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 9
  });
  const [mode, setMode] = useState('all'); // 'all' or 'my'
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    // Fetch blogs based on mode
    fetchBlogs(currentPage, mode);
  }, [currentPage, mode]);

  const fetchBlogs = async (page, blogsMode) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = blogsMode === 'my' 
        ? `/api/blogs/my-blogs?page=${page}&limit=9` 
        : `/api/blogs?page=${page}&limit=9`;
        
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token && blogsMode === 'my') {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, { headers });
      
      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs || []);
        setPagination(data.pagination || {
          page: 1,
          totalPages: 1,
          total: 0,
          limit: 9
        });
      } else {
        console.error('Failed to fetch blogs');
        if (blogsMode === 'my') {
          // If unauthorized, switch to all blogs
          setMode('all');
        }
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (newMode) => {
    if (newMode === 'my' && !isAuthenticated) {
      router.push('/login?redirectTo=/blogs?mode=my');
      return;
    }
    
    setMode(newMode);
    router.push(`/blogs?mode=${newMode}&page=1`);
  };

  const handlePageChange = (newPage) => {
    router.push(`/blogs?mode=${mode}&page=${newPage}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pt-24 pb-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Travel Stories & Insights
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Discover inspiring destinations, travel tips, and adventures from around the world.
          </p>
          
          {/* Action buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={() => handleModeChange('all')}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                mode === 'all' 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Blogs
            </button>
            
            <button
              onClick={() => handleModeChange('my')}
              className={`px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
                mode === 'my' 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaUserCircle />
              My Blogs
            </button>
            
            {isAuthenticated && (
              <Link href="/blogs/new" 
                className="px-6 py-2 rounded-full font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2"
              >
                <HiPlus />
                Add Blog
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {isLoading ? (
          // Loading state
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
                <div className="h-64 bg-gray-200" />
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-gray-200 rounded-full" />
                      <div className="h-6 w-16 bg-gray-200 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          // Empty state
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No blogs found</h3>
            <p className="text-gray-500 mb-6">
              {mode === 'my' 
                ? "You haven't created any blogs yet. Start writing your first blog!" 
                : "There are no blogs available at the moment."}
            </p>
            {mode === 'my' && isAuthenticated && (
              <Link href="/blogs/new" 
                className="px-6 py-2 rounded-full font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors inline-flex items-center gap-2"
              >
                <HiPlus />
                Create your first blog
              </Link>
            )}
          </div>
        )}
        
        {/* Pagination */}
        {blogs.length > 0 && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1}
                className={`p-2 rounded-md ${
                  pagination.page === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Previous
              </button>
              
              {[...Array(pagination.totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`w-10 h-10 rounded-md ${
                    pagination.page === index + 1
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                disabled={pagination.page === pagination.totalPages}
                className={`p-2 rounded-md ${
                  pagination.page === pagination.totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 