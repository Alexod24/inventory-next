-- Migration: Cash Register (Corte de Caja)

-- 1. Tabla de Sesiones de Caja
CREATE TABLE IF NOT EXISTS caja_sesiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sede_id UUID NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
    usuario_apertura_id UUID REFERENCES auth.users(id), -- Quien abrió
    usuario_cierre_id UUID REFERENCES auth.users(id),   -- Quien cerró
    
    fecha_apertura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_cierre TIMESTAMP WITH TIME ZONE,
    
    monto_apertura NUMERIC(10, 2) DEFAULT 0,
    monto_cierre_real NUMERIC(10, 2), -- Lo que el usuario cuenta físicamente
    monto_teorico NUMERIC(10, 2),     -- Lo que el sistema calcula
    diferencia NUMERIC(10, 2),        -- Real - Teorico
    
    estado VARCHAR(20) DEFAULT 'abierta' CHECK (estado IN ('abierta', 'cerrada')),
    
    observaciones TEXT
);

-- 2. Tabla de Movimientos de Caja
CREATE TABLE IF NOT EXISTS caja_movimientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sesion_id UUID NOT NULL REFERENCES caja_sesiones(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES auth.users(id),
    
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
    monto NUMERIC(10, 2) NOT NULL,
    motivo TEXT,
    
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS (Seguridad)
ALTER TABLE caja_sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE caja_movimientos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver sesiones" ON caja_sesiones
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear sesiones" ON caja_sesiones
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar sesiones" ON caja_sesiones
FOR UPDATE USING (auth.role() = 'authenticated');


CREATE POLICY "Usuarios autenticados pueden ver movimientos" ON caja_movimientos
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear movimientos" ON caja_movimientos
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. Indices para rendimiento
CREATE INDEX idx_caja_sesiones_sede_estado ON caja_sesiones(sede_id, estado);
