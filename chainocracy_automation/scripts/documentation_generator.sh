#!/bin/bash
# documentation_generator.sh
#
# This script automates the generation of documentation for the Chainocracy project
# It can generate API documentation, user guides, and developer documentation
#
# Usage: ./documentation_generator.sh <type>
# Types: api, user, developer, all

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

# Parse command line arguments
if [ $# -lt 1 ]; then
    echo -e "${RED}Error: Missing required parameter${NC}"
    echo "Usage: ./documentation_generator.sh <type>"
    echo "Types: api, user, developer, all"
    exit 1
fi

DOC_TYPE=$1

# Validate doc type parameter
if [[ ! "$DOC_TYPE" =~ ^(api|user|developer|all)$ ]]; then
    echo -e "${RED}Invalid documentation type: $DOC_TYPE${NC}"
    echo "Valid types: api, user, developer, all"
    exit 1
fi

# Function to display section headers
section() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install documentation dependencies
install_doc_dependencies() {
    section "Installing Documentation Dependencies"
    
    # Check if Python is installed
    if ! command_exists python3; then
        echo -e "${RED}Python 3 is required but not installed${NC}"
        echo "Please install Python 3 and try again"
        exit 1
    fi
    
    # Install Sphinx and other documentation tools
    echo "Installing Sphinx and other documentation tools..."
    pip3 install --user sphinx sphinx_rtd_theme recommonmark
    
    echo -e "${GREEN}Documentation dependencies installed successfully${NC}"
}

# Function to generate API documentation
generate_api_docs() {
    section "Generating API Documentation"
    
    if [ -d "backend-api" ]; then
        echo "Generating API documentation..."
        
        # Create docs directory if it doesn't exist
        mkdir -p docs/api
        
        # Check if TypeDoc is installed
        if ! command_exists npx; then
            echo "Installing TypeDoc..."
            npm install --global typedoc
        fi
        
        # Generate API documentation using TypeDoc
        cd backend-api
        npx typedoc --out ../docs/api src/
        
        echo -e "${GREEN}API documentation generated successfully${NC}"
        echo "Documentation available at: docs/api/index.html"
        
        cd "$PROJECT_ROOT"
    else
        echo -e "${RED}Backend API directory not found${NC}"
        exit 1
    fi
}

# Function to generate user documentation
generate_user_docs() {
    section "Generating User Documentation"
    
    # Create docs directory if it doesn't exist
    mkdir -p docs/user_guide
    
    # Check if documentation source exists
    if [ -d "documentation/user_manual" ]; then
        echo "Generating user documentation..."
        
        # Copy existing documentation
        cp -r documentation/user_manual/* docs/user_guide/
        
        # Generate PDF if pandoc is available
        if command_exists pandoc; then
            echo "Generating PDF user guide..."
            pandoc docs/user_guide/README.md -o docs/user_guide/user_guide.pdf
        else
            echo -e "${YELLOW}Pandoc not found, skipping PDF generation${NC}"
        fi
        
        echo -e "${GREEN}User documentation generated successfully${NC}"
        echo "Documentation available at: docs/user_guide/"
    else
        echo -e "${YELLOW}User manual source not found, creating template...${NC}"
        
        # Create template user documentation
        cat > docs/user_guide/index.md << EOF
# Chainocracy User Guide

## Introduction
This is the user guide for the Chainocracy blockchain-based voting system.

## Getting Started
Instructions for getting started with the Chainocracy system.

## Voter Guide
Instructions for voters on how to use the mobile application.

## Committee Member Guide
Instructions for committee members on how to use the web application.

## Troubleshooting
Common issues and their solutions.
EOF
        
        echo -e "${GREEN}User documentation template created${NC}"
        echo "Please edit the template at: docs/user_guide/index.md"
    fi
}

# Function to generate developer documentation
generate_developer_docs() {
    section "Generating Developer Documentation"
    
    # Create docs directory if it doesn't exist
    mkdir -p docs/developer_guide
    
    # Check if documentation source exists
    if [ -d "documentation/developer_guide" ]; then
        echo "Generating developer documentation..."
        
        # Copy existing documentation
        cp -r documentation/developer_guide/* docs/developer_guide/
        
        echo -e "${GREEN}Developer documentation generated successfully${NC}"
        echo "Documentation available at: docs/developer_guide/"
    else
        echo -e "${YELLOW}Developer guide source not found, creating template...${NC}"
        
        # Create template developer documentation
        cat > docs/developer_guide/index.md << EOF
# Chainocracy Developer Guide

## Project Setup
Instructions for setting up the development environment.

## Architecture
Overview of the system architecture.

## Backend API
Documentation for the backend API.

## Web Frontend
Documentation for the web frontend.

## Mobile Frontend
Documentation for the mobile frontend.

## Testing
Instructions for testing the application.

## Deployment
Instructions for deploying the application.
EOF
        
        echo -e "${GREEN}Developer documentation template created${NC}"
        echo "Please edit the template at: docs/developer_guide/index.md"
    fi
}

# Main execution
section "Chainocracy Documentation Generator"
echo "Generating documentation type: $DOC_TYPE"

# Install dependencies
install_doc_dependencies

# Generate documentation based on type
case $DOC_TYPE in
    "api")
        generate_api_docs
        ;;
    "user")
        generate_user_docs
        ;;
    "developer")
        generate_developer_docs
        ;;
    "all")
        generate_api_docs
        generate_user_docs
        generate_developer_docs
        ;;
esac

section "Documentation Generation Complete"
echo -e "${GREEN}Chainocracy documentation generation completed successfully!${NC}"
