# Imagen base
FROM python:3.11-slim

# Carpeta de trabajo
WORKDIR /app

# Copiar dependencias
COPY requirements.txt .

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Instala FFmpeg y otras dependencias del sistema
RUN apt-get update && apt-get install -y ffmpeg && apt-get clean


# Copiar código
COPY . .

# Definir variable de entorno para Flask
ENV FLASK_APP=app.py

# Exponer el puerto
EXPOSE 5000

# Comando por defecto: ejecutar el script de arranque
CMD ["python", "run.py"]