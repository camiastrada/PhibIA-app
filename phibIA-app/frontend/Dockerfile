# Etapa de construcción
# =========================
FROM node:20 AS build
WORKDIR /app

# 1️⃣ Copiar archivos de dependencias
COPY package*.json ./

# 2️⃣ Asegurarse de instalación limpia
RUN npm ci

# 3️⃣ Copiar el resto del código fuente
COPY . .

# 4️⃣ (Opcional pero útil) Asegurarse de que esbuild esté limpio
RUN npm rebuild esbuild

# 5️⃣ Compilar la app
RUN npm run build

# Etapa de producción
# =========================
FROM nginx:alpine

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados al servidor
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
