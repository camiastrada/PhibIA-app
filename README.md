# PhibIA-app  🐸  

Aplicación para reconocer distintas especies de anfibios de la región(Río Cuarto - Córdoba) a través de audios.

## 📝 Funcionalidades Principales

- Reconocer especies de anfibios por audio
- Registrar ubicación de anfibios en nuevas grabaciones 
- Guardar una biblioteca personal de anfibios encontrados

## 🔊 Enlaces de interés
- [Link a Miró del proyecto](https://miro.com/app/board/uXjVJP2cDz8=/)
- [Link a Figma del proyecto](https://www.figma.com/design/qQEoRQuefrvVby2dB6fPVy/Phibia-views?node-id=0-1&t=4Uc8m4m6WApkZdQH-0)

## 👥 Integrantes

   1. Camila Astrada - [@camiastrada](https://github.com/camiastrada)
   2. Trinidad Aguirre - [@TrinidadSA](https://github.com/TrinidadSA)
   3. Agostina Rodriguez - [@agosrodriguez2](https://github.com/agosrodriguez2)
   4. Sebastián Cepeda Cáceres - [@sebastiancepedacaceres](https://github.com/sebastiancepedacaceres)
   5. Lucas Martín Lillo - [@lucaslillo03](https://github.com/lucaslillo03)


## PhibIA app

Proyecto con Flask (backend), React (frontend) y MySQL, dockerizado para facilitar la instalación y despliegue.

Para levantar la aplicación con Docker:

-Para construir imágenes y levantar los servicios:
   
   ```docker compose up --build```


   - **db**: levanta MySQL con la base de datos inicial `anfibios`.  
   - **backend**: levanta Flask en [http://localhost:5000](http://localhost:5000).  
   - **frontend**: levanta React (Nginx) en [http://localhost:3000](http://localhost:3000).


-Una vez construido, solo para iniciar:

   ```sudo docker compose up```


