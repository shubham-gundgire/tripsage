import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// Static dummy data for hotel details
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
    availability: true,
    room_types: [
      {
        id: 101,
        name: "Deluxe King Room",
        price_per_night: 350,
        max_guests: 2,
        beds: "1 King Bed",
        description: "Spacious room with king-sized bed, city view, and luxury amenities.",
        images: ["/images/rooms/deluxe-king-1.jpg", "/images/rooms/deluxe-king-2.jpg"]
      },
      {
        id: 102,
        name: "Executive Suite",
        price_per_night: 550,
        max_guests: 3,
        beds: "1 King Bed, 1 Sofa Bed",
        description: "Elegant suite with separate living area, panoramic city views, and premium amenities.",
        images: ["/images/rooms/executive-suite-1.jpg", "/images/rooms/executive-suite-2.jpg"]
      },
      {
        id: 103,
        name: "Family Room",
        price_per_night: 450,
        max_guests: 4,
        beds: "2 Queen Beds",
        description: "Comfortable room ideal for families, with two queen beds and additional space.",
        images: ["/images/rooms/family-room-1.jpg", "/images/rooms/family-room-2.jpg"]
      }
    ]
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
    availability: true,
    room_types: [
      {
        id: 201,
        name: "Ocean View Room",
        price_per_night: 275,
        max_guests: 2,
        beds: "1 Queen Bed",
        description: "Cozy room with beautiful ocean views and balcony.",
        images: ["/images/rooms/ocean-view-1.jpg", "/images/rooms/ocean-view-2.jpg"]
      },
      {
        id: 202,
        name: "Beachfront Suite",
        price_per_night: 450,
        max_guests: 3,
        beds: "1 King Bed, 1 Sofa Bed",
        description: "Luxurious suite with direct beach access and private terrace.",
        images: ["/images/rooms/beachfront-suite-1.jpg", "/images/rooms/beachfront-suite-2.jpg"]
      }
    ]
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
    availability: true,
    room_types: [
      {
        id: 301,
        name: "Standard Room",
        price_per_night: 195,
        max_guests: 2,
        beds: "1 Queen Bed",
        description: "Cozy room with rustic decor and mountain views.",
        images: ["/images/rooms/standard-mountain-1.jpg", "/images/rooms/standard-mountain-2.jpg"]
      },
      {
        id: 302,
        name: "Deluxe Cabin",
        price_per_night: 350,
        max_guests: 4,
        beds: "1 King Bed, 2 Twin Beds",
        description: "Spacious cabin with fireplace and private balcony overlooking the mountains.",
        images: ["/images/rooms/deluxe-cabin-1.jpg", "/images/rooms/deluxe-cabin-2.jpg"]
      }
    ]
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
    availability: true,
    room_types: [
      {
        id: 401,
        name: "Designer Room",
        price_per_night: 220,
        max_guests: 2,
        beds: "1 Queen Bed",
        description: "Uniquely designed room with contemporary furnishings and city views.",
        images: ["/images/rooms/designer-room-1.jpg", "/images/rooms/designer-room-2.jpg"]
      },
      {
        id: 402,
        name: "Loft Suite",
        price_per_night: 380,
        max_guests: 3,
        beds: "1 King Bed, 1 Sofa Bed",
        description: "Trendy loft-style suite with separate living area and panoramic city views.",
        images: ["/images/rooms/loft-suite-1.jpg", "/images/rooms/loft-suite-2.jpg"]
      }
    ]
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
    availability: true,
    room_types: [
      {
        id: 501,
        name: "Classic Room",
        price_per_night: 310,
        max_guests: 2,
        beds: "1 Queen Bed",
        description: "Elegantly appointed room with classic decor and period features.",
        images: ["/images/rooms/classic-room-1.jpg", "/images/rooms/classic-room-2.jpg"]
      },
      {
        id: 502,
        name: "Heritage Suite",
        price_per_night: 550,
        max_guests: 3,
        beds: "1 King Bed, 1 Sofa Bed",
        description: "Luxurious suite featuring original architectural elements and antique furnishings.",
        images: ["/images/rooms/heritage-suite-1.jpg", "/images/rooms/heritage-suite-2.jpg"]
      },
      {
        id: 503,
        name: "Presidential Suite",
        price_per_night: 850,
        max_guests: 4,
        beds: "1 King Bed, 2 Queen Beds",
        description: "Opulent multi-room suite with butler service and panoramic city views.",
        images: ["/images/rooms/presidential-suite-1.jpg", "/images/rooms/presidential-suite-2.jpg"]
      }
    ]
  }
];

export async function GET(request, { params }) {
  console.log('⬇️ Starting hotel detail API request');
  const { id } = params;
  console.log('🏨 Hotel ID:', id);
  
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

    // Find the hotel in dummy data
    const hotel = dummyHotels.find(hotel => hotel.id === parseInt(id));
    
    if (!hotel) {
      console.error('❌ Hotel not found');
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }

    console.log('✅ Hotel details fetched successfully');
    return NextResponse.json({ 
      hotel,
      roomTypes: hotel.room_types 
    });
  } catch (error) {
    console.error('❌ Unexpected error in hotel detail API:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'An unexpected error occurred: ' + error.message },
      { status: 500 }
    );
  }
} 