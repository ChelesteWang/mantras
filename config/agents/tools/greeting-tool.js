"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GreetingTool = void 0;
const logger_1 = require("../../../src/core/logger"); // Adjust path as needed
class GreetingTool {
    constructor() {
        this.id = 'item-001-greet';
        this.name = 'Greeter Tool';
        this.description = 'A simple tool to greet the user.';
        this.metadata = {
            version: '1.0.0',
            tags: ['greeting', 'utility'],
        };
    }
    async execute(ideContext, rules, params) {
        const userName = params?.userName || ideContext?.user?.name || 'User';
        const message = `Hello, ${userName}! This is the ${this.name} (ID: ${this.id}) speaking.`;
        logger_1.Logger.log(message);
        if (ideContext) {
            logger_1.Logger.log('IDE Context available:', ideContext);
        }
        if (rules) {
            logger_1.Logger.log('Rules to follow:', rules);
        }
        return message;
    }
}
exports.GreetingTool = GreetingTool;
// Optional: Export an instance if you want to directly use it without instantiation elsewhere,
// or if your dynamic loading mechanism expects a pre-instantiated object.
// export const greetingToolInstance = new GreetingTool();
