import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { View, Button, Text } from 'react-native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock authService
jest.mock('../src/services/authService', () => ({
    loginWithEmail: jest.fn(() => Promise.resolve({ id: '123', email: 'test@example.com' })),
    signUpWithEmail: jest.fn(),
    logout: jest.fn(() => Promise.resolve()),
    loadUser: jest.fn(() => Promise.resolve(null)),
    getGoogleCredential: jest.fn(),
    getOAuthCredential: jest.fn(),
    signInWithCredential: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
}));

jest.mock('../src/services/dreamService', () => ({
    __esModule: true,
    default: {
        getLocalDreams: jest.fn(() => Promise.resolve([])),
        saveDream: jest.fn(),
    },
}));

jest.mock('../src/config/firebase', () => ({
    auth: { currentUser: null },
    db: {},
}));

jest.mock('firebase/auth', () => ({
    onAuthStateChanged: jest.fn((_auth, callback) => {
        callback(null);
        return jest.fn();
    }),
    updateProfile: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
}));

jest.mock('expo-auth-session/providers/google', () => ({
    useAuthRequest: jest.fn(() => [null, null, jest.fn()]),
}));

jest.mock('expo-auth-session', () => ({
    ResponseType: { IdToken: 'id_token' },
}));

jest.mock('expo-apple-authentication', () => ({
    AppleAuthenticationScope: {
        FULL_NAME: 'FULL_NAME',
        EMAIL: 'EMAIL',
    },
    signInAsync: jest.fn(),
}));

// Test Component
const TestComponent = () => {
    const { user, login, logout } = useAuth();
    return (
        <View>
            <Text>{user ? `Logged in as ${user.email}` : 'Logged out'}</Text>
            <Button title="Login" onPress={() => login('test@example.com', 'password')} />
            <Button title="Logout" onPress={logout} />
        </View>
    );
};

describe('AuthContext', () => {
    it('logs in successfully', async () => {
        const { getByText } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(getByText('Logged out')).toBeTruthy();

        fireEvent.press(getByText('Login'));

        await waitFor(() => {
            expect(getByText('Logged in as test@example.com')).toBeTruthy();
        });
    });
});
