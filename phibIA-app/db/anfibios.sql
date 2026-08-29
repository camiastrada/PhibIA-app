
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS audios;
DROP TABLE IF EXISTS imagenes;
DROP TABLE IF EXISTS ubicaciones;
DROP TABLE IF EXISTS usuarios_especies;
DROP TABLE IF EXISTS especies;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios(
    usuario_id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    register_date DATE NOT NULL DEFAULT CURRENT_DATE,
    avatar_id INTEGER DEFAULT 0,
    background_color VARCHAR(10) DEFAULT '#FFFFFF',
    rol VARCHAR(20) NOT NULL DEFAULT 'usuario'
);

CREATE TABLE especies(
    especie_id SERIAL PRIMARY KEY,
    nombre_cientifico VARCHAR(40) NOT NULL UNIQUE,
    nombre_comun VARCHAR(100) DEFAULT NULL,
    descripcion VARCHAR(2500) DEFAULT NULL,
    imagen VARCHAR(100) DEFAULT NULL,
    ruta_audio VARCHAR(255) DEFAULT NULL
);

CREATE TABLE usuarios_especies(
    usuario_id INT NOT NULL,
    especie_id INT NOT NULL,
    fecha_registro TIMESTAMP NOT NULL,
    PRIMARY KEY (usuario_id, especie_id),
    CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id),
    CONSTRAINT fk_especie FOREIGN KEY (especie_id) REFERENCES especies(especie_id)
);

CREATE TABLE ubicaciones(
    ubicacion_id SERIAL PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL,
    longitud FLOAT,
    latitud FLOAT
);

CREATE TABLE audios(
    audio_id SERIAL PRIMARY KEY,
    ruta VARCHAR(100) NOT NULL,
    fecha_grabacion TIMESTAMP NOT NULL,
    especie_id INT NOT NULL,
    usuario_id INT NOT NULL,
    ubicacion_id INT NOT NULL,
    CONSTRAINT fk_usuario_audio FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id),
    CONSTRAINT fk_especie_audio FOREIGN KEY (especie_id) REFERENCES especies(especie_id),
    CONSTRAINT fk_ubicacione_audio FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(ubicacion_id)
);

CREATE TABLE imagenes(
    imagen_id SERIAL PRIMARY KEY,
    ruta VARCHAR(255),
    public_id VARCHAR(255),
    fecha_subida TIMESTAMP NOT NULL,
    usuario_id INT NOT NULL,
    ubicacion_id INT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    fecha_revision TIMESTAMP,
    revisado_por INT,
    CONSTRAINT fk_usuario_imagen FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id),
    CONSTRAINT fk_ubicacione_imagen FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(ubicacion_id),
    CONSTRAINT fk_revisor_imagen FOREIGN KEY (revisado_por) REFERENCES usuarios(usuario_id)
);

CREATE TABLE password_reset_tokens(
    token_id SERIAL PRIMARY KEY,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    usuario_id INT NOT NULL,
    expira TIMESTAMP NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    creado TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_reset_token FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id)
);