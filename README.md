# 배포 가이드

## 목차

1. [사전 준비](#사전-준비)
2. [로컬 환경 설정](#로컬-환경-설정)
3. [EC2 설정](#ec2-설정)
4. [GitHub Actions 설정](#github-actions-설정)
5. [배포 실행](#배포-실행)
6. [모니터링 및 관리](#모니터링-및-관리)

## 사전 준비

### 1. 필요한 계정 및 리소스

- [x] GitHub 계정
- [x] Docker Hub 계정 (https://hub.docker.com/)
- [x] AWS 계정 및 EC2 인스턴스

### 2. 로컬 환경 요구사항

- Docker Desktop
- Git
- SSH 클라이언트

## 로컬 환경 설정

### 1. Docker Desktop 설치 및 설정

```bash
# Docker Desktop 설치 확인
docker --version
docker-compose --version

# Docker Buildx 확인
docker buildx version
```

### 2. 프로젝트 클론

```bash
git clone https://github.com/your-username/ec2-deploy.git
cd ec2-deploy
```

### 3. 환경 변수 설정

```bash
# .env 파일 생성
cp .env.example .env

# Docker Hub 사용자명 입력
echo "DOCKER_USERNAME=your-dockerhub-username" >> .env
```

### 4. 로컬 테스트

```bash
# Docker Compose로 전체 스택 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 접속 테스트
# Frontend: http://localhost
# Backend: http://localhost:3000

# 종료
docker-compose down
```

## EC2 설정

### 1. EC2 인스턴스 생성

**AWS 콘솔에서:**

1. EC2 서비스 이동
2. "인스턴스 시작" 클릭
3. 설정:
   - AMI: Ubuntu 24.04 LTS
   - 인스턴스 유형: t2.micro (프리티어) 또는 t3.small
   - 키 페어: 새로 생성 또는 기존 키 선택 (중요: 안전하게 보관!)
   - 보안 그룹: 다음 포트 오픈
     - SSH (22): 내 IP
     - HTTP (80): 0.0.0.0/0
     - Custom TCP (3000): 0.0.0.0/0

### 2. EC2 인스턴스 접속

```bash
# SSH 키 권한 설정 (최초 1회)
chmod 400 your-key.pem

# EC2 접속
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### 3. EC2 초기 설정 자동화

```bash
# EC2 인스턴스 내에서 실행

# 설정 스크립트 다운로드
curl -o setup-ec2.sh https://raw.githubusercontent.com/your-username/ec2-deploy/main/scripts/setup-ec2.sh

# 실행 권한 부여
chmod +x setup-ec2.sh

# 스크립트 실행
./setup-ec2.sh
```

스크립트가 자동으로 수행하는 작업:

- 시스템 패키지 업데이트
- Docker 설치 및 시작
- Docker Compose 설치
- 프로젝트 디렉토리 생성
- docker-compose.yml 파일 생성

### 4. Docker 그룹 권한 적용

```bash
# 로그아웃
exit

# 다시 접속
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Docker 정상 작동 확인
docker ps
```

## GitHub Actions 설정

### 1. Docker Hub 액세스 토큰 생성

1. Docker Hub 로그인 (https://hub.docker.com/)
2. Settings → Personal access tokens
3. "New Access Token" 클릭
4. 토큰 이름 입력 (예: github-actions)
5. 생성된 토큰 복사 (재표시 안됨!)

### 2. GitHub Secrets 등록

**GitHub Repository → Settings → Secrets and variables → Actions → New repository secret**

| Secret Name       | 설명                      | 값 예시              |
| ----------------- | ------------------------- | -------------------- |
| `DOCKER_USERNAME` | Docker Hub 사용자명       | `myusername`         |
| `DOCKER_PASSWORD` | Docker Hub 액세스 토큰    | `dckr_pat_abc123...` |
| `EC2_HOST`        | EC2 퍼블릭 IP             | `13.125.123.45`      |
| `EC2_USERNAME`    | EC2 사용자명              | `ubuntu`             |
| `EC2_SSH_KEY`     | EC2 프라이빗 키 전체 내용 | 아래 참조            |

**EC2_SSH_KEY 값 가져오기:**

```bash
# Mac/Linux에서
cat your-key.pem

# 출력되는 전체 내용을 복사 (BEGIN부터 END까지)
-----BEGIN RSA PRIVATE KEY-----
...전체 내용...
-----END RSA PRIVATE KEY-----
```

### 3. GitHub Actions 워크플로우 확인

`.github/workflows/deploy.yml` 파일이 이미 생성되어 있습니다.

**워크플로우가 수행하는 작업:**

1. 코드 체크아웃
2. Docker Buildx 설정
3. Docker Hub 로그인
4. Backend 이미지 빌드 및 푸시
5. Frontend 이미지 빌드 및 푸시
6. EC2 SSH 접속
7. 최신 이미지 풀
8. 컨테이너 재시작

## 배포 실행

### 자동 배포 (권장)

```bash
# main 브랜치에 푸시
git add .
git commit -m "Deploy application"
git push origin main
```

**GitHub Actions 진행 상황 확인:**

- GitHub Repository → Actions 탭
- 워크플로우 실행 로그 실시간 확인

### 수동 배포

**1. 로컬에서 이미지 빌드**

```bash
# Docker Hub 로그인
docker login

# 빌드 실행
export DOCKER_USERNAME=your-dockerhub-username
./scripts/build-multiplatform.sh
```

**2. EC2에서 배포**

```bash
# EC2 접속
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# 프로젝트 디렉토리로 이동
cd ~/todo-app

# 최신 이미지 풀
docker-compose pull

# 기존 컨테이너 중지 및 제거
docker-compose down

# 새 컨테이너 시작
docker-compose up -d
```

## 모니터링 및 관리

### 애플리케이션 상태 확인

```bash
# 컨테이너 상태 확인
docker-compose ps

# 헬스체크 상태 확인
docker ps
```

### 로그 확인

```bash
# 전체 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f backend
docker-compose logs -f frontend

# 최근 100줄만 보기
docker-compose logs --tail=100 backend
```

### 리소스 사용량 확인

```bash
# 컨테이너 리소스 사용량
docker stats

# 디스크 사용량
df -h
docker system df
```

### 컨테이너 재시작

```bash
# 특정 서비스만 재시작
docker-compose restart backend
docker-compose restart frontend

# 전체 재시작
docker-compose restart
```

### 이미지 및 컨테이너 정리

```bash
# 사용하지 않는 이미지 삭제
docker image prune -a

# 중지된 컨테이너 삭제
docker container prune

# 전체 정리 (주의!)
docker system prune -a --volumes
```

## 트러블슈팅

### 문제 1: GitHub Actions에서 EC2 SSH 연결 실패

**원인:** SSH 키 형식 오류 또는 보안 그룹 설정

**해결:**

1. EC2_SSH_KEY 시크릿에 키 전체 내용 포함 확인
2. EC2 보안 그룹에서 GitHub Actions IP 허용 (또는 0.0.0.0/0)

### 문제 2: 컨테이너가 시작되지 않음

**원인:** 포트 충돌 또는 이미지 문제

**해결:**

```bash
# 포트 사용 확인
sudo lsof -i :80
sudo lsof -i :3000

# 충돌하는 프로세스 종료
sudo kill -9 PID

# 이미지 재다운로드
docker-compose pull
docker-compose up -d
```

### 문제 3: 데이터가 컨테이너 재시작 시 사라짐

**원인:** H2 인메모리 데이터베이스 사용

**해결:** README.md의 "프로덕션 개선 사항" 참조하여 MySQL/PostgreSQL 연동

## 추가 보안 설정

### 1. HTTPS 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt install -y certbot python3-certbot-nginx

# 인증서 발급
sudo certbot --nginx -d yourdomain.com

# 자동 갱신 설정
sudo certbot renew --dry-run
```

### 2. 방화벽 설정

```bash
# ufw 방화벽 설정
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# 상태 확인
sudo ufw status
```

### 3. 환경 변수 보안

```bash
# .env 파일 권한 제한
chmod 600 ~/todo-app/.env
```

## 백업 및 복구

### 데이터베이스 백업 (MySQL 사용 시)

```bash
# 백업
docker-compose exec backend sh -c 'mysqldump -u$DB_USER -p$DB_PASSWORD tododb > /backup/tododb.sql'

# 복구
docker-compose exec backend sh -c 'mysql -u$DB_USER -p$DB_PASSWORD tododb < /backup/tododb.sql'
```

## 참고 자료

- [Docker 공식 문서](https://docs.docker.com/)
- [Docker Buildx](https://docs.docker.com/build/building/multi-platform/)
- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [AWS EC2 문서](https://docs.aws.amazon.com/ec2/)
- [Spring Boot 문서](https://spring.io/projects/spring-boot)
- [React 19 문서](https://react.dev/)
