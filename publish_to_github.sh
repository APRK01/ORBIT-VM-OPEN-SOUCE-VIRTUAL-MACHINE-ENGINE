#!/bin/bash

# Orbit VM - GitHub Publish Script

echo "🚀 Preparing to publish Orbit VM to GitHub..."

# 1. Initialize Git
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git branch -M main
else
    echo "✅ Git already initialized."
fi

# 2. Add all files
echo "➕ Adding files..."
git add .

# 3. Commit
echo "💾 Committing files..."
git commit -m "Initial commit: Release Orbit VM v1.0"

# 4. Instructions
echo ""
echo "✨ Ready to push!"
echo "To finish, run these commands:"
echo ""
echo "  1. Create a new repository on GitHub: https://github.com/new"
echo "  2. Run the following command (replace YOUR_REPO_URL):"
echo ""
echo "     git remote add origin https://github.com/APRK/orbit-vm.git"
echo "     git push -u origin main"
echo ""
