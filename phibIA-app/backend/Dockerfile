# Imagen base
FROM python:3.11-slim

# Carpeta de trabajo
WORKDIR /app

# Copiar dependencias
COPY requirements.txt .

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

# Definir variable de entorno para Flask
ENV FLASK_APP=app.py

# Exponer el puerto
EXPOSE 5000

# Comando por defecto: ejecutar el script de arranque
CMD ["python", "run.py"]