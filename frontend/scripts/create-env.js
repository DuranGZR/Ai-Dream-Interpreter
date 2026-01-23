const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');

// ENV'de olması gereken değişkenlerin listesini buraya ekleyin
const ENV_VARS = [
    'API_URL',
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID',
    'FIREBASE_MEASUREMENT_ID',
    'GOOGLE_WEB_CLIENT_ID',
    'GOOGLE_IOS_CLIENT_ID',
    'GOOGLE_ANDROID_CLIENT_ID'
];

console.log('📝 Creating .env file from environment variables...');

let envContent = '';

ENV_VARS.forEach(key => {
    if (process.env[key]) {
        envContent += `${key}=${process.env[key]}\n`;
        console.log(`  ✓ Written: ${key}`);
    } else {
        console.warn(`  ⚠️ Warning: ${key} is missing in environment variables.`);
    }
});

// Eğer içerik boşsa ve environment'ta hiçbir şey yoksa, belki de local development içindir.
if (!envContent) {
    console.log('ℹ️ No environment variables found matching the list. Skipping .env creation (assuming local dev or pre-existing .env).');
} else {
    try {
        fs.writeFileSync(envPath, envContent);
        console.log(`✅ successfully created .env at ${envPath}`);
    } catch (error) {
        console.error('❌ Failed to create .env file:', error);
        process.exit(1);
    }
}
