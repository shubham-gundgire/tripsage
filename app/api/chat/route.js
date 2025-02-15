import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function POST(req) {
  try {
    const { messages } = await req.json();

    // Format the request according to the API specification
    const requestBody = {
      system_instruction: {
        parts: {
          text: "You are TripSage AI, an expert travel planning assistant. Your role is to help users plan their trips, recommend destinations, and provide detailed travel information."
        }
      },
      contents: {
        parts: {
          text: messages[messages.length - 1].content
        }
      }
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