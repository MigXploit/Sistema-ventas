-- ============================================================
-- Yasumi - Base de datos PostgreSQL
-- Convertido desde MariaDB 10.4.32
-- ============================================================

BEGIN;

-- --------------------------------------------------------
-- sucursal (sin dependencias)
-- --------------------------------------------------------
CREATE TABLE sucursal (
    id_sucursal SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    direccion   VARCHAR(255),
    ciudad      VARCHAR(100),
    referencia  VARCHAR(255),
    latitud     NUMERIC(10,8),
    longitud    NUMERIC(11,8),
    activo      BOOLEAN DEFAULT TRUE
);

INSERT INTO sucursal (id_sucursal, nombre, direccion, ciudad, referencia, latitud, longitud, activo) VALUES
(1, 'Sucursal Central',    'Av. Arce #2132',                'La Paz', 'Frente a la plaza principal',                          -16.50560000, -68.12870000, TRUE),
(2, 'Sucursal Sopocachi',  'Calle Belisario Salinas #450',  'La Paz', 'A una cuadra de la estación del teleférico',           -16.51120000, -68.12450000, TRUE);

SELECT setval('sucursal_id_sucursal_seq', (SELECT MAX(id_sucursal) FROM sucursal));

-- --------------------------------------------------------
-- persona (sin dependencias)
-- Nota: idPersona → id_persona (snake_case consistente)
-- --------------------------------------------------------
CREATE TABLE persona (
    id_persona INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre     VARCHAR(100) NOT NULL,
    paterno    VARCHAR(100),
    materno    VARCHAR(100),
    email      VARCHAR(150) UNIQUE
);

INSERT INTO persona (id_persona, nombre, paterno, materno, email) OVERRIDING SYSTEM VALUE VALUES
(1, 'Carlos', 'Mendoza', 'Arce',       'carlos.m@example.com'),
(2, 'Ana',    'Gomez',   'Lopez',      'ana.g@example.com'),
(3, 'Juan',   'Perez',   'Silva',      'juan.perez@example.com'),
(4, 'Maria',  'Rodriguez','Chavez',    'maria.rod@example.com');

SELECT setval(pg_get_serial_sequence('persona', 'id_persona'), (SELECT MAX(id_persona) FROM persona));

-- --------------------------------------------------------
-- categoria (sin dependencias)
-- --------------------------------------------------------
CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL,
    descripcion  TEXT,
    imagen_url   VARCHAR(255),
    activo       BOOLEAN DEFAULT TRUE
);

INSERT INTO categoria (id_categoria, nombre, descripcion, imagen_url, activo) VALUES
(1, 'Tortas Personalizadas', 'Tortas artesanales para todo tipo de evento con diseño a elección', 'https://images.example.com/categorias/tortas.jpg',    TRUE),
(2, 'Bocaditos Finos',       'Bocaditos dulces y salados por porciones para eventos',             'https://images.example.com/categorias/bocaditos.jpg', TRUE);

SELECT setval('categoria_id_categoria_seq', (SELECT MAX(id_categoria) FROM categoria));

-- --------------------------------------------------------
-- componente (sin dependencias)
-- --------------------------------------------------------
CREATE TABLE componente (
    id_componente   SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    descripcion     TEXT,
    activo          BOOLEAN DEFAULT TRUE,
    stock           NUMERIC(10,2),
    tipo_componente VARCHAR(50),
    unidad_medida   VARCHAR(20),
    precio_unitario NUMERIC(10,2)
);

INSERT INTO componente (id_componente, nombre, descripcion, activo, stock, tipo_componente, unidad_medida, precio_unitario) VALUES
(1, 'Masa de Vainilla',       'Base de bizcochuelo sabor vainilla tradicional',          TRUE, 150.00, 'Base',      'Unidad', 15.00),
(2, 'Relleno Dulce de Leche', 'Relleno premium de dulce de leche artesanal',             TRUE,  45.50, 'Relleno',   'Kg',     25.00),
(3, 'Cobertura de Fondant',   'Masa elástica para decoración externa y figuras',         TRUE,  20.00, 'Cobertura', 'Kg',     35.00);

SELECT setval('componente_id_componente_seq', (SELECT MAX(id_componente) FROM componente));

-- --------------------------------------------------------
-- fecha_especial (sin dependencias)
-- --------------------------------------------------------
CREATE TABLE fecha_especial (
    id_fecha         SERIAL PRIMARY KEY,
    nombre           VARCHAR(100) NOT NULL,
    descripcion      TEXT,
    fecha_aproximada DATE,
    es_anual         BOOLEAN DEFAULT FALSE,
    color_referencia VARCHAR(20)
);

INSERT INTO fecha_especial (id_fecha, nombre, descripcion, fecha_aproximada, es_anual, color_referencia) VALUES
(1, 'Día de la Madre', 'Campañas especiales orientadas al agasajo materno', '2026-05-27', TRUE, '#FFC0CB'),
(2, 'Navidad',         'Temporada festiva de fin de año',                   '2026-12-25', TRUE, '#FF0000');

SELECT setval('fecha_especial_id_fecha_seq', (SELECT MAX(id_fecha) FROM fecha_especial));

-- --------------------------------------------------------
-- cliente (FK → persona)
-- --------------------------------------------------------
CREATE TABLE cliente (
    id_cliente       INTEGER PRIMARY KEY REFERENCES persona(id_persona) ON DELETE CASCADE,
    telefono         VARCHAR(20),
    direccion        VARCHAR(255),
    fecha_nacimiento DATE,
    fecha_registro   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo           BOOLEAN DEFAULT TRUE
);

INSERT INTO cliente (id_cliente, telefono, direccion, fecha_nacimiento, fecha_registro, activo) VALUES
(3, '71234567', 'Av. 20 de Octubre #1500',   '1995-08-14', '2026-06-09 23:27:57', TRUE),
(4, '76543210', 'Calle Claudio Aliaga #12',  '1992-03-22', '2026-06-09 23:27:57', TRUE);

-- --------------------------------------------------------
-- usuario (FK → persona, sucursal)
-- Nota: hashes cambiados de $2y$ a $2b$ (equivalentes, compatibles con bcryptjs)
-- --------------------------------------------------------
CREATE TABLE usuario (
    id_usuario     INTEGER PRIMARY KEY REFERENCES persona(id_persona) ON DELETE CASCADE,
    id_sucursal    INTEGER NOT NULL REFERENCES sucursal(id_sucursal),
    password       VARCHAR(255) NOT NULL,
    rol            VARCHAR(50),
    activo         BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso  TIMESTAMP
);

INSERT INTO usuario (id_usuario, id_sucursal, password, rol, activo, fecha_creacion, ultimo_acceso) VALUES
(1, 1, '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador',       TRUE, '2026-06-09 23:27:57', '2026-06-10 00:11:20'),
(2, 2, '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Atención al Cliente', TRUE, '2026-06-09 23:27:57', '2026-06-09 19:30:00');

-- --------------------------------------------------------
-- contacto (FK → sucursal)
-- --------------------------------------------------------
CREATE TABLE contacto (
    id_contacto SERIAL PRIMARY KEY,
    id_sucursal INTEGER NOT NULL REFERENCES sucursal(id_sucursal) ON DELETE CASCADE,
    tipo        VARCHAR(50),
    valor       VARCHAR(150),
    descripcion TEXT,
    principal   BOOLEAN DEFAULT FALSE,
    activo      BOOLEAN DEFAULT TRUE
);

INSERT INTO contacto (id_contacto, id_sucursal, tipo, valor, descripcion, principal, activo) VALUES
(1, 1, 'Teléfono Fijo',      '22446688', 'Línea directa de la central',              TRUE,  TRUE),
(2, 1, 'WhatsApp Business',  '70011223', 'Canal de atención rápida y catálogos',     FALSE, TRUE);

SELECT setval('contacto_id_contacto_seq', (SELECT MAX(id_contacto) FROM contacto));

-- --------------------------------------------------------
-- horario (FK → sucursal)
-- --------------------------------------------------------
CREATE TABLE horario (
    id_horario    SERIAL PRIMARY KEY,
    id_sucursal   INTEGER NOT NULL REFERENCES sucursal(id_sucursal) ON DELETE CASCADE,
    dia_semana    VARCHAR(20),
    hora_apertura TIME,
    hora_cierre   TIME,
    activo        BOOLEAN DEFAULT TRUE
);

INSERT INTO horario (id_horario, id_sucursal, dia_semana, hora_apertura, hora_cierre, activo) VALUES
(1, 1, 'Lunes a Viernes', '08:00:00', '20:00:00', TRUE),
(2, 1, 'Sábados',         '09:00:00', '16:00:00', TRUE);

SELECT setval('horario_id_horario_seq', (SELECT MAX(id_horario) FROM horario));

-- --------------------------------------------------------
-- producto (FK → categoria)
-- --------------------------------------------------------
CREATE TABLE producto (
    id_producto      SERIAL PRIMARY KEY,
    id_categoria     INTEGER NOT NULL REFERENCES categoria(id_categoria),
    nombre           VARCHAR(150) NOT NULL,
    descripcion      TEXT,
    fecha_creacion   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo             VARCHAR(50),
    imagen_url       VARCHAR(255),
    activo           BOOLEAN DEFAULT TRUE,
    precio           NUMERIC(10,2) NOT NULL,
    stock_disponible INTEGER,
    stock_minimo     INTEGER
);

INSERT INTO producto (id_producto, id_categoria, nombre, descripcion, fecha_creacion, tipo, imagen_url, activo, precio, stock_disponible, stock_minimo) VALUES
(1, 1, 'Torta Temática Tres Pisos',  'Torta personalizada ideal para matrimonios o quinceaños',       '2026-06-09 23:27:57', 'Personalizado', '/productos/tortas_personalizadas/torta_boda.webp',    TRUE, 450.00,  5, 1),
(2, 2, 'Pack 50 Bocaditos Dulces',   'Surtido variado de trufas, tartaletas de fruta y mini brownies','2026-06-09 23:27:57', 'Estándar',      '/productos/bocaditos_finos/pack_bocaditos.webp',      TRUE, 120.00, 40, 5);

SELECT setval('producto_id_producto_seq', (SELECT MAX(id_producto) FROM producto));

-- --------------------------------------------------------
-- reserva (FK → cliente, usuario)
-- --------------------------------------------------------
CREATE TABLE reserva (
    id_reserva     SERIAL PRIMARY KEY,
    id_cliente     INTEGER NOT NULL REFERENCES cliente(id_cliente),
    id_usuario     INTEGER NOT NULL REFERENCES usuario(id_usuario),
    fecha_reserva  DATE,
    fecha_entrega  DATE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones  TEXT,
    anticipo       NUMERIC(10,2),
    total          NUMERIC(10,2),
    hora_entrega   TIME,
    tipo_entrega   VARCHAR(50),
    estado         VARCHAR(50)
);

INSERT INTO reserva (id_reserva, id_cliente, id_usuario, fecha_reserva, fecha_entrega, fecha_creacion, observaciones, anticipo, total, hora_entrega, tipo_entrega, estado) VALUES
(1, 3, 2, '2026-06-09', '2026-06-15', '2026-06-09 23:27:57', 'Diseño elegante con flores blancas. Entregar por la tarde.', 150.00, 450.00, '16:00:00', 'Delivery', 'Confirmado'),
(2, 4, 2, '2026-06-09', '2026-06-11', '2026-06-09 23:27:57', 'Sin empaque plástico, usar cajas ecológicas.',               120.00, 120.00, '10:30:00', 'Recojo',   'Pendiente');

SELECT setval('reserva_id_reserva_seq', (SELECT MAX(id_reserva) FROM reserva));

-- --------------------------------------------------------
-- delivery (FK → reserva)
-- --------------------------------------------------------
CREATE TABLE delivery (
    id_delivery        SERIAL PRIMARY KEY,
    id_reserva         INTEGER NOT NULL UNIQUE REFERENCES reserva(id_reserva) ON DELETE CASCADE,
    direccion_destino  VARCHAR(255),
    zona               VARCHAR(100),
    referencia         TEXT,
    costo_envio        NUMERIC(10,2),
    estado_delivery    VARCHAR(50),
    fecha_entrega_real TIMESTAMP
);

INSERT INTO delivery (id_delivery, id_reserva, direccion_destino, zona, referencia, costo_envio, estado_delivery, fecha_entrega_real) VALUES
(1, 1, 'Av. Sánchez Lima #2210', 'Sopocachi', 'Edificio Torres Blancas, Departamento 5B', 15.00, 'Programado', NULL);

SELECT setval('delivery_id_delivery_seq', (SELECT MAX(id_delivery) FROM delivery));

-- --------------------------------------------------------
-- detalle_reserva (FK → reserva, producto)
-- --------------------------------------------------------
CREATE TABLE detalle_reserva (
    id_reserva      INTEGER NOT NULL REFERENCES reserva(id_reserva) ON DELETE CASCADE,
    id_producto     INTEGER NOT NULL REFERENCES producto(id_producto),
    cantidad        INTEGER NOT NULL,
    personalizacion TEXT,
    precio_unitario NUMERIC(10,2) NOT NULL,
    PRIMARY KEY (id_reserva, id_producto)
);

INSERT INTO detalle_reserva (id_reserva, id_producto, cantidad, personalizacion, precio_unitario) VALUES
(1, 1, 1, 'Sabor vainilla, relleno de dulce de leche, cobertura fondant blanca', 450.00),
(2, 2, 1, 'Predominancia de tartaletas de fruta',                                120.00);

-- --------------------------------------------------------
-- log_acceso (FK → usuario)
-- --------------------------------------------------------
CREATE TABLE log_acceso (
    id_log     SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    evento     VARCHAR(100),
    browser    VARCHAR(255),
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO log_acceso (id_log, id_usuario, ip_address, evento, browser, fecha_hora) VALUES
(1, 1, '192.168.1.15', 'Login Exitoso', 'Chrome v125 / Windows 11', '2026-06-09 18:00:05'),
(2, 1, '127.0.0.1',    'INGRESO',       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2026-06-10 00:11:20');

SELECT setval('log_acceso_id_log_seq', (SELECT MAX(id_log) FROM log_acceso));

-- --------------------------------------------------------
-- pago (FK → reserva)
-- --------------------------------------------------------
CREATE TABLE pago (
    id_pago     SERIAL PRIMARY KEY,
    id_reserva  INTEGER NOT NULL REFERENCES reserva(id_reserva) ON DELETE CASCADE,
    monto       NUMERIC(10,2) NOT NULL,
    metodo_pago VARCHAR(50),
    estado_pago VARCHAR(50),
    comprobante VARCHAR(255),
    fecha_pago  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observacion TEXT
);

INSERT INTO pago (id_pago, id_reserva, monto, metodo_pago, estado_pago, comprobante, fecha_pago, observacion) VALUES
(1, 1, 150.00, 'Transferencia Bancaria', 'Verificado', 'TRANS-998241', '2026-06-09 23:27:57', 'Adelanto del 30% acordado para iniciar producción.'),
(2, 2, 120.00, 'Código QR',             'Verificado', 'QR-554210',    '2026-06-09 23:27:57', 'Pago total del pack de bocaditos.');

SELECT setval('pago_id_pago_seq', (SELECT MAX(id_pago) FROM pago));

-- --------------------------------------------------------
-- producto_componente (FK → producto, componente)
-- --------------------------------------------------------
CREATE TABLE producto_componente (
    id_producto   INTEGER NOT NULL REFERENCES producto(id_producto) ON DELETE CASCADE,
    id_componente INTEGER NOT NULL REFERENCES componente(id_componente) ON DELETE CASCADE,
    cantidad      NUMERIC(10,2) NOT NULL,
    observacion   TEXT,
    PRIMARY KEY (id_producto, id_componente)
);

INSERT INTO producto_componente (id_producto, id_componente, cantidad, observacion) VALUES
(1, 1, 3.00, 'Requiere 3 unidades de masa base para los tres pisos'),
(1, 2, 2.50, '2.5 kg distribuidos en las capas internas');

-- --------------------------------------------------------
-- producto_fecha (FK → producto, fecha_especial)
-- --------------------------------------------------------
CREATE TABLE producto_fecha (
    id_producto     INTEGER NOT NULL REFERENCES producto(id_producto) ON DELETE CASCADE,
    id_fecha        INTEGER NOT NULL REFERENCES fecha_especial(id_fecha) ON DELETE CASCADE,
    precio_especial NUMERIC(10,2),
    destacado       BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (id_producto, id_fecha)
);

INSERT INTO producto_fecha (id_producto, id_fecha, precio_especial, destacado) VALUES
(1, 1, 420.00, TRUE);

COMMIT;
