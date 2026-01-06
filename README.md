# Orbit VM
> **A Project By APRK**

Orbit VM is a modern, lightweight virtual machine manager for macOS and Windows, built with Tauri, React, and QEMU. It provides a beautiful, monochrome interface for managing your local virtual machines.

## Features

- **Monochrome UI**: A strict, minimalist black & white design.
- **Spaces**: Organize your VMs into different workspaces.
- **Fast & Native**: Built with Rust and Tauri for maximum performance.
- **Cross-Platform**: Optimized for macOS (Apple Silicon) and Windows (WHPX).
- **QEMU Backend**: Leverages the power of QEMU for robust emulation.
- **Snapshots**: Create and restore VM states instantly.

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Framer Motion
- **Backend**: Rust, Tauri
- **Virtualization**: QEMU
- **Design system**: Lucide Icons, San Francisco / Inter Fonts

## Getting Started

### Prerequisites

- **Node.js**: v18+
- **Rust**: Latest stable
- **QEMU**:
  - macOS: `brew install qemu`
  - Windows: Install via Winget or official installer

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/APRK/orbit-vm.git
   cd orbit-vm
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development mode:
   ```bash
   npm run tauri dev
   ```

4. Build for production:
   ```bash
   npm run tauri build
   ```

## License

MIT License - see [LICENSE](LICENSE) for details.

---
© 2025 APRK.DEV - https://aprkdev.netlify.app/
