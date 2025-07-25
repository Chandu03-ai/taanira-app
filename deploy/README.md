# Taanira Deployment Scripts

This repo contains scripts to automate deployment of the taanira project using Docker and SSH.

## Scripts Overview

### 1. `deploy-script.sh`
- Prompts for remote SSH details
- Copies required files to the remote server:
  - `KeycloakTheme/`, `.env`, `realm-export.json`, `docker-compose.yml`
- Runs `Deploy-DockerImages.sh` to build and push Docker images

### 2. `Deploy-DockerImages.sh`
- Starts local Docker registry (if not running)
- Builds and pushes API and UI Docker images by calling:
  - `Build-And-Push-ApiImage.sh`
  - `Build-And-Push-UiImage.sh`

### 3. `Build-And-Push-UiImage.sh`
- Prompts for image name and context path
- Builds the UI Docker image
- Pushes it to the local Docker registry

### 4. `Build-And-Push-ApiImage.sh`
- Prompts for image name and context path
- Builds the Api Docker image
- Pushes it to the local Docker registry

---

💡 Make sure Docker is running locally and ports are accessible.
