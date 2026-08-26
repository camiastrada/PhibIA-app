
INSERT INTO especies (nombre_cientifico, nombre_comun, descripcion, imagen)
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
('Physalaemus biligonigerus', 'Ranita llorona', 'Descripción Ranita llorona', 'photo/PhysalaemusBiligonigerus.png')
ON CONFLICT (nombre_cientifico) DO NOTHING;

-- Ubicación por defecto
INSERT INTO ubicaciones (ubicacion_id, descripcion)
VALUES (1, 'Desconocida')
ON CONFLICT (ubicacion_id) DO NOTHING;

-- Usuario por defecto
INSERT INTO usuarios (name, email, password, register_date)
VALUES ('Invitado', 'invitado@sistema.local', 'no-password', CURRENT_DATE)
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO usuarios (name, email, password, register_date, rol)
VALUES (
    'Admin',
    'admin@phibia.com',
    '$2b$12$c7/Kv4HCg5a8bKrFuGDT4.qpZjFkg.9hZr/cPtZjMOptax7Y7e5Bu',
    CURRENT_DATE,
    'admin'
)
ON CONFLICT (email) DO UPDATE SET rol = 'admin';



INSERT INTO ubicaciones (ubicacion_id, descripcion, latitud, longitud)
VALUES (1, 'Desconocida', 0.0, 0.0)
ON CONFLICT (ubicacion_id) DO NOTHING;


-- Un usuario común de prueba
INSERT INTO usuarios (name, email, password, register_date, rol)
VALUES ('Test User', 'test@test.com', '$2b$12$c7/Kv4HCg5a8bKrFuGDT4.qpZjFkg.9hZr/cPtZjMOptax7Y7e5Bu', CURRENT_DATE, 'usuario');

-- Un audio de prueba asociado a ese usuario (usá el especie_id y ubicacion_id que ya existan, por ejemplo 1)
INSERT INTO audios (ruta, fecha_grabacion, especie_id, usuario_id, ubicacion_id)
VALUES (
    'test.wav',
    now(),
    1,
    (SELECT usuario_id FROM usuarios WHERE email = 'test@test.com'),
    1
);

-- Un audio de prueba asociado a ese usuario (usá el especie_id y ubicacion_id que ya existan, por ejemplo 1)
INSERT INTO audios (ruta, fecha_grabacion, especie_id, usuario_id, ubicacion_id)
VALUES (
    'test1.wav',
    now(),
    1,
    (SELECT usuario_id FROM usuarios WHERE email = 'admin@phibia.com'),
    1
);
