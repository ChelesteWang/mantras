# Technical Architecture Document

## 1. System Architecture Overview

AI Asset Manager employs a layered, service-oriented architecture. At its core is a Node.js-based MCP (Model Context Protocol) server responsible for communicating with MCP clients, managing asset data, and executing tool calls. The architecture is designed for high cohesion and low coupling, allowing components to be developed and maintained independently.

### Architecture Diagram

```mermaid
graph TD
    subgraph MCP Client (e.g., Trae, Cursor)
        Client[User Interface]
    end

    subgraph AI Asset Manager MCP Server
        Server[MCP Server (server.ts)]
        Repo[Asset Repository (asset-repository.ts)]
    end

    subgraph Data Sources
        Local[Local Asset File (JSON)]
        Remote[Remote Asset Hub (JSON)]
        Default[Default Assets (asset-sources.ts)]
    end

    Client -- MCP (stdio) --> Server
    Server -- Calls --> Repo
    Repo -- Reads --> Local
    Repo -- Fetches --> Remote
    Repo -- Falls back to --> Default
```

## 2. Component Breakdown

### 2.1. MCP Server (`server.ts`)

- **Responsibility**: Acts as the system's entry point and main controller, handling communication with external MCP clients.
- **Implementation**: Uses the `@modelcontextprotocol/sdk` library to create a `Server` instance. It listens for and responds to client requests via `StdioServerTransport`.
- **Core Functions**:
    - **Tool Registration**: Declares the list of available tools (`list_tools`) to the client, such as `list_assets` and `get_asset`, providing their input schemas.
    - **Request Handling**: Listens for `call_tool` requests and dispatches them to the appropriate handler based on the tool name.
    - **Dependency Injection**: Creates an instance of `RemoteAssetRepository` at startup to be used by tool calls.

### 2.2. Asset Repository (`asset-repository.ts`)

- **Responsibility**: Manages the logic for fetching, caching, and merging asset data, providing a stable and unified data access interface for the server.
- **Implementation**: Implements the `AssetRepository` interface. It maintains an internal cache (`Map`) for asset data and tracks the last fetch time to implement a caching policy.
- **Core Functions**:
    - **Multi-Source Fetching**: Retrieves asset data from different sources in order of priority: Remote Hub -> Fallback Remote Hub -> Default Built-in Assets.
    - **Local Override**: Supports loading assets from a local file. Local assets have the highest priority and can override any remote or default assets with the same `id`.
    - **Caching**: Caches the retrieved asset data for 5 minutes to reduce unnecessary network requests and improve performance.
    - **Fault Tolerance**: Automatically falls back to using the default built-in assets if all remote sources fail, ensuring core functionality remains available.

### 2.3. Data Sources (`asset-sources.ts` & Local Files)

- **Responsibility**: Provides the raw asset definition data.
- **Implementation**:
    - `asset-sources.ts`: Defines two constants, `ASSET_SOURCES` (an array of remote Hub URLs) and `defaultAssets` (an array of default `Asset` objects).
    - **Local File**: Users can pass the path to a local JSON file via the `--personas` command-line argument. This file should contain an array of `Asset` objects.

## 3. Data Flow

1.  **Startup**: `server.ts` starts, parses command-line arguments (like the local asset file path), and instantiates `RemoteAssetRepository`.
2.  **First Call**: When the first request requiring asset data (e.g., `list_assets`) arrives, `RemoteAssetRepository` is triggered.
3.  **Data Fetching**: It iterates through the `ASSET_SOURCES` list, attempting to fetch `assets.json` from the remote URLs.
4.  **Caching & Merging**: If successful, the data is cached. It then loads the local asset file (if provided) and merges the local assets into the dataset, overwriting any remote assets with the same `id`.
5.  **Fallback**: If all remote URLs fail, it uses `defaultAssets` as the base data before merging local assets.
6.  **Response**: The final, merged list of assets is returned to the caller in `server.ts`, which formats it and sends it back to the client via the MCP protocol.

## 4. Key Technology Stack

- **Runtime**: Node.js
- **MCP Protocol**: `@modelcontextprotocol/sdk`
- **Command-Line Parsing**: `commander`
- **Language**: TypeScript
- **Package Manager**: npm

## 5. Extensibility

### 5.1. Adding New Assets

- **Local Method**: The easiest way is to create a new `assets.json` file and point to it with the `--personas` argument when starting the server. This is the most flexible and recommended approach.
- **Code Method**: Directly modify the `src/asset-sources.ts` file to add new `Asset` objects to the `defaultAssets` array. This requires rebuilding the project.

### 5.2. Adding New Tools

1.  **Declare in `server.ts`**: Add a new tool definition to the `tools` array in the `list_tools` handler, including its `name`, `description`, and `inputSchema`.
2.  **Implement in `server.ts`**: Add a `case` for the new tool's name in the `switch` statement of the `call_tool` handler and write the corresponding logic.
3.  **Access Repository**: If the new tool needs asset data, it can access it through the already instantiated `this.repository`.