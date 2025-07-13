# AI Asset Manager

## 1. Project Overview

AI Asset Manager is a versatile MCP (Model Context Protocol) server designed to manage a wide range of AI-related assets, including prompts, personas, and tool definitions. It allows users to fetch, cache, and utilize these assets through simple commands, providing a centralized repository for AI development resources.

## 2. Key Features

- **Generic Asset Support**: Manages different types of assets, such as `persona`, `prompt`, and `tool`, not just personas.
- **Multi-Source Federation**: Aggregates assets from remote URLs, local files, and a set of built-in defaults.
- **Local Override**: Assets defined in a local file take precedence, allowing for easy customization and development.
- **Caching Mechanism**: Caches fetched assets to improve performance and reduce network latency.
- **Command-Line Integration**: Can be run as a command-line tool and easily integrated with any MCP-compatible client.

## 3. Project Structure

```
ai-asset-manager/
├── src/
│   ├── server.ts           # Main MCP server entry point
│   ├── asset-repository.ts # Asset data repository
│   ├── asset-sources.ts    # Defines remote and default assets
│   └── types.ts            # TypeScript type definitions
├── package.json
└── ...
```

## 4. Core Module Analysis

### 4.1. `server.ts`

This is the project's core, responsible for:
- Initializing and starting an MCP server.
- Registering available tools like `list_assets` and `get_asset`.
- Handling tool call requests from the MCP client and dispatching them to the appropriate functions.

### 4.2. `asset-repository.ts`

This module is the heart of data management, responsible for:
- Fetching asset data from remote URLs defined in `asset-sources.ts`.
- Loading assets from a local JSON file if specified.
- Implementing a cache layer to avoid redundant requests.
- Falling back to default assets when remote sources are unavailable.
- Merging remote, local, and default assets, with local assets having the highest priority.

### 4.3. `asset-sources.ts`

This file defines:
- A list of remote URLs for asset sources.
- A default list of built-in assets (`Asset[]`) that serve as a fallback.

### 4.4. `types.ts`

Defines the key TypeScript interfaces used in the project, primarily `Asset`, `AssetType`, and `AssetRepository`.

## 5. Usage Flow

1.  The user configures the AI Asset Manager server in their MCP client.
2.  The client runs the server, potentially with a `--personas` argument pointing to a local `assets.json` file.
3.  `server.ts` starts and initializes the `RemoteAssetRepository`.
4.  The repository attempts to fetch assets from remote URLs, falling back to default assets on failure.
5.  If a local asset file is provided, it's loaded and merged, overriding any existing assets with the same `id`.
6.  The user calls `list_assets` or `get_asset` from the client.
7.  `server.ts` receives the request, uses the repository to fulfill it, and returns the result to the client.

## 6. Conclusion

AI Asset Manager is a well-structured and extensible MCP server. Its layered design (Server, Repository, Sources) promotes separation of concerns, making it easy to maintain and expand. By supporting various asset types and multiple data sources, it offers developers a high degree of flexibility and customization for their AI-powered workflows.