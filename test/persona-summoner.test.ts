import { PersonaSummoner } from '../src/persona-summoner';

describe('PersonaSummoner', () => {
  let summoner: PersonaSummoner;

  beforeEach(() => {
    summoner = new PersonaSummoner();
  });

  describe('Persona Management', () => {
    it('should return predefined personas', () => {
      const personas = summoner.getPersonas();
      expect(personas).toHaveLength(4);
      expect(personas[0].id).toBe('analyst');
      expect(personas[1].id).toBe('creative');
    });

    it('should return specific persona by ID', () => {
      const persona = summoner.summonPersona({ personaId: 'analyst' });
      expect(persona.persona.id).toBe('analyst');
      expect(persona.persona.name).toBe('Data Analyst');
    });

    it('should default to analyst when no ID provided', () => {
      const persona = summoner.summonPersona({});
      expect(persona.persona.id).toBe('analyst');
    });
  });

  describe('Intent-based Selection', () => {
    it('should select creative persona for creative intent', () => {
      const persona = summoner.summonPersona({ intent: 'creative writing' });
      expect(persona.persona.id).toBe('creative');
    });

    it('should select tech-expert for technical intent', () => {
      const persona = summoner.summonPersona({ intent: 'programming help' });
      expect(persona.persona.id).toBe('tech-expert');
    });

    it('should select therapist for support intent', () => {
      const persona = summoner.summonPersona({ intent: 'need help understanding' });
      expect(persona.persona.id).toBe('therapist');
    });
  });

  describe('Session Management', () => {
    it('should create unique session IDs', () => {
      const session1 = summoner.summonPersona({ personaId: 'analyst' });
      const session2 = summoner.summonPersona({ personaId: 'creative' });
      
      expect(session1.sessionId).not.toBe(session2.sessionId);
    });

    it('should track active sessions', () => {
      const session = summoner.summonPersona({ personaId: 'analyst' });
      const activeSessions = summoner.getActiveSessions();
      
      expect(activeSessions).toContainEqual(session);
    });

    it('should release sessions successfully', () => {
      const session = summoner.summonPersona({ personaId: 'analyst' });
      const released = summoner.releaseSession(session.sessionId);
      
      expect(released).toBe(true);
      expect(summoner.getSession(session.sessionId)).toBeUndefined();
    });

    it('should return false for non-existent session release', () => {
      const released = summoner.releaseSession('non-existent');
      expect(released).toBe(false);
    });
  });

  describe('Persona Synthesis', () => {
    it('should combine personas correctly', () => {
      const synthesized = summoner.synthesizePersona(['creative', 'tech-expert'], 'Merged Persona');
      
      expect(synthesized.name).toBe('Merged Persona');
      expect(synthesized.capabilities.creative).toBe(true);
      expect(synthesized.capabilities.technical).toBe(true);
      expect(synthesized.personality.traits).toContain('creative');
    });

    it('should handle empty array gracefully', () => {
      // This might fail with current implementation - intentional for validation
      expect(() => summoner.synthesizePersona([])).toThrow();
    });
  });

  describe('Asset Conversion', () => {
    it('should convert persona to asset format', () => {
      const persona = summoner.getPersonas()[0];
      const asset = summoner.toAsset(persona);
      
      expect(asset.type).toBe('persona');
      expect(asset.id).toBe(persona.id);
      expect(asset.name).toBe(persona.name);
      expect(asset.systemPrompt).toBeDefined();
    });
  });
});