# PhibIA-app  🐸  

Aplicación para reconocer distintas especies de anfibios de la región(Río Cuarto - Córdoba) a través de audios.

## 📝 Funcionalidades Principales

- Reconocer especies de anfibios por audio
- Registrar ubicación de anfibios en nuevas grabaciones 
- Guardar una biblioteca personal de anfibios encontrados

## 🔊 Enlaces de interés
- [Link a Miró del proyecto](https://miro.com/app/board/uXjVJP2cDz8=/)

## 👥 Integrantes

   1. Camila Astrada - [@camiastrada](https://github.com/camiastrada)
   2. Trinidad Aguirre - [@TrinidadSA](https://github.com/TrinidadSA)
   3. Agostina Rodriguez - [@agosrodriguez2](https://github.com/agosrodriguez2)
   4. Sebastián Cepeda Cáceres - [@sebastiancepedacaceres](https://github.com/sebastiancepedacaceres)
   5. Lucas Martín Lillo - [@lucaslillo03](https://github.com/lucaslillo03)


## PhibIA app

Proyecto con Flask (backend), React (frontend) y MySQL, dockerizado para facilitar la instalación y despliegue.

## Configuración de variables de entorno

Antes de levantar la aplicación es **obligatorio** crear el archivo `.env` a partir del ejemplo:

```bash
cd phibIA-app
cp .env.example .env
```

Luego completar los valores reales en `.env` (especialmente `JWT_SECRET_KEY`, credenciales de Postgres, Cloudinary y Brevo). El archivo `.env` **no se sube a git** (ver `.gitignore`).

Para generar una clave JWT segura:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

> **Nota de seguridad:** la aplicación **no arranca** si `JWT_SECRET_KEY` no está definida.

## Levantar la aplicación

- Para construir imágenes y levantar los servicios:

   ```docker compose --env-file .env up --build```

- **db**: levanta la base de datos inicial `anfibios`.  
- **backend**: levanta Flask en [http://localhost:5000](http://localhost:5000).  
- **frontend**: levanta React (Nginx) en [http://localhost:3000](http://localhost:3000).

- Una vez construido, solo para iniciar:

   ```docker compose --env-file .env up```


