import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";

import { geminiFlashModel } from "@/ai";

export async function POST(request: Request) {
  try {
    const { messages }: { messages: Array<Message> } = await request.json();

    const coreMessages = convertToCoreMessages(messages).filter(
      (message) => message.content.length > 0,
    );

    const result = await streamText({
      model: geminiFlashModel,
      system: "You are a helpful AI assistant powered by Gemini. Answer user questions concisely and accurately.",
      messages: coreMessages,
      tools: {
        analyzeFlightCallsign: {
          description: "Analyze a flight by its callsign to get real-time flight tracking data and AI analysis",
          parameters: z.object({
            callsign: z.string().describe("The flight callsign (e.g., AIC111)"),
          }),
          execute: async ({ callsign }) => {
            try {
              const response = await fetch(`http://localhost:8000/flight/analyze/${callsign}`, {
                method: 'GET',
                timeout: 5000,
              });
              if (!response.ok) {
                return { error: `Flight API error: ${response.statusText}` };
              }
              const data = await response.json();
              return {
                callsign: data.callsign,
                sentence: data.metadata?.sentence || "No description available",
                analysis: data.ai_analysis,
                location: {
                  latitude: data.metadata?.latitude,
                  longitude: data.metadata?.longitude,
                },
                altitude: data.metadata?.max_altitude,
                origin: data.metadata?.origin_country,
              };
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : 'Unknown error';
              console.error('Flight API Error:', errorMsg);
              return { error: `Unable to fetch flight data: ${errorMsg}` };
            }
          },
        },
      },
      experimental_telemetry: {
        isEnabled: true,
        functionId: "stream-text",
      },
    });

    return result.toDataStreamResponse({});
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Chat API Error:', errorMsg);
    
    // Return error as a readable message
    return new Response(
      `data: {"type":"error","message":"${errorMsg.replace(/"/g, '\\"')}"}\n\n`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      }
    );
  }
}
