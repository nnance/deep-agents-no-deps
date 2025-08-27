Let's build a NodeJS package that implements 4 key components of a Deep Agent: planning, sub agents, file system access, and memory management in a general purpose way so that you can easily create a Deep Agent for your application.

Help me think through how to break this into iterative development phases and write a plan.md.

Technical Requirements:

- Node.js, npm, TypeScript
- No external dependencies for runtime.   We will implement all functionality using built-in Node.js modules and TypeScript features.
- We will need to core infrastructure for things like logging, configuration management, http requests, environment variables and error handling.
- Comprehensive documentation and examples for each component that is exported.
- Unit tests for each component to ensure reliability and maintainability.
- Use Git for version control and collaboration with clear commit messages.
- A clear versioning strategy (e.g., semantic versioning) to manage changes and updates.
- Support for both CommonJS and ES Module syntax.

Feature Requirements:
- Integrate with multiple LLM providers (e.g., OpenAI, Anthropic, Ollama)
- The planning component should allow for defining and managing tasks via an internally managed to do list.  It should have a verification step to ensure the planned tasks are feasible and meet the requirements.
- The sub-agent component should enable the creation and management of specialized agents that can handle specific tasks or domains.
- The file system access component should provide a secure and efficient way to read and write files, as well as manage file metadata.
- The memory management component should implement a caching mechanism to store and retrieve information efficiently, as well as support for long-term memory storage.
