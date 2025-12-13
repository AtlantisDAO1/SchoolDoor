# Contributing to SchoolDoor

Thank you for your interest in contributing to SchoolDoor! We welcome contributions from the community. Since this is a monorepo containing both Backend and Frontend, please follow the guidelines relevant to the part of the codebase you are working on.

## Getting Started

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally.
3.  **Choose your path**:
    *   **Backend**: Navigate to `SchoolDoor-Backend` and follow the [README](SchoolDoor-Backend/README.md).
    *   **Frontend**: Navigate to `SchoolDoor-Frontend` and follow the [README](SchoolDoor-Frontend/README.md).
4.  **Create a new branch** for your feature or fix (`git checkout -b feature/amazing-feature`).

## Development Workflow

1.  Make your changes in the respective directory.
2.  Ensure tests and local servers run correctly:
    *   **Backend**: `python run.py` (FastAPI)
    *   **Frontend**: `npm run dev` (Next.js)
3.  Commit your changes with clear messages.
4.  Push to your fork and submit a **Pull Request (PR)** to the `main` branch.

## Coding Standards

### Backend (Python)
-   **Version**: Python 3.10+
-   **Style**: Follow PEP 8 guidelines.
-   **Linting**: Ensure code is clean and readable.

### Frontend (TypeScript/React)
-   **Version**: Node.js 18+
-   **Type Safety**: Use TypeScript strict mode. Avoid `any` unless absolutely necessary.
-   **Formatting**: Prettier
-   **Linting**: ESLint (`npm run lint`)

## Code of Conduct

### Our Pledge
We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards
Examples of behavior that contributes to a positive environment include:
*   Demonstrating empathy and kindness toward other people
*   Being respectful of differing opinions, viewpoints, and experiences
*   Giving and gracefully accepting constructive feedback

Examples of unacceptable behavior include:
*   The use of sexualized language or imagery
*   Trolling, insulting or derogatory comments
*   Public or private harassment

### Enforcement
Community leaders are responsible for clarifying and enforcing our standards of acceptable behavior and will take appropriate and fair corrective action in response to any behavior that they deem inappropriate, threatening, offensive, or harmful.
