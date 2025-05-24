# Chainocracy Automation Scripts

This directory contains automation scripts for the Chainocracy project. These scripts are designed to streamline development, testing, deployment, and documentation processes.

## Scripts Overview

1. **main.sh** - Main entry point for all automation scripts
2. **setup_environment.sh** - Automates environment setup for all components
3. **dev_workflow.sh** - Manages development workflow tasks (start servers, run tests, lint)
4. **deployment.sh** - Handles deployment to different environments
5. **documentation_generator.sh** - Generates project documentation
6. **ci_cd_helper.sh** - Assists with CI/CD workflows

## Usage

All scripts can be accessed through the main script:

```bash
./main.sh <command> [options]
```

### Available Commands

- **setup** - Set up development environment
  ```bash
  ./main.sh setup --component all
  ./main.sh setup --component backend
  ./main.sh setup --component web
  ./main.sh setup --component mobile
  ```

- **dev** - Development workflow commands
  ```bash
  ./main.sh dev start backend
  ./main.sh dev test all
  ./main.sh dev lint web
  ./main.sh dev build mobile
  ```

- **deploy** - Deployment commands
  ```bash
  ./main.sh deploy dev backend
  ./main.sh deploy staging web
  ./main.sh deploy production all
  ```

- **docs** - Documentation generation commands
  ```bash
  ./main.sh docs api
  ./main.sh docs user
  ./main.sh docs developer
  ./main.sh docs all
  ```

- **ci** - CI/CD helper commands
  ```bash
  ./main.sh ci validate
  ./main.sh ci local-ci
  ./main.sh ci status
  ```

## Installation

1. Extract the scripts to your Chainocracy project root directory
2. Make the scripts executable:
   ```bash
   chmod +x scripts/*.sh
   ```
3. Run the scripts from the project root directory

## Requirements

- Bash shell
- Git
- Node.js and npm
- Python 3 (for documentation generation)

## Script Details

### setup_environment.sh

Automates the setup of the development environment for all components:
- Installs system dependencies
- Sets up Node.js and npm
- Installs Expo CLI for mobile development
- Configures environment variables
- Installs project dependencies

### dev_workflow.sh

Manages common development workflow tasks:
- Starting development servers
- Running tests
- Linting code
- Building for production

### deployment.sh

Handles deployment to different environments:
- Development
- Staging
- Production
- Supports backend, web, and mobile components

### documentation_generator.sh

Generates project documentation:
- API documentation
- User guides
- Developer documentation

### ci_cd_helper.sh

Assists with CI/CD workflows:
- Validates workflow files
- Runs CI checks locally
- Checks GitHub Actions workflow status
