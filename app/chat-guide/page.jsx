'use client';
import { useState, useRef, useEffect } from 'react';
import { FaRobot, FaUser } from 'react-icons/fa';
import { IoSend } from 'react-icons/io5';
import ReactMarkdown from 'react-markdown';

const LoadingDots = () => (
  <div className="flex space-x-1.5">
    <div className="w-1.5 h-1.5 bg-teal-500/40 rounded-full animate-pulse"></div>
    <div className="w-1.5 h-1.5 bg-teal-500/40 rounded-full animate-pulse [animation-delay:-.3s]"></div>
    <div className="w-1.5 h-1.5 bg-teal-500/40 rounded-full animate-pulse [animation-delay:-.5s]"></div>
  </div>
);

const ChatMessage = ({ message, isBot }) => (
  <div className={`group flex gap-3 px-4 py-3 hover:bg-emerald-50/50 transition-colors ${isBot ? '' : 'justify-end'}`}>
    <div className={`flex items-start gap-3 ${!isBot && 'flex-row-reverse'} ${isBot ? 'max-w-3xl' : 'max-w-2xl'}`}>
      <div className={`relative mt-1 w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isBot 
          ? 'bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg shadow-teal-200' 
          : 'bg-gradient-to-br from-slate-700 to-slate-800'
      }`}>
        {isBot ? (
          <FaRobot className="text-white text-xs" />
        ) : (
          <FaUser className="text-white text-xs" />
        )}
        <div className={`absolute -inset-1 ${isBot ? 'bg-teal-500/20' : 'bg-slate-700/20'} rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity`} />
      </div>
      
      <div className={`relative flex-1 ${isBot ? 'bg-white' : 'bg-teal-500'} rounded-2xl px-4 py-3 shadow-sm
        ${isBot ? 'rounded-tl-lg' : 'rounded-tr-lg'}`}>
        <div className={`absolute inset-0 ${isBot ? 'bg-gradient-to-r from-teal-500/5 to-emerald-500/5' : ''} 
          rounded-2xl ${isBot ? 'rounded-tl-lg' : 'rounded-tr-lg'} opacity-0 group-hover:opacity-100 transition-opacity`} />
        <div className={`font-medium text-xs mb-1 ${isBot ? 'text-teal-600' : 'text-teal-50'}`}>
          {isBot ? 'TripSage AI' : 'You'}
        </div>
        <div className={`prose prose-sm max-w-none ${
          isBot 
            ? 'prose-p:leading-relaxed prose-pre:bg-slate-800 prose-pre:text-slate-100 prose-pre:shadow-md text-black' 
            : 'text-white prose-p:leading-relaxed prose-pre:bg-teal-600 prose-pre:text-white prose-headings:text-white prose-a:text-white'
        }`}>
          {typeof message === 'string' ? (
            <ReactMarkdown>{message}</ReactMarkdown>
          ) : (
            message
          )}
        </div>
      </div>
    </div>
  </div>
);

export default function ChatGuide() {
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content: "Welcome to TripSage AI! I'm your personal travel assistant. How can I help you today?",
      displayContent: (
        <div>
          <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-transparent bg-clip-text">
            Welcome to TripSage AI
          </h2>
          <p className="text-slate-600">I'm your personal travel assistant. How can I help you plan your next adventure?</p>
        </div>
      ),
      isBot: true
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    const userMessageObj = {
      role: 'user',
      content: userMessage,
      displayContent: userMessage,
      isBot: false
    };
    
    setMessages(prev => [...prev, userMessageObj]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessageObj].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: responseData.text,
        displayContent: responseData.text,
        isBot: true
      }]);

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        displayContent: 'I apologize, but I encountered an error. Please try again.',
        isBot: true
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-emerald-50 to-white">
      {/* Chat Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-emerald-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl blur-lg opacity-40" />
              <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-200/50">
                <FaRobot className="text-white text-xl" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 text-transparent bg-clip-text">
                TripSage AI
              </h1>
              <p className="text-sm text-slate-500">Your personal travel assistant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto scrollbar-hide pb-32"
      >
        <div className="max-w-6xl mx-auto">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message.displayContent}
              isBot={message.isBot}
            />
          ))}
          {isLoading && (
            <div className="group flex gap-3 px-4 py-3">
              <div className="flex items-start gap-3 max-w-3xl">
                <div className="relative mt-1 w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg shadow-teal-200">
                  <FaRobot className="text-white text-xs" />
                  <div className="absolute -inset-1 bg-teal-500/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="relative flex-1 bg-white rounded-2xl rounded-tl-lg px-4 py-3 shadow-sm">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-emerald-500/5 rounded-2xl rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="font-medium text-xs mb-1 text-teal-600">
                    TripSage AI
                  </div>
                  <LoadingDots />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Chat Input */}
      <div className="bg-white/80 backdrop-blur-lg border-t border-emerald-100 fixed bottom-0 left-0 right-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 md:px-6">
          <form onSubmit={handleSubmit} className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about travel..."
              className="w-full px-4 py-3 pr-12 rounded-xl bg-emerald-50/50 border border-emerald-200 
                focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all 
                placeholder:text-slate-400 text-black"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center 
                rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 text-white 
                disabled:opacity-50 disabled:cursor-not-allowed 
                hover:shadow-lg hover:shadow-teal-200/50 
                transition-all duration-200 disabled:hover:shadow-none"
            >
              <IoSend className="text-sm" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 