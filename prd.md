# **Overview**

The purpose of Hookformers is to make integrating powerful AI models into a React app as easy as fetching data.

Running on-device AI models typically requires developers to write significant boilerplate: managing Web Workers to prevent UI freezes, and building custom state logic for loading, progress, and errors. This creates a high barrier to entry and slows down development.

Hookformers is an abstraction layer for React developers that handles this complexity. It provides a simple, performant, and predictable way to leverage the full power of Transformers.js without the repetitive setup.

Think of it like SWR, but for AI models. We handle the caching, background processing, and state management, so developers can focus on building their product.

# **Core Features**

## **1. Simple, Task-Specific Hooks**

- **What it does:** Provides a dedicated React Hook for each common AI task (e.g., `useTextClassification`, `useImageToText`).
- **Why it's important:** Lowers the barrier to entry. Developers can use AI without being experts, and the API is intuitive and discoverable.
- **How it works:** Each hook is a pre-configured wrapper around a core `useTransformer` hook, passing in the specific task type and providing appropriate TypeScript definitions for that task's inputs and outputs.

## **2. "Supercharged" State Management**

- **What it does:** Every hook returns a comprehensive state object: `{ status, progress, error, output }`.
- **Why it's important:** Eliminates all state management boilerplate. Developers get a rich, declarative state out-of-the-box, making it trivial to build responsive UIs (e.g., loading spinners, progress bars, error messages).
- **How it works:** The library listens to events from the model loader and the Web Worker, translating them into a clean, consistent state object that is returned from the hook and triggers re-renders in the component.

## **3. Performant Background Processing**

- **What it does:** Automatically runs all model inference inside a Web Worker.
- **Why it's important:** Prevents the browser's main thread from freezing, ensuring the user interface remains fast and responsive even during heavy computation.
- **How it works:** The library maintains a pool of persistent Web Workers. When a hook is used, it either creates a new worker for that model or gets a reference to an existing one. All `predict` calls are sent as messages to the worker, which performs the computation and sends the result back.

## **4. Intelligent Model Caching & Reuse**

- **What it does:** Ensures a specific model is only initialized once across the entire application.
- **Why it's important:** Eliminates the expensive one-time model initialization cost on all but the very first prediction. This dramatically improves performance and reduces memory usage for applications using the same model in multiple components.
- **How it works:** A global `ModelManager` acts as a singleton registry. When a hook requests a model, the manager checks if an initialized instance already exists in a living worker. If so, it returns a reference to that worker; otherwise, it creates a new one and stores it for future use.

# **User Experience**

## **User Personas**

- **Frontend Developer:** Comfortable with React, but new to AI/ML. Wants to quickly add an AI feature (like sentiment analysis) to an existing app without a steep learning curve. Values simplicity and clear documentation.
- **Full-stack Developer / Indie Hacker:** Prototyping a new AI-powered application. Needs to move fast and validate ideas. Values developer velocity and zero-config defaults.
- **AI/ML Engineer:** Familiar with Transformers, but needs to deploy a model in a React web app. Values performance, control, and the ability to configure model parameters (`dtype`, `quantized`, etc.).

## **Key User Flows**

1. **First Use:** A developer installs the library, imports `useTextClassification`, and calls it with a model name. They are able to get a prediction and render the output with just a few lines of code.
2. **Building a Responsive UI:** A developer uses the `status` and `progress` state to show a loading indicator while the model initializes, and the `error` state to display a helpful message if something goes wrong.
3. **Optimizing for Production:** A developer uses the "Power User" configuration to load a smaller, quantized model to improve performance on mobile devices.

## **UI/UX Considerations (Developer Experience)**

- **API Ergonomics:** Method names (`predict`, `terminate`) should be intuitive and follow industry standards.
- **Error Handling:** Errors should be descriptive, helping the developer understand if the issue is a network problem, an invalid model, or incorrect input.
- **TypeScript Support:** Provide strong, accurate types for all hooks, inputs, and outputs to improve auto-completion and prevent bugs.
- **Documentation:** The README and official docs must be clear, with copy-pasteable examples for every major feature.

# **Technical Architecture**

## **System Components**

- **Hook (`useTask(...)`):** The React-facing interface. Manages component lifecycle and calls the `ModelManager`.
- **`ModelManager`:** A global singleton class responsible for managing the worker pool. It handles creating, reusing, and terminating model workers.
- **`ModelWorker`:** A persistent Web Worker instance. It contains the logic for listening to messages, initializing a single Transformers.js pipeline, running predictions, and posting results or errors back to the main thread.

## **Data Models**

- **`ModelOptions`:** An interface for model configuration: `{ modelId, dtype?, quantized?, device?, revision? }`.
- **`HookState`:** The structure of the returned state object: `{ status, progress, error, output }`. The `output` type is generic and depends on the task.

## **APIs and Integrations**

- **Primary Dependency:** `@huggingface/transformers`. Hookformers is a wrapper around this library's `pipeline` function.
- **Environment:** Modern web browsers with support for Web Workers, Cache API, and ES Modules.

## **Infrastructure Requirements**

- None. Hookformers is a purely client-side library distributed via NPM.

# **Development Methodology**

Our development process is guided by Behavior-Driven Development (BDD). We prioritize building reliable software from the outside-in, ensuring that every piece of code serves a clear, user-facing purpose. Our goal is to create a codebase that is resilient to refactoring and where tests verify the public contract, not the internal implementation.

- **Behavior-First**: For every new feature, we will first write a test that describes its behavior from a developer's perspective. This test will fail initially and will only pass once the feature correctly implements the specified behavior.
- **Test the Contract, Not the Implementation**: Our tests will verify the public API's inputs and outputs (i.e., the state transitions of a hook: `loading` -> `processing` -> `success`). They will be deliberately ignorant of internal implementation details like `useTransformer`. This ensures we can refactor and improve the internals without breaking our test suite.
- **Defining Scope:** A feature is considered "done" when its corresponding behavioral tests pass. This creates lean, well-defined features that deliver end-to-end value.

## TypeScript and Code Style

Our guiding principle is a codebase that is **strict**, **self-documenting**, and **maintainable**. All code and tests will be written in TypeScript, adhering to the following best practices.

- **Compiler Strictness**: The `tsconfig.json` file must have `strict: true` enabled. This is non-negotiable and catches a wide range of common errors at compile time.

- **Type Safety**:
  - **No `any`**: The ESLint rule `@typescript-eslint/no-explicit-any` will be enforced. All types must be explicit to leverage the full power of TypeScript.
  - **Explicit Return Types**: All exported functions and hooks must have explicit return types. This makes the public API clear and prevents accidental regressions.
- **Code Conventions**:
  - **Naming**: `PascalCase` for types, interfaces, and enums. `camelCase` for variables and functions.
  - **Types vs. Interfaces**: Use `interface` for defining the shape of public objects and API contracts, as they are extensible. Use `type` for union types, intersection types, or internal-only type definitions.
  - **Immutability**: Avoid direct mutation of state and objects. Prefer non-mutating array/object methods (e.g., `map`, `filter`, spread syntax) to ensure predictable state flow.
- **Documentation and Readability**:
  - **JSDoc**: All exported functions, hooks, types, and interfaces must be documented with JSDoc comments. This documentation should explain the purpose (`@description`), parameters (`@param`), and return values (`@returns`).
  - **Inline Comments**: Use comments to explain the _why_ behind complex or non-obvious logic within a function's body, not the _what_.
  - **Modularity**: Keep files focused on a single responsibility (e.g., `ModelManager.ts`, `useTextClassification.ts`). Define shared types in a central `types.ts` file to avoid duplication.

## Testing (Jest) Best Practices

Our testing philosophy is that tests should verify behavior, run fast, and be reliable.

- **Mocking Heavy Dependencies**: The `@huggingface/transformers` library must be mocked in all tests. Tests will not perform actual model downloads or spin up real workers.
- **Behavioral Hook Testing:** All hooks will be tested using `@testing-library/react`'s `renderHook` utility. We will test the hook's full lifecycle, asserting state changes (`status`, `output`, `error`) over time as our primary measure of correctness.
- **Test Organization**:
  - Test files will use the `*.test.ts` (or `*.test.tsx`) suffix.
  - Use `describe` blocks to group related tests for a specific hook or function.
  - Use `it` blocks with clear, descriptive names for individual test cases (e.g., `it('should return a loading status while the model initializes')`).
- **Hook Testing**: All hooks will be tested using `@testing-library/react`. This allows us to test the hook's entire lifecycle, including asynchronous state updates and cleanup effects, as it would behave in a real component.
- **Test Isolation**: Use `beforeEach` and `afterEach` to reset all mocks and clear the state of the `ModelManager` singleton between tests. This prevents one test from influencing another.
- **Snapshot Testing**: Use snapshots judiciously to verify the shape of complex, stable output objects from different tasks. This protects against unintentional API regressions.
- **Asynchronous Code**: All asynchronous logic must be tested using `async/await` and `@testing-library/react`'s `waitFor` utilities to ensure state updates are correctly handled.

## **Tooling & Quality Gates**

To enforce consistency and quality, the project will utilize a standard set of development tools. All pull requests must pass the following CI checks before being merged:

- **Testing (Jest):** All tests must pass. NPM script: `ci:test`
- **Linting (ESLint):** Code must adhere to the defined linting rules. NPM script: `ci:lint`
- **Formatting (Prettier):** Code must be formatted correctly. NPM script: `ci:format`
- **Type Checking (TypeScript):** The project must be free of TypeScript errors. NPM script: `ci:typecheck`

## Definition of Done (DoD)

A feature, enhancement, or bug fix is considered "Done" only when it meets all of the following criteria:

- **Code Complete**: All implementation work is finished.
- **Tests Pass**: All existing and new tests pass (`ci:test`).
- **Linter and Formatter Pass**: The code is clean (`ci:lint`, `ci:format`).
- **Type Safe**: The code is free of TypeScript errors (`tsc --noEmit`).
- **Documented**: All new public APIs (hooks, types) have JSDoc comments. The main `README.md` or documentation site is updated if necessary.
- **Peer Reviewed**: The pull request has been reviewed and approved by at least one other team member.

# **Development Roadmap**

This roadmap is iterative. We will build and deliver a complete, end-to-end product at each stage, gathering feedback and experience to inform the next iteration.

## Milestone: The Skateboard - Generic Hook Foundation

**Goal**: Deliver the absolute core of the library: a generic useTransformer hook that works on the main thread. This proves the fundamental state management and API contract for power-users and ourselves.

**BDD-Driven Steps**:

1. **Write API Snapshot Test**: Create a snapshot test for the library's public API to prevent accidental changes.
2. **Write Failing Behavioral Test**: Write a BDD test for `useTextClassification` that describes its full state lifecycle.
3. **Implement the Hook**: Write the simplest possible implementation of the hook that runs on the main thread.
4. **Make Tests Pass**: Refine the implementation until all behavioral tests pass.

## Milestone: The Bicycle - First User-Friendly Hook

**Goal**: Prove the convenience-hook pattern by building a simple, ergonomic wrapper around the Skateboard. This makes the library accessible to all developers.

**BDD-Driven Steps**:

1. **Write New Failing Test**: Create a BDD test for a new `useTextClassification` hook. This test should verify its behavior without knowing about `useTransformer`.
2. **Implement the Convenience Hook**: Build `useTextClassification` as a simple one-line wrapper around the existing `useTransformer`.
3. **Make Tests Pass**: Ensure the new tests pass and that no existing tests have broken.

## Milestone: The Motorbike - Performance via Web Worker

**Goal**: Solve the UI-freezing problem by offloading computation to a Web Worker, making the library usable for real applications.

**BDD-Driven Steps:**

1. **Refactor Internals:** Modify the hook to run the Transformers.js pipeline inside a Web Worker.
2. **Ensure Tests Pass (No Changes)**: The key to this milestone is that the existing behavioral tests should pass without modification. This proves the refactor was successful without altering the public contract.

## Milestone: The Car - Efficiency via Caching

**Goal**: Eliminate redundant model loading and initialization across the application by implementing a singleton cache (ModelManager).

**BDD-Driven Steps:**

1. **Write New Failing Test**: Add a new behavioral test that renders two hooks for the same model and asserts that the core model initialization is only performed once.
2. **Implement Caching Logic**: Build the ModelManager and integrate it with the hook.
3. **Make All Tests Pass**: Refine the implementation until the new caching test and all pre-existing tests pass.

## Future: The Hook Factory (Post-1.0)

With a robust and tested architecture in place for a single hook, adding support for new tasks (`useSummarization`, `useImageToText`, etc.) becomes a repeatable, low-risk process.

# **Iterative Development Path**

Our development philosophy follows a strict iterative path, moving from a simple but complete product to a more complex and optimized one.

**Prove the Core Logic (The Skateboard)**: We start by building a single, generic `useTransformer` hook. This validates the fundamental state management contract that underpins the entire library.

1. **Prove the User Experience (The Bicycle)**: We start by building a single, end-to-end feature (`useTextClassification`) that works, even if it's not performant. This validates our API and core value proposition immediately.

2. **Enhance Performance (The Motorbike)**: Once the API is validated, we focus on the most significant bottleneck—UI freezing. We solve this by refactoring our working feature to use Web Workers, without changing the public API contract.

3. **Optimize for Efficiency (The Car)**: Once the feature is performant, we focus on reducing waste by adding a caching layer. This makes the library efficient for production use cases.

This approach ensures we have a working, shippable product at every milestone, dramatically reducing risk and allowing for continuous feedback.

# **Risks and Mitigations**

- **Technical Risk: Memory Leaks.** Improperly managed workers could lead to memory leaks in long-lived applications.
  - **Mitigation:** Implement a robust `terminate()` function and ensure automatic cleanup in `useEffect`. Add memory profiling to our testing process.
- **Adoption Risk: Unclear Value Proposition.** Developers may not understand why they need this over using Transformers.js directly.
  - **Mitigation:** The "Proof of Concept" performance test is a powerful marketing tool. The `README` and all communication must lead with the "SWR for AI" analogy and focus on the problems of performance and boilerplate.
- **Scope Risk: The "Everything" Trap.** The list of supported tasks is huge. Trying to build them all at once will delay the MVP.
  - **Mitigation:** The Development Roadmap is strictly phased. We must be disciplined in shipping the MVP with only one or two convenience hooks to get feedback quickly.

# **Appeendix**

## **A1: Supported Tasks**

This list defines the full scope of AI/ML tasks that Hookformers aims to support through dedicated convenience hooks.

**Natural Language Processing**:

- `fill-mask`
- `question-answering`
- `sentence-similarity`
- `summarization`
- `text-classification` (also `sentiment-analysis`)
- `text-generation`
- `text2text-generation`
- `token-classification` (also `ner`)
- `translation`
- `translation_xx_to_yy`
- `zero-shot-classification`
- `feature-extraction`

**Computer Vision**:

- `background-removal`
- `depth-estimation`
- `image-classification`
- `image-segmentation`
- `image-to-image`
- `object-detection`
- `image-feature-extraction`

**Audio**:

- `audio-classification`
- `automatic-speech-recognition`
- `text-to-speech` (also `text-to-audio`)
- `zero-shot-audio-classification`

**Multimodal**:

- `document-question-answering`
- `image-to-text`
- `zero-shot-image-classification`
- `zero-shot-object-detection`
