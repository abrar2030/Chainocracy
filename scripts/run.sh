#!/bin/bash

# Project Run Script for QuantumBallot
# Provides a unified entry point to run the application components in development mode.

set -euo pipefail # Exit on error, exit on unset variable, fail on pipe error

echo "----------------------------------------"
echo "Starting QuantumBallot Application Components..."
echo "----------------------------------------"

# --- Configuration ---
# Each entry is "directory:npm-script".
COMPONENTS=(
  "code/backend:dev"
  "web-frontend:dev"
  "mobile-frontend:start"
)

# Absolute log directory, resolved before any directory changes.
LOG_DIR="$(pwd)/logs"

# Function to start a component
start_component() {
  local component_dir="$1"
  local start_command="$2"

  if [ -d "$component_dir" ]; then
    echo "--- Starting $component_dir ---"
    (
      cd "$component_dir"
      if [ -f "package.json" ]; then
        echo "Executing '$start_command' in $component_dir..."
        # Run in background and redirect output to a log file
        npm run "$start_command" > "$LOG_DIR/$(basename "$component_dir").log" 2>&1 &
        echo "$component_dir started (PID: $!)"
      else
        echo "Warning: package.json not found in $component_dir. Skipping start."
      fi
    )
  else
    echo "Warning: Component directory '$component_dir' not found. Skipping start."
  fi
}

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Start all components
for entry in "${COMPONENTS[@]}"; do
  start_component "${entry%%:*}" "${entry##*:}"
done

echo "----------------------------------------"
echo "QuantumBallot services are running in the background."
echo "Check 'logs/' directory for output."
echo "Use 'jobs' to see running jobs."
echo "To stop all services, use 'kill \$(jobs -p)'"
echo "----------------------------------------"

# Keep the script running to prevent the background jobs from being killed immediately
# Wait for all background jobs to finish
wait -n
