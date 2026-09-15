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

# Comando por defecto: ejecutar el script de arranque
CMD ["python", "run.py"]