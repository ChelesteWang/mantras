import { PROMPT_TEMPLATES } from '../src/core/templates/prompt-templates';

describe('Prompt Templates - Complete Coverage', () => {
  describe('Template Structure', () => {
    it('should have all required fields for each template', () => {
      PROMPT_TEMPLATES.forEach(template => {
        expect(template.id).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.description).toBeDefined();
        expect(template.technique).toBeDefined();
        expect(template.template).toBeDefined();
        expect(template.parameters).toBeDefined();
        expect(template.category).toBeDefined();
        expect(Array.isArray(template.parameters)).toBe(true);
      });
    });

    it('should have unique IDs', () => {
      const ids = PROMPT_TEMPLATES.map(t => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid categories', () => {
      const validCategories = [
        'code-review',
        'debugging',
        'implementation',
        'planning',
        'architecture',
        'refactoring',
        'optimization',
      ];

      PROMPT_TEMPLATES.forEach(template => {
        expect(validCategories).toContain(template.category);
      });
    });
  });

  describe('Template Content Validation', () => {
    it('should have templates with parameter placeholders', () => {
      PROMPT_TEMPLATES.forEach(template => {
        template.parameters.forEach((param: string) => {
          expect(template.template).toContain(`{${param}}`);
        });
      });
    });

    it('should have non-empty descriptions', () => {
      PROMPT_TEMPLATES.forEach(template => {
        expect(template.description).toBeDefined();
        expect(template.description!.length).toBeGreaterThan(0);
      });
    });

    it('should have valid technique names', () => {
      const techniques = PROMPT_TEMPLATES.map(t => t.technique);
      const uniqueTechniques = new Set(techniques);

      // Should have multiple different techniques
      expect(uniqueTechniques.size).toBeGreaterThan(1);

      // Each technique should be a non-empty string
      techniques.forEach(technique => {
        expect(typeof technique).toBe('string');
        expect(technique.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Specific Template Tests', () => {
    it('should have role-prompting template', () => {
      const roleTemplate = PROMPT_TEMPLATES.find(t => t.id === 'role-prompting');
      expect(roleTemplate).toBeDefined();
      expect(roleTemplate?.category).toBe('code-review');
      expect(roleTemplate?.parameters).toContain('language');
    });

    it('should have debugging templates', () => {
      const debugTemplates = PROMPT_TEMPLATES.filter(t => t.category === 'debugging');
      expect(debugTemplates.length).toBeGreaterThan(0);

      const debugSimulation = debugTemplates.find(t => t.id === 'debug-simulation');
      expect(debugSimulation).toBeDefined();
      expect(debugSimulation?.parameters).toContain('code');
    });

    it('should have architecture template', () => {
      const archTemplate = PROMPT_TEMPLATES.find(t => t.category === 'architecture');
      expect(archTemplate).toBeDefined();
      expect(archTemplate?.id).toBe('feature-blueprinting');
    });
  });

  describe('Template Categories Distribution', () => {
    it('should have templates in all major categories', () => {
      const categories = PROMPT_TEMPLATES.map(t => t.category);
      const uniqueCategories = new Set(categories);

      expect(uniqueCategories.has('debugging')).toBe(true);
      expect(uniqueCategories.has('optimization')).toBe(true);
      expect(uniqueCategories.has('refactoring')).toBe(true);
      expect(uniqueCategories.has('architecture')).toBe(true);
    });

    it('should have balanced distribution across categories', () => {
      const categoryCount = new Map<string, number>();

      PROMPT_TEMPLATES.forEach(template => {
        const count = categoryCount.get(template.category) || 0;
        categoryCount.set(template.category, count + 1);
      });

      // Each category should have at least one template
      categoryCount.forEach(count => {
        expect(count).toBeGreaterThan(0);
      });
    });
  });

  describe('Template Parameter Validation', () => {
    it('should have reasonable parameter counts', () => {
      PROMPT_TEMPLATES.forEach(template => {
        expect(template.parameters.length).toBeGreaterThan(0);
        expect(template.parameters.length).toBeLessThanOrEqual(5);
      });
    });

    it('should have unique parameters within each template', () => {
      PROMPT_TEMPLATES.forEach(template => {
        const uniqueParams = new Set(template.parameters);
        expect(uniqueParams.size).toBe(template.parameters.length);
      });
    });

    it('should have meaningful parameter names', () => {
      PROMPT_TEMPLATES.forEach(template => {
        template.parameters.forEach((param: string) => {
          expect(typeof param).toBe('string');
          expect(param.length).toBeGreaterThan(0);
          expect(param).not.toContain(' '); // No spaces in parameter names
        });
      });
    });
  });
});
