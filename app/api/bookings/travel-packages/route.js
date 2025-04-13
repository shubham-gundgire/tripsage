import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// Static dummy data for travel packages
const dummyTravelPackages = [
  {
    id: 1,
    name: "Tropical Island Getaway",
    description: "Escape to paradise with this all-inclusive tropical island vacation package. Enjoy crystal clear waters, white sandy beaches, and luxurious accommodations.",
    destination: "Bali, Indonesia",
    price: 1899,
    discounted_price: 1599,
    duration: 7,
    group_size: 20,
    rating: 4.9,
    includes: [
      "Round-trip flights",
      "5-star resort accommodation",
      "All meals and drinks",
      "Airport transfers",
      "Daily activities and excursions",
      "Professional guide"
    ],
    excludes: [
      "Travel insurance",
      "Personal expenses",
      "Optional activities"
    ],
    images: [
      "/images/travel/bali-1.jpg",
      "/images/travel/bali-2.jpg",
      "/images/travel/bali-3.jpg"
    ],
    featured: true,
    difficulty: "Easy",
    departure_dates: ["2023-07-15", "2023-08-12", "2023-09-10"]
  },
  {
    id: 2,
    name: "Alpine Adventure Tour",
    description: "Experience the breathtaking beauty of the Swiss Alps with this adventure package. Hike through picturesque landscapes, stay in charming mountain lodges, and enjoy authentic local cuisine.",
    destination: "Switzerland",
    price: 2450,
    discounted_price: null,
    duration: 10,
    group_size: 12,
    rating: 4.7,
    includes: [
      "Accommodation in mountain lodges",
      "All breakfasts and dinners",
      "Expert mountain guide",
      "Cable car tickets",
      "Hiking equipment"
    ],
    excludes: [
      "Flights to Switzerland",
      "Lunches",
      "Travel insurance",
      "Personal expenses"
    ],
    images: [
      "/images/travel/switzerland-1.jpg",
      "/images/travel/switzerland-2.jpg"
    ],
    featured: true,
    difficulty: "Moderate",
    departure_dates: ["2023-06-20", "2023-07-25", "2023-08-30"]
  },
  {
    id: 3,
    name: "Cultural Heritage Tour",
    description: "Immerse yourself in the rich history and vibrant culture of Japan. Visit ancient temples, experience traditional tea ceremonies, and explore modern Tokyo.",
    destination: "Japan",
    price: 3200,
    discounted_price: 2899,
    duration: 14,
    group_size: 16,
    rating: 4.8,
    includes: [
      "Round-trip flights",
      "4-star hotels",
      "Daily breakfast",
      "Bullet train passes",
      "English-speaking guide",
      "Entrance fees to attractions"
    ],
    excludes: [
      "Some meals",
      "Optional activities",
      "Travel insurance"
    ],
    images: [
      "/images/travel/japan-1.jpg",
      "/images/travel/japan-2.jpg"
    ],
    featured: false,
    difficulty: "Easy",
    departure_dates: ["2023-09-05", "2023-10-10", "2023-11-15"]
  },
  {
    id: 4,
    name: "Safari Adventure",
    description: "Embark on the ultimate wildlife adventure in the heart of Africa. Witness the majestic Big Five on daily game drives and experience authentic African culture.",
    destination: "Kenya",
    price: 4500,
    discounted_price: 3850,
    duration: 8,
    group_size: 10,
    rating: 4.9,
    includes: [
      "Round-trip flights",
      "Luxury tented camps",
      "All meals",
      "Daily game drives",
      "Park entrance fees",
      "Safari guide"
    ],
    excludes: [
      "Visa fees",
      "Travel insurance",
      "Personal expenses",
      "Gratuities"
    ],
    images: [
      "/images/travel/kenya-1.jpg",
      "/images/travel/kenya-2.jpg"
    ],
    featured: true,
    difficulty: "Moderate",
    departure_dates: ["2023-07-10", "2023-08-05", "2023-09-15"]
  },
  {
    id: 5,
    name: "Historic Cities Tour",
    description: "Journey through the most beautiful historic cities of Europe. Discover architectural wonders, artistic masterpieces, and culinary delights across multiple countries.",
    destination: "Europe",
    price: 2850,
    discounted_price: 2599,
    duration: 12,
    group_size: 18,
    rating: 4.6,
    includes: [
      "All transportation between cities",
      "4-star hotel accommodation",
      "Daily breakfast",
      "City tours with local guides",
      "Museum entrance fees"
    ],
    excludes: [
      "Flights to Europe",
      "Most lunches and dinners",
      "Travel insurance"
    ],
    images: [
      "/images/travel/europe-1.jpg",
      "/images/travel/europe-2.jpg"
    ],
    featured: false,
    difficulty: "Easy",
    departure_dates: ["2023-06-15", "2023-07-20", "2023-09-01"]
  }
];

export async function GET(request) {
  console.log('⬇️ Starting travel-packages API request');

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
    
    // Get filter parameters
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get('destination');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const duration = searchParams.get('duration');
    
    console.log('🔍 Filter params:', { destination, minPrice, maxPrice, duration });
    
    // Filter the dummy data based on parameters
    let filteredPackages = [...dummyTravelPackages];
    
    if (destination) {
      filteredPackages = filteredPackages.filter(pkg => 
        pkg.destination.toLowerCase().includes(destination.toLowerCase())
      );
    }
    
    if (minPrice && !isNaN(minPrice)) {
      const min = parseInt(minPrice);
      filteredPackages = filteredPackages.filter(pkg => 
        (pkg.discounted_price || pkg.price) >= min
      );
    }
    
    if (maxPrice && !isNaN(maxPrice)) {
      const max = parseInt(maxPrice);
      filteredPackages = filteredPackages.filter(pkg => 
        (pkg.discounted_price || pkg.price) <= max
      );
    }
    
    if (duration) {
      // Handle duration ranges
      const [min, max] = duration.split('-');
      
      if (min && max) {
        // Range like "1-3", "4-7", etc.
        filteredPackages = filteredPackages.filter(pkg => 
          pkg.duration >= parseInt(min) && pkg.duration <= parseInt(max)
        );
      } else if (duration.includes('+')) {
        // Range like "15+"
        const minDuration = parseInt(duration.replace('+', ''));
        filteredPackages = filteredPackages.filter(pkg => pkg.duration >= minDuration);
      } else if (!isNaN(duration)) {
        // Exact duration
        filteredPackages = filteredPackages.filter(pkg => pkg.duration === parseInt(duration));
      }
    }
    
    console.log(`✅ Successfully filtered ${filteredPackages.length} travel packages`);
    return NextResponse.json({ travelPackages: filteredPackages });
  } catch (error) {
    console.error('❌ Unexpected error in travel packages API:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'An unexpected error occurred: ' + error.message },
      { status: 500 }
    );
  }
} 