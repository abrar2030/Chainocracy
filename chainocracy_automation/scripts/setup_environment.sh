#!/bin/bash
# setup_environment.sh
# 
# This script automates the setup of the development environment for Chainocracy project
# It installs all necessary dependencies and configures the environment for all components
# 
# Usage: ./setup_environment.sh [--component <component>]
# Options:
#   --component: Specify which component to set up (backend, web, mobile, all). Default: all

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
COMPONENT="all"
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --component) COMPONENT="$2"; shift ;;
        *) echo -e "${RED}Unknown parameter: $1${NC}"; exit 1 ;;
    esac
    shift
done

# Function to display section headers
section() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install system dependencies
install_system_dependencies() {
    section "Installing System Dependencies"
    
    if command_exists apt-get; then
        echo "Detected Debian/Ubuntu system"
        sudo apt-get update
        sudo apt-get install -y curl git build-essential
    elif command_exists yum; then
        echo "Detected Red Hat/CentOS system"
        sudo yum update -y
        sudo yum install -y curl git gcc gcc-c++ make
    elif command_exists brew; then
        echo "Detected macOS system"
        brew update
        brew install git
    else
        echo -e "${YELLOW}Unsupported package manager. Please install dependencies manually.${NC}"
        echo "Required: git, curl, build tools"
    fi
    
    echo -e "${GREEN}System dependencies installed successfully${NC}"
}

# Function to install Node.js and npm
install_node() {
    section "Installing Node.js and npm"
    
    if ! command_exists node || ! command_exists npm; then
        echo "Installing Node.js and npm..."
        
        if command_exists apt-get; then
            curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif command_exists yum; then
            curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
            sudo yum install -y nodejs
        elif command_exists brew; then
            brew install node@16
        else
            echo -e "${YELLOW}Please install Node.js v16+ manually:${NC}"
            echo "https://nodejs.org/en/download/"
            exit 1
        fi
    else
        echo "Node.js is already installed"
    fi
    
    # Verify installation
    NODE_VERSION=$(node -v)
    NPM_VERSION=$(npm -v)
    echo -e "Node.js version: ${GREEN}$NODE_VERSION${NC}"
    echo -e "npm version: ${GREEN}$NPM_VERSION${NC}"
}

# Function to install Expo CLI for mobile development
install_expo() {
    section "Installing Expo CLI"
    
    if ! command_exists expo; then
        echo "Installing Expo CLI..."
        npm install -g expo-cli
    else
        echo "Expo CLI is already installed"
    fi
    
    EXPO_VERSION=$(expo --version 2>/dev/null || echo "Unknown")
    echo -e "Expo CLI version: ${GREEN}$EXPO_VERSION${NC}"
}

# Function to set up backend environment
setup_backend() {
    section "Setting up Backend Environment"
    
    if [ -d "backend-api" ]; then
        echo "Setting up backend environment..."
        cd backend-api
        
        # Install dependencies
        echo "Installing backend dependencies..."
        npm install
        
        # Set up environment variables
        if [ -f ".env.example" ] && [ ! -f ".env" ]; then
            echo "Creating .env file from example..."
            cp .env.example .env
            echo -e "${YELLOW}Please edit .env file with your configuration${NC}"
        fi
        
        echo -e "${GREEN}Backend environment setup complete${NC}"
        cd "$PROJECT_ROOT"
    else
        echo -e "${RED}Backend directory not found${NC}"
    fi
}

# Function to set up web frontend environment
setup_web_frontend() {
    section "Setting up Web Frontend Environment"
    
    if [ -d "web-frontend" ]; then
        echo "Setting up web frontend environment..."
        cd web-frontend
        
        # Install dependencies
        echo "Installing web frontend dependencies..."
        npm install
        
        # Set up environment variables
        if [ -f ".env.example" ] && [ ! -f ".env" ]; then
            echo "Creating .env file from example..."
            cp .env.example .env
            echo -e "${YELLOW}Please edit .env file with your configuration${NC}"
        fi
        
        echo -e "${GREEN}Web frontend environment setup complete${NC}"
        cd "$PROJECT_ROOT"
    else
        echo -e "${RED}Web frontend directory not found${NC}"
    fi
}

# Function to set up mobile frontend environment
setup_mobile_frontend() {
    section "Setting up Mobile Frontend Environment"
    
    if [ -d "mobile-frontend" ]; then
        echo "Setting up mobile frontend environment..."
        cd mobile-frontend
        
        # Install dependencies
        echo "Installing mobile frontend dependencies..."
        npm install
        
        # Set up environment variables
        if [ -f ".env.example" ] && [ ! -f ".env" ]; then
            echo "Creating .env file from example..."
            cp .env.example .env
            echo -e "${YELLOW}Please edit .env file with your configuration${NC}"
        fi
        
        echo -e "${GREEN}Mobile frontend environment setup complete${NC}"
        cd "$PROJECT_ROOT"
    else
        echo -e "${RED}Mobile frontend directory not found${NC}"
    fi
}

# Main execution
main() {
    section "Chainocracy Environment Setup"
    echo "Setting up environment for component: $COMPONENT"
    
    # Install common dependencies
    install_system_dependencies
    install_node
    
    # Set up components based on selection
    case $COMPONENT in
        "backend")
            setup_backend
            ;;
        "web")
            setup_web_frontend
            ;;
        "mobile")
            install_expo
            setup_mobile_frontend
            ;;
        "all")
            setup_backend
            setup_web_frontend
            install_expo
            setup_mobile_frontend
            ;;
        *)
            echo -e "${RED}Invalid component: $COMPONENT${NC}"
            echo "Valid options: backend, web, mobile, all"
            exit 1
            ;;
    esac
    
    section "Setup Complete"
    echo -e "${GREEN}Chainocracy environment setup completed successfully!${NC}"
}

# Run the main function
main
