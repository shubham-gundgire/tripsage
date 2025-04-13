import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// Static dummy data for hotels
const dummyHotels = [
  {
    id: 1,
    name: "Luxury Palace Hotel",
    description: "Experience ultimate luxury in the heart of the city with stunning views and world-class amenities.",
    location: "New York City, USA",
    price_per_night: 350,
    discounted_price: 295,
    rating: 4.8,
    amenities: ["Free WiFi", "Swimming Pool", "Spa", "Fitness Center", "Restaurant", "Bar", "Room Service", "Parking", "Airport Shuttle"],
    images: [
      "/images/hotels/luxury-palace-1.jpg",
      "/images/hotels/luxury-palace-2.jpg",
      "/images/hotels/luxury-palace-3.jpg"
    ],
    featured: true,
    availability: true
  },
  {
    id: 2,
    name: "Seaside Resort & Spa",
    description: "Relax and unwind at this beautiful beachfront resort featuring private beach access and rejuvenating spa treatments.",
    location: "Miami, USA",
    price_per_night: 275,
    discounted_price: null,
    rating: 4.6,
    amenities: ["Free WiFi", "Beach Access", "Swimming Pool", "Spa", "Fitness Center", "Restaurant", "Bar"],
    images: [
      "/images/hotels/seaside-resort-1.jpg",
      "/images/hotels/seaside-resort-2.jpg"
    ],
    featured: true,
    availability: true
  },
  {
    id: 3,
    name: "Mountain View Lodge",
    description: "Escape to the mountains in this cozy lodge surrounded by nature with breathtaking panoramic views.",
    location: "Denver, USA",
    price_per_night: 195,
    discounted_price: 175,
    rating: 4.5,
    amenities: ["Free WiFi", "Fireplace", "Mountain View", "Restaurant", "Bar", "Hiking Trails"],
    images: [
      "/images/hotels/mountain-lodge-1.jpg",
      "/images/hotels/mountain-lodge-2.jpg"
    ],
    featured: false,
    availability: true
  },
  {
    id: 4,
    name: "Urban Boutique Hotel",
    description: "Stylish and contemporary hotel in the center of the entertainment district with unique décor and personalized service.",
    location: "Los Angeles, USA",
    price_per_night: 220,
    discounted_price: null,
    rating: 4.3,
    amenities: ["Free WiFi", "Boutique Design", "Restaurant", "Bar", "Concierge Service"],
    images: [
      "/images/hotels/urban-boutique-1.jpg",
      "/images/hotels/urban-boutique-2.jpg"
    ],
    featured: false,
    availability: true
  },
  {
    id: 5,
    name: "Historic Grand Hotel",
    description: "Step back in time at this historic landmark hotel offering classic elegance and modern comforts.",
    location: "Chicago, USA",
    price_per_night: 310,
    discounted_price: 265,
    rating: 4.7,
    amenities: ["Free WiFi", "Historic Architecture", "Luxury Spa", "Fine Dining", "Ballroom", "Concierge"],
    images: [
      "/images/hotels/historic-grand-1.jpg",
      "/images/hotels/historic-grand-2.jpg"
    ],
    featured: true,
    availability: true
  }
];

export async function GET(request) {
  console.log('⬇️ Starting hotels API request');
  
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('authorization');
    console.log('🔑 Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ No Bearer token in authorization header');
      return NextResponse.json(
        { error: 'Unauthorized: No valid token provided' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    console.log('🔑 Token retrieved from header');
    
    // Verify and decode the JWT token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
      console.log('✅ Token verified successfully');
    } catch (err) {
      console.error('❌ Invalid token:', err.message);
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }
    
    // Get user ID from decoded token
    const userId = decodedToken.userId;
    console.log('👤 User ID from token:', userId);
    
    // Get filter parameters from the URL
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const rating = searchParams.get('min_rating');
    
    console.log('🔍 Filter params:', { location, minPrice, maxPrice, rating });

    // Filter the dummy data based on parameters
    let filteredHotels = [...dummyHotels];
    
    if (location) {
      filteredHotels = filteredHotels.filter(hotel => 
        hotel.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    if (minPrice && !isNaN(minPrice)) {
      const min = parseInt(minPrice);
      filteredHotels = filteredHotels.filter(hotel => 
        (hotel.discounted_price || hotel.price_per_night) >= min
      );
    }
    
    if (maxPrice && !isNaN(maxPrice)) {
      const max = parseInt(maxPrice);
      filteredHotels = filteredHotels.filter(hotel => 
        (hotel.discounted_price || hotel.price_per_night) <= max
      );
    }
    
    if (rating && !isNaN(rating)) {
      const minRating = parseFloat(rating);
      filteredHotels = filteredHotels.filter(hotel => hotel.rating >= minRating);
    }
    
    console.log(`✅ Successfully filtered ${filteredHotels.length} hotels`);
    return NextResponse.json({ hotels: filteredHotels });
  } catch (error) {
    console.error('❌ Unexpected error in hotels API:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'An unexpected error occurred: ' + error.message },
      { status: 500 }
    );
  }
} 