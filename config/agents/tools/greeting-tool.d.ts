import { IMantra, IDEContext, IRule } from '../../../src/interfaces';
export declare class GreetingTool implements IMantra {
    id: string;
    name: string;
    description: string;
    metadata: Record<string, any>;
    execute(ideContext?: IDEContext, rules?: IRule[], params?: any): Promise<string>;
}
