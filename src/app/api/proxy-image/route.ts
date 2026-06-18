import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const prompt = searchParams.get("prompt");
    const seed = searchParams.get("seed") || "0";
    
    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Missing prompt parameter" },
        { status: 400 }
      );
    }
    
    const apiKey = process.env.POLLINATIONS_API_KEY;
    
    // Construct the URL
    const urlObj = new URL(`https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}`);
    urlObj.searchParams.set("width", "1024");
    urlObj.searchParams.set("height", "1024");
    urlObj.searchParams.set("nologo", "true");
    urlObj.searchParams.set("private", "true");
    urlObj.searchParams.set("seed", seed);
    
    if (apiKey) {
      urlObj.searchParams.set("key", apiKey);
    } else {
      console.warn("[Proxy Image API] Warning: POLLINATIONS_API_KEY is not set in environment variables. Requests may fail with 402.");
    }
    
    const pollinationsUrl = urlObj.toString();
    console.log(`[Proxy Image API] Proxying request to Pollinations AI (Authenticated: ${!!apiKey})`);
    
    const response = await fetch(pollinationsUrl);
    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Failed to fetch image from Pollinations AI: status ${response.status} ${response.statusText}. Details: ${errorText}`);
    }
    
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";
    
    return new Response(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
        "Access-Control-Allow-Origin": "*", // Allow cross-origin calls
      },
    });
  } catch (error: any) {
    console.error("[Proxy Image API] Error proxying image:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
