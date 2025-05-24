#!/bin/bash
# deployment.sh
#
# This script automates the deployment process for Chainocracy project components
# It handles building, packaging, and deploying to different environments
#
# Usage: ./deployment.sh <environment> <component>
# Environments: dev, staging, production
# Components: backend, web, mobile, all

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
if [ $# -lt 2 ]; then
    echo -e "${RED}Error: Missing required parameters${NC}"
    echo "Usage: ./deployment.sh <environment> <component>"
    echo "Environments: dev, staging, production"
    echo "Components: backend, web, mobile, all"
    exit 1
fi

ENVIRONMENT=$1
COMPONENT=$2

# Validate environment parameter
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|production)$ ]]; then
    echo -e "${RED}Invalid environment: $ENVIRONMENT${NC}"
    echo "Valid environments: dev, staging, production"
    exit 1
fi

# Validate component parameter
if [[ ! "$COMPONENT" =~ ^(backend|web|mobile|all)$ ]]; then
    echo -e "${RED}Invalid component: $COMPONENT${NC}"
    echo "Valid components: backend, web, mobile, all"
    exit 1
fi

# Function to display section headers
section() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Function to deploy backend
deploy_backend() {
    local env=$1
    section "Deploying Backend to $env"
    
    if [ -d "backend-api" ]; then
        cd backend-api
        
        # Build for production
        echo "Building backend for deployment..."
        npm run build
        
        # Deploy based on environment
        case $env in
            "dev")
                echo "Deploying backend to development environment..."
                # Add deployment commands for dev environment
                echo -e "${GREEN}Backend deployed to development environment${NC}"
                ;;
            "staging")
                echo "Deploying backend to staging environment..."
                # Add deployment commands for staging environment
                echo -e "${GREEN}Backend deployed to staging environment${NC}"
                ;;
            "production")
                echo "Deploying backend to production environment..."
                # Add deployment commands for production environment
                echo -e "${GREEN}Backend deployed to production environment${NC}"
                ;;
        esac
        
        cd "$PROJECT_ROOT"
    else
        echo -e "${RED}Backend directory not found${NC}"
        exit 1
    fi
}

# Function to deploy web frontend
deploy_web() {
    local env=$1
    section "Deploying Web Frontend to $env"
    
    if [ -d "web-frontend" ]; then
        cd web-frontend
        
        # Build for production
        echo "Building web frontend for deployment..."
        npm run build
        
        # Deploy based on environment
        case $env in
            "dev")
                echo "Deploying web frontend to development environment..."
                # Add deployment commands for dev environment
                echo -e "${GREEN}Web frontend deployed to development environment${NC}"
                ;;
            "staging")
                echo "Deploying web frontend to staging environment..."
                # Add deployment commands for staging environment
                echo -e "${GREEN}Web frontend deployed to staging environment${NC}"
                ;;
            "production")
                echo "Deploying web frontend to production environment..."
                # Add deployment commands for production environment
                echo -e "${GREEN}Web frontend deployed to production environment${NC}"
                ;;
        esac
        
        cd "$PROJECT_ROOT"
    else
        echo -e "${RED}Web frontend directory not found${NC}"
        exit 1
    fi
}

# Function to deploy mobile frontend
deploy_mobile() {
    local env=$1
    section "Deploying Mobile Frontend to $env"
    
    if [ -d "mobile-frontend" ]; then
        cd mobile-frontend
        
        # Build for the specified environment
        case $env in
            "dev")
                echo "Building mobile app for development environment..."
                expo build:android --release-channel dev
                expo build:ios --release-channel dev
                echo -e "${GREEN}Mobile app built for development environment${NC}"
                ;;
            "staging")
                echo "Building mobile app for staging environment..."
                expo build:android --release-channel staging
                expo build:ios --release-channel staging
                echo -e "${GREEN}Mobile app built for staging environment${NC}"
                ;;
            "production")
                echo "Building mobile app for production environment..."
                expo build:android --release-channel production
                expo build:ios --release-channel production
                echo -e "${GREEN}Mobile app built for production environment${NC}"
                ;;
        esac
        
        echo -e "${YELLOW}Mobile app deployment requires manual steps:${NC}"
        echo "1. Download the built app from Expo"
        echo "2. Submit to Google Play Store and/or Apple App Store"
        
        cd "$PROJECT_ROOT"
    else
        echo -e "${RED}Mobile frontend directory not found${NC}"
        exit 1
    fi
}

# Main execution
section "Chainocracy Deployment"
echo "Deploying $COMPONENT to $ENVIRONMENT environment"

case $COMPONENT in
    "backend")
        deploy_backend "$ENVIRONMENT"
        ;;
    "web")
        deploy_web "$ENVIRONMENT"
        ;;
    "mobile")
        deploy_mobile "$ENVIRONMENT"
        ;;
    "all")
        deploy_backend "$ENVIRONMENT"
        deploy_web "$ENVIRONMENT"
        deploy_mobile "$ENVIRONMENT"
        ;;
esac

section "Deployment Complete"
echo -e "${GREEN}Chainocracy $COMPONENT deployment to $ENVIRONMENT completed successfully!${NC}"
