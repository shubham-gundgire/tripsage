import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Generate prompts based on the section requested
const generatePrompt = (destination, startDate, endDate, guests, section) => {
  const duration = calculateDuration(startDate, endDate);
  const baseContext = `You are a travel expert assistant for TripSage. Provide detailed information about ${destination} for a trip with ${guests} ${guests === 1 ? 'person' : 'people'} ${duration ? `for ${duration} days` : ''}. ${startDate ? `The trip is planned from ${startDate} to ${endDate}.` : ''}`;
  
  // Define the expected response format for each section
  const responseFormats = {
    overview: `
      {
        "description": "General information about the destination",
        "attractions": ["List of top attractions"],
        "cultural": "Cultural highlights and information",
        "weather": "Weather summary for the date range",
        "safety": "Safety tips or travel advisories"
      }
    `,
    accommodation: `
      {
        "options": [
          {
            "type": "Type of accommodation (e.g., Luxury Hotels)",
            "priceRange": "Price range in USD",
            "description": "Description of this type of accommodation",
            "recommendations": ["List of specific recommendations"]
          }
        ]
      }
    `,
    food: `
      {
        "cuisine": "Overview of local cuisine",
        "dishes": ["Array of must-try dishes"],
        "restaurants": [
          {
            "name": "Restaurant name",
            "type": "Type of cuisine",
            "description": "Brief description"
          }
        ],
        "dietary": "Information about vegetarian/vegan options"
      }
    `,
    transportation: `
      {
        "gettingThere": "Information on how to reach the destination",
        "nearestAirport": "Name of nearest airport",
        "distance": "Distance from major cities",
        "localTransport": "Information about local transportation",
        "transportOptions": ["List of transport options"],
        "tips": "Transportation tips and advice"
      }
    `,
    events: `
      {
        "events": [
          {
            "name": "Event name",
            "date": "Event date",
            "description": "Brief description"
          }
        ],
        "activities": [
          {
            "name": "Activity name",
            "type": "Type of activity",
            "description": "Brief description"
          }
        ],
        "tours": ["List of recommended tours"]
      }
    `,
    budget: `
      {
        "summary": "General budget overview",
        "totalCost": "Total estimated cost in USD",
        "breakdown": [
          {
            "category": "Category name (e.g., Accommodation)",
            "cost": "Estimated cost in USD"
          }
        ],
        "disclaimer": "Budget disclaimer text"
      }
    `,
    itinerary: `
      {
        "intro": "Introduction to the itinerary",
        "days": [
          {
            "title": "Day title",
            "activities": [
              {
                "time": "Time of day",
                "title": "Activity title",
                "description": "Brief description"
              }
            ]
          }
        ]
      }
    `,
    tips: `
      {
        "bestTime": "Best time to visit information",
        "currentSeason": "Remarks about current season",
        "customs": "Local customs overview",
        "etiquetteTips": ["List of etiquette tips"],
        "language": {
          "overview": "Language information",
          "phrases": ["Useful phrases"]
        },
        "emergency": {
          "info": "Emergency information",
          "contacts": ["Emergency contact details"]
        }
      }
    `,
    shopping: `
      {
        "overview": "Overview of shopping in the location",
        "shoppingAreas": [
          {
            "name": "Area name",
            "type": "Type of shopping area",
            "description": "Brief description"
          }
        ],
        "souvenirs": ["List of recommended souvenirs"]
      }
    `
  };

  // Section specific prompts
  const sectionPrompts = {
    overview: `Provide an overview of ${destination} as a travel destination. Include general information, top attractions, cultural highlights, weather for ${startDate ? `the dates ${startDate} to ${endDate}` : 'typical weather'}, and any safety tips.`,
    
    accommodation: `Recommend accommodation options in ${destination} for ${guests} ${guests === 1 ? 'person' : 'people'}. Group by budget categories (Budget, Mid-range, Luxury). For each category, provide price ranges and at least 3 specific recommendations. Consider accommodation that's suitable for ${guests === 1 ? 'solo travelers' : guests > 2 ? 'groups' : 'couples'}.`,
    
    food: `Describe the local cuisine in ${destination}. List 5-8 must-try dishes. Recommend at least 4 restaurants across different price ranges. Include information about vegetarian/vegan options or any dietary restrictions.`,
    
    transportation: `Explain how to get to ${destination} and transportation options within the area. Include information about the nearest airport/train station, distances, local transportation options like buses, taxis, rentals, and transportation tips.`,
    
    events: `List events, festivals, or activities in ${destination}${startDate ? ` occurring around ${startDate} to ${endDate}` : ''}. Include both cultural events and recreational activities suitable for ${guests === 1 ? 'solo travelers' : guests > 2 ? 'groups' : 'couples'}. Suggest guided tours or day trips.`,
    
    budget: `Provide a budget estimate for a trip to ${destination} for ${guests} ${guests === 1 ? 'person' : 'people'}${duration ? ` for ${duration} days` : ''}. Break down costs for transportation, accommodation, food, activities, and other expenses across budget ranges. Provide a reasonable total estimate.`,
    
    itinerary: `Create a suggested itinerary for a trip to ${destination}${duration ? ` for ${duration} days` : ''}. For each day, provide a structured plan including morning, afternoon, and evening activities, with estimated times. Group attractions by proximity and consider a balanced mix of sightseeing, relaxation, and cultural experiences.`,
    
    tips: `Provide travel tips for visiting ${destination}. Include information about the best time to visit (and how the selected dates ${startDate ? `(${startDate} to ${endDate})` : ''} compare), local customs and etiquette, language tips with useful phrases, and emergency contact information.`,
    
    shopping: `Recommend shopping experiences in ${destination}. List major shopping areas, markets, and malls. Suggest unique local products and souvenirs that travelers should consider buying. Include information about price ranges and bargaining if applicable.`
  };

  return {
    systemPrompt: baseContext + ' Respond only with JSON in the specified format.',
    userPrompt: sectionPrompts[section] + ` Format your response as a valid JSON object using this structure: ${responseFormats[section]}`,
    responseFormat: responseFormats[section]
  };
};

// Helper function to calculate trip duration
const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Helper function to validate JSON
const isValidJSON = (text) => {
  try {
    const json = JSON.parse(text);
    return true;
  } catch (error) {
    return false;
  }
};

// Helper function to extract JSON from text
const extractJSON = (text) => {
  try {
    // First try direct parsing
    return JSON.parse(text);
  } catch (error) {
    // If that fails, try to extract JSON from markdown or text
    try {
      // Look for JSON between ```json and ``` markers
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // Look for JSON between { and } enclosing the entire text
      const curlyMatch = text.match(/^\s*({[\s\S]*})\s*$/);
      if (curlyMatch && curlyMatch[1]) {
        return JSON.parse(curlyMatch[1]);
      }
      
      // If we still haven't found valid JSON, throw an error
      throw new Error("No valid JSON found in the response");
    } catch (extractError) {
      throw new Error(`Failed to extract JSON: ${extractError.message}`);
    }
  }
};

export async function POST(req) {
  try {
    const { destination, startDate, endDate, guests, section } = await req.json();
    
    if (!destination || !section) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    const { systemPrompt, userPrompt, responseFormat } = generatePrompt(
      destination,
      startDate,
      endDate,
      parseInt(guests, 10),
      section
    );
    
    // Check if API key is available
    if (!GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is not defined, using fallback response');
      return NextResponse.json(
        generateFallbackResponse(section, destination, startDate, endDate, guests),
        { status: 200 }
      );
    }
    
    // Request to the LLM API
    const requestBody = {
      system_instruction: {
        parts: {
          text: systemPrompt
        }
      },
      contents: {
        parts: {
          text: userPrompt
        }
      }
    };

    // First attempt
    let response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    let responseBody = await response.json();
    let botResponse = responseBody?.candidates?.[0]?.content?.parts[0]?.text || '';
    
    // Check if the response is valid JSON
    if (!isValidJSON(botResponse) && !botResponse.includes('{') && !botResponse.includes('}')) {
      console.log('Invalid JSON response, retrying...');
      
      // Modify the prompt to emphasize JSON format
      const retryRequestBody = {
        system_instruction: {
          parts: {
            text: systemPrompt + ' You MUST respond with ONLY valid JSON and nothing else. No explanations, just the JSON object.'
          }
        },
        contents: {
          parts: {
            text: userPrompt + ' CRITICAL: Your response must be valid JSON that can be parsed directly with JSON.parse(). Do not include any text outside the JSON object. The expected structure is: ' + responseFormat
          }
        }
      };
      
      // Retry the request
      response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(retryRequestBody)
      });
      
      responseBody = await response.json();
      botResponse = responseBody?.candidates?.[0]?.content?.parts[0]?.text || '';
    }
    
    // Try to extract and parse the JSON
    try {
      const jsonData = extractJSON(botResponse);
      return NextResponse.json(jsonData, { status: 200 });
    } catch (error) {
      console.error('Failed to extract valid JSON:', error);
      // Return a fallback response based on the section
      return NextResponse.json(
        generateFallbackResponse(section, destination, startDate, endDate, guests),
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error in destination details API:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
}

// Generate fallback responses when the LLM fails to provide valid JSON
const generateFallbackResponse = (section, destination, startDate, endDate, guests) => {
  const fallbacks = {
    overview: {
      description: `Discover the wonders of ${destination}, a destination known for its unique blend of culture, history, and natural beauty.`,
      attractions: [
        "Popular Tourist Attraction 1",
        "Famous Landmark 2",
        "Historic Site 3",
        "Natural Wonder 4"
      ],
      cultural: `${destination} has a rich cultural heritage with diverse traditions, festivals, and local customs that visitors can experience.`,
      weather: `The weather in ${destination} during your visit is expected to be pleasant and suitable for exploration and outdoor activities.`,
      safety: `${destination} is generally considered safe for tourists, but always exercise normal precautions and be aware of your surroundings.`,
      bestTime: "Spring and Fall",
      language: "Local language",
      currency: "Local currency",
      timezone: "Local timezone",
      relatedDestinations: [
        { name: "Similar Destination 1", description: "A popular alternative with similar attractions" },
        { name: "Similar Destination 2", description: "Another great option for travelers" },
        { name: "Similar Destination 3", description: "Worth considering for your next trip" }
      ]
    },
    accommodation: {
      options: [
        {
          type: "Budget Accommodations",
          priceRange: "$50-100 per night",
          description: "Comfortable and affordable options ideal for budget-conscious travelers.",
          recommendations: [
            "Budget Hotel 1 - Great value for money",
            "Popular Hostel - Perfect for solo travelers",
            "Guesthouse - Authentic local experience"
          ]
        },
        {
          type: "Mid-range Hotels",
          priceRange: "$100-250 per night",
          description: "Quality accommodations with good amenities and service.",
          recommendations: [
            "Mid-range Hotel 1 - Excellent location",
            "Boutique Hotel - Unique design and experience",
            "Resort - Good facilities for relaxation"
          ]
        },
        {
          type: "Luxury Options",
          priceRange: "$250+ per night",
          description: "Premium accommodations offering the highest level of comfort and service.",
          recommendations: [
            "Luxury Hotel 1 - 5-star experience",
            "Historic Grand Hotel - Iconic and elegant",
            "Premium Resort - World-class amenities"
          ]
        }
      ]
    },
    food: {
      cuisine: `${destination} offers a diverse culinary scene with dishes that showcase local ingredients and traditional cooking methods.`,
      dishes: [
        "Local Specialty 1",
        "Traditional Dish 2",
        "Street Food Item 3",
        "Famous Dessert 4",
        "Signature Beverage 5"
      ],
      restaurants: [
        {
          name: "Local Favorite Restaurant",
          type: "Traditional Cuisine",
          description: "Authentic local dishes in a cozy atmosphere"
        },
        {
          name: "Popular Café",
          type: "Casual Dining",
          description: "Great spot for breakfast and lunch"
        },
        {
          name: "Fine Dining Establishment",
          type: "Gourmet Experience",
          description: "Elegant setting with innovative cuisine"
        },
        {
          name: "Street Food Market",
          type: "Casual & Authentic",
          description: "Variety of local specialties at affordable prices"
        }
      ],
      dietary: "Vegetarian and vegan options are increasingly available in restaurants throughout the area."
    },
    transportation: {
      gettingThere: `You can reach ${destination} by air, with regular flights from major cities, or by land through well-connected road and rail networks.`,
      nearestAirport: `${destination} International Airport`,
      distance: {
        "Major City 1": "250 km (2.5 hours by car)",
        "Major City 2": "500 km (1 hour by plane)",
        "Major City 3": "300 km (3 hours by train)"
      },
      localTransport: `In ${destination}, you can get around using public transportation, taxis, or rental services. The city has a well-developed transport system making it easy to explore.`,
      transportOptions: [
        "Subway/Metro",
        "Bus Network",
        "Taxi Services",
        "Ride-sharing Apps",
        "Bicycle Rentals",
        "Walking (city center)"
      ],
      tips: [
        "Purchase a transit card for discounted fares on public transportation",
        "Download the local transit app for real-time updates",
        "Taxis are readily available but negotiate the fare or ensure the meter is used",
        "Rush hour traffic can be heavy, plan accordingly",
        "Some areas are best explored on foot"
      ]
    },
    events: {
      events: [
        {
          name: "Annual Cultural Festival",
          date: "Spring Season",
          description: "Celebration of local culture with music, dance, and food"
        },
        {
          name: "Food and Wine Festival",
          date: "Fall Season",
          description: "Showcasing local cuisine and beverages"
        },
        {
          name: "Local Music Event",
          date: "Summer Season",
          description: "Live performances by local and international artists"
        }
      ],
      activities: [
        {
          name: "Historical Walking Tour",
          type: "Cultural",
          description: "Guided tour of historical landmarks in the city center"
        },
        {
          name: "Outdoor Adventure",
          type: "Active",
          description: "Hiking, biking, or water sports in the surrounding natural areas"
        },
        {
          name: "Local Cooking Class",
          type: "Culinary",
          description: "Learn to prepare traditional local dishes with expert chefs"
        },
        {
          name: "Relaxation Spa Day",
          type: "Wellness",
          description: "Traditional treatments and relaxation therapies"
        }
      ],
      tours: [
        "Full-day City Tour with Local Guide",
        "Food Tasting Tour through Local Markets",
        "Evening Cultural Performance and Dinner",
        "Day Trip to Nearby Natural Attractions",
        "Photography Tour of Scenic Viewpoints"
      ]
    },
    budget: {
      summary: `A trip to ${destination} can be adapted to various budgets. Costs will vary based on your accommodation choice, dining preferences, and selected activities.`,
      totalCost: {
        budget: "800",
        midrange: "1500",
        luxury: "3000"
      },
      breakdown: [
        {
          category: "Accommodation",
          cost: {
            budget: "300",
            midrange: "700",
            luxury: "1500"
          }
        },
        {
          category: "Food & Dining",
          cost: {
            budget: "200",
            midrange: "400",
            luxury: "700"
          }
        },
        {
          category: "Transportation",
          cost: {
            budget: "100",
            midrange: "200",
            luxury: "400"
          }
        },
        {
          category: "Activities & Tours",
          cost: {
            budget: "150",
            midrange: "300",
            luxury: "600"
          }
        },
        {
          category: "Shopping & Souvenirs",
          cost: {
            budget: "50",
            midrange: "100",
            luxury: "300"
          }
        }
      ],
      disclaimer: "Prices are approximate and may vary based on exchange rates, season, and personal preferences. It's recommended to budget extra for unexpected expenses or special experiences."
    },
    itinerary: {
      intro: `This suggested itinerary for ${destination} combines popular attractions, cultural experiences, and time to relax and enjoy the local atmosphere.`,
      days: [
        {
          title: "Exploring the City Center",
          activities: [
            {
              time: "Morning",
              title: "Breakfast & City Tour",
              description: "Start with breakfast at a local café, then explore the main attractions in the city center"
            },
            {
              time: "Afternoon",
              title: "Lunch & Museum Visit",
              description: "Sample local cuisine for lunch, then visit a prominent museum or gallery"
            },
            {
              time: "Evening",
              title: "Dinner & Entertainment",
              description: "Enjoy dinner at a recommended restaurant followed by local entertainment"
            }
          ]
        },
        {
          title: "Cultural Experiences",
          activities: [
            {
              time: "Morning",
              title: "Local Market Visit",
              description: "Explore the vibrant local market and sample street food"
            },
            {
              time: "Afternoon",
              title: "Historical Sites Tour",
              description: "Visit key historical landmarks and learn about local history"
            },
            {
              time: "Evening",
              title: "Cultural Dinner Experience",
              description: "Participate in a traditional dinner with local entertainment"
            }
          ]
        },
        {
          title: "Natural Surroundings",
          activities: [
            {
              time: "Morning",
              title: "Nature Excursion",
              description: "Visit nearby natural attractions, parks, or gardens"
            },
            {
              time: "Afternoon",
              title: "Outdoor Activities",
              description: "Participate in outdoor activities suitable for the location"
            },
            {
              time: "Evening",
              title: "Sunset Viewpoint & Dinner",
              description: "Watch the sunset from a scenic viewpoint and enjoy dinner"
            }
          ]
        }
      ]
    },
    tips: {
      bestTime: `The best time to visit ${destination} is during spring and fall when the weather is pleasant and tourist crowds are smaller.`,
      currentSeason: "Currently in peak/off-peak season depending on your travel dates",
      customs: `In ${destination}, respect for local customs is important. This includes appropriate dress in religious sites and awareness of local etiquette.`,
      etiquetteTips: [
        "Remove shoes when entering homes or certain religious sites",
        "Dress modestly when visiting religious or traditional areas",
        "Ask permission before taking photos of locals",
        "Learn a few basic phrases in the local language",
        "Be aware of appropriate tipping customs"
      ],
      language: {
        overview: `The primary language in ${destination} is the local language, but English is often spoken in tourist areas and hotels.`,
        phrases: [
          "Hello/Greetings - Local Translation",
          "Thank you - Local Translation",
          "Please - Local Translation",
          "Yes/No - Local Translation",
          "Excuse me/Sorry - Local Translation",
          "How much? - Local Translation"
        ]
      },
      emergency: {
        info: `In case of emergency in ${destination}, dial the local emergency number and contact your embassy if needed.`,
        contacts: [
          "Emergency Services: Local Emergency Number",
          "Tourist Police: Local Police Number",
          "Medical Emergencies: Local Hospital Number",
          "Embassy Contact: Varies by nationality"
        ]
      }
    },
    shopping: {
      overview: `${destination} offers diverse shopping experiences from modern malls to traditional markets, with opportunities to purchase local crafts, fashion, and specialty items.`,
      shoppingAreas: [
        {
          name: "Main Shopping District",
          type: "Retail Stores & Boutiques",
          description: "Central shopping area with a mix of local and international brands"
        },
        {
          name: "Traditional Market",
          type: "Local Market",
          description: "Authentic market experience with local products, crafts, and food"
        },
        {
          name: "Modern Shopping Mall",
          type: "Indoor Mall",
          description: "Air-conditioned complex with shops, restaurants, and entertainment"
        },
        {
          name: "Artisan Quarter",
          type: "Craft Shops",
          description: "Area known for local craftspeople and unique handmade items"
        }
      ],
      souvenirs: [
        "Local Handicrafts",
        "Traditional Clothing Items",
        "Local Food Products",
        "Artisanal Jewelry",
        "Local Art",
        "Specialty Items Unique to the Region"
      ]
    }
  };
  
  // Return fallback data or a generic error message structure
  return fallbacks[section] || {
    error: true,
    message: `Unable to generate valid data for ${section}. Please try again later.`,
    destinationName: destination
  };
}; 