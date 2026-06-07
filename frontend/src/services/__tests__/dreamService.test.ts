import AsyncStorage from '@react-native-async-storage/async-storage';
import dreamService from '../dreamService';
import authService from '../authService';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('../authService', () => ({
  getIdToken: jest.fn(() => Promise.resolve('test-token')),
}));

(globalThis as any).fetch = jest.fn();

describe('DreamService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveDream - guest user', () => {
    it('saves dream to local storage for guest users', async () => {
      const mockDream = {
        userId: 'guest-12345',
        dreamText: 'Test dream content',
        interpretation: 'Test interpretation',
        energy: 70,
        symbols: [],
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await dreamService.saveDream(mockDream);

      expect(result).toMatchObject({
        userId: 'guest-12345',
        dreamText: 'Test dream content',
        isLocal: true,
      });
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@dreams_storage',
        expect.any(String)
      );
      expect((globalThis as any).fetch).not.toHaveBeenCalled();
    });
  });

  describe('saveDream - registered user', () => {
    it('saves dream to backend with auth token', async () => {
      const mockDream = {
        userId: 'user-12345',
        dreamText: 'Test dream content',
        interpretation: 'Test interpretation',
        energy: 80,
        symbols: [],
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 'dream-id' }),
      };

      ((globalThis as any).fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await dreamService.saveDream(mockDream);

      expect(result).toHaveProperty('id', 'dream-id');
      expect(authService.getIdToken).toHaveBeenCalled();
      expect((globalThis as any).fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });

  describe('getLocalDreams', () => {
    it('returns empty array when no dreams exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const dreams = await dreamService.getLocalDreams();

      expect(dreams).toEqual([]);
    });

    it('normalizes parsed dreams from storage', async () => {
      const mockDreams = [
        { id: '1', content: 'Dream 1', createdAt: '2026-01-01T00:00:00.000Z' },
        { id: '2', dreamText: 'Dream 2', date: '2026-01-02T00:00:00.000Z' },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockDreams)
      );

      const dreams = await dreamService.getLocalDreams();

      expect(dreams).toHaveLength(2);
      expect(dreams[0]).toMatchObject({
        id: '1',
        dreamText: 'Dream 1',
        date: '2026-01-01T00:00:00.000Z',
      });
    });
  });

  describe('deleteDream', () => {
    it('deletes dream from local storage for guest users', async () => {
      const mockDreams = [
        { id: '1', userId: 'guest-123', dreamText: 'Dream 1' },
        { id: '2', userId: 'guest-123', dreamText: 'Dream 2' },
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
