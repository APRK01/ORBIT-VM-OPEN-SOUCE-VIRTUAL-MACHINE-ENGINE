#!/bin/bash

# Orbit VM - Quick Setup Script
# This script installs all dependencies and builds the app

set -e

echo "🚀 Orbit VM Setup"
echo "=================="
echo ""

# Check for Homebrew
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew not found. Installing..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo "✅ Homebrew found"
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    brew install node
else
    echo "✅ Node.js found ($(node -v))"
fi

# Check for Rust
if ! command -v cargo &> /dev/null; then
    echo "🦀 Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    echo "✅ Rust found ($(rustc --version))"
fi

# Install QEMU
if ! command -v qemu-system-aarch64 &> /dev/null; then
    echo "💻 Installing QEMU..."
    brew install qemu
else
    echo "✅ QEMU found"
fi

# Install TigerVNC Viewer
if ! ls /Applications/ | grep -q "TigerVNC"; then
    echo "🖥️  Installing TigerVNC Viewer..."
    brew install --cask tigervnc-viewer
else
    echo "✅ TigerVNC Viewer found"
fi

# Install npm dependencies
echo ""
echo "📦 Installing npm dependencies..."
npm install

# Build the app
echo ""
echo "🔨 Building Orbit VM..."
npm run tauri build

echo ""
echo "✅ Setup complete!"
echo ""
echo "To run in development mode: npm run tauri dev"
echo "The built app is in: src-tauri/target/release/bundle/"
