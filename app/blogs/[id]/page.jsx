'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { IoArrowBack } from 'react-icons/io5';
import { use } from 'react';
import blogData from '../../data/blogs.json';

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
          <Image
            src={block.url}
            alt={block.caption}
            fill
            className="object-cover"
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

export default function BlogPost({ params }) {
  const resolvedParams = use(params);
  const blog = blogData.blogs.find(b => b.id === resolvedParams.id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!blog) {
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
        <Link 
          href="/blogs"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <IoArrowBack />
          <span>Back to blogs</span>
        </Link>
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
          <span>{blog.readTime}</span>
        </div>
        
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
          {blog.title}
        </h1>
        
        <div className="flex items-center gap-4 mb-8">
          <div>
            <p className="font-medium text-gray-900">{blog.author}</p>
          </div>
        </div>

        {/* Cover Image */}
        <div className="relative w-full h-[60vh] rounded-2xl overflow-hidden mb-12">
          <Image
            src={blog.coverImage}
            alt={blog.title}
            fill
            className="object-cover"
            priority
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