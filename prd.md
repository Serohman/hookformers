# **PRD: Milestone 1 - The Skateboard**

Mission: Deliver the absolute core of Hookformers—a generic, main-thread useTransformer hook. This milestone is about proving the fundamental API contract and developer experience. We will build the simplest thing that could possibly work.

### Core Component

- useTransformer(options)

### Public API & Developer Experience

This is the contract we are building. The developer using our hook will experience the following:

1. A Comprehensive State Object: The hook will return an object that always has a predictable shape, giving the developer everything they need to build a responsive UI.
   const { status, output, error, progress } = useTransformer(...);

   - status: A string representing the current state ('loading', 'idle', 'processing', 'success', 'error').
   - output: The result from the AI model after a successful prediction. null otherwise.
   - error: An error object if any part of the process fails. null otherwise.
   - progress: A number from 0 to 100 indicating model download progress.

2. A Prediction Function: The hook will also return a function to run the model.
   const { predict } = useTransformer(...);
   const result = await predict('Some input text');

### Technical Approach (The "Skateboard" Constraints)

- Main Thread Only: All model initialization and inference will run directly on the main browser thread. The UI _will_ freeze during heavy computation. This is expected and will be solved in the "Motorbike" milestone.
- No Caching: Every instance of the hook will re-download and re-initialize its own model. This is inefficient but simple. Caching will be solved in the "Car" milestone.

### Behavior Plan & Definition of Done

This milestone is considered complete only when all of the following behaviors are implemented and have passing BDD tests. This is our checklist.

#### 1. Successful Initialization Lifecycle

- [ ] The hook must start with a 'loading' status immediately upon being rendered.
- [ ] It must call the underlying pipeline function from the transformers library exactly once with the correct task and model arguments.
- [ ] It must transition to an 'idle' status after the pipeline promise successfully resolves.

#### 2. Successful Prediction Lifecycle

- [ ] The hook must return a stable predict function.
- [ ] When predict is called, the hook's status must immediately change to 'processing'.
- [ ] The predict function must invoke the model instance (the function returned by the resolved pipeline).
- [ ] After the prediction resolves successfully, the status must change to 'success'.
- [ ] The output property in the returned state must be populated with the result of the prediction.

#### 3. Comprehensive Error Handling

- [ ] If the pipeline function rejects during initialization, the final status must become 'error'.
- [ ] If the prediction call is rejected, the final status must also become 'error'.
- [ ] In either error case, the error property in the state must be populated with the error object or message.

#### 4. State Integrity

- [ ] The output and error properties must be mutually exclusive. When one is populated, the other must be null.
- [ ] Calling predict again should correctly clear the previous output or error before the new prediction runs.
