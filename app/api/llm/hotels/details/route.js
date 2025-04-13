import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/app/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

// Fallback hotel details when API fails
const getFallbackHotelDetails = (id, name, location) => {
  return {
    hotel: {
      id: id,
      name: name,
      location: location,
      address: `123 Main Street, ${location}`,
      description: `Experience luxury and comfort at ${name}, located in the heart of ${location}. Our hotel offers spacious rooms with modern amenities, an award-winning restaurant serving local and international cuisine, and a relaxing spa. We are conveniently located near major attractions, shopping centers, and business districts, making us the perfect choice for both leisure and business travelers. Our dedicated staff is committed to providing exceptional service to ensure a memorable stay.`,
      price_per_night: 249.99,
      rating: 4.7,
      reviews_count: 342,
      amenities: [
        "Free Wi-Fi",
        "Swimming Pool",
        "Fitness Center",
        "Spa & Wellness Center",
        "Restaurant & Bar",
        "24-Hour Room Service",
        "Business Center",
        "Concierge Service",
        "Laundry Service",
        "Airport Shuttle"
      ],
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2025",
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070",
        "https://images.unsplash.com/photo-1618245318763-453825cd2de4?q=80&w=2070",
        "https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?q=80&w=2127"
      ],
      room_types: [
        {
          id: "2a8b5e35-1c9c-4b3d-8c3a-db7e3bcd3e4f",
          name: "Deluxe King Room",
          description: "Spacious room with a king-sized bed, work desk, and city views. Features premium bedding, a 50-inch smart TV, and a luxurious bathroom with a rainfall shower.",
          price_per_night: 249.99,
          capacity: 2,
          amenities: ["King Bed", "City View", "Air Conditioning", "Mini Bar", "Safe", "Free Wi-Fi", "Coffee Maker"],
          images: [
            "https://images.unsplash.com/photo-1631049552240-59c37f38802b?q=80&w=2070",
            "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=2080"
          ]
        },
        {
          id: "9e7b3f2a-1d8e-4c5a-b9f2-e7d6a5c8b1a3",
          name: "Executive Suite",
          description: "Elegant suite with a separate living area, king-sized bed, and panoramic views. Includes access to the Executive Lounge with complimentary breakfast and evening cocktails.",
          price_per_night: 399.99,
          capacity: 2,
          amenities: ["King Bed", "Separate Living Area", "Executive Lounge Access", "Premium Toiletries", "Espresso Machine", "Free Wi-Fi", "Bathrobe & Slippers"],
          images: [
            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070",
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070"
          ]
        },
        {
          id: "5c2e8f1d-7a3b-4e9c-8d5f-1a2b3c4d5e6f",
          name: "Family Room",
          description: "Comfortable room with two queen beds, perfect for families. Features a spacious bathroom, extra seating area, and all standard amenities to ensure a pleasant stay for the whole family.",
          price_per_night: 329.99,
          capacity: 4,
          amenities: ["Two Queen Beds", "Extra Seating", "Child-Friendly", "Air Conditioning", "Mini Fridge", "Free Wi-Fi", "Smart TV"],
          images: [
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=2070",
            "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2025"
          ]
        }
      ],
      nearby_attractions: [
        {
          name: `${location} Central Park`,
          description: `A beautiful urban park just 10 minutes walk from the hotel. Perfect for morning jogs or relaxing afternoon strolls.`
        },
        {
          name: `${location} Museum of Art`,
          description: `World-class art museum featuring both local and international exhibitions, located just 2 km from the hotel.`
        },
        {
          name: `${location} Shopping District`,
          description: `Upscale shopping area with boutiques, department stores, and local crafts, within easy walking distance.`
        },
        {
          name: `Historic ${location} District`,
          description: `Explore the charming historic district with its centuries-old architecture and quaint cafes.`
        }
      ],
      policies: {
        check_in_time: "3:00 PM",
        check_out_time: "12:00 PM",
        cancellation_policy: "Free cancellation up to 24 hours before check-in. Cancellations made less than 24 hours before check-in may be subject to a fee equivalent to one night's stay.",
        pet_policy: "Pets are welcome with a $50 fee per stay. Please notify the hotel in advance.",
        payment_methods: "All major credit cards accepted. A valid credit card is required at check-in for incidental charges."
      }
    }
  };
};

export async function POST(request) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    // Parse the request body
    const { id, name, location } = await request.json();

    // Validate inputs
    if (!id || !name || !location) {
      return NextResponse.json(
        { error: 'Hotel ID, name, and location are required' },
        { status: 400 }
      );
    }

    // Log the hotel details request
    console.log('Hotel details request:', { id, name, location });

    let hotelData;
    
    // First, check if the API key is available
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.log('No Google AI API key found, using fallback data');
      hotelData = getFallbackHotelDetails(id, name, location);
      // Add flag to indicate this is fallback data
      hotelData.is_fallback_data = true;
    } else {
      try {
        // Generate detailed hotel information using LLM
        const prompt = `
          Generate detailed information for a hotel named "${name}" in ${location} as JSON.
          
          The hotel should include these properties:
          - id: "${id}"
          - name: "${name}"
          - location: "${location}"
          - address: (realistic address in ${location})
          - description: (detailed 5-7 sentence description)
          - price_per_night: (realistic price between 100-500)
          - rating: (between 3.5 and 5.0)
          - reviews_count: (between 50 and 500)
          - amenities: (array of 8-10 detailed amenities)
          - images: (array of 5 placeholder image URLs from unsplash.com)
          - room_types: (array of objects with these properties:
              - id: (uuid string)
              - name: (room type name)
              - description: (detailed description)
              - price_per_night: (number)
              - capacity: (number)
              - amenities: (array of room-specific amenities)
              - images: (array of 2 image URLs)
            )
          - nearby_attractions: (array of 3-5 nearby attractions with name and short description)
          - policies: (object with check_in_time, check_out_time, cancellation_policy, etc.)
          
          Return ONLY valid JSON without any explanations, prefixes, or markdown formatting.
          The response should look like: {"hotel": { ... hotel object ... }}
        `;

        // Call the generative model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        // Parse the JSON response
        try {
          // Extract JSON from the response (handle case where LLM might add extra text)
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          const jsonString = jsonMatch ? jsonMatch[0] : responseText;
          hotelData = JSON.parse(jsonString);
        } catch (jsonErr) {
          console.error('Error parsing LLM response:', jsonErr);
          console.log('Raw LLM response:', responseText);
          // If parsing fails, fall back to mock data
          hotelData = getFallbackHotelDetails(id, name, location);
          // Add flag to indicate this is fallback data
          hotelData.is_fallback_data = true;
        }
      } catch (aiError) {
        console.error('Error with AI API call:', aiError);
        // If the API call fails, use fallback data
        hotelData = getFallbackHotelDetails(id, name, location);
        // Add flag to indicate this is fallback data
        hotelData.is_fallback_data = true;
      }
    }

    return NextResponse.json(hotelData);
  } catch (error) {
    console.error('Hotel details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 