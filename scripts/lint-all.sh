#!/bin/bash

# Optimized Linting and Fixing Script for QuantumBallot Project (TypeScript, React, YAML)
# This script prioritizes local dependencies and virtual environments for security and reproducibility.

set -euo pipefail # Exit on error, exit on unset variable, fail on pipe error

echo "----------------------------------------"
echo "Starting optimized linting and fixing process for QuantumBallot..."
echo "----------------------------------------"

# --- Configuration ---
COMPONENTS=(
  "code/backend"
  "web-frontend"
  "mobile-frontend"
)
YAML_DIRS=(
  "infrastructure"
  "docs"
  "security"
)

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# --- Setup Dependencies (Ensure they are installed locally) ---

echo "--- 1. Checking and Installing Local Dependencies ---"

# Ensure all components have their dependencies installed
for component in "${COMPONENTS[@]}"; do
  if [ -d "$component" ]; then
    (
      cd "$component"
      if [ -f "package.json" ]; then
        echo "Installing/Updating dependencies for $component..."
        npm install --no-fund
      fi
    )
  fi
done

# --- Tool Availability Checks ---

echo "--- 2. Checking for System Tools ---"

YAMLLINT_AVAILABLE=false
if command_exists yamllint; then
  echo "yamllint is installed."
  YAMLLINT_AVAILABLE=true
else
  echo "Warning: yamllint is not installed. YAML validation will be limited."
fi

# --- Linting and Fixing Processes ---

# 3. ESLint for TypeScript/React files
echo "--- 3. Running ESLint for TypeScript/React/Node.js files ---"

for component in "${COMPONENTS[@]}"; do
  if [ -d "$component" ]; then
    echo "Running ESLint for $component..."
    (
      cd "$component"
      # Use the existing lint script if available, otherwise use npx
      if grep -q "\"lint\":" package.json 2>/dev/null; then
        echo "Using existing 'npm run lint' script..."
        npm run lint -- --fix
      else
        echo "Using npx eslint fallback..."
        npx eslint 'src/**/*.{ts,tsx,js,jsx}' --fix
      fi
    )
  else
    echo "Component directory '$component' not found. Skipping ESLint."
  fi
done

# 4. YAML Linting
echo "--- 4. Running YAML Linting Tools ---"

if [ "$YAMLLINT_AVAILABLE" = true ]; then
  echo "Running yamllint for YAML files..."
  # Find all YAML files in the specified directories and run yamllint
  find "${YAML_DIRS[@]}" -type f \( -name "*.yaml" -o -name "*.yml" \) -print0 | xargs -0 yamllint
else
  echo "Skipping yamllint (not installed). Manual inspection recommended."
fi

echo "----------------------------------------"
echo "Optimized linting and fixing process for QuantumBallot completed!"
echo "----------------------------------------"
