import authService from '../authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../config/firebase';

// Mock Firebase
jest.mock('../../config/firebase', () => ({
    auth: {
        currentUser: null,
    },
    db: {},
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
}));

// Mock Firebase Auth functions
jest.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
    GoogleAuthProvider: { credential: jest.fn() },
    updateProfile: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    setDoc: jest.fn(),
    getDoc: jest.fn(() => Promise.resolve({ exists: () => false })),
}));

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('loginWithEmail', () => {
        it('should login successfully with valid credentials', async () => {
            const mockUser = {
                uid: 'test-uid',
                email: 'test@example.com',
                displayName: 'Test User',
            };

            const { signInWithEmailAndPassword } = require('firebase/auth');
            signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });

            const result = await authService.loginWithEmail('test@example.com', 'password123');

            expect(result).toMatchObject({
                id: 'test-uid',
                email: 'test@example.com',
                name: 'Test User',
            });
            expect(AsyncStorage.setItem).toHaveBeenCalled();
        });

        it('should throw error for invalid credentials', async () => {
            const { signInWithEmailAndPassword } = require('firebase/auth');
            signInWithEmailAndPassword.mockRejectedValue({
                code: 'auth/wrong-password',
            });

            await expect(
                authService.loginWithEmail('test@example.com', 'wrong')
            ).rejects.toThrow();
        });
    });

    describe('logout', () => {
        it('should clear user data on logout', async () => {
            const { signOut } = require('firebase/auth');
            signOut.mockResolvedValue(undefined);

            await authService.logout();

            expect(AsyncStorage.removeItem).toHaveBeenCalledWith('auth_user');
        });
    });

    describe('getCurrentUser', () => {
        it('should return null when no user is logged in', () => {
            const user = authService.getCurrentUser();
            expect(user).toBeNull();
        });
    });
});
