# ============================================
# Dockerfile para Backend - Render Deployment
# Optimizado para 512MB RAM (plan gratuito)
# ============================================

FROM python:3.11-slim AS base

# Variables de entorno
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Instalar dependencias del sistema mínimas
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar requirements primero (para cache de Docker layers)
COPY requirements.txt .

# Instalar PyTorch CPU-only PRIMERO (más ligero, ~200MB vs ~900MB GPU)
RUN pip install --no-cache-dir \
    torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir \
    torchvision --index-url https://download.pytorch.org/whl/cpu

# Instalar el resto de dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código del backend
COPY . .

# Crear directorio para uploads temporales y modelos con permisos correctos
RUN mkdir -p temp_uploads models .cache && \
    chmod -R 777 temp_uploads models .cache

# Configurar usuario no-root para Hugging Face (ID 1000)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/app

# Variables de entorno para caché en directorio escribible
ENV NUMBA_CACHE_DIR=/app/.cache
ENV MPLCONFIGDIR=/app/.cache

# Puerto (Hugging Face usa 7860 por defecto)
EXPOSE 7860

# Comando de inicio
CMD uvicorn main:app --host 0.0.0.0 --port 7860
