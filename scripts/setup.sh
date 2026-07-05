#!/bin/bash

# Project Setup Script for QuantumBallot
# Automates the installation of all dependencies for the project components.

set -euo pipefail # Exit on error, exit on unset variable, fail on pipe error

echo "----------------------------------------"
echo "Starting QuantumBallot Project Setup..."
echo "----------------------------------------"

# --- Configuration ---
COMPONENTS=(
  "code/backend"
  "code/blockchain"
  "web-frontend"
  "mobile-frontend"
)

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# 1. Check for System Dependencies
echo "--- 1. Checking for System Dependencies ---"
if ! command_exists npm; then
  echo "Error: npm is required but not installed. Please install Node.js and npm."
  exit 1
fi

# 2. Install Dependencies for Each Component
echo "--- 2. Installing Dependencies for Components ---"

for component in "${COMPONENTS[@]}"; do
  if [ -d "$component" ]; then
    echo "Processing component: $component"
    (
      cd "$component"
      if [ -f "package.json" ]; then
        echo "  Found package.json. Installing Node.js dependencies..."
        npm install --no-fund
        echo "  Dependencies for $component installed."
      else
        echo "  Warning: package.json not found in $component. Skipping dependency installation."
      fi
    )
  else
    echo "Warning: Component directory '$component' not found. Skipping."
  fi
done

echo "----------------------------------------"
echo "QuantumBallot Project Setup completed successfully!"
echo "----------------------------------------"
