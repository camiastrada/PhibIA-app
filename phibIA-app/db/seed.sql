USE anfibios;

INSERT INTO especies (nombre_cientifico, nombre_comun, descripcion, imagen)
VALUES
('Rhinella arenarum', NULL, NULL, 'photo/RhinellaArenarum.png'),
('Odontophrynus asper', NULL, NULL, 'photo/OdontophrynusAsper.png'),
('Boana pulchella', NULL, NULL, 'photo/BoanaPulchella.png'),
('Ceratophrys cranwelli', NULL, NULL, 'photo/CeratophrysCranwelli.png'),
('Leptodactylus gracilis', NULL, NULL, 'photo/LeptodactylusGracilis.png'),
('Leptodactylus latinasus', NULL, NULL, 'photo/LeptodactylusLatinasus.png'),
('Leptodactylus luctator', NULL, NULL, 'photo/LeptodactylusLuctator.png'),
('Leptodactylus mystacinus', NULL, NULL, 'photo/LeptodactylusMystacinus.png'),
('Pleurodema tucumanum', NULL, NULL, 'photo/PleurodemaTucumanum.png'),
('Scinax nasicus', NULL, NULL, 'photo/ScinaxNasicus.png'),
('Physalaemus biligonigerus', NULL, NULL, 'photo/PhysalaemusBiligonigerus.png')
ON DUPLICATE KEY UPDATE imagen=VALUES(imagen);

/*Ubicación por defecto*/
INSERT IGNORE INTO ubicaciones (ubicacion_id, descripcion)
VALUES (1, 'Desconocida');

/*Usuario por defecto*/
INSERT INTO usuarios (name, email, password, register_date) 
VALUES ('Invitado', 'invitado@sistema.local', 'no-password', CURRENT_DATE)
ON DUPLICATE KEY UPDATE name = name;