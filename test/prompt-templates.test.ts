import { PROMPT_TEMPLATES, getTemplatesByCategory, getTemplateByTechnique } from '../src/prompt-templates';
import { PromptTemplate } from '../src/types';

describe('Prompt Engineering Templates', () => {
  test('should have 10 core templates', () => {
    expect(PROMPT_TEMPLATES).toHaveLength(10);
  });

  test('should have all required properties', () => {
    PROMPT_TEMPLATES.forEach(template => {
      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('type', 'prompt-template');
      expect(template).toHaveProperty('name');
      expect(template).toHaveProperty('description');
      expect(template).toHaveProperty('technique');
      expect(template).toHaveProperty('template');
      expect(template).toHaveProperty('parameters');
      expect(template).toHaveProperty('category');
      expect(Array.isArray(template.parameters)).toBe(true);
    });
  });

  test('should cover all 10 techniques from the handbook', () => {
    const expectedTechniques = [
      'role_prompting',
      'explicit_context',
      'input_output_examples',
      'iterative_chaining',
      'debug_simulation',
      'feature_blueprinting',
      'refactor_guidance',
      'ask_alternatives',
      'rubber_ducking',
      'constraint_anchoring'
    ];

    const actualTechniques = PROMPT_TEMPLATES.map(t => t.technique);
    expectedTechniques.forEach(technique => {
      expect(actualTechniques).toContain(technique);
    });
  });

  test('should have valid categories', () => {
    const validCategories = [
      'code-review',
      'debugging', 
      'implementation',
      'planning',
      'architecture',
      'refactoring',
      'optimization'
    ];

    PROMPT_TEMPLATES.forEach(template => {
      expect(validCategories).toContain(template.category);
    });
  });

  test('should filter templates by category', () => {
    const debuggingTemplates = getTemplatesByCategory('debugging');
    expect(debuggingTemplates.length).toBeGreaterThan(0);
    debuggingTemplates.forEach(template => {
      expect(template.category).toBe('debugging');
    });
  });

  test('should find template by technique', () => {
    const roleTemplate = getTemplateByTechnique('role_prompting');
    expect(roleTemplate).toBeDefined();
    expect(roleTemplate?.technique).toBe('role_prompting');
  });

  test('should have proper parameter placeholders in templates', () => {
    PROMPT_TEMPLATES.forEach(template => {
      template.parameters.forEach(param => {
        expect(template.template).toContain(`{${param}}`);
      });
    });
  });

  test('role prompting template should work correctly', () => {
    const template = getTemplateByTechnique('role_prompting');
    expect(template).toBeDefined();
    
    const inputs = {
      language: 'JavaScript',
      goal: '性能优化',
      code: 'function slow() { return 1; }'
    };
    
    let result = template!.template;
    template!.parameters.forEach(param => {
      result = result.replace(new RegExp(`{${param}}`, 'g'), inputs[param as keyof typeof inputs] || '');
    });
    
    expect(result).toContain('JavaScript');
    expect(result).toContain('性能优化');
    expect(result).toContain('function slow()');
  });
});