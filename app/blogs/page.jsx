'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import blogData from '../data/blogs.json';

const BlogCard = ({ blog }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
  >
    <Link href={`/blogs/${blog.id}`}>
      <div className="relative h-64 overflow-hidden">
        <Image
          src={blog.coverImage}
          alt={blog.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
            <span>{blog.category}</span>
            <span>•</span>
            <span>{blog.readTime}</span>
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
            <p className="text-sm font-medium text-gray-900">{blog.author}</p>
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
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pt-24 pb-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Travel Stories & Insights
          </h1>
          <p className="text-lg text-gray-600">
            Discover inspiring destinations, travel tips, and adventures from around the world.
          </p>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogData.blogs.map((blog, index) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      </div>
    </div>
  );
} 