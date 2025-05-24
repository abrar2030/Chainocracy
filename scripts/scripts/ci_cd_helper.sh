#!/bin/bash
# ci_cd_helper.sh
#
# This script helps manage CI/CD workflows for the Chainocracy project
# It can validate workflows, run local CI checks, and manage GitHub Actions
#
# Usage: ./ci_cd_helper.sh <command> [options]
# Commands:
#   validate   - Validate CI/CD workflow files
#   local-ci   - Run CI checks locally
#   status     - Check status of GitHub Actions workflows
#   help       - Show this help message

set -e

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Define project root directory
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")
cd "$PROJECT_ROOT"

# Function to display section headers
section() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Function to display help message
show_help() {
    echo "Chainocracy CI/CD Helper"
    echo ""
    echo "Usage: ./ci_cd_helper.sh <command> [options]"
    echo ""
    echo "Commands:"
    echo "  validate   - Validate CI/CD workflow files"
    echo "  local-ci   - Run CI checks locally"
    echo "  status     - Check status of GitHub Actions workflows"
    echo "  help       - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./ci_cd_helper.sh validate          - Validate all workflow files"
    echo "  ./ci_cd_helper.sh local-ci          - Run CI checks locally"
    echo "  ./ci_cd_helper.sh status            - Check GitHub Actions workflow status"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate workflow files
validate_workflows() {
    section "Validating CI/CD Workflow Files"
    
    if [ -d ".github/workflows" ]; then
        echo "Checking for workflow validation tools..."
        
        # Install actionlint if not available
        if ! command_exists actionlint; then
            echo "Installing actionlint..."
            if command_exists go; then
                go install github.com/rhysd/actionlint/cmd/actionlint@latest
            else
                echo -e "${YELLOW}Go is not installed, skipping actionlint installation${NC}"
                echo "Please install Go and actionlint manually for better validation"
            fi
        fi
        
        # Validate workflow files
        echo "Validating workflow files..."
        
        # Basic YAML validation
        for file in .github/workflows/*.yml; do
            if [ -f "$file" ]; then
                echo "Checking $file..."
                if command_exists yamllint; then
                    yamllint "$file" || echo -e "${YELLOW}YAML issues found in $file${NC}"
                else
                    # Basic syntax check if yamllint is not available
                    if command_exists python3; then
                        python3 -c "import yaml; yaml.safe_load(open('$file'))" && echo -e "${GREEN}$file is valid YAML${NC}" || echo -e "${RED}$file has YAML syntax errors${NC}"
                    else
                        echo -e "${YELLOW}Python3 not found, skipping YAML validation for $file${NC}"
                    fi
                fi
            fi
        done
        
        # Use actionlint if available
        if command_exists actionlint; then
            echo "Running actionlint..."
            actionlint
        fi
        
        echo -e "${GREEN}Workflow validation completed${NC}"
    else
        echo -e "${YELLOW}No .github/workflows directory found${NC}"
        echo "Creating example workflow directory and file..."
        
        # Create example workflow directory and file
        mkdir -p .github/workflows
        cat > .github/workflows/ci.yml << EOF
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: |
        npm ci
        
    - name: Run linting
      run: npm run lint
      
    - name: Run tests
      run: npm test
EOF
        
        echo -e "${GREEN}Example workflow file created at .github/workflows/ci.yml${NC}"
    fi
}

# Function to run CI checks locally
run_local_ci() {
    section "Running CI Checks Locally"
    
    echo "Running local CI checks..."
    
    # Check if backend exists and run its checks
    if [ -d "backend-api" ]; then
        echo "Running backend CI checks..."
        cd backend-api
        
        # Install dependencies if needed
        if [ ! -d "node_modules" ]; then
            echo "Installing backend dependencies..."
            npm install
        fi
        
        # Run linting
        echo "Running backend linting..."
        npm run lint || echo -e "${YELLOW}Backend linting issues found${NC}"
        
        # Run tests
        echo "Running backend tests..."
        npm test || echo -e "${YELLOW}Backend tests failed${NC}"
        
        cd "$PROJECT_ROOT"
    fi
    
    # Check if web frontend exists and run its checks
    if [ -d "web-frontend" ]; then
        echo "Running web frontend CI checks..."
        cd web-frontend
        
        # Install dependencies if needed
        if [ ! -d "node_modules" ]; then
            echo "Installing web frontend dependencies..."
            npm install
        fi
        
        # Run linting
        echo "Running web frontend linting..."
        npm run lint || echo -e "${YELLOW}Web frontend linting issues found${NC}"
        
        # Run tests
        echo "Running web frontend tests..."
        npm test || echo -e "${YELLOW}Web frontend tests failed${NC}"
        
        cd "$PROJECT_ROOT"
    fi
    
    # Check if mobile frontend exists and run its checks
    if [ -d "mobile-frontend" ]; then
        echo "Running mobile frontend CI checks..."
        cd mobile-frontend
        
        # Install dependencies if needed
        if [ ! -d "node_modules" ]; then
            echo "Installing mobile frontend dependencies..."
            npm install
        fi
        
        # Run linting
        echo "Running mobile frontend linting..."
        npm run lint || echo -e "${YELLOW}Mobile frontend linting issues found${NC}"
        
        # Run tests
        echo "Running mobile frontend tests..."
        npm test || echo -e "${YELLOW}Mobile frontend tests failed${NC}"
        
        cd "$PROJECT_ROOT"
    fi
    
    echo -e "${GREEN}Local CI checks completed${NC}"
}

# Function to check GitHub Actions workflow status
check_workflow_status() {
    section "Checking GitHub Actions Workflow Status"
    
    # Check if gh CLI is installed
    if ! command_exists gh; then
        echo -e "${YELLOW}GitHub CLI (gh) is not installed${NC}"
        echo "Please install GitHub CLI to check workflow status:"
        echo "https://cli.github.com/manual/installation"
        return 1
    fi
    
    # Check if authenticated with GitHub
    if ! gh auth status &>/dev/null; then
        echo -e "${YELLOW}Not authenticated with GitHub${NC}"
        echo "Please run 'gh auth login' to authenticate"
        return 1
    fi
    
    # Get repository name
    REPO_NAME=$(basename "$PROJECT_ROOT")
    REPO_OWNER=$(git config --get remote.origin.url | sed -n 's/.*github.com[:/]\([^/]*\).*/\1/p')
    
    if [ -z "$REPO_OWNER" ]; then
        echo -e "${YELLOW}Could not determine repository owner${NC}"
        echo "Please run this command in a git repository with a GitHub remote"
        return 1
    fi
    
    echo "Checking workflow status for $REPO_OWNER/$REPO_NAME..."
    gh workflow list
    
    echo -e "\n${GREEN}Workflow status check completed${NC}"
}

# Main execution
if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

COMMAND=$1
shift

case $COMMAND in
    "validate")
        validate_workflows
        ;;
    "local-ci")
        run_local_ci
        ;;
    "status")
        check_workflow_status
        ;;
    "help")
        show_help
        ;;
    *)
        echo -e "${RED}Invalid command: $COMMAND${NC}"
        show_help
        exit 1
        ;;
esac
