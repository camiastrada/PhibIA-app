# Imagen base
FROM python:3.11-slim

# Carpeta de trabajo
WORKDIR /app

# Copiar dependencias
COPY requirements.txt .

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Instala FFmpeg y otras dependencias del sistema
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    libsndfile1 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


# Copiar código
COPY . .

# Definir variable de entorno para Flask
ENV FLASK_APP=app.py

# Correr como usuario sin privilegios (uid 1000, coincide con el usuario
# del host en desarrollo para que el volumen montado siga siendo escribible)
RUN useradd --uid 1000 --create-home appuser && \
    chown -R appuser:appuser /app
USER appuser

# Exponer el puerto
EXPOSE 5000

# Comando por defecto: gunicorn en vez del servidor de desarrollo de Flask.
# --preload corre la espera de la DB y db.create_all() una sola vez (en el
# proceso maestro) en lugar de una vez por worker.
# --timeout 120 porque /predict corre inferencia de ML; el timeout default
# de gunicorn (30s) mataría esas requests a mitad de camino.
CMD ["gunicorn", "--preload", "--bind", "0.0.0.0:5000", "--workers", "2", "--timeout", "120", "run:app"]