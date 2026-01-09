/**
 * Using BuildPico LLM and Image Generation APIs
 */
export async function chatWithAI(query) {
    try {
        // Check if user is asking for an image/visualization
        const wantsImage = /\b(draw|create|generate|show|make|visualize|image|picture|diagram)\b/i.test(query);

        // Use LLM API for text responses
        const apiUrl = 'https://backend.buildpicoapps.com/aero/run/llm-api?pk=v1-Z0FBQUFBQnBYU0R3OGxEQWZnTlU2VUFETjdMTXo5bHlrVi1fallKdWdqTVlLV1lhZFRvLURDSDBZMDltdW91X3c0OXdNRjBtNDVOaFN4aVp4bUh4YktJUTBpcGg4enVRN2c9PQ==';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: `You are a helpful study assistant. Explain this concept clearly and concisely: ${query}`
            })
        });

        const data = await response.json();

        if (data.status !== 'success') {
            throw new Error('API request failed');
        }

        const explanation = data.text;

        // Generate image if requested
        let generatedImage = null;
        if (wantsImage) {
            try {
                const imageResponse = await fetch('https://backend.buildpicoapps.com/aero/run/image-generation-api?pk=v1-Z0FBQUFBQnBYU0R3OGxEQWZnTlU2VUFETjdMTXo5bHlrVi1fallKdWdqTVlLV1lhZFRvLURDSDBZMDltdW91X3c0OXdNRjBtNDVOaFN4aVp4bUh4YktJUTBpcGg4enVRN2c9PQ==', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        prompt: query
                    })
                });

                const imageData = await imageResponse.json();
                if (imageData.status === 'success' && imageData.imageUrl) {
                    generatedImage = imageData.imageUrl;
                }
            } catch (err) {
                console.warn('Image generation failed:', err);
            }
        }

        return {
            response: explanation,
            videos: [], // Removed dummy videos
            image: generatedImage // Add generated image if available
        };

    } catch (error) {
        console.error("AI Service Error:", error);
        return {
            response: `⚠️ **Connection Error**\n\n${error.message}\n\nPlease check your internet connection and try again.`,
            videos: [],
            image: null
        };
    }
}
