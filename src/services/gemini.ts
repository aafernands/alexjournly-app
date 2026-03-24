import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function generateTravelPlan(params: {
  destination?: string;
  duration: string;
  budget: string;
  style: string;
}) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a smart travel assistant for the Alex Journly app.
    
    User Input:
    - Destination: ${params.destination || "Not provided"}
    - Duration: ${params.duration}
    - Budget Level: ${params.budget}
    - Travel Style: ${params.style}
    
    Goal: Help the user plan a trip that matches their style, aesthetic, and budget.
    Tone: Modern, inspiring, helpful (like a travel content creator).
    
    IMPORTANT: Do NOT include any introductory sentences like "I've integrated real images into your travel plans to make them more inspiring and visual!". Just start with the travel plan content.
    
    Requirements:
    1. If destination is NOT provided, suggest 3 destinations matching the vibe/budget/duration.
    2. If destination IS provided, generate a structured travel plan including:
       - Trip overview (short summary)
       - Suggested areas to stay
       - Day-by-day itinerary
       - Must-see attractions
       - Hidden gems
       - Food & drink recommendations
       - Optional experiences
    3. For EACH day and major attraction, include a high-quality real image using the following format:
       ![Description](https://source.unsplash.com/featured/?{keyword})
       Replace {keyword} with specific, relevant search terms (e.g., "Eiffel Tower", "Tokyo Night", "Italian Pasta").
    4. If budget is included, provide estimated cost breakdown:
       - Accommodation per night
       - Daily spending
       - Total estimated trip cost
    5. Adapt recommendations to match the user's "vibe":
       - Aesthetic/luxury -> visually appealing places
       - Budget -> affordable but high-value spots
       - Adventure -> activities and experiences
       - Chill -> relaxed and scenic locations
    6. Clear and structured markdown.
    7. Always end with: "Want me to adjust this plan based on your preferences?"`,
  });

  const response = await model;
  return response.text;
}

export async function refineTravelPlan(currentPlan: string, refinementRequest: string, chatHistory: { role: string; content: string }[] = []) {
  const contents = [
    {
      role: "user",
      parts: [{ text: `You are a smart travel assistant for the Alex Journly app.
    
    Current Travel Plan:
    ${currentPlan}
    
    Goal: Update the current travel plan based on the user's specific request while maintaining the same style, aesthetic, and structure.
    
    IMPORTANT: Do NOT include any introductory sentences like "I've integrated real images into your travel plans to make them more inspiring and visual!". Just return the updated travel plan.
    
    Requirements:
    1. Incorporate the requested changes seamlessly into the itinerary.
    2. Maintain the overall structure (Overview, Stay, Day-by-day, Attractions, Gems, Food, Costs).
    3. Ensure all images (Markdown format) are preserved or updated to match the new content.
    4. Keep the tone modern, inspiring, and helpful.
    5. Return the FULL updated plan in markdown.
    6. Always end with: "Want me to adjust this plan further based on your preferences?"` }]
    }
  ];

  // Add chat history if any
  for (const msg of chatHistory) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    });
  }

  // Add the latest request
  contents.push({
    role: "user",
    parts: [{ text: refinementRequest }]
  });

  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: contents,
  });

  const response = await model;
  return response.text;
}
