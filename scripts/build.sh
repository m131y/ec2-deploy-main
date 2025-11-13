#!/bin/bash

set -e

# Docker Hub 사용자명 확인
if [ -z "$DOCKER_USERNAME" ]; then
    echo "DOCKER_USERNAME을 입력하세요:"
    read DOCKER_USERNAME
fi

# Docker Buildx 설정
if ! docker buildx ls | grep -q multiplatform; then
    docker buildx create --name multiplatform --use
else
    docker buildx use multiplatform
fi

docker buildx inspect --bootstrap

# Backend 이미지 빌드
docker buildx build \
    --platform linux/amd64,linux/arm64 \
    --tag ${DOCKER_USERNAME}/todo-backend:latest \
    --push \
    ./backend

# Frontend 이미지 빌드
docker buildx build \
    --platform linux/amd64,linux/arm64 \
    --tag ${DOCKER_USERNAME}/todo-frontend:latest \
    --push \
    ./frontend

echo "빌드 완료"
