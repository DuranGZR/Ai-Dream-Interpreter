import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY not found in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Test Gemini 2.5 Flash (New & Fast)
    try {
        console.log("\n🧪 Testing gemini-2.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Hello, are you working?");
        console.log("✅ Success with gemini-2.5-flash!");
        console.log("Response:", result.response.text());
    } catch (error: any) {
        console.error("❌ Error with gemini-2.5-flash:", error.message);
    }

    // Test Gemini Pro Latest
    try {
        console.log("\n🧪 Testing gemini-pro-latest...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });
        const result = await model.generateContent("Hello, are you working?");
        console.log("✅ Success with gemini-pro-latest!");
    } catch (error: any) {
        console.error("❌ Error with gemini-pro-latest:", error.message);
    }
}

listModels();
