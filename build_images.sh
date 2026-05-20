#!/bin/bash
set -e

# Visual formatting helper
info() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}
error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}
success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

info "Checking Docker daemon connectivity..."
if ! docker info >/dev/null 2>&1; then
    error "Docker daemon is not responsive. Please ensure Docker Desktop is running!"
    exit 1
fi

info "Starting builds for separate service containers..."

# 1. Core API Build
info "Compiling Core Operational Backend [maintainer-core-api:latest]..."
docker build -t maintainer-core-api:latest ./Maint_backend

# 2. RAG API Build
info "Compiling RAG Diagnostic Query Backend [maintainer-rag-api:latest]..."
docker build -t maintainer-rag-api:latest ./RAG_backend

# 3. Web UI Portal Build
info "Compiling Nginx Production Web Client [maintainer-web-portal:latest]..."
docker build -t maintainer-web-portal:latest ./frontend

success "All service images built successfully!"
info "Current built Maintainer AI images:"
docker images | grep maintainer
