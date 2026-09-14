-- Migración: almacenar audios en Cloudinary (como las imágenes)
-- A ejecutar una sola vez en bases existentes:
--   psql -U phibia_user -d anfibios -p 5433 -h localhost -f db/migrations/0001_audio_cloudinary.sql
--
-- En bases nuevas (volumen de Postgres sin inicializar) no es necesaria:
-- db/anfibios.sql ya incluye estos cambios en CREATE TABLE audios.

-- Ampliar ruta para que entre la URL de Cloudinary (más larga que la ruta local)
ALTER TABLE audios ALTER COLUMN ruta TYPE VARCHAR(255);

-- Columna para guardar el public_id de Cloudinary y poder borrar el audio de la nube
ALTER TABLE audios ADD COLUMN IF NOT EXISTS public_id VARCHAR(255);