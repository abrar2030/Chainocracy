#!/bin/bash

# Project Build Script for QuantumBallot
# Provides a unified entry point to build the application components for production.

set -euo pipefail # Exit on error, exit on unset variable, fail on pipe error

echo "----------------------------------------"
echo "Starting QuantumBallot Project Build..."
echo "----------------------------------------"

# --- Configuration ---
COMPONENTS=(
  "code/backend"
  "web-frontend"
  "mobile-frontend"
)

# Function to build a component
build_component() {
  local component_dir="$1"

  if [ -d "$component_dir" ]; then
    echo "--- Building $component_dir ---"
    (
      cd "$component_dir"
      if [ -f "package.json" ]; then
        # Assuming a standard 'npm run build' script for production build
        if grep -q "\"build\":" package.json 2>/dev/null; then
          echo "Executing 'npm run build' in $component_dir..."
          npm run build
          echo "$component_dir build completed."
        else
          echo "Warning: 'build' script not found in package.json for $component_dir. Skipping build."
        fi
      else
        echo "Warning: package.json not found in $component_dir. Skipping build."
      fi
    )
  else
    echo "Warning: Component directory '$component_dir' not found. Skipping build."
  fi
}

# Build all components
for component in "${COMPONENTS[@]}"; do
  build_component "$component"
done

echo "----------------------------------------"
echo "QuantumBallot Project Build completed successfully!"
echo "----------------------------------------"
