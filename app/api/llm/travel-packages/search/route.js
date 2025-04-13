import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/app/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || "");

// Fallback travel packages data when API fails
const getFallbackTravelPackages = (destination, minPrice = 1000, maxPrice = 5000, duration = '') => {
  const basePrice = Math.min(Math.max(minPrice, 1000), maxPrice);
  
  // Parse duration to get min and max days
  let minDays = 3;
  let maxDays = 14;
  
  if (duration) {
    if (duration.includes('-')) {
      const [min, max] = duration.split('-');
      minDays = parseInt(min) || 3;
      maxDays = parseInt(max) || 14;
    } else if (duration.includes('+')) {
      minDays = parseInt(duration.replace('+', '')) || 15;
      maxDays = 30;
    } else if (!isNaN(duration)) {
      minDays = parseInt(duration);
      maxDays = parseInt(duration);
    }
  }

  return {
    travelPackages: [
      {
        id: "t290f1ee-6c54-4b01-90e6-d701748f0851",
        name: `${destination} Explorer`,
        description: `Discover the wonders of ${destination} with our comprehensive tour package. Experience the perfect blend of cultural immersion and natural beauty. Our expert guides will take you to hidden gems and must-see attractions.`,
        destination: destination,
        price: basePrice,
        discounted_price: basePrice * 0.85,
        duration: Math.min(Math.max(minDays, 7), maxDays),
        max_participants: 12,
        rating: 4.8,
        highlights: [
          `Exclusive guided tour of ${destination}'s main attractions`,
          "Authentic local cuisine experiences",
          "Comfortable accommodations in premium locations",
          "Small group size for personalized attention"
        ],
        itinerary: [
          {
            title: "Arrival & Welcome",
            description: "Arrive in your destination and enjoy a welcome dinner with your fellow travelers.",
            activities: ["Airport transfer", "Welcome dinner", "Tour briefing"]
          },
          {
            title: "Cultural Exploration",
            description: "Dive into the rich cultural heritage with visits to museums and historical sites.",
            activities: ["Guided museum tour", "Historical district walk", "Local craft workshop"]
          },
          {
            title: "Natural Wonders",
            description: "Experience the breathtaking natural scenery that makes this destination famous.",
            activities: ["Scenic hike", "Photography spots", "Picnic lunch in nature"]
          }
        ],
        included_services: [
          "Professional English-speaking guide",
          "All accommodations",
          "Daily breakfast and selected meals",
          "All entrance fees",
          "Airport transfers",
          "Transportation between destinations"
        ],
        excluded_services: [
          "International flights",
          "Travel insurance",
          "Personal expenses",
          "Optional activities",
          "Gratuities for guides and drivers"
        ],
        images: [
          "https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=80&w=2070",
          "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070",
          "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2070"
        ],
        categories: ["Cultural", "Adventure", "Sightseeing"],
        features: ["English Guide", "Small Group", "Meals Included"],
        accommodation_type: "4-Star Hotels",
        activity_level: "Moderate",
        availability: "Year-round"
      },
      {
        id: "t290f1ee-6c54-4b01-90e6-d701748f0852",
        name: `${destination} Adventure Tour`,
        description: `Embark on a thrilling adventure in the heart of ${destination}. This action-packed itinerary is perfect for those seeking excitement and new experiences. Challenge yourself with outdoor activities while enjoying stunning landscapes.`,
        destination: destination,
        price: basePrice + 500,
        discounted_price: null,
        duration: Math.min(Math.max(minDays, 10), maxDays),
        max_participants: 8,
        rating: 4.9,
        highlights: [
          "Adrenaline-pumping outdoor activities",
          "Exploration of remote and pristine areas",
          "Close encounters with local wildlife",
          "Expert adventure guides"
        ],
        itinerary: [
          {
            title: "Adventure Begins",
            description: "Meet your guides and prepare for your upcoming adventure with equipment briefing.",
            activities: ["Equipment check", "Safety briefing", "Welcome dinner"]
          },
          {
            title: "Into the Wild",
            description: "Venture into untouched wilderness areas with expert guides leading the way.",
            activities: ["Hiking expedition", "Wildlife spotting", "Camping under the stars"]
          },
          {
            title: "Peak Experiences",
            description: "Challenge yourself with the highlight adventure activities of the tour.",
            activities: ["Rock climbing", "Whitewater rafting", "Mountain biking"]
          }
        ],
        included_services: [
          "Professional adventure guides",
          "All necessary equipment",
          "Mixed accommodation (hotels and camping)",
          "All meals during the tour",
          "Activity fees and permits",
          "Transportation during the tour"
        ],
        excluded_services: [
          "Flights to and from destination",
          "Travel insurance (mandatory)",
          "Personal gear and clothing",
          "Alcoholic beverages",
          "Optional activities not in itinerary"
        ],
        images: [
          "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070",
          "https://images.unsplash.com/photo-1544960511-1db20083cdef?q=80&w=1887",
          "https://images.unsplash.com/photo-1533130061792-64b345e4a833?q=80&w=2070"
        ],
        categories: ["Adventure", "Active", "Outdoor"],
        features: ["Expert Guides", "Equipment Included", "All-Inclusive"],
        accommodation_type: "Mixed (Hotels & Camping)",
        activity_level: "Challenging",
        availability: "March to November"
      },
      {
        id: "t290f1ee-6c54-4b01-90e6-d701748f0853",
        name: `${destination} Culinary Journey`,
        description: `Delight your taste buds with an immersive culinary experience in ${destination}. This food-focused tour combines cooking classes, market visits, and dining at both local gems and fine restaurants to provide a complete gastronomic adventure.`,
        destination: destination,
        price: basePrice + 300,
        discounted_price: (basePrice + 300) * 0.9,
        duration: Math.min(Math.max(minDays, 8), maxDays),
        max_participants: 10,
        rating: 4.7,
        highlights: [
          "Hands-on cooking classes with local chefs",
          "Market tours with food tastings",
          "Dining at renowned local restaurants",
          "Wine and beverage pairings"
        ],
        itinerary: [
          {
            title: "Taste Introduction",
            description: "Begin your culinary journey with a tasting menu showcasing local specialties.",
            activities: ["Welcome dinner", "Food tradition presentation", "Beverage pairing"]
          },
          {
            title: "Markets & Ingredients",
            description: "Explore local markets and learn about regional ingredients and their uses.",
            activities: ["Guided market tour", "Food tastings", "Ingredient selection"]
          },
          {
            title: "Cooking Mastery",
            description: "Put your skills to the test in hands-on cooking classes with expert chefs.",
            activities: ["Morning cooking class", "Lunch featuring your creations", "Evening gourmet dinner"]
          }
        ],
        included_services: [
          "All cooking classes and food workshops",
          "Market tours with tastings",
          "Meals as specified in itinerary",
          "Wine and beverage pairings",
          "Recipe collection to take home",
          "Luxury accommodation"
        ],
        excluded_services: [
          "International flights",
          "Travel insurance",
          "Additional alcoholic beverages",
          "Personal expenses",
          "Meals not specified in itinerary"
        ],
        images: [
          "https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?q=80&w=2070",
          "https://images.unsplash.com/photo-1600335895229-6e75511892c8?q=80&w=2070",
          "https://images.unsplash.com/photo-1605522561233-768ad7a8fabf?q=80&w=2074"
        ],
        categories: ["Culinary", "Cultural", "Luxury"],
        features: ["Cooking Classes", "Gourmet Dining", "Market Tours"],
        accommodation_type: "Boutique Hotels",
        activity_level: "Easy",
        availability: "Year-round"
      },
      {
        id: "t290f1ee-6c54-4b01-90e6-d701748f0854",
        name: `${destination} Family Discovery`,
        description: `Create unforgettable family memories with our specially designed tour of ${destination}. This family-friendly itinerary balances fun activities for children with experiences adults will appreciate, ensuring everyone has an amazing time.`,
        destination: destination,
        price: basePrice + 100,
        discounted_price: (basePrice + 100) * 0.95,
        duration: Math.min(Math.max(minDays, 9), maxDays),
        max_participants: 20,
        rating: 4.8,
        highlights: [
          "Kid-friendly activities and attractions",
          "Educational experiences for all ages",
          "Comfortable family accommodations",
          "Balanced pace with free time"
        ],
        itinerary: [
          {
            title: "Family Welcome",
            description: "Get acquainted with your guide and other families as the adventure begins.",
            activities: ["Interactive welcome activity", "Kid-friendly dinner", "Trip briefing for parents"]
          },
          {
            title: "Learning Adventures",
            description: "Engage in educational activities that bring the destination's history and culture to life.",
            activities: ["Interactive museum visit", "Hands-on cultural workshop", "Scavenger hunt"]
          },
          {
            title: "Outdoor Fun",
            description: "Enjoy outdoor activities suitable for different ages and abilities.",
            activities: ["Gentle hiking trail", "Wildlife spotting", "Picnic lunch", "Free time at the beach/park"]
          }
        ],
        included_services: [
          "Family-friendly accommodations",
          "Daily breakfast and selected meals",
          "All activities and entrance fees",
          "Child-specific equipment where needed",
          "Family-friendly local guides",
          "Transportation during the tour"
        ],
        excluded_services: [
          "Flights to destination",
          "Travel insurance",
          "Personal expenses",
          "Additional activities",
          "Babysitting services"
        ],
        images: [
          "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?q=80&w=2070",
          "https://images.unsplash.com/photo-1600880292630-ee8a00403024?q=80&w=2070",
          "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=2023"
        ],
        categories: ["Family", "Educational", "Leisure"],
        features: ["Kid-Friendly", "Educational", "Relaxed Pace"],
        accommodation_type: "Family Hotels",
        activity_level: "Easy to Moderate",
        availability: "School Holidays"
      },
      {
        id: "t290f1ee-6c54-4b01-90e6-d701748f0855",
        name: `Luxury ${destination} Escape`,
        description: `Indulge in the ultimate luxury experience in ${destination}. This premium tour combines 5-star accommodations, exclusive experiences, and VIP treatment throughout your journey. Perfect for those seeking refined travel with every detail taken care of.`,
        destination: destination,
        price: basePrice + 1500,
        discounted_price: null,
        duration: Math.min(Math.max(minDays, 7), maxDays),
        max_participants: 6,
        rating: 4.9,
        highlights: [
          "5-star luxury accommodations",
          "Private guided experiences",
          "Gourmet dining experiences",
          "VIP access to attractions"
        ],
        itinerary: [
          {
            title: "Luxurious Arrival",
            description: "Begin your premium experience with VIP airport service and champagne welcome.",
            activities: ["Private airport transfer", "Champagne reception", "Personalized welcome dinner"]
          },
          {
            title: "Exclusive Experiences",
            description: "Enjoy private access to cultural sites and special experiences unavailable to regular tourists.",
            activities: ["Private museum tour", "Exclusive cultural performance", "VIP shopping experience"]
          },
          {
            title: "Premium Relaxation",
            description: "Balance cultural experiences with luxury relaxation and wellness options.",
            activities: ["Spa treatment", "Private yacht excursion", "Gourmet tasting menu dinner"]
          }
        ],
        included_services: [
          "5-star luxury accommodations",
          "Private guide and chauffeur",
          "All meals at premium restaurants",
          "VIP entrance to attractions",
          "Luxury airport transfers",
          "Concierge service throughout"
        ],
        excluded_services: [
          "International flights (business class available for booking)",
          "Travel insurance",
          "Personal shopping purchases",
          "Gratuities (recommended but at your discretion)"
        ],
        images: [
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070",
          "https://images.unsplash.com/photo-1520420097861-e4959843b520?q=80&w=2070",
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070"
        ],
        categories: ["Luxury", "Exclusive", "Premium"],
        features: ["5-Star Hotels", "Private Guide", "All-Inclusive"],
        accommodation_type: "Luxury Hotels & Resorts",
        activity_level: "Easy",
        availability: "Year-round"
      },
      {
        id: "t290f1ee-6c54-4b01-90e6-d701748f0856",
        name: `${destination} Sustainable Eco-Tour`,
        description: `Experience ${destination} in an environmentally responsible way with our eco-conscious tour. Stay in sustainable accommodations, support local communities, and minimize your carbon footprint while enjoying authentic experiences.`,
        destination: destination,
        price: basePrice + 200,
        discounted_price: (basePrice + 200) * 0.9,
        duration: Math.min(Math.max(minDays, 10), maxDays),
        max_participants: 12,
        rating: 4.7,
        highlights: [
          "Eco-friendly accommodations",
          "Community-based tourism initiatives",
          "Conservation activities",
          "Low-impact transportation options"
        ],
        itinerary: [
          {
            title: "Sustainable Introduction",
            description: "Learn about the eco-principles of your tour and the local conservation efforts.",
            activities: ["Eco-lodge check-in", "Sustainability briefing", "Locally-sourced welcome dinner"]
          },
          {
            title: "Conservation in Action",
            description: "Participate in local conservation projects that help protect the natural environment.",
            activities: ["Tree planting activity", "Wildlife monitoring", "Environmental education workshop"]
          },
          {
            title: "Community Connections",
            description: "Engage with local communities and learn how tourism supports their sustainable development.",
            activities: ["Village visit", "Artisan workshop", "Community-hosted meal"]
          }
        ],
        included_services: [
          "Eco-certified accommodations",
          "Locally-sourced meals",
          "Guides from local communities",
          "Carbon offset for ground transportation",
          "Contributions to local conservation projects",
          "Reusable water bottle and amenities"
        ],
        excluded_services: [
          "International flights",
          "Travel insurance",
          "Personal expenses",
          "Additional carbon offsets",
          "Items not specified"
        ],
        images: [
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070",
          "https://images.unsplash.com/photo-1578645510447-e20b4311e3ce?q=80&w=2070",
          "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2070"
        ],
        categories: ["Eco-Friendly", "Sustainable", "Nature"],
        features: ["Carbon Offset", "Community Tourism", "Eco-Lodges"],
        accommodation_type: "Eco-Lodges & Sustainable Hotels",
        activity_level: "Moderate",
        availability: "Year-round"
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
    const { destination, minPrice, maxPrice, duration } = await request.json();

    // Validate inputs
    if (!destination || destination.trim() === '') {
      return NextResponse.json(
        { error: 'Destination is required' },
        { status: 400 }
      );
    }

    // Log the search parameters
    console.log('Travel package search parameters:', { destination, minPrice, maxPrice, duration });

    let travelData;
    
    // First, check if the API key is available
    if (!process.env.GOOGLE_AI_API_KEY && !process.env.GEMINI_API_KEY) {
      console.log('No Google AI API key found, using fallback data');
      travelData = getFallbackTravelPackages(destination, minPrice, maxPrice, duration);
      // Add flag to indicate this is fallback data
      travelData.is_fallback_data = true;
    } else {
      try {
        // Generate dynamic travel package data using LLM
        const prompt = `
          Generate a list of 6 realistic travel packages to ${destination} as JSON. 
          ${minPrice ? `Minimum price: $${minPrice}.` : ''}
          ${maxPrice ? `Maximum price: $${maxPrice}.` : ''}
          ${duration ? `Duration: ${duration} days.` : ''}
          
          Each travel package should include:
          - id (UUID string)
          - name (package name)
          - description (3-4 sentences about the package)
          - destination (city, country or region)
          - price (number between ${minPrice || 1000} and ${maxPrice || 5000})
          - discounted_price (optional, number less than price or null if no discount)
          - duration (number of days, between ${duration || '5-15'})
          - max_participants (group size, number)
          - rating (number between 3.5 and 5.0)
          - highlights (array of 4-5 bullet points)
          - itinerary (array of day objects with title, description, and activities array)
          - included_services (array of 5-6 items included in the package)
          - excluded_services (array of 4-5 items not included)
          - images (array of 3 placeholder image URLs from unsplash.com)
          - categories (array of 2-3 categories like "Adventure", "Cultural", "Luxury")
          - features (array of 2-3 features like "English Guide", "All-Inclusive")
          - accommodation_type (string describing the accommodations)
          - activity_level (string like "Easy", "Moderate", "Challenging")
          - availability (string describing when the package is available)
          
          Return ONLY valid JSON without any explanations, prefixes, or markdown formatting.
          The response should look like: {"travelPackages": [ ... array of travel package objects ... ]}
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
          travelData = JSON.parse(jsonString);
        } catch (jsonErr) {
          console.error('Error parsing LLM response:', jsonErr);
          console.log('Raw LLM response:', responseText);
          // If parsing fails, fall back to mock data
          travelData = getFallbackTravelPackages(destination, minPrice, maxPrice, duration);
          // Add flag to indicate this is fallback data
          travelData.is_fallback_data = true;
        }
      } catch (aiError) {
        console.error('Error with AI API call:', aiError);
        // If the API call fails, use mock data
        travelData = getFallbackTravelPackages(destination, minPrice, maxPrice, duration);
        // Add flag to indicate this is fallback data
        travelData.is_fallback_data = true;
      }
    }

    return NextResponse.json(travelData);
  } catch (error) {
    console.error('Travel package search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 