import { ActionableTool } from '../types.js';

export const calculatorTool: ActionableTool = {
  id: 'calculator',
  type: 'tool',
  name: 'Calculator',
  description: 'Performs basic arithmetic operations. Currently only supports addition.',
  parameters: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        enum: ['add'],
        description: 'The operation to perform.'
      },
      a: {
        type: 'number',
        description: 'The first operand'
      },
      b: {
        type: 'number',
        description: 'The second operand'
      }
    },
    required: ['operation', 'a', 'b']
  },
  async execute(args: { operation: string; a: number; b: number }): Promise<number> {
    if (args.operation === 'add') {
      return args.a + args.b;
    }
    throw new Error('Unsupported operation');
  }
};