USE anfibios;

INSERT IGNORE INTO especies (nombre_cientifico, nombre_comun, descripcion, imagen)
VALUES
('Rhinella arenarum', 'Sapo común', 'Descripción Sapo común', 'photo/RhinellaArenarum.png'),
('Odontophrynus asper', 'Escuercito', 'Descripción Escuercito', 'photo/OdontophrynusAsper.png'),
('Boana pulchella', 'Ranita trepadora, Ranita del zarzal', 'Descripción Ranita trepadora, Ranita del zarzal', 'photo/BoanaPulchella.png'),
('Ceratophrys cranwelli', 'Escuerzo', 'Descripción Escuerzo', 'photo/CeratophrysCranwelli.png'),
('Leptodactylus gracilis', 'Ranita rayada', 'Descripción Ranita rayada', 'photo/LeptodactylusGracilis.png'),
('Leptodactylus latinasus', 'Ranita piadora, Ranita de las cunetas', 'Descripción Ranita piadora, Ranita de las cunetas', 'photo/LeptodactylusLatinasus.png'),
('Leptodactylus luctator', 'Rana criolla', 'Descripción Rana criolla', 'photo/LeptodactylusLuctator.png'),
('Leptodactylus mystacinus', 'Ranita de bigotes', 'Descripción Ranita de bigotes', 'photo/LeptodactylusMystacinus.png'),
('Pleurodema tucumanum', 'Ranita de flancos manchados', 'Descripción Ranita de flancos manchados', 'photo/PleurodemaTucumanum.png'),
('Scinax nasicus', 'Ranita hocicuda manchada; Ranita hocicuda trepadora', 'Descripción Ranita hocicuda manchada; Ranita hocicuda trepadora', 'photo/ScinaxNasicus.png'),
('Physalaemus biligonigerus', 'Ranita llorona', 'Descripción Ranita llorona', 'photo/PhysalaemusBiligonigerus.png');

/*Ubicación por defecto*/
INSERT IGNORE INTO ubicaciones (ubicacion_id, descripcion)
VALUES (1, 'Desconocida');

/*Usuario por defecto*/
INSERT INTO usuarios (name, email, password, register_date) 
VALUES ('Invitado', 'invitado@sistema.local', 'no-password', CURRENT_DATE)
ON DUPLICATE KEY UPDATE name = name;    