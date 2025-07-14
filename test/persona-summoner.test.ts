import { PersonaSummoner } from '../src/persona-summoner';
import * as logFunctions from '../src/log-to-file';
import { SummonRequest, SummonedPersona } from '../src/types';

// Mock the log-to-file module
jest.mock('../src/log-to-file', () => ({
  logToFile: jest.fn(),
}));

describe('PersonaSummoner', () => {
  let summoner: PersonaSummoner;
  const logToFileMock = logFunctions.logToFile as jest.Mock;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    summoner = new PersonaSummoner();
  });

  describe('Persona Loading and Retrieval', () => {
    it('should load default personas on initialization', () => {
      const personas = summoner.getPersonas();
      expect(personas.length).toBeGreaterThan(0);
      expect(personas.find(p => p.id === 'analyst')).toBeDefined();
    });

    it('should retrieve a specific persona by ID', () => {
      const persona = summoner.getPersonaById('creative');
      expect(persona).toBeDefined();
      expect(persona?.id).toBe('creative');
    });

    it('should return undefined for a non-existent persona ID', () => {
      const persona = summoner.getPersonaById('non-existent-id');
      expect(persona).toBeUndefined();
    });
  });

  describe('summonPersona', () => {
    it('should summon a persona by ID and create a session', () => {
      const result = summoner.summonPersona({ personaId: 'analyst' });
      expect(result.persona.id).toBe('analyst');
      expect(result.sessionId).toBeDefined();
      expect(summoner.getActiveSessions().length).toBe(1);
    });

    it('should select the correct persona based on intent', () => {
      const creativeResult = summoner.summonPersona({ intent: 'creative writing' });
      expect(creativeResult.persona.id).toBe('creative');

      const techResult = summoner.summonPersona({ intent: 'programming help' });
      expect(techResult.persona.id).toBe('tech-expert');

      const therapistResult = summoner.summonPersona({ intent: 'need help understanding' });
      expect(therapistResult.persona.id).toBe('therapist');
    });

    it('should fall back to the analyst persona for an unknown intent', () => {
      const result = summoner.summonPersona({ intent: 'some unknown intent' });
      expect(result.persona.id).toBe('analyst');
    });

    it('should return a non-customized persona when no customParams are provided', () => {
      const request: SummonRequest = { personaId: 'analyst' };
      const originalPersona = summoner.getPersonaById('analyst');
      const result = summoner.summonPersona(request);
      
      expect(result.persona).toEqual(originalPersona);
      expect(result.metadata.customized).toBe(false);
    });

    it('should return a customized persona when customParams are provided', () => {
      const request: SummonRequest = {
        personaId: 'analyst',
        customParams: {
          systemPrompt: 'You are a super analyst.'
        }
      };
      const result = summoner.summonPersona(request);
      
      expect(result.persona.systemPrompt).toBe('You are a super analyst.');
      expect(result.metadata.customized).toBe(true);
    });

    it('should fall back to the default persona if no params are provided', () => {
      const result = summoner.summonPersona({});
      expect(result.persona.id).toBe('analyst'); // Default persona
    });

    it('should throw an error if the requested persona does not exist', () => {
      expect(() => {
        summoner.summonPersona({ personaId: 'non-existent' });
      }).toThrow('Persona with ID non-existent not found.');
    });
  });

  describe('Session Management', () => {
    let summoned: SummonedPersona;

    beforeEach(() => {
      summoned = summoner.summonPersona({ personaId: 'analyst' });
    });

    it('should retrieve an active session by its ID', () => {
      const session = summoner.getSession(summoned.sessionId);
      expect(session).toBeDefined();
      expect(session?.sessionId).toBe(summoned.sessionId);
    });

    it('should return undefined when retrieving a non-existent session', () => {
      const session = summoner.getSession('non-existent-session-id');
      expect(session).toBeUndefined();
    });

    it('should release an active session and log the action', () => {
      const result = summoner.releaseSession(summoned.sessionId);
      expect(result).toBe(true);
      expect(summoner.getActiveSessions().length).toBe(0);
      expect(logToFileMock).toHaveBeenCalledWith(`Released session: ${summoned.sessionId}`);
    });

    it('should return false when trying to release a non-existent session', () => {
      const result = summoner.releaseSession('non-existent-session-id');
      expect(result).toBe(false);
      expect(logToFileMock).not.toHaveBeenCalled();
    });
  });

  describe('synthesizePersona', () => {
    it('should synthesize a new persona from multiple base personas with a custom name', () => {
      const synthesized = summoner.synthesizePersona(['creative', 'tech-expert'], 'Creative Coder');
      expect(synthesized.name).toBe('Creative Coder');
      expect(synthesized.capabilities.creative).toBe(true);
      expect(synthesized.capabilities.technical).toBe(true);
      expect(synthesized.personality.traits).toEqual(['creative', 'vivid', 'engaging', 'storyteller', 'technical', 'detailed', 'accurate', 'structured']);
    });

    it('should synthesize a persona with a default name if no custom name is provided', () => {
      const synthesized = summoner.synthesizePersona(['analyst', 'creative']);
      expect(synthesized.name).toBe('Synthesized (Data Analyst + Creative Writer)');
      expect(logToFileMock).toHaveBeenCalledWith('Synthesized persona: Synthesized (Data Analyst + Creative Writer)');
    });

    it('should throw an error if synthesizing with non-existent persona IDs', () => {
      expect(() => {
        summoner.synthesizePersona(['analyst', 'non-existent']);
      }).toThrow('Base persona with ID non-existent not found.');
    });

    it('should throw an error if base persona IDs are empty', () => {
      expect(() => {
        summoner.synthesizePersona([]);
      }).toThrow('At least one base persona ID is required for synthesis.');
    });
  });

  describe('toAsset', () => {
    it('should convert a persona to the Asset format', () => {
      const persona = summoner.getPersonaById('analyst');
      if (!persona) throw new Error('Test setup failed: Analyst persona not found');
      
      const asset = summoner.toAsset(persona);
      expect(asset.id).toBe('analyst');
      expect(asset.type).toBe('persona');
      expect(asset.name).toBe('Data Analyst');
      expect(asset.systemPrompt).toBe(persona.systemPrompt);
    });
  });
});
