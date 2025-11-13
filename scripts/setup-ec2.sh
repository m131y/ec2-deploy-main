#!/bin/bash

set -e

# 시스템 업데이트
sudo apt update -y
sudo apt upgrade -y

# Docker 설치
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 프로젝트 디렉토리 생성
mkdir -p ~/todo-app
cd ~/todo-app

# docker-compose.prod.yml 생성
cat > docker-compose.prod.yml <<'EOF'
services:
  backend:
    image: ${DOCKER_USERNAME}/todo-backend:latest
    container_name: todo-backend
    ports:
      - "3000:3000"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
    networks:
      - todo-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    image: ${DOCKER_USERNAME}/todo-frontend:latest
    container_name: todo-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - todo-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

networks:
  todo-network:
    driver: bridge
EOF

# .env 파일 생성
echo "DOCKER_USERNAME을 입력하세요:"
read DOCKER_USERNAME
echo "DOCKER_USERNAME=$DOCKER_USERNAME" > .env

echo "설치 완료. 로그아웃 후 재접속하세요."
