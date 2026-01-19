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
    logout: jest.fn(() => Promise.resolve()),
    loadUser: jest.fn(() => Promise.resolve(null)),
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
