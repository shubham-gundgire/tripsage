import { NextResponse } from 'next/server';
import supabase from '@/app/lib/supabase';

// Initialize Google AI - Match the working implementation from destination-details/route.js
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function POST(request) {
  try {
    // Parse the request body
    const { destination, startDate, endDate, guests } = await request.json();

    // Validate inputs
    if (!destination) {
      return NextResponse.json(
        { error: 'Destination is required' },
        { status: 400 }
      );
    }

    // Generate a unique URL path for sharing
    const shareId = crypto.randomUUID();
    console.log('Generated share ID:', shareId);
    const shareUrl = `/shared-trip/${shareId}`;

    // Check if API key is available
    if (!GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is not defined, using fallback response');
      return NextResponse.json(
        { error: 'AI service is not available' },
        { status: 503 }
      );
    }

    // Generate the LLM prompt
    const prompt = `
      Generate a comprehensive travel summary for a trip to ${destination}.
      ${startDate && endDate ? `The trip dates are from ${startDate} to ${endDate}.` : ''}
      ${guests ? `There are ${guests} travelers.` : ''}
      
      The summary should include three main sections:
      
      1. Place Information - Include key facts about ${destination}, notable attractions, best times to visit, and cultural highlights.
      
      2. Budget Information - Provide approximate costs for accommodation, food, transportation, and activities in ${destination}.
      
      3. Itinerary Information - Suggest a day-by-day itinerary for exploring ${destination}.
      
      Return the data as a JSON object with the following structure:
      {
        "summary_text": "A brief overall summary of the trip in 2-3 paragraphs",
        "place_info": {
          "description": "General description",
          "highlights": ["Highlight 1", "Highlight 2", ...],
          "best_time_to_visit": "Season information",
          "language": "Main language(s)",
          "currency": "Local currency"
        },
        "budget_info": {
          "accommodation": "Price range and information",
          "food": "Daily food budget estimate",
          "transportation": "Local transport costs",
          "activities": "Cost information for main activities",
          "total_estimate": "Total approximate budget"
        },
        "itinerary_info": {
          "recommended_days": Number,
          "days": [
            {
              "day": 1,
              "title": "Day title",
              "description": "Day description",
              "activities": ["Activity 1", "Activity 2", ...]
            },
            ...
          ]
        }
      }
      
      Return ONLY valid JSON without any explanations, prefixes, or markdown formatting.
    `;

    // Request to the LLM API - Using the format from destination-details/route.js
    const requestBody = {
      system_instruction: {
        parts: {
          text: "You are a travel expert assistant for TripSage. Respond only with JSON in the specified format."
        }
      },
      contents: {
        parts: {
          text: prompt
        }
      }
    };

    console.log('Calling Gemini API with key:', GEMINI_API_KEY ? 'Key exists' : 'No key found');
    
    // Make the API call directly
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('LLM API error:', errorText);
      return NextResponse.json(
        { error: `Failed to generate trip summary (${response.status})` },
        { status: 500 }
      );
    }
    
    const responseData = await response.json();
    console.log('Gemini API response:', JSON.stringify(responseData).substring(0, 200) + '...');
    
    const responseText = responseData?.candidates?.[0]?.content?.parts[0]?.text || '';

    let summaryData;
    try {
      // Extract JSON from the response (handle case where LLM might add extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      summaryData = JSON.parse(jsonString);
    } catch (jsonErr) {
      console.error('Error parsing LLM response:', jsonErr);
      console.log('Raw LLM response:', responseText);
      return NextResponse.json(
        { error: 'Failed to generate trip summary' },
        { status: 500 }
      );
    }

    // Store the summary in the database with a null user_id since there's no authentication
    const { data, error } = await supabase
      .from('trip_summaries')
      .insert({
        destination,
        summary_text: summaryData.summary_text,
        place_info: summaryData.place_info,
        budget_info: summaryData.budget_info,
        itinerary_info: summaryData.itinerary_info,
        user_id: null, // No user authentication, so set to null
        share_url: shareUrl,
        share_id: shareId // Store the unique ID separately for easier querying
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing trip summary:', error);
      return NextResponse.json(
        { error: 'Failed to store trip summary', details: error.message },
        { status: 500 }
      );
    }

    console.log('Trip summary stored successfully with ID:', data.id);

    // Return the summary data and share URL
    return NextResponse.json({
      success: true,
      summary: summaryData,
      shareUrl: shareUrl,
      id: data.id
    });
  } catch (error) {
    console.error('Trip summary generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 