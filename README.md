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

Proyecto con Flask (backend), React (frontend) y PostgreSQL, dockerizado para facilitar la instalación y despliegue.

## 🛠️ Tecnologías

**Backend**
- Python + Flask / Flask-SQLAlchemy
- PostgreSQL (vía psycopg2)
- Flask-JWT-Extended (autenticación), Flask-Bcrypt (hash de contraseñas)
- Flask-CORS, Flask-Limiter
- TensorFlow, scikit-learn, librosa, soundfile, numpy, scipy (reconocimiento de especies por audio)
- Cloudinary (almacenamiento de imágenes)
- Brevo SMTP (envío de emails, ej. recuperación de contraseña)
- pytest (testing)

**Frontend**
- React 18 + TypeScript
- Vite
- Tailwind CSS 4
- React Router
- Mapbox GL / react-map-gl (mapa de capturas)
- ESLint

**Infraestructura**
- Docker / Docker Compose
- Nginx (reverse proxy)

Para levantar la aplicación con Docker:

-Para construir imágenes y levantar los servicios:
   
   ```docker compose up --build```


   - **db**: levanta PostgreSQL con la base de datos inicial `anfibios`.  
   - **backend**: levanta Flask en [http://localhost:5000](http://localhost:5000).  
   - **frontend**: build de React servido por Nginx.
   - **nginx**: proxy en [http://localhost](http://localhost), expone la app y redirige `/api` al backend.


-Una vez construido, solo para iniciar:

   ```sudo docker compose up```


