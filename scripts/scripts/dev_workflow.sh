#!/bin/bash
# dev_workflow.sh
#
# This script automates common development workflow tasks for the Chainocracy project
# It provides commands for starting development servers, running tests, and more
#
# Usage: ./dev_workflow.sh <command> [options]
# Commands:
#   start <component>   - Start development server for specified component
#   test <component>    - Run tests for specified component
#   lint <component>    - Run linting for specified component
#   build <component>   - Build specified component for production
#   help                - Show this help message

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
    echo "Chainocracy Development Workflow Automation"
    echo ""
    echo "Usage: ./dev_workflow.sh <command> [options]"
    echo ""
    echo "Commands:"
    echo "  start <component>   - Start development server for specified component"
    echo "                        Components: backend, web, mobile, all"
    echo "  test <component>    - Run tests for specified component"
    echo "                        Components: backend, web, mobile, all"
    echo "  lint <component>    - Run linting for specified component"
    echo "                        Components: backend, web, mobile, all"
    echo "  build <component>   - Build specified component for production"
    echo "                        Components: backend, web, mobile"
    echo "  help                - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./dev_workflow.sh start backend    - Start backend development server"
    echo "  ./dev_workflow.sh test all         - Run tests for all components"
    echo "  ./dev_workflow.sh lint web         - Run linting for web frontend"
    echo "  ./dev_workflow.sh build mobile     - Build mobile app for production"
}

# Function to start development servers
start_dev_server() {
    local component=$1
    
    case $component in
        "backend")
            section "Starting Backend Development Server"
            if [ -d "backend-api" ]; then
                cd backend-api
                echo "Starting backend server..."
                npm run dev
            else
                echo -e "${RED}Backend directory not found${NC}"
                exit 1
            fi
            ;;
        "web")
            section "Starting Web Frontend Development Server"
            if [ -d "web-frontend" ]; then
                cd web-frontend
                echo "Starting web frontend server..."
                npm run dev
            else
                echo -e "${RED}Web frontend directory not found${NC}"
                exit 1
            fi
            ;;
        "mobile")
            section "Starting Mobile Frontend Development Server"
            if [ -d "mobile-frontend" ]; then
                cd mobile-frontend
                echo "Starting mobile frontend server..."
                expo start
            else
                echo -e "${RED}Mobile frontend directory not found${NC}"
                exit 1
            fi
            ;;
        "all")
            echo -e "${YELLOW}Starting all servers in separate terminals...${NC}"
            
            # This requires multiple terminals, so we'll provide instructions
            echo -e "${RED}Cannot start all servers in one process.${NC}"
            echo "Please run the following commands in separate terminals:"
            echo ""
            echo "Terminal 1: ./dev_workflow.sh start backend"
            echo "Terminal 2: ./dev_workflow.sh start web"
            echo "Terminal 3: ./dev_workflow.sh start mobile"
            ;;
        *)
            echo -e "${RED}Invalid component: $component${NC}"
            echo "Valid options: backend, web, mobile, all"
            exit 1
            ;;
    esac
}

# Function to run tests
run_tests() {
    local component=$1
    
    case $component in
        "backend")
            section "Running Backend Tests"
            if [ -d "backend-api" ]; then
                cd backend-api
                echo "Running backend tests..."
                npm test
            else
                echo -e "${RED}Backend directory not found${NC}"
                exit 1
            fi
            ;;
        "web")
            section "Running Web Frontend Tests"
            if [ -d "web-frontend" ]; then
                cd web-frontend
                echo "Running web frontend tests..."
                npm test
            else
                echo -e "${RED}Web frontend directory not found${NC}"
                exit 1
            fi
            ;;
        "mobile")
            section "Running Mobile Frontend Tests"
            if [ -d "mobile-frontend" ]; then
                cd mobile-frontend
                echo "Running mobile frontend tests..."
                npm test
            else
                echo -e "${RED}Mobile frontend directory not found${NC}"
                exit 1
            fi
            ;;
        "all")
            section "Running All Tests"
            
            # Run backend tests
            if [ -d "backend-api" ]; then
                echo "Running backend tests..."
                (cd backend-api && npm test)
                echo -e "${GREEN}Backend tests completed${NC}"
            else
                echo -e "${YELLOW}Backend directory not found, skipping tests${NC}"
            fi
            
            # Run web frontend tests
            if [ -d "web-frontend" ]; then
                echo "Running web frontend tests..."
                (cd web-frontend && npm test)
                echo -e "${GREEN}Web frontend tests completed${NC}"
            else
                echo -e "${YELLOW}Web frontend directory not found, skipping tests${NC}"
            fi
            
            # Run mobile frontend tests
            if [ -d "mobile-frontend" ]; then
                echo "Running mobile frontend tests..."
                (cd mobile-frontend && npm test)
                echo -e "${GREEN}Mobile frontend tests completed${NC}"
            else
                echo -e "${YELLOW}Mobile frontend directory not found, skipping tests${NC}"
            fi
            
            echo -e "${GREEN}All tests completed${NC}"
            ;;
        *)
            echo -e "${RED}Invalid component: $component${NC}"
            echo "Valid options: backend, web, mobile, all"
            exit 1
            ;;
    esac
}

# Function to run linting
run_linting() {
    local component=$1
    
    case $component in
        "backend")
            section "Running Backend Linting"
            if [ -d "backend-api" ]; then
                cd backend-api
                echo "Running backend linting..."
                npm run lint
            else
                echo -e "${RED}Backend directory not found${NC}"
                exit 1
            fi
            ;;
        "web")
            section "Running Web Frontend Linting"
            if [ -d "web-frontend" ]; then
                cd web-frontend
                echo "Running web frontend linting..."
                npm run lint
            else
                echo -e "${RED}Web frontend directory not found${NC}"
                exit 1
            fi
            ;;
        "mobile")
            section "Running Mobile Frontend Linting"
            if [ -d "mobile-frontend" ]; then
                cd mobile-frontend
                echo "Running mobile frontend linting..."
                npm run lint
            else
                echo -e "${RED}Mobile frontend directory not found${NC}"
                exit 1
            fi
            ;;
        "all")
            section "Running All Linting"
            
            # Run backend linting
            if [ -d "backend-api" ]; then
                echo "Running backend linting..."
                (cd backend-api && npm run lint)
                echo -e "${GREEN}Backend linting completed${NC}"
            else
                echo -e "${YELLOW}Backend directory not found, skipping linting${NC}"
            fi
            
            # Run web frontend linting
            if [ -d "web-frontend" ]; then
                echo "Running web frontend linting..."
                (cd web-frontend && npm run lint)
                echo -e "${GREEN}Web frontend linting completed${NC}"
            else
                echo -e "${YELLOW}Web frontend directory not found, skipping linting${NC}"
            fi
            
            # Run mobile frontend linting
            if [ -d "mobile-frontend" ]; then
                echo "Running mobile frontend linting..."
                (cd mobile-frontend && npm run lint)
                echo -e "${GREEN}Mobile frontend linting completed${NC}"
            else
                echo -e "${YELLOW}Mobile frontend directory not found, skipping linting${NC}"
            fi
            
            echo -e "${GREEN}All linting completed${NC}"
            ;;
        *)
            echo -e "${RED}Invalid component: $component${NC}"
            echo "Valid options: backend, web, mobile, all"
            exit 1
            ;;
    esac
}

# Function to build for production
build_production() {
    local component=$1
    
    case $component in
        "backend")
            section "Building Backend for Production"
            if [ -d "backend-api" ]; then
                cd backend-api
                echo "Building backend for production..."
                npm run build
                echo -e "${GREEN}Backend build completed${NC}"
            else
                echo -e "${RED}Backend directory not found${NC}"
                exit 1
            fi
            ;;
        "web")
            section "Building Web Frontend for Production"
            if [ -d "web-frontend" ]; then
                cd web-frontend
                echo "Building web frontend for production..."
                npm run build
                echo -e "${GREEN}Web frontend build completed${NC}"
            else
                echo -e "${RED}Web frontend directory not found${NC}"
                exit 1
            fi
            ;;
        "mobile")
            section "Building Mobile Frontend for Production"
            if [ -d "mobile-frontend" ]; then
                cd mobile-frontend
                echo "Building mobile frontend for production..."
                expo build
                echo -e "${GREEN}Mobile frontend build completed${NC}"
            else
                echo -e "${RED}Mobile frontend directory not found${NC}"
                exit 1
            fi
            ;;
        "all")
            section "Building All Components for Production"
            
            # Build backend
            if [ -d "backend-api" ]; then
                echo "Building backend for production..."
                (cd backend-api && npm run build)
                echo -e "${GREEN}Backend build completed${NC}"
            else
                echo -e "${YELLOW}Backend directory not found, skipping build${NC}"
            fi
            
            # Build web frontend
            if [ -d "web-frontend" ]; then
                echo "Building web frontend for production..."
                (cd web-frontend && npm run build)
                echo -e "${GREEN}Web frontend build completed${NC}"
            else
                echo -e "${YELLOW}Web frontend directory not found, skipping build${NC}"
            fi
            
            # Build mobile frontend
            if [ -d "mobile-frontend" ]; then
                echo "Building mobile frontend for production..."
                (cd mobile-frontend && expo build)
                echo -e "${GREEN}Mobile frontend build completed${NC}"
            else
                echo -e "${YELLOW}Mobile frontend directory not found, skipping build${NC}"
            fi
            
            echo -e "${GREEN}All builds completed${NC}"
            ;;
        *)
            echo -e "${RED}Invalid component: $component${NC}"
            echo "Valid options: backend, web, mobile, all"
            exit 1
            ;;
    esac
}

# Main execution
if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

COMMAND=$1
shift

case $COMMAND in
    "start")
        if [ $# -eq 0 ]; then
            echo -e "${RED}Missing component parameter${NC}"
            echo "Usage: ./dev_workflow.sh start <component>"
            exit 1
        fi
        start_dev_server "$1"
        ;;
    "test")
        if [ $# -eq 0 ]; then
            echo -e "${RED}Missing component parameter${NC}"
            echo "Usage: ./dev_workflow.sh test <component>"
            exit 1
        fi
        run_tests "$1"
        ;;
    "lint")
        if [ $# -eq 0 ]; then
            echo -e "${RED}Missing component parameter${NC}"
            echo "Usage: ./dev_workflow.sh lint <component>"
            exit 1
        fi
        run_linting "$1"
        ;;
    "build")
        if [ $# -eq 0 ]; then
            echo -e "${RED}Missing component parameter${NC}"
            echo "Usage: ./dev_workflow.sh build <component>"
            exit 1
        fi
        build_production "$1"
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
