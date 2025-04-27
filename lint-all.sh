#!/bin/bash

# Linting and Fixing Script for Chainocracy Project (TypeScript, React, YAML)

set -e  # Exit immediately if a command exits with a non-zero status

echo "----------------------------------------"
echo "Starting linting and fixing process for Chainocracy..."
echo "----------------------------------------"

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Skip Homebrew installation and use npm/npx directly
echo "Checking for required tools..."
if ! command_exists npm; then
  echo "Error: npm is required but not installed. Please install Node.js and npm."
  exit 1
else
  echo "npm is installed."
fi

if ! command_exists npx; then
  echo "Error: npx is required but not installed. Please install Node.js and npm."
  exit 1
else
  echo "npx is installed."
fi

# Check for yamllint - optional
if ! command_exists yamllint; then
  echo "Warning: yamllint is not installed. YAML validation will be limited."
  YAMLLINT_AVAILABLE=false
else
  echo "yamllint is installed."
  YAMLLINT_AVAILABLE=true
fi

# Check for dos2unix - optional
if ! command_exists dos2unix; then
  echo "Warning: dos2unix is not installed. Line ending fixes will be skipped."
  DOS2UNIX_AVAILABLE=false
else
  echo "dos2unix is installed."
  DOS2UNIX_AVAILABLE=true
fi

# 1. ESLint for TypeScript files in backend-api
echo "----------------------------------------"
echo "Running ESLint for TypeScript files in backend-api..."
if [ -d "backend-api" ]; then
  (
    cd backend-api
    if [ -f package.json ]; then
      echo "Found package.json. Installing npm dependencies if needed..."
      npm install --no-fund
    fi
    
    # Create a basic ESLint config compatible with ESLint v8 or v9
    echo "Creating ESLint config for TypeScript..."
    cat > eslint.config.js << 'EOF'
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  }
);
EOF

    # Also create a fallback .eslintrc.js for ESLint v8 compatibility
    cat > .eslintrc.js << 'EOF'
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  env: {
    node: true,
    es6: true
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  }
};
EOF
      
    # Install TypeScript ESLint dependencies if needed
    echo "Installing ESLint dependencies..."
    npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin typescript-eslint --no-fund
    
    echo "Running ESLint with --fix for TypeScript files..."
    # Try modern ESLint config first, fall back to legacy if it fails
    if npx eslint --fix 'src/**/*.{ts,js}' 2>/dev/null || npx eslint --config .eslintrc.js --fix 'src/**/*.{ts,js}'; then
      echo "ESLint completed successfully for backend-api."
    else
      echo "ESLint encountered some issues in backend-api. Please review the above errors."
    fi
  )
else
  echo "No backend-api directory found. Skipping backend ESLint."
fi

# 2. ESLint for TypeScript/React files in web-frontend
echo "----------------------------------------"
echo "Running ESLint for TypeScript/React files in web-frontend..."
if [ -d "web-frontend" ]; then
  (
    cd web-frontend
    if [ -f package.json ]; then
      echo "Found package.json. Installing npm dependencies if needed..."
      npm install --no-fund
    fi
    
    echo "Running ESLint with --fix for TypeScript/React files..."
    # Use the existing lint script if available
    if grep -q "\"lint\":" package.json; then
      echo "Using existing lint script from package.json..."
      npm run lint -- --fix || {
        echo "ESLint encountered some issues in web-frontend. Please review the above errors."
      }
    else
      # Fallback to direct ESLint command
      npx eslint 'src/**/*.{ts,tsx,js,jsx}' --fix || {
        echo "ESLint encountered some issues in web-frontend. Please review the above errors."
      }
    fi
    echo "ESLint completed for web-frontend."
  )
else
  echo "No web-frontend directory found. Skipping web frontend ESLint."
fi

# 3. ESLint for TypeScript/React Native files in mobile-frontend
echo "----------------------------------------"
echo "Running ESLint for TypeScript/React Native files in mobile-frontend..."
if [ -d "mobile-frontend" ]; then
  (
    cd mobile-frontend
    if [ -f package.json ]; then
      echo "Found package.json. Installing npm dependencies if needed..."
      npm install --legacy-peer-deps --no-fund
    fi
    
    # Create a basic ESLint config for React Native if it doesn't exist
    if [ ! -f .eslintrc.js ] && [ ! -f .eslintrc.json ] && [ ! -f .eslintrc.yml ]; then
      echo "Creating basic ESLint config for React Native..."
      cat > .eslintrc.js << 'EOF'
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-native/all',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react', 'react-native', '@typescript-eslint'],
  rules: {
    'react-native/no-unused-styles': 'warn',
    'react-native/no-inline-styles': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
EOF
      # Install React Native ESLint dependencies if needed
      npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-native --legacy-peer-deps --no-fund
    fi
    
    echo "Running ESLint with --fix for TypeScript/React Native files..."
    # Use the existing lint script if available
    if grep -q "\"lint\":" package.json; then
      echo "Using existing lint script from package.json..."
      npm run lint -- --fix || {
        echo "ESLint encountered some issues in mobile-frontend. Please review the above errors."
      }
    else
      # Fallback to direct ESLint command
      npx eslint 'src/**/*.{ts,tsx,js,jsx}' --fix || {
        echo "ESLint encountered some issues in mobile-frontend. Please review the above errors."
      }
    fi
    echo "ESLint completed for mobile-frontend."
  )
else
  echo "No mobile-frontend directory found. Skipping mobile frontend ESLint."
fi

# 4. Fix YAML Files (automated fixes for common issues)
fix_yaml_files() {
  echo "----------------------------------------"
  echo "Applying automated fixes to YAML files..."
  echo "----------------------------------------"

  # Define directories to process YAML files
  yaml_directories=("." "kubernetes" "docs")

  for dir in "${yaml_directories[@]}"; do
    if [ -d "$dir" ]; then
      echo "Processing YAML files in directory: $dir"
      # Find all YAML files in the directory and subdirectories, excluding .tmp files
      yaml_files=$(find "$dir" -type f \( -name '*.yaml' -o -name '*.yml' \) ! -name '*.tmp')

      for file in $yaml_files; do
        echo "Processing $file"

        # Check if file exists
        if [ ! -f "$file" ]; then
          echo "Warning: $file does not exist. Skipping."
          echo "----------------------------------------"
          continue
        fi

        # Create a backup before making changes
        cp "$file" "$file.bak"

        # a. Remove BOM if present
        if head -c 3 "$file" | grep -q $'\xef\xbb\xbf'; then
          echo "Removing BOM from $file"
          tail -c +4 "$file" > "$file.tmp" && mv "$file.tmp" "$file"
        else
          echo "No BOM found in $file"
        fi

        # b. Ensure '---' is on the first line with no leading spaces or characters
        first_line=$(head -n 1 "$file")
        if [[ "$first_line" =~ ^[[:space:]]*--- ]]; then
          echo "Cleaning up '---' in $file"
          sed -i '1s/^[[:space:]]*---$/---/' "$file"
        else
          echo "Adding document start '---' to $file"
          sed -i '1i---' "$file"
        fi

        # c. Remove any '---' lines after the first line
        sed -i '2,${/^---/d}' "$file"

        # d. Remove leading spaces from the second line to fix indentation issues
        #    This assumes that the second line should start at column 1
        second_line=$(sed -n '2p' "$file")
        if [[ "$second_line" =~ ^[[:space:]]+ ]]; then
          echo "Removing leading spaces from the second line of $file"
          sed -i '2s/^[[:space:]]*//' "$file"
        else
          echo "No leading spaces found on the second line of $file"
        fi

        # e. Convert Windows-style line endings to Unix (if dos2unix is available)
        if [ "$DOS2UNIX_AVAILABLE" = true ]; then
          dos2unix "$file" >/dev/null 2>&1
          echo "Converted line endings to Unix style for $file"
        else
          echo "Skipping line ending conversion (dos2unix not available)"
        fi

        # f. Ensure newline at end of file
        if [ -n "$(tail -c1 "$file")" ] && [ "$(tail -c1 "$file")" != $'\n' ]; then
          echo "Adding newline at end of $file"
          echo "" >> "$file"
        else
          echo "No need to add newline at end of $file"
        fi

        # g. Handle line length (notify if lines exceed 80 characters)
        long_lines=$(awk 'length($0) > 80' "$file")
        if [ -n "$long_lines" ]; then
          echo "Warning: The following lines in $file exceed 80 characters:"
          awk 'length($0) > 80' "$file" | nl
        else
          echo "No lines exceed 80 characters in $file"
        fi

        echo "Finished processing $file"
        echo "----------------------------------------"
      done
    else
      echo "Directory $dir not found. Skipping YAML processing for this directory."
    fi
  done
}

fix_yaml_files

# 5. Run yamllint on YAML files to identify remaining issues (if available)
if [ "$YAMLLINT_AVAILABLE" = true ]; then
  echo "----------------------------------------"
  echo "Running yamllint for YAML files..."
  yamllint ./**/*.yaml ./**/*.yml || {
    echo "YAML linting completed with some issues. Please review the above warnings/errors."
  }
  echo "yamllint completed."
  echo "----------------------------------------"
else
  echo "----------------------------------------"
  echo "Skipping yamllint (not installed)."
  echo "----------------------------------------"
fi

# 6. Cleanup Unnecessary Backup and Temporary Files
cleanup_backup_files() {
  echo "Cleaning up unnecessary backup (.bak) and temporary (.tmp) files..."
  echo "----------------------------------------"

  # Define directories to clean up
  cleanup_directories=("." "kubernetes" "docs" "backend-api" "web-frontend" "mobile-frontend")

  for dir in "${cleanup_directories[@]}"; do
    if [ -d "$dir" ]; then
      echo "Cleaning up in directory: $dir"
      # Find and delete all .bak and .tmp files
      find "$dir" -type f \( -name '*.bak' -o -name '*.tmp' \) -exec rm -f {} +
      echo "Removed backup and temporary files in $dir"
      echo "----------------------------------------"
    else
      echo "Directory $dir not found. Skipping cleanup for this directory."
    fi
  done
}

cleanup_backup_files

echo "----------------------------------------"
echo "Linting and fixing process for Chainocracy completed!"
echo "----------------------------------------"
