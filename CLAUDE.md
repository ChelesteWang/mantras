# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Build**: `npm run build` - Compiles TypeScript to JavaScript using tsup
- **Dev Mode**: `npm run dev` - Runs the server in watch mode with auto-restart
- **Debug Mode**: `npm run dev:debug` - Same as dev with debugging enabled
- **Test**: `npm test` - Runs all Jest tests
- **Test Specific**: `npm test -- test/server.test.ts` - Run specific test file
- **Start**: `npm start` - Runs compiled server from dist/

## Architecture Overview

This is an **MCP (Model Context Protocol) server** that manages AI assets (personas, prompts, tools) with advanced persona management capabilities.

### Core Components

- **MCP Server** (`src/server.ts`): Entry point that registers tools and handles MCP protocol communication
- **Asset Repository** (`src/asset-repository.ts`): Multi-source asset fetching with caching (remote URLs, local files, defaults)
- **Persona Summoner** (`src/persona-summoner.ts`): Advanced persona management system with intent-based selection and synthesis
- **Asset Sources** (`src/asset-sources.ts`): Default assets and remote source configuration
- **Types** (`src/types.ts`): Core TypeScript interfaces

### Key Features

1. **Multi-Source Asset Federation**: Assets from remote URLs, local JSON files, and built-in defaults
2. **Persona Summoner**: Intent-based persona selection, synthesis, and session management
3. **Caching**: 5-minute asset caching to reduce network requests
4. **Local Override**: Local assets take precedence via `--personas <path>` CLI arg

### Available MCP Tools

- `list_assets` - List all available assets
- `get_asset` - Get specific asset by ID
- `list_personas` - List predefined personas
- `summon_persona` - Activate a persona by ID or intent
- `summon_by_intent` - Automatic persona selection based on intent
- `list_active_sessions` - View active persona sessions
- `release_session` - End a persona session
- `synthesize_persona` - Create combined personas from multiple sources
- `get_session` - Get session details by ID

### Extension Patterns

To add new tools: Register in `server.ts` using `server.registerTool()`
To add new personas: Add to `defaultAssets` array in `asset-sources.ts`
To override remotely: Host JSON files with asset arrays at URLs in `ASSET_SOURCES`
To override locally: Create assets.json and use `--personas assets.json`