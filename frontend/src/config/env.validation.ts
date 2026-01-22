/**
 * Environment Variable Validation
 * Runtime kontrol - eksik kritik değişkenleri tespit eder
 */

import {
    FIREBASE_API_KEY,
    FIREBASE_PROJECT_ID,
    API_URL,
} from '@env';

interface EnvValidationResult {
    isValid: boolean;
    missing: string[];
    warnings: string[];
}

/**
 * Kritik environment variable'ları kontrol eder
 * Uygulama başlangıcında çağrılmalı
 */
export const validateEnvironment = (): EnvValidationResult => {
    const missing: string[] = [];
    const warnings: string[] = [];

    // Kritik Firebase config
    if (!FIREBASE_API_KEY) missing.push('FIREBASE_API_KEY');
    if (!FIREBASE_PROJECT_ID) missing.push('FIREBASE_PROJECT_ID');

    // API URL kontrolü
    if (!API_URL) {
        warnings.push('API_URL not set - using fallback URL');
    }

    const isValid = missing.length === 0;

    if (!isValid) {
        console.error('❌ Missing critical environment variables:', missing);
    }

    if (warnings.length > 0) {
        warnings.forEach(w => console.warn('⚠️', w));
    }

    if (isValid && warnings.length === 0) {
        console.log('✅ All environment variables validated');
    }

    return { isValid, missing, warnings };
};

/**
 * Environment bilgilerini debug için loglar
 */
export const logEnvironmentInfo = (): void => {
    if (__DEV__) {
        console.log('📱 Environment Info:');
        console.log('  - Firebase Project:', FIREBASE_PROJECT_ID || 'NOT SET');
        console.log('  - API URL:', API_URL || 'FALLBACK');
        console.log('  - Mode:', __DEV__ ? 'Development' : 'Production');
    }
};
