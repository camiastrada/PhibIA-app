create database if not exists anfibios;
use anfibios;

drop table if exists usuarios;
drop table if exists especies;
drop table if exists ubicaciones;
drop table if exists audios;

create table usuarios(
    usuario_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    register_date DATE NOT NULL DEFAULT CURRENT_DATE
);

create table especies(
    especie_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_cientifico VARCHAR(40) NOT NULL,
    nombre_comun VARCHAR(20) DEFAULT NULL,
    descripcion VARCHAR(250) DEFAULT NULL,
    imagen VARCHAR(100) DEFAULT NULL
    /*IMAGEN ?*/
);

create table usuarios_especies(
    usuario_id INT NOT NULL,
    especie_id INT NOT NULL,
    fecha_registro DATETIME NOT NULL,
    PRIMARY KEY (usuario_id, especie_id),
    CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id),
    CONSTRAINT fk_especie FOREIGN KEY (especie_id) REFERENCES especies(especie_id)
);

create table ubicaciones(
    ubicacion_id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL
);

create table audios(
    audio_id INT AUTO_INCREMENT PRIMARY KEY,
    ruta VARCHAR(100) NOT NULL,
    fecha_grabacion DATETIME NOT NULL,
    especie_id INT NOT NULL,
    usuario_id INT NOT NULL,
    ubicacion_id INT NOT NULL,
    CONSTRAINT fk_usuario_audio FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id),
    CONSTRAINT fk_especie_audio FOREIGN KEY (especie_id) REFERENCES especies(especie_id),
    CONSTRAINT fk_ubicacione_audio FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(ubicacion_id)
);
