'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { IoArrowBack } from 'react-icons/io5';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useRouter, useParams } from 'next/navigation';

const ContentBlock = ({ block }) => {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="text-gray-700 leading-relaxed mb-6">
          {block.text}
        </p>
      );
    case 'heading':
      return (
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          {block.text}
        </h2>
      );
    case 'image':
      return (
        <div className="relative w-full h-96 mb-8 rounded-xl overflow-hidden">
          <img
            src={block.url}
            alt={block.caption}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
            <p className="text-white/90 text-sm">{block.caption}</p>
          </div>
        </div>
      );
    case 'tips':
      return (
        <div className="bg-emerald-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-emerald-800 mb-4">Travel Tips</h3>
          <ul className="space-y-2">
            {block.items.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-emerald-700">
                <span className="text-emerald-500 mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case 'conclusion':
      return (
        <div className="border-l-4 border-teal-500 pl-6 my-8">
          <p className="text-gray-700 italic">
            {block.text}
          </p>
        </div>
      );
    default:
      return null;
  }
};

function BlogPostContent() {
  const router = useRouter();
  const params = useParams();
  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);
  
  useEffect(() => {
    // Only proceed if params.id is available
    if (!params.id) return;
    
    const fetchBlog = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = {};
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`/api/blogs/${params.id}`, { headers });
        
        if (!response.ok) {
          throw new Error('Blog not found');
        }
        
        const data = await response.json();
        setBlog(data);
        
        // Check if current user is the author
        if (token) {
          try {
            const userResponse = await fetch('/api/auth/me', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setIsAuthor(userData.user.id === data.author_id);
            }
          } catch (error) {
            console.error('Error checking author status:', error);
          }
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBlog();
    window.scrollTo(0, 0);
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this blog?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }
      
      const response = await fetch(`/api/blogs/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        router.push('/blogs?mode=my');
      } else {
        alert('Failed to delete blog');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('An error occurred while deleting the blog');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-12" />
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6" />
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8" />
            <div className="h-96 bg-gray-200 rounded-2xl mb-12" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Blog not found</h1>
          <Link 
            href="/blogs"
            className="text-teal-600 hover:text-teal-700 transition-colors"
          >
            Return to blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 mb-8">
        <div className="flex justify-between items-center">
          <Link 
            href="/blogs"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <IoArrowBack />
            <span>Back to blogs</span>
          </Link>
          
          {isAuthor && (
            <div className="flex items-center gap-3">
              <Link
                href={`/blogs/edit/${blog.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                <FaEdit />
                <span>Edit</span>
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <FaTrash />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 md:px-6 mb-12"
      >
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span>{blog.category}</span>
          <span>•</span>
          <span>{new Date(blog.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
          <span>•</span>
          <span>{blog.read_time}</span>
        </div>
        
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
          {blog.title}
        </h1>
        
        <div className="flex items-center gap-4 mb-8">
          <div>
            <p className="font-medium text-gray-900">{blog.author_name}</p>
          </div>
        </div>

        {/* Cover Image */}
        <div className="relative w-full h-[60vh] rounded-2xl overflow-hidden mb-12">
          <img
            src={blog.cover_image}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      </motion.div>

      {/* Content */}
      <motion.article 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-3xl mx-auto px-4 md:px-6"
      >
        {blog.content.map((block, index) => (
          <ContentBlock key={index} block={block} />
        ))}

        {/* Tags */}
        <div className="mt-12 pt-6 border-t">
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-3 py-1 text-sm font-medium text-teal-600 bg-teal-50 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.article>
    </div>
  );
}

export default function BlogPost() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-4 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-xl font-medium text-gray-700">Loading blog...</h2>
          <p className="text-gray-500 mt-2">Please wait while we fetch the content</p>
        </div>
      </div>
    }>
      <BlogPostContent />
    </Suspense>
  );
} 