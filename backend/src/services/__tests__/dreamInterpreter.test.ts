import { interpretDream } from '../dreamInterpreter';

// Mock AI Provider
jest.mock('../AIProvider', () => ({
    AIFactory: {
        createProvider: jest.fn(() => ({
            interpret: jest.fn().mockResolvedValue({
                interpretation: 'Mock interpretation',
                energy: 80,
                symbols: ['Test Symbol']
            })
        }))
    }
}));

describe('dreamInterpreter', () => {
    it('interprets a dream correctly', async () => {
        const result = await interpretDream('I was flying in the sky');

        expect(result).toHaveProperty('interpretation', 'Mock interpretation');
        expect(result).toHaveProperty('energy', 80);
        expect(result.symbols).toHaveLength(1);
        expect(result.symbols[0]).toEqual('Test Symbol');
    });
});
