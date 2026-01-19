import * as dotenv from 'dotenv';
import path from 'path';
import { AIFactory } from './src/services/AIProvider';

// Load env from backend root
dotenv.config({ path: path.join(__dirname, '.env') });

async function testAI() {
    console.log('🧪 Testing AI Integration...');

    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY is missing in .env');
        return;
    }

    try {
        const provider = AIFactory.createProvider('gemini-flash');
        console.log('✅ Provider created successfully');

        const dream = "Rüyamda uçuyordum ve altımda masmavi bir deniz vardı. Kendimi çok özgür hissediyordum.";
        console.log(`\n💭 Interpreting dream: "${dream}"\n`);

        const result = await provider.interpret(dream);

        console.log('✨ Result:');
        console.log(JSON.stringify(result, null, 2));

        if (result.interpretation && result.energy && result.symbols.length > 0) {
            console.log('\n✅ Test PASSED: Structure is correct.');
        } else {
            console.error('\n❌ Test FAILED: Invalid structure.');
        }

    } catch (error) {
        console.error('\n❌ Test FAILED:', error);
    }
}

testAI();
