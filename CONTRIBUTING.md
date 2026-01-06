# Contributing to Orbit VM

Thank you for your interest in contributing to Orbit VM! We welcome contributions from the community to help make this project better.

## Getting Started

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/YOUR_USERNAME/orbit-vm.git
    cd orbit-vm
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Run the development server**:
    ```bash
    npm run tauri dev
    ```

## Code Style

*   **Frontend**: We use React with TypeScript and Tailwind CSS. clear, readable code is prioritized.
*   **Backend**: Rust code should follow standard Rust formatting conventions (`cargo fmt`).
*   **Design**: Please adhere to the strict **Monochrome** (Black & White) design language. No colored elements unless absolutely necessary for status indication (and even then, prefer icons or text).

## Component Structure

*   `src/components`: Reusable UI components.
*   `src/layouts`: Page layouts.
*   `src-tauri/src`: Rust backend logic.

## Pull Requests

1.  Create a new branch for your feature or fix: `git checkout -b feature/amazing-feature`.
2.  Commit your changes: `git commit -m 'Add some amazing feature'`.
3.  Push to the branch: `git push origin feature/amazing-feature`.
4.  Open a Pull Request.

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
