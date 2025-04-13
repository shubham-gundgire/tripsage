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
    departure_dates: ["2023-07-15", "2023-08-12", "2023-09-10"],
    detailed_itinerary: [
      {
        day: 1,
        title: "Arrival and Welcome",
        description: "Arrive at Denpasar International Airport. Transfer to your beachfront resort. Welcome dinner with traditional Balinese entertainment."
      },
      {
        day: 2,
        title: "Beach Day and Water Sports",
        description: "Enjoy a day at the pristine beaches with complimentary water sports activities including snorkeling, paddleboarding, and jet skiing."
      },
      {
        day: 3,
        title: "Cultural Village Tour",
        description: "Visit traditional Balinese villages, temples, and rice terraces. Participate in a traditional cooking class."
      },
      {
        day: 4,
        title: "Ubud Art and Monkey Forest",
        description: "Explore the artistic heart of Bali in Ubud. Visit art galleries, craft markets, and the famous Sacred Monkey Forest Sanctuary."
      },
      {
        day: 5,
        title: "Mount Batur Sunrise Trek",
        description: "Optional early morning trek to Mount Batur to witness a breathtaking sunrise. Afternoon spa treatment at the resort."
      },
      {
        day: 6,
        title: "Island Hopping",
        description: "Full-day boat trip to Nusa Penida and surrounding islands. Snorkeling at Crystal Bay and visit to Kelingking Beach."
      },
      {
        day: 7,
        title: "Farewell and Departure",
        description: "Free morning for last-minute shopping or beach time. Transfer to airport for departure."
      }
    ]
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
    departure_dates: ["2023-06-20", "2023-07-25", "2023-08-30"],
    detailed_itinerary: [
      {
        day: 1,
        title: "Arrival in Zurich",
        description: "Arrive in Zurich and transfer to your first mountain lodge in the heart of the Swiss Alps."
      },
      {
        day: 2,
        title: "Interlaken Exploration",
        description: "Explore the charming town of Interlaken with its stunning views of Eiger, Mönch, and Jungfrau mountains."
      },
      {
        day: 3,
        title: "Grindelwald Hike",
        description: "Moderate hike around Grindelwald with breathtaking views of glaciers and alpine meadows."
      },
      {
        day: 4,
        title: "Lauterbrunnen Valley",
        description: "Visit the valley of 72 waterfalls and take a train to Wengen, a car-free mountain village."
      },
      {
        day: 5,
        title: "Jungfraujoch Excursion",
        description: "Journey to the 'Top of Europe' - Jungfraujoch, with its ice palace and panoramic views."
      },
      {
        day: 6,
        title: "Transfer to Zermatt",
        description: "Scenic train journey to Zermatt, the famous car-free resort town at the foot of the Matterhorn."
      },
      {
        day: 7,
        title: "Matterhorn Glacier Paradise",
        description: "Cable car ride to the highest viewpoint in Europe with 360° views of the Alps."
      },
      {
        day: 8,
        title: "Gorner Glacier Hike",
        description: "Guided hike along the Gorner Glacier, one of the largest glaciers in the Alps."
      },
      {
        day: 9,
        title: "Lake Geneva Region",
        description: "Transfer to the Lake Geneva region. Visit vineyards and enjoy a scenic boat cruise on the lake."
      },
      {
        day: 10,
        title: "Departure",
        description: "Transfer to Geneva Airport for your return flight."
      }
    ]
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
    departure_dates: ["2023-09-05", "2023-10-10", "2023-11-15"],
    detailed_itinerary: [
      {
        day: 1,
        title: "Arrival in Tokyo",
        description: "Arrive at Narita or Haneda Airport. Transfer to your hotel in central Tokyo."
      },
      {
        day: 2,
        title: "Tokyo Exploration Day 1",
        description: "Visit Asakusa, Senso-ji Temple, Tokyo Skytree, and Ueno Park."
      },
      {
        day: 3,
        title: "Tokyo Exploration Day 2",
        description: "Explore Shibuya, Harajuku, Meiji Shrine, and Shinjuku districts."
      },
      {
        day: 4,
        title: "Day Trip to Nikko",
        description: "Full-day excursion to Nikko National Park and UNESCO World Heritage shrines and temples."
      },
      {
        day: 5,
        title: "Travel to Hakone",
        description: "Bullet train to Hakone. Explore this scenic mountainous region with hot springs and views of Mt. Fuji."
      },
      {
        day: 6,
        title: "Hakone to Kyoto",
        description: "Morning in Hakone followed by bullet train journey to Kyoto, Japan's cultural heart."
      },
      {
        day: 7,
        title: "Kyoto Exploration Day 1",
        description: "Visit Kinkaku-ji (Golden Pavilion), Nijo Castle, and the Imperial Palace."
      },
      {
        day: 8,
        title: "Kyoto Exploration Day 2",
        description: "Explore Fushimi Inari Shrine with its thousands of red torii gates, Kiyomizu-dera Temple, and Gion District."
      },
      {
        day: 9,
        title: "Day Trip to Nara",
        description: "Visit Japan's first capital with its Great Buddha, Todai-ji Temple, and deer park."
      },
      {
        day: 10,
        title: "Kyoto to Hiroshima",
        description: "Bullet train to Hiroshima. Visit the Peace Memorial Park and Museum."
      },
      {
        day: 11,
        title: "Miyajima Island",
        description: "Day trip to the sacred island of Miyajima with its floating torii gate and Mt. Misen."
      },
      {
        day: 12,
        title: "Hiroshima to Osaka",
        description: "Travel to Osaka, Japan's food capital. Evening street food tour in Dotonbori."
      },
      {
        day: 13,
        title: "Osaka Exploration",
        description: "Visit Osaka Castle, Umeda Sky Building, and Kuromon Market."
      },
      {
        day: 14,
        title: "Departure",
        description: "Transfer to Kansai International Airport for your return flight."
      }
    ]
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
    departure_dates: ["2023-07-10", "2023-08-05", "2023-09-15"],
    detailed_itinerary: [
      {
        day: 1,
        title: "Arrival in Nairobi",
        description: "Arrive at Jomo Kenyatta International Airport. Transfer to your hotel in Nairobi."
      },
      {
        day: 2,
        title: "Nairobi to Amboseli",
        description: "Morning visit to the Giraffe Centre and David Sheldrick Wildlife Trust. Afternoon drive to Amboseli National Park."
      },
      {
        day: 3,
        title: "Amboseli National Park",
        description: "Full day of game drives in Amboseli with views of Mt. Kilimanjaro. Look for elephants, lions, cheetahs, and numerous bird species."
      },
      {
        day: 4,
        title: "Amboseli to Lake Nakuru",
        description: "Drive to Lake Nakuru National Park, famous for its flamingos and rhino sanctuary."
      },
      {
        day: 5,
        title: "Lake Nakuru to Masai Mara",
        description: "Morning game drive in Lake Nakuru, then travel to the world-famous Masai Mara Game Reserve."
      },
      {
        day: 6,
        title: "Masai Mara Game Reserve Day 1",
        description: "Full day of game drives in search of the Big Five. Optional hot air balloon safari at sunrise (additional cost)."
      },
      {
        day: 7,
        title: "Masai Mara Game Reserve Day 2",
        description: "Another day of game viewing. Visit to a traditional Maasai village to learn about their culture and traditions."
      },
      {
        day: 8,
        title: "Return to Nairobi and Departure",
        description: "Morning game drive, then return to Nairobi for your departure flight."
      }
    ]
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
    departure_dates: ["2023-06-15", "2023-07-20", "2023-09-01"],
    detailed_itinerary: [
      {
        day: 1,
        title: "Arrival in Rome",
        description: "Arrive in Rome, the Eternal City. Transfer to your hotel and welcome dinner."
      },
      {
        day: 2,
        title: "Ancient Rome",
        description: "Visit the Colosseum, Roman Forum, Palatine Hill, and the Pantheon."
      },
      {
        day: 3,
        title: "Vatican City",
        description: "Explore Vatican Museums, Sistine Chapel, St. Peter's Basilica, and St. Peter's Square."
      },
      {
        day: 4,
        title: "Rome to Florence",
        description: "Train journey to Florence. Afternoon walking tour including Piazza della Signoria and Ponte Vecchio."
      },
      {
        day: 5,
        title: "Florence Art Day",
        description: "Visit the Uffizi Gallery, Accademia Gallery (home to Michelangelo's David), and the Duomo."
      },
      {
        day: 6,
        title: "Florence to Venice",
        description: "Train to Venice. Evening gondola ride through the canals."
      },
      {
        day: 7,
        title: "Venice Exploration",
        description: "Visit St. Mark's Square, St. Mark's Basilica, Doge's Palace, and explore the charming canals and alleyways."
      },
      {
        day: 8,
        title: "Venice to Vienna",
        description: "Train journey to Vienna, Austria's imperial capital."
      },
      {
        day: 9,
        title: "Vienna Highlights",
        description: "Explore Schönbrunn Palace, Hofburg Palace, Vienna Opera House, and St. Stephen's Cathedral."
      },
      {
        day: 10,
        title: "Vienna to Prague",
        description: "Train to Prague, the City of a Hundred Spires."
      },
      {
        day: 11,
        title: "Prague Exploration",
        description: "Visit Prague Castle, Charles Bridge, Old Town Square, and the Astronomical Clock."
      },
      {
        day: 12,
        title: "Departure from Prague",
        description: "Transfer to Prague Airport for your return flight."
      }
    ]
  }
];

export async function GET(request, { params }) {
  console.log('⬇️ Starting travel package detail API request');
  const { id } = params;
  console.log('🧳 Travel Package ID:', id);
  
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

    // Find the travel package in dummy data
    const travelPackage = dummyTravelPackages.find(pkg => pkg.id === parseInt(id));
    
    if (!travelPackage) {
      console.error('❌ Travel package not found');
      return NextResponse.json(
        { error: 'Travel package not found' },
        { status: 404 }
      );
    }

    console.log('✅ Travel package details fetched successfully');
    return NextResponse.json({ travelPackage });
  } catch (error) {
    console.error('❌ Unexpected error in travel package detail API:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'An unexpected error occurred: ' + error.message },
      { status: 500 }
    );
  }
} 