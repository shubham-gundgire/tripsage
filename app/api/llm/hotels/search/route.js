import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/app/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

// Fallback hotel data when API fails
const getFallbackHotels = (location, minPrice = 100, maxPrice = 500, minRating = 3.5) => {
  const basePrice = Math.min(Math.max(minPrice, 100), maxPrice);
  return {
    hotels: [
      {
        id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
        name: `${location} Grand Hotel`,
        location: `${location}, Country`,
        address: `123 Main Street, ${location}`,
        description: `Experience luxury in the heart of ${location} with stunning views. Our centrally located hotel offers premium amenities and exceptional service. Just minutes away from major attractions and shopping districts.`,
        price_per_night: basePrice + 99,
        rating: 4.8,
        amenities: ["Free Wi-Fi", "Swimming Pool", "Spa", "Fitness Center", "Restaurant", "Room Service", "24-Hour Front Desk"],
        images: [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070",
          "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070",
          "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2025"
        ],
        room_types: ["Standard", "Deluxe", "Suite"]
      },
      {
        id: "d290f1ee-6c54-4b01-90e6-d701748f0852",
        name: `${location} Boutique Resort`,
        location: `${location}, Country`,
        address: `456 Park Avenue, ${location}`,
        description: `A charming boutique hotel offering personalized service and unique accommodations. Our intimate property features individually designed rooms and a tranquil garden courtyard. Enjoy our award-winning restaurant and bar.`,
        price_per_night: basePrice + 149,
        rating: 4.6,
        amenities: ["Free Wi-Fi", "Garden", "Restaurant", "Bar", "Concierge", "Laundry Service", "Airport Shuttle"],
        images: [
          "https://images.unsplash.com/photo-1618245318763-453825cd2de4?q=80&w=2070",
          "https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?q=80&w=2127",
          "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070"
        ],
        room_types: ["Classic", "Superior", "Junior Suite"]
      },
      {
        id: "d290f1ee-6c54-4b01-90e6-d701748f0853",
        name: `${location} Plaza Hotel`,
        location: `${location}, Country`,
        address: `789 Boulevard Street, ${location}`,
        description: `Modern elegance meets comfort at our downtown hotel. Floor-to-ceiling windows offer spectacular city views. Our rooftop pool and lounge is the perfect place to unwind after a day of exploring ${location}.`,
        price_per_night: basePrice + 79,
        rating: 4.4,
        amenities: ["Free Wi-Fi", "Rooftop Pool", "Fitness Center", "Restaurant", "Business Center", "Parking", "Pet Friendly"],
        images: [
          "https://images.unsplash.com/photo-1606402179428-a57976d71fa4?q=80&w=2074",
          "https://images.unsplash.com/photo-1631049552240-59c37f38802b?q=80&w=2070",
          "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=2080"
        ],
        room_types: ["City View", "Executive", "Family Suite"]
      },
      {
        id: "d290f1ee-6c54-4b01-90e6-d701748f0854",
        name: `${location} Riverside Inn`,
        location: `${location}, Country`,
        address: `321 Waterfront Drive, ${location}`,
        description: `Nestled along the scenic riverfront, our hotel combines rustic charm with modern comforts. Enjoy breathtaking water views and easy access to riverside walking trails. Our restaurant specializes in farm-to-table cuisine.`,
        price_per_night: basePrice + 199,
        rating: 4.7,
        amenities: ["Free Wi-Fi", "Riverside Terrace", "Restaurant", "Bar", "Bicycle Rental", "Fishing", "Garden"],
        images: [
          "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=2089",
          "https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?q=80&w=2070",
          "https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?q=80&w=2127"
        ],
        room_types: ["River View", "Garden View", "Luxury Suite"]
      },
      {
        id: "d290f1ee-6c54-4b01-90e6-d701748f0855",
        name: `Historic ${location} Hotel`,
        location: `${location}, Country`,
        address: `555 Heritage Lane, ${location}`,
        description: `A landmark hotel housed in a beautifully restored historic building. Original architectural details blend with contemporary amenities. Our property is within walking distance to major museums and cultural attractions.`,
        price_per_night: basePrice + 129,
        rating: 4.5,
        amenities: ["Free Wi-Fi", "Historic Tours", "Restaurant", "Bar", "Library", "Meeting Rooms", "Valet Parking"],
        images: [
          "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070",
          "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070",
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070"
        ],
        room_types: ["Heritage Room", "Premium Room", "Presidential Suite"]
      },
      {
        id: "d290f1ee-6c54-4b01-90e6-d701748f0856",
        name: `${location} Beach Resort`,
        location: `${location}, Country`,
        address: `888 Coastal Highway, ${location}`,
        description: `Escape to our beachfront paradise with direct access to pristine sands and turquoise waters. Spacious rooms feature private balconies with ocean views. Enjoy water sports, multiple dining options, and our luxurious spa.`,
        price_per_night: basePrice + 249,
        rating: 4.9,
        amenities: ["Free Wi-Fi", "Private Beach", "Swimming Pools", "Spa", "Water Sports", "Multiple Restaurants", "Kids Club"],
        images: [
          "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2080",
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070",
          "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=2070"
        ],
        room_types: ["Ocean View", "Garden Bungalow", "Beach Villa"]
      }
    ]
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
    const { location, minPrice, maxPrice, rating } = await request.json();

    // Validate inputs
    if (!location || location.trim() === '') {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    // Log the search parameters
    console.log('Hotel search parameters:', { location, minPrice, maxPrice, rating });

    let hotelData;
    
    // First, check if the API key is available
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.log('No Google AI API key found, using fallback data');
      hotelData = getFallbackHotels(location, minPrice, maxPrice, rating);
      // Add flag to indicate this is fallback data
      hotelData.is_fallback_data = true;
    } else {
      try {
        // Generate dynamic hotel data using LLM
        const prompt = `
          Generate a list of 6 realistic hotels in ${location} as JSON. 
          ${minPrice ? `Minimum price per night: $${minPrice}.` : ''}
          ${maxPrice ? `Maximum price per night: $${maxPrice}.` : ''}
          ${rating ? `Minimum rating: ${rating} stars.` : ''}
          
          Each hotel should include:
          - id (UUID string)
          - name (hotel name)
          - location (city, country)
          - address (street address)
          - description (3-4 sentences about the hotel)
          - price_per_night (number between ${minPrice || 100} and ${maxPrice || 500})
          - rating (number between 3.5 and 5.0)
          - amenities (array of 5-7 amenities)
          - images (array of 3 placeholder image URLs from unsplash.com)
          - room_types (array of 3 room type names)
          
          Return ONLY valid JSON without any explanations, prefixes, or markdown formatting.
          The response should look like: {"hotels": [ ... array of hotel objects ... ]}
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
          hotelData = getFallbackHotels(location, minPrice, maxPrice, rating);
          // Add flag to indicate this is fallback data
          hotelData.is_fallback_data = true;
        }
      } catch (aiError) {
        console.error('Error with AI API call:', aiError);
        // If the API call fails, use mock data
        hotelData = getFallbackHotels(location, minPrice, maxPrice, rating);
        // Add flag to indicate this is fallback data
        hotelData.is_fallback_data = true;
      }
    }

    return NextResponse.json(hotelData);
  } catch (error) {
    console.error('Hotel search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 