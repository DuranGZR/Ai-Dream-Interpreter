import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../config/api';
import authService from './authService';

export interface DreamSymbol {
  name: string;
  meaning: string;
}

export interface Dream {
  id: string;
  userId: string;
  dreamText: string;
  interpretation?: string;
  energy?: number;
  symbols?: DreamSymbol[];
  sentiment?: {
    score: number;
    label: string;
  };
  date: string;
  createdAt?: unknown;
  isFavorite?: boolean;
  isLocal?: boolean;
}

export interface SaveDreamInput {
  userId: string;
  dreamText: string;
  interpretation: string;
  energy: number;
  symbols?: DreamSymbol[];
  date?: string;
}

export interface InterpretationResponse {
  interpretation: string;
  energy: number;
  symbols: DreamSymbol[];
}

const DREAMS_STORAGE_KEY = '@dreams_storage';

class DreamService {
  private isGuestUser(userId: string): boolean {
    return userId.startsWith('guest-');
  }

  private normalizeSymbols(symbols: unknown): DreamSymbol[] {
    if (!Array.isArray(symbols)) return [];

    return symbols.map((symbol: any) => {
      if (typeof symbol === 'string') {
        return { name: symbol, meaning: '' };
      }

      return {
        name: symbol.name || symbol.symbol || '',
        meaning: symbol.meaning || '',
      };
    });
  }

  private normalizeDream(rawDream: any): Dream {
    const date = rawDream.date || rawDream.createdAt || new Date().toISOString();

    return {
      ...rawDream,
      id: rawDream.id || Date.now().toString(),
      userId: rawDream.userId || 'guest-unknown',
      dreamText: rawDream.dreamText || rawDream.content || '',
      interpretation: rawDream.interpretation,
      energy: typeof rawDream.energy === 'number' ? rawDream.energy : 50,
      symbols: this.normalizeSymbols(rawDream.symbols),
      date,
      isFavorite: Boolean(rawDream.isFavorite),
    };
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await authService.getIdToken();

    if (!token) {
      throw new Error('Kimlik dogrulama tokeni bulunamadi');
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  private async getOptionalAuthHeaders(): Promise<Record<string, string>> {
    const token = await authService.getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async interpretDream(
    dreamText: string,
    userId: string,
    persona?: string,
    userName?: string
  ): Promise<InterpretationResponse> {
    const response = await fetch(API_ENDPOINTS.interpret, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await this.getOptionalAuthHeaders()),
      },
      body: JSON.stringify({
        dreamText,
        userId,
        persona,
        userName,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async saveDream(dream: SaveDreamInput): Promise<Dream> {
    if (this.isGuestUser(dream.userId)) {
      const newDream: Dream = {
        id: Date.now().toString(),
        userId: dream.userId,
        dreamText: dream.dreamText,
        interpretation: dream.interpretation,
        energy: dream.energy,
        symbols: this.normalizeSymbols(dream.symbols),
        date: dream.date || new Date().toISOString(),
        isFavorite: false,
        isLocal: true,
      };

      const existingDreams = await this.getLocalDreams();
      await this.saveLocalDreams([newDream, ...existingDreams]);

      return newDream;
    }

    const response = await fetch(API_ENDPOINTS.dreams, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await this.getAuthHeaders()),
      },
      body: JSON.stringify(dream),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const savedDream = await response.json();
    return this.normalizeDream({
      ...dream,
      ...savedDream,
      id: savedDream.id,
    });
  }

  async getLocalDreams(): Promise<Dream[]> {
    try {
      const dreamsJson = await AsyncStorage.getItem(DREAMS_STORAGE_KEY);
      if (!dreamsJson) return [];

      const dreams = JSON.parse(dreamsJson);
      return Array.isArray(dreams) ? dreams.map((dream) => this.normalizeDream(dream)) : [];
    } catch (error) {
      console.error('Local dreams could not be loaded:', error);
      return [];
    }
  }

  async saveLocalDreams(dreams: Dream[]): Promise<void> {
    await AsyncStorage.setItem(DREAMS_STORAGE_KEY, JSON.stringify(dreams.map((dream) => this.normalizeDream(dream))));
  }

  async getDreams(userId: string): Promise<Dream[]> {
    const cacheKey = `${DREAMS_STORAGE_KEY}_${userId}`;

    if (this.isGuestUser(userId)) {
      return this.getLocalDreams();
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.dreams}?userId=${encodeURIComponent(userId)}`, {
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const dreams = Array.isArray(data) ? data.map((dream) => this.normalizeDream(dream)) : [];

      await AsyncStorage.setItem(cacheKey, JSON.stringify(dreams));
      return dreams;
    } catch (error) {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const dreams = JSON.parse(cached);
        return Array.isArray(dreams) ? dreams.map((dream) => this.normalizeDream(dream)) : [];
      }

      throw error;
    }
  }

  async toggleFavorite(dreamId: string, isFavorite: boolean): Promise<void> {
    const response = await fetch(`${API_ENDPOINTS.dreams}/${dreamId}/favorite`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(await this.getAuthHeaders()),
      },
      body: JSON.stringify({ isFavorite }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  async deleteDream(dreamId: string, userId: string): Promise<void> {
    if (this.isGuestUser(userId)) {
      const dreams = await this.getLocalDreams();
      await this.saveLocalDreams(dreams.filter((dream) => dream.id !== dreamId));
      return;
    }

    const response = await fetch(API_ENDPOINTS.dreamById(dreamId), {
      method: 'DELETE',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
}

export default new DreamService();
