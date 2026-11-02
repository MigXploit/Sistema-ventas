-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-06-2026 a las 06:44:33
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `bd_sistema_reserva`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`id_categoria`, `nombre`, `descripcion`, `imagen_url`, `activo`) VALUES
(1, 'Tortas Personalizadas', 'Tortas artesanales para todo tipo de evento con diseño a elección', 'https://images.example.com/categorias/tortas.jpg', 1),
(2, 'Bocaditos Finos', 'Bocaditos dulces y salados por porciones para eventos', 'https://images.example.com/categorias/bocaditos.jpg', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `id_cliente` int(11) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp(),
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`id_cliente`, `telefono`, `direccion`, `fecha_nacimiento`, `fecha_registro`, `activo`) VALUES
(3, '71234567', 'Av. 20 de Octubre #1500', '1995-08-14', '2026-06-09 23:27:57', 1),
(4, '76543210', 'Calle Claudio Aliaga #12', '1992-03-22', '2026-06-09 23:27:57', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `componente`
--

CREATE TABLE `componente` (
  `id_componente` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `stock` decimal(10,2) DEFAULT NULL,
  `tipo_componente` varchar(50) DEFAULT NULL,
  `unidad_medida` varchar(20) DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `componente`
--

INSERT INTO `componente` (`id_componente`, `nombre`, `descripcion`, `activo`, `stock`, `tipo_componente`, `unidad_medida`, `precio_unitario`) VALUES
(1, 'Masa de Vainilla', 'Base de bizcochuelo sabor vainilla tradicional', 1, 150.00, 'Base', 'Unidad', 15.00),
(2, 'Relleno Dulce de Leche', 'Relleno premium de dulce de leche artesanal', 1, 45.50, 'Relleno', 'Kg', 25.00),
(3, 'Cobertura de Fondant', 'Masa elástica para decoración externa y figuras', 1, 20.00, 'Cobertura', 'Kg', 35.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contacto`
--

CREATE TABLE `contacto` (
  `id_contacto` int(11) NOT NULL,
  `id_sucursal` int(11) NOT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `valor` varchar(150) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `principal` tinyint(1) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `contacto`
--

INSERT INTO `contacto` (`id_contacto`, `id_sucursal`, `tipo`, `valor`, `descripcion`, `principal`, `activo`) VALUES
(1, 1, 'Teléfono Fijo', '22446688', 'Línea directa de la central', 1, 1),
(2, 1, 'WhatsApp Business', '70011223', 'Canal de atención rápida y catálogos', 0, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `delivery`
--

CREATE TABLE `delivery` (
  `id_delivery` int(11) NOT NULL,
  `id_reserva` int(11) NOT NULL,
  `direccion_destino` varchar(255) DEFAULT NULL,
  `zona` varchar(100) DEFAULT NULL,
  `referencia` text DEFAULT NULL,
  `costo_envio` decimal(10,2) DEFAULT NULL,
  `estado_delivery` varchar(50) DEFAULT NULL,
  `fecha_entrega_real` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `delivery`
--

INSERT INTO `delivery` (`id_delivery`, `id_reserva`, `direccion_destino`, `zona`, `referencia`, `costo_envio`, `estado_delivery`, `fecha_entrega_real`) VALUES
(1, 1, 'Av. Sánchez Lima #2210', 'Sopocachi', 'Edificio Torres Blancas, Departamento 5B', 15.00, 'Programado', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_reserva`
--

CREATE TABLE `detalle_reserva` (
  `id_reserva` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `personalizacion` text DEFAULT NULL,
  `precio_unitario` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_reserva`
--

INSERT INTO `detalle_reserva` (`id_reserva`, `id_producto`, `cantidad`, `personalizacion`, `precio_unitario`) VALUES
(1, 1, 1, 'Sabor vainilla, relleno de dulce de leche, cobertura fondant blanca', 450.00),
(2, 2, 1, 'Predominancia de tartaletas de fruta', 120.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fecha_especial`
--

CREATE TABLE `fecha_especial` (
  `id_fecha` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_aproximada` date DEFAULT NULL,
  `es_anual` tinyint(1) DEFAULT 0,
  `color_referencia` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `fecha_especial`
--

INSERT INTO `fecha_especial` (`id_fecha`, `nombre`, `descripcion`, `fecha_aproximada`, `es_anual`, `color_referencia`) VALUES
(1, 'Día de la Madre', 'Campañas especiales orientadas al agasajo materno', '2026-05-27', 1, '#FFC0CB'),
(2, 'Navidad', 'Temporada festiva de fin de año', '2026-12-25', 1, '#FF0000');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horario`
--

CREATE TABLE `horario` (
  `id_horario` int(11) NOT NULL,
  `id_sucursal` int(11) NOT NULL,
  `dia_semana` varchar(20) DEFAULT NULL,
  `hora_apertura` time DEFAULT NULL,
  `hora_cierre` time DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `horario`
--

INSERT INTO `horario` (`id_horario`, `id_sucursal`, `dia_semana`, `hora_apertura`, `hora_cierre`, `activo`) VALUES
(1, 1, 'Lunes a Viernes', '08:00:00', '20:00:00', 1),
(2, 1, 'Sábados', '09:00:00', '16:00:00', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `log_acceso`
--

CREATE TABLE `log_acceso` (
  `id_log` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `evento` varchar(100) DEFAULT NULL,
  `browser` varchar(255) DEFAULT NULL,
  `fecha_hora` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `log_acceso`
--

INSERT INTO `log_acceso` (`id_log`, `id_usuario`, `ip_address`, `evento`, `browser`, `fecha_hora`) VALUES
(1, 1, '192.168.1.15', 'Login Exitoso', 'Chrome v125 / Windows 11', '2026-06-09 18:00:05'),
(2, 1, '127.0.0.1', 'INGRESO', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-06-10 00:11:20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago`
--

CREATE TABLE `pago` (
  `id_pago` int(11) NOT NULL,
  `id_reserva` int(11) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `metodo_pago` varchar(50) DEFAULT NULL,
  `estado_pago` varchar(50) DEFAULT NULL,
  `comprobante` varchar(255) DEFAULT NULL,
  `fecha_pago` datetime DEFAULT current_timestamp(),
  `observacion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pago`
--

INSERT INTO `pago` (`id_pago`, `id_reserva`, `monto`, `metodo_pago`, `estado_pago`, `comprobante`, `fecha_pago`, `observacion`) VALUES
(1, 1, 150.00, 'Transferencia Bancaria', 'Verificado', 'TRANS-998241', '2026-06-09 23:27:57', 'Adelanto del 30% acordado para iniciar producción.'),
(2, 2, 120.00, 'Código QR', 'Verificado', 'QR-554210', '2026-06-09 23:27:57', 'Pago total del pack de bocaditos.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `persona`
--

CREATE TABLE `persona` (
  `idPersona` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `paterno` varchar(100) DEFAULT NULL,
  `materno` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `persona`
--

INSERT INTO `persona` (`idPersona`, `nombre`, `paterno`, `materno`, `email`) VALUES
(1, 'Carlos', 'Mendoza', 'Arce', 'carlos.m@example.com'),
(2, 'Ana', 'Gomez', 'Lopez', 'ana.g@example.com'),
(3, 'Juan', 'Perez', 'Silva', 'juan.perez@example.com'),
(4, 'Maria', 'Rodriguez', 'Chavez', 'maria.rod@example.com');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `id_producto` int(11) NOT NULL,
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `tipo` varchar(50) DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `precio` decimal(10,2) NOT NULL,
  `stock_disponible` int(11) DEFAULT NULL,
  `stock_minimo` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`id_producto`, `id_categoria`, `nombre`, `descripcion`, `fecha_creacion`, `tipo`, `imagen_url`, `activo`, `precio`, `stock_disponible`, `stock_minimo`) VALUES
(1, 1, 'Torta Temática Tres Pisos', 'Torta personalizada ideal para matrimonios o quinceaños', '2026-06-09 23:27:57', 'Personalizado', '/productos/tortas_personalizadas/torta_boda.webp', 1, 450.00, 5, 1),
(2, 2, 'Pack 50 Bocaditos Dulces', 'Surtido variado de trufas, tartaletas de fruta y mini brownies', '2026-06-09 23:27:57', 'Estándar', '/productos/bocaditos_finos/pack_bocaditos.webp', 1, 120.00, 40, 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_componente`
--

CREATE TABLE `producto_componente` (
  `id_producto` int(11) NOT NULL,
  `id_componente` int(11) NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `observacion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto_componente`
--

INSERT INTO `producto_componente` (`id_producto`, `id_componente`, `cantidad`, `observacion`) VALUES
(1, 1, 3.00, 'Requiere 3 unidades de masa base para los tres pisos'),
(1, 2, 2.50, '2.5 kg distribuidos en las capas internas');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_fecha`
--

CREATE TABLE `producto_fecha` (
  `id_producto` int(11) NOT NULL,
  `id_fecha` int(11) NOT NULL,
  `precio_especial` decimal(10,2) DEFAULT NULL,
  `destacado` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto_fecha`
--

INSERT INTO `producto_fecha` (`id_producto`, `id_fecha`, `precio_especial`, `destacado`) VALUES
(1, 1, 420.00, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reserva`
--

CREATE TABLE `reserva` (
  `id_reserva` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha_reserva` date DEFAULT NULL,
  `fecha_entrega` date DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `observaciones` text DEFAULT NULL,
  `anticipo` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `hora_entrega` time DEFAULT NULL,
  `tipo_entrega` varchar(50) DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reserva`
--

INSERT INTO `reserva` (`id_reserva`, `id_cliente`, `id_usuario`, `fecha_reserva`, `fecha_entrega`, `fecha_creacion`, `observaciones`, `anticipo`, `total`, `hora_entrega`, `tipo_entrega`, `estado`) VALUES
(1, 3, 2, '2026-06-09', '2026-06-15', '2026-06-09 23:27:57', 'Diseño elegante con flores blancas. Entregar por la tarde.', 150.00, 450.00, '16:00:00', 'Delivery', 'Confirmado'),
(2, 4, 2, '2026-06-09', '2026-06-11', '2026-06-09 23:27:57', 'Sin empaque plástico, usar cajas ecológicas.', 120.00, 120.00, '10:30:00', 'Recojo', 'Pendiente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sucursal`
--

CREATE TABLE `sucursal` (
  `id_sucursal` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `referencia` varchar(255) DEFAULT NULL,
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sucursal`
--

INSERT INTO `sucursal` (`id_sucursal`, `nombre`, `direccion`, `ciudad`, `referencia`, `latitud`, `longitud`, `activo`) VALUES
(1, 'Sucursal Central', 'Av. Arce #2132', 'La Paz', 'Frente a la plaza principal', -16.50560000, -68.12870000, 1),
(2, 'Sucursal Sopocachi', 'Calle Belisario Salinas #450', 'La Paz', 'A una cuadra de la estación del teleférico', -16.51120000, -68.12450000, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `id_sucursal` int(11) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` varchar(50) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `ultimo_acceso` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `id_sucursal`, `password`, `rol`, `activo`, `fecha_creacion`, `ultimo_acceso`) VALUES
(1, 1, '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 1, '2026-06-09 23:27:57', '2026-06-10 00:11:20'),
(2, 2, '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Atención al Cliente', 1, '2026-06-09 23:27:57', '2026-06-09 19:30:00');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id_cliente`);

--
-- Indices de la tabla `componente`
--
ALTER TABLE `componente`
  ADD PRIMARY KEY (`id_componente`);

--
-- Indices de la tabla `contacto`
--
ALTER TABLE `contacto`
  ADD PRIMARY KEY (`id_contacto`),
  ADD KEY `id_sucursal` (`id_sucursal`);

--
-- Indices de la tabla `delivery`
--
ALTER TABLE `delivery`
  ADD PRIMARY KEY (`id_delivery`),
  ADD UNIQUE KEY `id_reserva` (`id_reserva`);

--
-- Indices de la tabla `detalle_reserva`
--
ALTER TABLE `detalle_reserva`
  ADD PRIMARY KEY (`id_reserva`,`id_producto`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `fecha_especial`
--
ALTER TABLE `fecha_especial`
  ADD PRIMARY KEY (`id_fecha`);

--
-- Indices de la tabla `horario`
--
ALTER TABLE `horario`
  ADD PRIMARY KEY (`id_horario`),
  ADD KEY `id_sucursal` (`id_sucursal`);

--
-- Indices de la tabla `log_acceso`
--
ALTER TABLE `log_acceso`
  ADD PRIMARY KEY (`id_log`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `pago`
--
ALTER TABLE `pago`
  ADD PRIMARY KEY (`id_pago`),
  ADD KEY `id_reserva` (`id_reserva`);

--
-- Indices de la tabla `persona`
--
ALTER TABLE `persona`
  ADD PRIMARY KEY (`idPersona`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id_producto`),
  ADD KEY `id_categoria` (`id_categoria`);

--
-- Indices de la tabla `producto_componente`
--
ALTER TABLE `producto_componente`
  ADD PRIMARY KEY (`id_producto`,`id_componente`),
  ADD KEY `id_componente` (`id_componente`);

--
-- Indices de la tabla `producto_fecha`
--
ALTER TABLE `producto_fecha`
  ADD PRIMARY KEY (`id_producto`,`id_fecha`),
  ADD KEY `id_fecha` (`id_fecha`);

--
-- Indices de la tabla `reserva`
--
ALTER TABLE `reserva`
  ADD PRIMARY KEY (`id_reserva`),
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `sucursal`
--
ALTER TABLE `sucursal`
  ADD PRIMARY KEY (`id_sucursal`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD KEY `id_sucursal` (`id_sucursal`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `componente`
--
ALTER TABLE `componente`
  MODIFY `id_componente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `contacto`
--
ALTER TABLE `contacto`
  MODIFY `id_contacto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `delivery`
--
ALTER TABLE `delivery`
  MODIFY `id_delivery` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `fecha_especial`
--
ALTER TABLE `fecha_especial`
  MODIFY `id_fecha` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `horario`
--
ALTER TABLE `horario`
  MODIFY `id_horario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `log_acceso`
--
ALTER TABLE `log_acceso`
  MODIFY `id_log` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `pago`
--
ALTER TABLE `pago`
  MODIFY `id_pago` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `persona`
--
ALTER TABLE `persona`
  MODIFY `idPersona` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `reserva`
--
ALTER TABLE `reserva`
  MODIFY `id_reserva` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `sucursal`
--
ALTER TABLE `sucursal`
  MODIFY `id_sucursal` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD CONSTRAINT `cliente_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `persona` (`idPersona`) ON DELETE CASCADE;

--
-- Filtros para la tabla `contacto`
--
ALTER TABLE `contacto`
  ADD CONSTRAINT `contacto_ibfk_1` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`) ON DELETE CASCADE;

--
-- Filtros para la tabla `delivery`
--
ALTER TABLE `delivery`
  ADD CONSTRAINT `delivery_ibfk_1` FOREIGN KEY (`id_reserva`) REFERENCES `reserva` (`id_reserva`) ON DELETE CASCADE;

--
-- Filtros para la tabla `detalle_reserva`
--
ALTER TABLE `detalle_reserva`
  ADD CONSTRAINT `detalle_reserva_ibfk_1` FOREIGN KEY (`id_reserva`) REFERENCES `reserva` (`id_reserva`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalle_reserva_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`);

--
-- Filtros para la tabla `horario`
--
ALTER TABLE `horario`
  ADD CONSTRAINT `horario_ibfk_1` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`) ON DELETE CASCADE;

--
-- Filtros para la tabla `log_acceso`
--
ALTER TABLE `log_acceso`
  ADD CONSTRAINT `log_acceso_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pago`
--
ALTER TABLE `pago`
  ADD CONSTRAINT `pago_ibfk_1` FOREIGN KEY (`id_reserva`) REFERENCES `reserva` (`id_reserva`) ON DELETE CASCADE;

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`);

--
-- Filtros para la tabla `producto_componente`
--
ALTER TABLE `producto_componente`
  ADD CONSTRAINT `producto_componente_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE,
  ADD CONSTRAINT `producto_componente_ibfk_2` FOREIGN KEY (`id_componente`) REFERENCES `componente` (`id_componente`) ON DELETE CASCADE;

--
-- Filtros para la tabla `producto_fecha`
--
ALTER TABLE `producto_fecha`
  ADD CONSTRAINT `producto_fecha_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE,
  ADD CONSTRAINT `producto_fecha_ibfk_2` FOREIGN KEY (`id_fecha`) REFERENCES `fecha_especial` (`id_fecha`) ON DELETE CASCADE;

--
-- Filtros para la tabla `reserva`
--
ALTER TABLE `reserva`
  ADD CONSTRAINT `reserva_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`),
  ADD CONSTRAINT `reserva_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `persona` (`idPersona`) ON DELETE CASCADE,
  ADD CONSTRAINT `usuario_ibfk_2` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
