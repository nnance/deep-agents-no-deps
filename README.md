# Deep Agents

A TypeScript-based Node.js package implementing a Deep Agent system with planning, sub-agents, file system access, and memory management capabilities.

## Overview

Deep Agents is a comprehensive library that provides the foundational components for building intelligent agent systems. It focuses on four key areas:

- **Planning**: Task management and requirement analysis with verification
- **Sub-Agents**: Specialized agents for different domains and tasks  
- **File System Access**: Secure and efficient file operations with sandboxing
- **Memory Management**: Intelligent caching and long-term memory storage

## Key Features

- 🚀 **Zero Runtime Dependencies** - Uses only built-in Node.js modules
- 📝 **TypeScript First** - Full type safety and excellent IDE support
- 🔧 **Modular Architecture** - Use only what you need
- 🧪 **Comprehensive Testing** - Built-in test suite with Node.js test runner
- 📖 **Rich Documentation** - Extensive examples and API documentation
- 🔌 **LLM Integration** - Support for multiple LLM providers (OpenAI, Anthropic, Ollama)

## Installation

```bash
npm install deep-agents
```

## Quick Start

```typescript
import { DeepAgent } from 'deep-agents';

// Create a new Deep Agent instance
const agent = new DeepAgent();

// Check agent status
console.log(agent.getStatus()); // "Deep Agent initialized - Phase 0 complete"
```

## Development Status

This project is currently in active development following an aggressive timeline:

### ✅ Phase 0: Project Setup & Foundation (COMPLETED)
- [x] Project structure and configuration
- [x] TypeScript setup with strict mode
- [x] Testing framework with Node.js built-in test runner
- [x] Build scripts and development workflow
- [x] Initial documentation

### 🚧 Upcoming Phases

- **Phase 1**: Core Infrastructure (LLM providers, event system, configuration)
- **Phase 2**: File System Component (sandboxed operations, metadata management)
- **Phase 3**: Memory Management (caching, persistence, indexing)
- **Phase 4**: Planning Component (task management, requirement analysis)
- **Phase 5**: Sub-Agent System (specialized agents, communication)
- **Phase 6**: Integration & Polish (orchestration, examples, documentation)
- **Phase 7**: Release Preparation (testing, optimization, packaging)

## Requirements

- Node.js 18.0.0 or higher
- TypeScript 5.0.0 or higher (for development)

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Development mode (watch for changes)
npm run dev

# Clean build artifacts
npm run clean
```

## Project Structure

```
src/
├── core/           # Foundation components and utilities
├── planning/       # Task management and planning algorithms (Phase 4)
├── agents/         # Sub-agent implementations (Phase 5)
├── filesystem/     # File system access and management (Phase 2)
├── memory/         # Memory management and caching (Phase 3)
├── llm/           # LLM provider integrations (Phase 1)
└── index.ts       # Main entry point

tests/             # Test suite
docs/              # Documentation
examples/          # Usage examples
```

## Contributing

This project follows an aggressive development timeline. Please check the current phase in the development plan before contributing.

## License

MIT

## Roadmap

See [PLAN.md](./PLAN.md) for the detailed development roadmap and current progress.

---

**Status**: Phase 0 Complete ✅ | **Next**: Phase 1 - Core Infrastructure | **Target**: 16-20 hours total development time
