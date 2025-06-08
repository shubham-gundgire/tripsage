'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IoArrowBack } from 'react-icons/io5';
import { FaImage, FaSpinner, FaUpload } from 'react-icons/fa';
import { use } from 'react';

// Blog categories
const BLOG_CATEGORIES = [
  'European Travel',
  'Indian Travel',
  'Asian Travel',
  'African Travel',
  'American Travel',
  'Adventure',
  'Budget Travel',
  'Luxury Travel',
  'Family Travel',
  'Solo Travel',
  'Sustainable Travel',
  'Food & Cuisine',
  'Cultural Experiences',
  'Travel Tips',
  'Travel Technology'
];

export default function EditBlogPage({ params }) {
  // Unwrap params using React.use()
  const unwrappedParams = use(params);
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [blogId, setBlogId] = useState('');
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [status, setStatus] = useState(''); // success, error or empty
  const [blog, setBlog] = useState(null);
  const [uploadError, setUploadError] = useState('');
  
  // Form fields
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [readTime, setReadTime] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  
  // Initialize blogId directly from unwrapped params
  useEffect(() => {
    // Get the ID directly from the unwrapped params
    if (unwrappedParams && unwrappedParams.id) {
      setBlogId(unwrappedParams.id);
      console.log("Blog ID set:", unwrappedParams.id);
    } else {
      console.error("Could not extract blog ID from params");
    }
  }, [unwrappedParams]);
  
  // Check authentication and fetch blog
  useEffect(() => {
    // Only proceed if blogId is available
    if (!blogId) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(`/login?redirectTo=/blogs/edit/${blogId}`);
      return;
    }
    
    setIsAuthenticated(true);
    
    const fetchBlog = async () => {
      setIsFetching(true);
      try {
        const response = await fetch(`/api/blogs/${blogId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            router.push('/blogs');
            return;
          }
          if (response.status === 401 || response.status === 403) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch blog');
        }
        
        const data = await response.json();
        setBlog(data);
        
        // Populate form fields
        setTitle(data.title);
        setExcerpt(data.excerpt);
        setCategory(data.category);
        setTags(data.tags || []);
        setCoverImage(data.cover_image);
        setReadTime(data.read_time);
        setIsPublished(data.published);
        
        // Convert structured content to HTML
        setContent(convertContentToHTML(data.content));
      } catch (error) {
        console.error('Error fetching blog:', error);
        setStatus('error');
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchBlog();
  }, [blogId]); // Make sure to depend on blogId here
  
  // Convert structured content to HTML
  const convertContentToHTML = (contentBlocks) => {
    if (!contentBlocks || !Array.isArray(contentBlocks)) return '';
    
    let plainText = '';
    
    contentBlocks.forEach(block => {
      switch (block.type) {
        case 'paragraph':
          plainText += block.text + '\n\n';
          break;
        case 'heading':
          plainText += '# ' + block.text + '\n\n';
          break;
        case 'tips':
          if (block.items && Array.isArray(block.items)) {
            plainText += block.items.map(item => '* ' + item).join('\n') + '\n\n';
          }
          break;
        case 'conclusion':
          plainText += '_' + block.text + '_\n\n';
          break;
        // Add more cases as needed
      }
    });
    
    return plainText;
  };
  
  // Add a tag
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  // Remove a tag
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Handle tag input key press
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };
  
  // Estimate read time based on content length
  const estimateReadTime = (text) => {
    // Average reading speed: 200 words per minute
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };
  
  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB');
      return;
    }
    
    setIsUploading(true);
    setUploadError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      setCoverImage(data.url);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  // Process text content to structured content format
  const processContent = (text) => {
    // Parse simple text into structured content
    const paragraphs = text.split('\n\n');
    
    const contentBlocks = [];
    
    paragraphs.forEach(paragraph => {
      if (!paragraph.trim()) return;
      
      // Detect headings (lines that start with # or ##)
      if (paragraph.trim().startsWith('# ')) {
        contentBlocks.push({
          type: 'heading',
          text: paragraph.trim().substring(2)
        });
      } 
      // Detect lists (lines that start with * or -)
      else if (paragraph.includes('\n* ') || paragraph.includes('\n- ')) {
        const listItems = paragraph.split('\n')
          .filter(line => line.trim().startsWith('* ') || line.trim().startsWith('- '))
          .map(line => line.trim().substring(2));
        
        if (listItems.length > 0) {
          contentBlocks.push({
            type: 'tips',
            items: listItems
          });
        }
      }
      // If paragraph is in italics, treat it as conclusion
      else if (paragraph.trim().startsWith('_') && paragraph.trim().endsWith('_')) {
        contentBlocks.push({
          type: 'conclusion',
          text: paragraph.trim().substring(1, paragraph.trim().length - 1)
        });
      }
      // Regular paragraph
      else {
        contentBlocks.push({
          type: 'paragraph',
          text: paragraph.trim()
        });
      }
    });
    
    return contentBlocks;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!title.trim() || !excerpt.trim() || !category || !coverImage.trim() || !content.trim()) {
      setStatus('error');
      return;
    }
    
    // Ensure we have a blogId
    if (!blogId) {
      setStatus('error');
      console.error('Blog ID is missing');
      return;
    }
    
    setIsLoading(true);
    setStatus('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push(`/login?redirectTo=/blogs/edit/${blogId}`);
        return;
      }
      
      // Create structured content
      const contentBlocks = processContent(content);
      
      // Update read time based on content
      const calculatedReadTime = estimateReadTime(content);
      
      // Create blog data
      const blogData = {
        title,
        excerpt,
        category,
        tags,
        cover_image: coverImage,
        read_time: calculatedReadTime,
        content: contentBlocks,
        published: isPublished
      };
      
      // Submit to API
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(blogData)
      });
      
      if (response.ok) {
        setStatus('success');
        // Redirect after a short delay
        setTimeout(() => {
          router.push(`/blogs/${blogId}`);
        }, 1000);
      } else {
        const data = await response.json();
        console.error('Blog update failed:', data.error);
        setStatus('error');
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isAuthenticated || isFetching) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16 flex items-center justify-center">
        <div className="animate-pulse">
          <FaSpinner className="animate-spin text-4xl text-teal-600 mx-auto" />
          <p className="mt-4 text-gray-600">
            {!isAuthenticated ? 'Checking authentication...' : 'Loading blog...'}
          </p>
        </div>
      </div>
    );
  }
  
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
          href={`/blogs/${blogId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <IoArrowBack />
          <span>Back to blog</span>
        </Link>
      </div>
      
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Edit Blog
        </h1>
        <p className="text-gray-600">
          Update your blog and make it even better.
        </p>
      </div>
      
      {/* Form */}
      <form 
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto px-4 md:px-6"
      >
        {/* Status messages */}
        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
            Blog updated successfully! Redirecting...
          </div>
        )}
        
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            There was an error updating your blog. Please check the form and try again.
          </div>
        )}
        
        {/* Title */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            placeholder="Enter a captivating title"
            required
          />
        </div>
        
        {/* Excerpt */}
        <div className="mb-6">
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
            Excerpt/Summary *
          </label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            placeholder="Write a brief summary of your blog (1-2 sentences)"
            rows={3}
            required
          />
        </div>
        
        {/* Cover Image */}
        <div className="mb-6">
          <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-2">
            Cover Image *
          </label>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={triggerFileInput}
                disabled={isUploading}
                className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md ${
                  isUploading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } transition-colors`}
              >
                {isUploading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaUpload />
                    Upload Image
                  </>
                )}
              </button>
              
              <input
                id="coverImage"
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                placeholder="Or enter image URL directly"
                required
              />
            </div>
            
            {uploadError && (
              <p className="text-sm text-red-600">{uploadError}</p>
            )}
            
            {coverImage && (
              <div className="relative w-full h-48 rounded-md overflow-hidden border border-gray-200">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {!coverImage && (
              <div className="w-full h-48 flex items-center justify-center bg-gray-100 text-gray-400 rounded-md border border-gray-200">
                <div className="flex flex-col items-center">
                  <FaImage className="text-4xl mb-2" />
                  <p>No image selected</p>
                </div>
              </div>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Upload an image or provide a URL. Recommended size: 1200×800 pixels.
          </p>
        </div>
        
        {/* Category */}
        <div className="mb-6">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            required
          >
            <option value="">Select a category</option>
            {BLOG_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        
        {/* Tags */}
        <div className="mb-6">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex items-center gap-2">
            <input
              id="tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagKeyPress}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="Add a tag and press Enter"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full flex items-center gap-1 text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-teal-500 hover:text-teal-700 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="mb-6">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            placeholder="Write your blog content here..."
            rows={10}
            required
          />
        </div>
        
        {/* Publish option */}
        <div className="mb-8">
          <div className="flex items-center">
            <input
              id="published"
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
              Published
            </label>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            If unchecked, your blog will be saved as a draft and won't be visible to others.
          </p>
        </div>
        
        {/* Submit button */}
        <div className="flex justify-end gap-4">
          <Link
            href={`/blogs/${blogId}`}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-2 rounded-md text-white transition-colors ${
              isLoading
                ? 'bg-teal-400 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <FaSpinner className="animate-spin" />
                Saving...
              </span>
            ) : (
              'Update Blog'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 