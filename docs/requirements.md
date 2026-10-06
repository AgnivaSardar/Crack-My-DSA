# Crack My DSA - Product Requirements

## 1. Purpose and scope

Crack My DSA is a web-based Data Structures and Algorithms learning and interview-preparation platform. It combines:

- Company-wise LeetCode interview data.
- Retrieval-Augmented Generation (RAG) for natural-language question answering.
- The Striver A2Z DSA roadmap and problem practice.
- Progress tracking, chat history, and solved-problem analytics.
- An interactive code execution and explanation experience.

This document defines the functional and non-functional requirements for the current product scope.

## 2. Users

The system supports the following user types:

1. **Guest learner** - Uses the platform without creating an account. Guest sessions and progress are persisted locally in the browser.
2. **Registered learner** - Signs in to synchronize chat sessions, solved problems, and roadmap progress with the backend database.

## 3. Functional requirements

### FR-01: User access and authentication

- The system shall allow a user to continue in guest mode without requiring registration.
- The system shall allow a user to sign up, sign in, and sign out through the configured authentication provider.
- The system shall restore an authenticated user's session after a page refresh when a valid session is available.
- The system shall distinguish guest data from registered-user data.
- The system shall prevent one registered user from reading or modifying another user's private sessions, solved problems, or progress.

### FR-02: AI interview assistant

- The system shall provide a chat interface for natural-language DSA and interview-preparation questions.
- The system shall accept optional conversation history so that follow-up questions can use the current conversation context.
- The system shall retrieve relevant company-wise problems using semantic search and metadata filters.
- The system shall support filtering or querying by, where available:
  - Company.
  - DSA topic.
  - Difficulty.
  - Interview recency/timeframe.
  - Frequency or acceptance-rate ordering.
- The system shall generate an answer using retrieved context and return the referenced problems alongside the answer.
- The system shall support requests for unsolved or fresh questions by excluding problems already marked as solved for the current user.
- The system shall provide a clear error response when the AI or retrieval service cannot process a request.

### FR-03: Problem references and metadata

- The system shall display each retrieved problem's title, company, difficulty, frequency, timeframe, topics, and external problem link when those values are available.
- The system shall provide a metadata endpoint or equivalent data source for available companies, topics, and company-topic mappings.
- The system shall provide database or index statistics to support the analytics and administration views.
- The system shall use the cleaned problem dataset as an offline fallback when the vector store is unavailable, where supported by the deployment.

### FR-04: Chat session management

- The system shall create a new chat session for a learner.
- The system shall display the learner's previous chat sessions.
- The system shall save messages and retrieved references in the active session.
- The system shall allow a learner to switch between sessions.
- The system shall allow a learner to delete a session.
- The system shall restore the previously selected session after a browser refresh when it still exists.
- Guest sessions shall be stored in browser storage; registered-user sessions shall be stored through the backend persistence layer.

### FR-05: DSA roadmap

- The system shall provide a structured roadmap covering the supported A2Z DSA topics and modules.
- The system shall display the problems associated with a selected roadmap topic.
- The system shall provide theory, problem, and/or reference views for a topic where content is available.
- The system shall support language selection for available code solutions, including C++, Java, and Python where provided.
- The system shall preserve the selected roadmap tab, topic, subtab, and language across page refreshes.
- The system shall allow a learner to mark an individual roadmap problem as solved or unsolved.
- The system shall show roadmap progress for the current learner.

### FR-06: Problem learning and code assistance

- The system shall display problem statements, explanations, complexity information, and solution references when available.
- The system shall provide syntax-highlighted code examples.
- The system shall allow a learner to copy solution code.
- The system shall provide contextual AI assistance for questions about a problem or its solution.
- The system shall allow a learner to submit supported code for execution against supplied input.
- The system shall support the configured programming languages and return execution output or an actionable error.
- The system shall apply execution limits so that submitted code cannot run indefinitely or consume unbounded resources.

### FR-07: Progress and analytics

- The system shall allow a registered learner to associate a LeetCode username with the profile when the integration is configured.
- The system shall display available solved-problem totals and Easy/Medium/Hard breakdowns.
- The system shall display company-frequency or company-distribution analytics when data is available.
- The system shall display a paginated solved-problems list.
- The system shall provide direct links to solved problems on the source platform when available.
- The system shall keep analytics consistent with the learner's persisted solved-problem state.

### FR-08: Onboarding and navigation

- The system shall provide navigation between the AI assistant, past chats, roadmap, problem references, and analytics dashboard.
- The system shall provide a guided onboarding tour for the primary features.
- The onboarding tour shall be usable on desktop and mobile layouts.
- The system shall allow a learner to dismiss or complete the onboarding tour.
- The system shall preserve the active area and relevant navigation state across refreshes.

### FR-09: API and service integration

- The backend shall expose health, query, metadata, statistics, session, progress, roadmap, and code-execution operations required by the frontend.
- The API shall validate request payloads and return documented JSON response shapes.
- The frontend shall show loading, empty, and failure states for asynchronous API operations.
- The backend shall initialize the embedding, vector-store, retrieval, and generation services at startup or through a controlled lazy-initialization path.

## 4. Non-functional requirements

### NFR-01: Performance

- For a healthy deployment, ordinary metadata, session, and progress requests should begin responding within 1 second at the 95th percentile.
- For a healthy deployment, a standard retrieval request should return within 5 seconds at the 95th percentile, excluding delays imposed by third-party model providers.
- The frontend shall show a loading state for operations that do not complete immediately.
- The interface shall remain responsive while network requests, retrieval, generation, or code execution are in progress.

### NFR-02: Availability and resilience

- The API shall expose a health-check endpoint for deployment and monitoring.
- A failure of an optional dependency shall produce an explicit error or documented fallback rather than a fabricated successful answer.
- The retrieval layer should fall back to the cleaned local dataset when the vector store is unavailable and the requested operation supports offline retrieval.
- Transient third-party failures shall be surfaced to the user with a recoverable error message.
- User-persisted data shall not be lost because of a single failed request.

### NFR-03: Security and privacy

- Secrets, API keys, database credentials, and private keys shall be supplied through environment or deployment secret configuration and shall not be embedded in application source or client bundles.
- All production traffic and authentication exchanges shall use HTTPS.
- Server-side authorization shall be enforced for every operation that reads or changes registered-user data.
- User-provided queries, chat content, and code shall be treated as untrusted input.
- Code execution shall run in an isolated, resource-limited environment with restrictions on execution time, memory, filesystem access, network access, and subprocess behavior.
- CORS shall be restricted to approved production and development origins rather than permitting arbitrary origins in production.
- The system shall avoid exposing provider credentials, internal stack traces, or sensitive database details in client-facing errors.

### NFR-04: Data integrity and consistency

- Persisted chat messages, solved states, and roadmap progress shall be associated with the correct user and problem identifiers.
- Updates to solved state shall be idempotent so that retries do not create duplicate records or contradictory progress.
- The system shall preserve the original problem link and identifying metadata when importing or transforming source data.
- Cached guest data shall be scoped to the current browser storage and shall not be sent as another user's data.
- The application shall handle missing, malformed, or incomplete dataset fields without crashing the entire service.

### NFR-05: Scalability

- The backend shall keep retrieval, generation, persistence, and code execution behind separable service boundaries so each can be scaled independently.
- Vector indexing and data ingestion shall be runnable independently from serving interactive queries.
- Database queries for sessions, solved problems, and progress shall support pagination and appropriate indexing.
- The frontend shall avoid loading the complete problem corpus when only a page, topic, or filtered result set is needed.

### NFR-06: Usability and accessibility

- The application shall provide clear labels, actionable validation messages, and visible success/failure feedback.
- Core workflows shall be usable with keyboard navigation.
- Interactive controls shall have accessible names and states.
- Text, controls, and code blocks shall remain readable at supported desktop and mobile viewport sizes.
- The application shall provide responsive layouts for mobile and desktop screens.
- Markdown, code, and mathematical notation shall render consistently without preventing access to the underlying content.

### NFR-07: Compatibility

- The frontend shall support modern browsers with JavaScript, Web Storage, and the browser APIs required by the application.
- The backend shall run on the supported Python version declared by the project.
- The frontend build shall be reproducible using the versions declared in the frontend package manifest.
- API responses shall remain backward-compatible for existing frontend consumers unless a versioned change is introduced.

### NFR-08: Maintainability and testability

- Requirements and API behavior shall remain documented as features evolve.
- Backend modules shall keep data preprocessing, retrieval, generation, persistence, and API routing separately testable.
- Frontend components shall keep authentication, navigation, data fetching, and presentation concerns reasonably separated.
- Automated checks shall cover critical query, persistence, authentication-authorization, progress, and code-execution behavior.
- Changes shall preserve type/schema validation and produce actionable diagnostics during development.

### NFR-09: Observability and operations

- The backend shall log startup failures, dependency initialization failures, query failures, and code-execution failures with enough context to diagnose the issue without logging secrets or full private user content.
- Production logs shall distinguish expected validation errors from unexpected server failures.
- Deployment shall provide a way to inspect service health and recent failures.
- Data ingestion and vector-index updates shall report their status and failure reason.

### NFR-10: Backup and recovery

- Registered-user data shall be backed up according to the configured database provider's recovery policy.
- A failed deployment or service restart shall not delete persisted registered-user sessions or progress.
- The system shall support rebuilding the vector index from the source/processed datasets.
- Recovery procedures shall document required environment configuration and the order in which data services are restored.

## 5. Requirement priorities

- **Must**: FR-01 through FR-05, FR-09, NFR-01 through NFR-04.
- **Should**: FR-06 through FR-08, NFR-05 through NFR-09.
- **Could**: Additional language runtimes, richer analytics, and expanded integrations that do not compromise the Must requirements.
