# ✅ Mantras MCP Usage Instructions

## 🚀 **Usage Methods** (All Working)

### **Method 1: Direct Node (Recommended for MCP)**
```bash
# Production:
node /Users/bytedance/Desktop/trae/mantras/bin/mantras.js

# With custom assets:
node /Users/bytedance/Desktop/trae/mantras/bin/mantras.js --personas ./my-assets.json
```

### **Method 2: NPX (From Project Directory)**
```bash
# From any directory:
npx --package=/Users/bytedance/Desktop/trae/mantras node /Users/bytedance/Desktop/trae/mantras/bin/mantras.js

# Or simpler:
cd /Users/bytedance/Desktop/trae/mantras
npm run start
```

### **Method 3: Development Mode**
```bash
# Hot-reload development:
cd /Users/bytedance/Desktop/trae/mantras
npm run dev

# Debug mode:
npm run dev:debug
```

## 🔗 **MCP Configuration**

### **Claude Community Tools (Recommended)**
```json
{
  "mcpServers": {
    "persona-summoner": {
      "command": "node",
      "args": ["/Users/bytedance/Desktop/trae/mantras/bin/mantras.js"],
      "env": {}
    }
  }
}
```

### **Development MCP Config**
```json
{
  "mcpServers": {
    "persona-dev": {
      "command": "npm",
      "args": ["run", "dev"],
      "cwd": "/Users/bytedance/Desktop/trae/mantras"
    }
  }
}
```

## 🎯 **Available Tools**

### **Core Tools:**
```bash
mantras__list_assets
mantras__get_asset
```

### **Persona-Summoner Tools:**
```bash
mantras__list_personas
mantras__summon_persona({"personaId": "analyst"})
mantras__summon_by_intent({"intent": "help with coding"})
mantras__synthesize_persona({"basePersonaIds": ["creative", "tech-expert"]})
mantras__list_active_sessions
mantras__release_session({"sessionId": "..."})
```

## 🔧 **Troubleshooting**

### **Permission Issues:**
```bash
# Ensure executable permissions:
chmod +x /Users/bytedance/Desktop/trae/mantras/bin/mantras.js

# Always use full path with node/npx for reliability
```

### **Development:**
```bash
# Start server in background for testing:
node /Users/bytedance/Desktop/trae/mantras/bin/mantras.js &
```

## ✅ **Status Verification**
```bash
# Test server starts correctly:
node /Users/bytedance/Desktop/trae/mantras/bin/mantras.js --help  # Shows available options
```

**Remember**: MCP configuration must use **absolute paths** to the `mantras.js` file.