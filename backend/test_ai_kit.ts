import { AIFactory } from './src/services/AIProvider';
import { AI_CONFIG } from './src/config/ai_config';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function testAIKit() {
    console.log("🧪 TESTING AI DEVELOPMENT KIT");
    console.log("--------------------------------");
    console.log(`🎭 Active Persona: ${AI_CONFIG.activePersona}`);
    console.log(`🌡️  Temperature: ${AI_CONFIG.modelParams.temperature}`);

    try {
        const provider = AIFactory.createProvider('gemini-flash'); // Uses default or mapped flash

        const dreamText = "I was falling from a skyscraper but instead of hitting the ground, I turned into a bird and flew away.";

        console.log(`\n💤 Dream: "${dreamText}"`);
        console.log("Thinking... (Dr. Aether is analyzing)\n");

        const result = await provider.interpret(dreamText);

        console.log("🧠 Dr. Aether's Analysis:");
        console.log(result.interpretation);
        console.log("\n⚡ Energy:", result.energy);
        console.log("🗝️  Symbols:", result.symbols);

        if (result.interpretation.includes("FARKINDALIK")) {
            console.log("\n✅ Test Passed: 'FARKINDALIK' marker found.");
        } else {
            console.log("\n⚠️ Test Warning: 'FARKINDALIK' marker missing (Check prompt injection).");
        }

    } catch (error) {
        console.error("❌ Test Failed:", error);
    }
}

testAIKit();
