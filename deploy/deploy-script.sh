#!/bin/bash
set -e

# === Prompt Inputs with Defaults ===
read -p "Enter remote SSH username [default: admin]: " REMOTE_USER
REMOTE_USER=${REMOTE_USER:-admin}

read -p "Enter remote host IP [default: 192.168.0.104]: " REMOTE_HOST
REMOTE_HOST=${REMOTE_HOST:-192.168.0.104}

read -p "Enter registry port [default: 5000]: " REGISTRY_PORT
REGISTRY_PORT=${REGISTRY_PORT:-5000}

read -p "Enter remote base directory [default: E:/Dev/docker/taanira-deploy]: " REMOTE_BASE_DIR
REMOTE_BASE_DIR=${REMOTE_BASE_DIR:-E:/Dev/docker/taanira-deploy}

read -p "Enter API image name [default: taanira-api]: " API_IMAGE_NAME
API_IMAGE_NAME=${API_IMAGE_NAME:-taanira-api}

read -p "Enter API image version [default: latest]: " API_IMAGE_VERSION
API_IMAGE_VERSION=${API_IMAGE_VERSION:-latest}

read -p "Enter API build context path [default: ../jewelleryApi]: " API_BUILD_PATH
API_BUILD_PATH=${API_BUILD_PATH:-../jewelleryApi}

read -p "Enter UI image name [default: taanira-ui]: " UI_IMAGE_NAME
UI_IMAGE_NAME=${UI_IMAGE_NAME:-taanira-ui}

read -p "Enter UI image version (leave blank to auto-read from package.json): " UI_IMAGE_VERSION
read -p "Enter UI build context path [default: ../jewelleryUi]: " UI_BUILD_PATH
UI_BUILD_PATH=${UI_BUILD_PATH:-../jewelleryui}

# === Read UI version from package.json if not provided ===
if [[ -z "$UI_IMAGE_VERSION" ]]; then
  UI_IMAGE_VERSION=$(grep '"version"' ../ui/package.json | head -1 | sed -E 's/.*"version": *"([^"]+)".*/\1/')
  if [[ -z "$UI_IMAGE_VERSION" ]]; then
    echo "[ERROR] Could not extract UI version from package.json"
    exit 1
  fi
fi

# === SCRIPT DIR & SOCKET ===
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONTROL_SOCKET="/tmp/ssh_mux_${REMOTE_HOST}"
ORIGINAL_COMPOSE="${SCRIPT_DIR}/deploy-docker-compose.yml"
TEMP_COMPOSE="${SCRIPT_DIR}/deploy-docker-compose.generated.yml"

# === Make temp copy from original ===
cp "$ORIGINAL_COMPOSE" "$TEMP_COMPOSE"

# === Replace image lines ===
sed -i "s|image: .*taanira-api.*|image: ${REMOTE_HOST}:${REGISTRY_PORT}/${API_IMAGE_NAME}:${API_IMAGE_VERSION}|g" "$TEMP_COMPOSE"
sed -i "s|image: .*taanira-ui.*|image: ${REMOTE_HOST}:${REGISTRY_PORT}/${UI_IMAGE_NAME}:${UI_IMAGE_VERSION}|g" "$TEMP_COMPOSE"

# === Start SSH connection ===
echo "[INFO] Connecting to ${REMOTE_USER}@${REMOTE_HOST}..."
ssh -o ControlMaster=yes -o ControlPath=${CONTROL_SOCKET} -o ControlPersist=5m ${REMOTE_USER}@${REMOTE_HOST} "echo Connected"

# === Ensure remote base directory exists ===
echo "[INFO] Ensuring remote base directory exists..."
ssh -o ControlPath=${CONTROL_SOCKET} ${REMOTE_USER}@${REMOTE_HOST} \
  "powershell -Command \"if (-Not (Test-Path '${REMOTE_BASE_DIR}')) { New-Item -ItemType Directory -Force -Path '${REMOTE_BASE_DIR}' }\""

# === Copy resources ===
echo "[INFO] Copying KeycloakTheme..."
scp -o ControlPath=${CONTROL_SOCKET} -r "${SCRIPT_DIR}/KeycloakTheme" ${REMOTE_USER}@${REMOTE_HOST}:"${REMOTE_BASE_DIR}/"

echo "[INFO] Copying realm-export.json..."
scp -o ControlPath=${CONTROL_SOCKET} "${SCRIPT_DIR}/realm-export.json" ${REMOTE_USER}@${REMOTE_HOST}:"${REMOTE_BASE_DIR}/"

echo "[INFO] Copying .env..."
scp -o ControlPath=${CONTROL_SOCKET} "${SCRIPT_DIR}/.env" ${REMOTE_USER}@${REMOTE_HOST}:"${REMOTE_BASE_DIR}/"

echo "[INFO] Copying modified docker-compose.yml..."
scp -o ControlPath=${CONTROL_SOCKET} "$TEMP_COMPOSE" ${REMOTE_USER}@${REMOTE_HOST}:"${REMOTE_BASE_DIR}/deploy-docker-compose.yml"

# === Close SSH session ===
ssh -O exit -o ControlPath=${CONTROL_SOCKET} ${REMOTE_USER}@${REMOTE_HOST}

# === Call image builder ===
echo "[INFO] Building and pushing Docker images..."
bash "${SCRIPT_DIR}/Deploy-DockerImages.sh" \
    "$REMOTE_HOST" "$REGISTRY_PORT" \
    "$API_IMAGE_NAME" "$API_IMAGE_VERSION" "$API_BUILD_PATH" \
    "$UI_IMAGE_NAME" "$UI_IMAGE_VERSION" "$UI_BUILD_PATH"

echo -e "\n✅ All done. Modified Compose + files sent to remote at: ${REMOTE_HOST}:${REMOTE_BASE_DIR}"

ssh ${REMOTE_USER}@${REMOTE_HOST} "
  cd '${REMOTE_BASE_DIR}' && \
  (docker compose pull || docker-compose pull) && \
  (docker compose up -d || docker-compose up -d)
"

