import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Helper function to truncate text to a maximum of 100 words
const truncateToWords = (text, maxWords = 100) => {
  if (!text) return '';
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
};

export async function POST(req) {
  try {
    const { messages } = await req.json();
    
    // Get the last 5 messages or all if less than 5
    const conversationHistory = messages.length <= 6 
      ? messages.slice(1) // Skip system message
      : messages.slice(Math.max(1, messages.length - 5)); // Get last 5 messages, skip system
    
    // Format the conversation history and truncate long messages
    const formattedHistory = conversationHistory.map(msg => ({
      role: msg.role,
      parts: [{ text: truncateToWords(msg.content, 100) }]
    }));

    // Format the request according to the API specification
    const requestBody = {
      system_instruction: {
        parts: {
          text: "You are TripSage AI, an expert travel planning assistant. Your role is to help users plan their trips, recommend destinations, and provide detailed travel information."
        }
      },
      contents: formattedHistory
    };

    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const responseBody = await response.json();

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`, responseBody);
      throw new Error(`HTTP error! status: ${response.status}`);
    }   

    // Get the response text
    const botResponse = responseBody?.candidates?.[0]?.content?.parts[0]?.text || 'No response text';
    return NextResponse.json(
      { text: botResponse },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
} 