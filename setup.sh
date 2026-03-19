#!/bin/bash
# Run from your HonestHouse project root:
#   chmod +x setup.sh && ./setup.sh

echo "🏠 HonestHouse v7 setup"
echo ""

# 1. Nuke old src completely
echo "→ removing old src/ folder..."
rm -rf src/

# 2. Nuke old App.tsx
echo "→ removing old App.tsx..."
rm -f App.tsx

# 3. Extract new files
echo "→ extracting v7 files..."
tar xzf HonestHouse-v7.tar.gz

# 4. Verify
echo ""
echo "✅ done! file structure:"
find src/ -type f | sort
echo ""
echo "App.tsx"
echo ""
echo "→ run: npx expo start"
