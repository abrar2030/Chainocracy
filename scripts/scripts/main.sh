#!/bin/bash
# main.sh
#
# Main entry point for Chainocracy automation scripts
# This script provides a unified interface to all automation scripts
#
# Usage: ./main.sh <command> [options]

set -e

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Define script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Function to display section headers
section() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Function to display help message
show_help() {
    echo "Chainocracy Automation Scripts"
    echo ""
    echo "Usage: ./main.sh <command> [options]"
    echo ""
    echo "Commands:"
    echo "  setup       - Set up development environment"
    echo "  dev         - Development workflow commands"
    echo "  deploy      - Deployment commands"
    echo "  docs        - Documentation generation commands"
    echo "  ci          - CI/CD helper commands"
    echo "  help        - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./main.sh setup --component all       - Set up all components"
    echo "  ./main.sh dev start backend           - Start backend development server"
    echo "  ./main.sh deploy production web       - Deploy web frontend to production"
    echo "  ./main.sh docs api                    - Generate API documentation"
    echo "  ./main.sh ci validate                 - Validate CI/CD workflow files"
    echo ""
    echo "For more information on specific commands, run:"
    echo "  ./main.sh <command> help"
}

# Check if script exists and is executable
check_script() {
    local script=$1
    if [ ! -f "$SCRIPT_DIR/$script" ]; then
        echo -e "${RED}Error: Script $script not found${NC}"
        exit 1
    fi
    
    if [ ! -x "$SCRIPT_DIR/$script" ]; then
        echo -e "${YELLOW}Warning: Script $script is not executable, fixing permissions...${NC}"
        chmod +x "$SCRIPT_DIR/$script"
    fi
}

# Make all scripts executable
make_scripts_executable() {
    section "Making Scripts Executable"
    
    chmod +x "$SCRIPT_DIR/setup_environment.sh"
    chmod +x "$SCRIPT_DIR/dev_workflow.sh"
    chmod +x "$SCRIPT_DIR/deployment.sh"
    chmod +x "$SCRIPT_DIR/documentation_generator.sh"
    chmod +x "$SCRIPT_DIR/ci_cd_helper.sh"
    
    echo -e "${GREEN}All scripts are now executable${NC}"
}

# Main execution
if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

# Make all scripts executable
make_scripts_executable

COMMAND=$1
shift

case $COMMAND in
    "setup")
        check_script "setup_environment.sh"
        "$SCRIPT_DIR/setup_environment.sh" "$@"
        ;;
    "dev")
        check_script "dev_workflow.sh"
        "$SCRIPT_DIR/dev_workflow.sh" "$@"
        ;;
    "deploy")
        check_script "deployment.sh"
        "$SCRIPT_DIR/deployment.sh" "$@"
        ;;
    "docs")
        check_script "documentation_generator.sh"
        "$SCRIPT_DIR/documentation_generator.sh" "$@"
        ;;
    "ci")
        check_script "ci_cd_helper.sh"
        "$SCRIPT_DIR/ci_cd_helper.sh" "$@"
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
