import * as dotenv from 'dotenv';
import path from 'path';
import { AIFactory } from './src/services/AIProvider';

dotenv.config({ path: path.join(__dirname, '.env') });

async function testGroq() {
    console.log('🧪 Testing Groq Integration...');

    if (!process.env.GROQ_API_KEY) {
        console.error('❌ GROQ_API_KEY is missing in .env');
        return;
    }

    try {
        const provider = AIFactory.createProvider('groq-llama-3');
        console.log('✅ Groq Provider created successfully');

        const dream = "Rüyamda bir aslanla satranç oynuyordum.";
        console.log(`\n💭 Interpreting dream: "${dream}"\n`);

        const result = await provider.interpret(dream);

        console.log('✨ Result:');
        console.log(JSON.stringify(result, null, 2));

        if (result.interpretation && result.energy) {
            console.log('\n✅ Groq Test PASSED!');
        } else {
            console.error('\n❌ Groq Test FAILED: Invalid structure.');
        }

    } catch (error) {
        console.error('\n❌ Groq Test FAILED:', error);
    }
}

testGroq();
