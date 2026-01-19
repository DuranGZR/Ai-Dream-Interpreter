import dreamService from '../dreamService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('DreamService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('saveDream - Guest User', () => {
        it('should save dream to local storage for guest users', async () => {
            const mockDream = {
                userId: 'guest-12345',
                content: 'Test dream content',
                interpretation: 'Test interpretation',
            };

            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
            (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

            const result = await dreamService.saveDream(mockDream);

            expect(result).toMatchObject({
                userId: 'guest-12345',
                content: 'Test dream content',
                isLocal: true,
            });
            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                '@dreams_storage',
                expect.any(String)
            );
        });
    });

    describe('saveDream - Registered User', () => {
        it('should save dream to backend for registered users', async () => {
            const mockDream = {
                userId: 'user-12345',
                content: 'Test dream content',
                interpretation: 'Test interpretation',
            };

            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({ ...mockDream, id: 'dream-id' }),
            };

            (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

            const result = await dreamService.saveDream(mockDream);

            expect(result).toHaveProperty('id');
            expect(global.fetch).toHaveBeenCalled();
        });
    });

    describe('getLocalDreams', () => {
        it('should return empty array when no dreams exist', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

            const dreams = await dreamService.getLocalDreams();

            expect(dreams).toEqual([]);
        });

        it('should return parsed dreams from storage', async () => {
            const mockDreams = [
                { id: '1', content: 'Dream 1' },
                { id: '2', content: 'Dream 2' },
            ];

            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
                JSON.stringify(mockDreams)
            );

            const dreams = await dreamService.getLocalDreams();

            expect(dreams).toHaveLength(2);
            expect(dreams[0].id).toBe('1');
        });
    });

    describe('deleteDream', () => {
        it('should delete dream from local storage for guest users', async () => {
            const mockDreams = [
                { id: '1', userId: 'guest-123', content: 'Dream 1' },
                { id: '2', userId: 'guest-123', content: 'Dream 2' },
            ];

            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
                JSON.stringify(mockDreams)
            );
            (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

            await dreamService.deleteDream('1', 'guest-123');

            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                '@dreams_storage',
                expect.stringContaining('Dream 2')
            );
        });
    });
});
