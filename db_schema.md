# Esquema de Base de Datos

Este documento sirve como referencia de las tablas y columnas definidas en el proyecto.

## base_operativa

| Columna        | Tipo de Dato | Nullable | Valor por Defecto                          |
| -------------- | ------------ | -------- | ------------------------------------------ |
| id             | integer      | NO       | nextval('base_operativa_id_seq'::regclass) |
| proveedor      | text         | NO       | -                                          |
| descripcion    | text         | NO       | -                                          |
| marca          | text         | NO       | -                                          |
| color          | text         | NO       | -                                          |
| cantidad       | integer      | NO       | -                                          |
| tamano         | text         | NO       | -                                          |
| material       | text         | NO       | -                                          |
| fecha          | timestamp    | YES      | CURRENT_TIMESTAMP                          |
| valor          | numeric      | NO       | -                                          |
| estado         | text         | NO       | -                                          |
| disponibilidad | text         | YES      | 'Pendiente'::text                          |
| espacio_id     | integer      | YES      | -                                          |

## bienes

| Columna           | Tipo de Dato | Nullable | Valor por Defecto                  |
| ----------------- | ------------ | -------- | ---------------------------------- |
| id                | integer      | NO       | nextval('bienes_id_seq'::regclass) |
| codigo            | varchar      | NO       | -                                  |
| nombre            | varchar      | NO       | -                                  |
| categoria_id      | integer      | NO       | -                                  |
| subcategoria_id   | integer      | YES      | -                                  |
| proveedor_id      | integer      | YES      | -                                  |
| espacio_id        | integer      | NO       | -                                  |
| cantidad          | integer      | NO       | 0                                  |
| fecha_adquisicion | date         | YES      | -                                  |
| valor             | numeric      | YES      | -                                  |
| estado            | varchar      | YES      | -                                  |
| disponibilidad    | boolean      | YES      | true                               |
| observaciones     | text         | YES      | -                                  |
| creado_en         | timestamptz  | YES      | now()                              |
| actualizado_en    | timestamptz  | YES      | now()                              |
| usuario_id        | uuid         | YES      | -                                  |
| precio_venta      | numeric      | YES      | -                                  |

## categorias

| Columna | Tipo de Dato | Nullable | Valor por Defecto                      |
| ------- | ------------ | -------- | -------------------------------------- |
| id      | integer      | NO       | nextval('categorias_id_seq'::regclass) |
| nombre  | varchar      | NO       | -                                      |
| codigo  | varchar      | NO       | -                                      |

## documentos

| Columna       | Tipo de Dato | Nullable | Valor por Defecto                      |
| ------------- | ------------ | -------- | -------------------------------------- |
| id            | integer      | NO       | nextval('documentos_id_seq'::regclass) |
| nombre        | varchar      | NO       | -                                      |
| url           | text         | NO       | -                                      |
| creado_por    | varchar      | NO       | -                                      |
| fecha_reporte | date         | NO       | -                                      |
| creado_en     | timestamptz  | YES      | now()                                  |
| descripcion   | text         | YES      | -                                      |
| usuario_id    | uuid         | YES      | -                                      |

## espacios

| Columna     | Tipo de Dato | Nullable | Valor por Defecto                    |
| ----------- | ------------ | -------- | ------------------------------------ |
| id          | integer      | NO       | nextval('espacios_id_seq'::regclass) |
| nombre      | varchar      | NO       | -                                    |
| codigo      | varchar      | NO       | -                                    |
| descripcion | text         | YES      | -                                    |

## estados

| Columna     | Tipo de Dato | Nullable | Valor por Defecto                   |
| ----------- | ------------ | -------- | ----------------------------------- |
| id          | integer      | NO       | nextval('estados_id_seq'::regclass) |
| nombre      | varchar      | NO       | -                                   |
| descripcion | text         | YES      | -                                   |
| created_at  | timestamptz  | YES      | now()                               |

## historial_inventario

| Columna         | Tipo de Dato | Nullable | Valor por Defecto |
| --------------- | ------------ | -------- | ----------------- |
| id              | uuid         | NO       | gen_random_uuid() |
| producto_id     | uuid         | NO       | -                 |
| tipo_movimiento | text         | NO       | -                 |
| cantidad        | integer      | NO       | -                 |
| usuario_id      | uuid         | YES      | -                 |
| fecha           | timestamp    | YES      | now()             |

## ingresos

| Columna     | Tipo de Dato | Nullable | Valor por Defecto |
| ----------- | ------------ | -------- | ----------------- |
| id          | uuid         | NO       | gen_random_uuid() |
| cantidad    | integer      | NO       | -                 |
| fecha       | timestamp    | YES      | now()             |
| descripcion | text         | YES      | -                 |
| usuario_id  | uuid         | YES      | -                 |
| producto    | bigint       | YES      | -                 |

## movimientos

| Columna         | Tipo de Dato | Nullable | Valor por Defecto                       |
| --------------- | ------------ | -------- | --------------------------------------- |
| id              | integer      | NO       | nextval('movimientos_id_seq'::regclass) |
| bien_id         | integer      | NO       | -                                       |
| cantidad        | integer      | NO       | -                                       |
| tipo_movimiento | varchar      | NO       | -                                       |
| fecha           | timestamp    | YES      | CURRENT_TIMESTAMP                       |
| motivo          | text         | YES      | -                                       |
| usuario_id      | uuid         | YES      | -                                       |
| total_venta     | numeric      | YES      | -                                       |

## movimientos_inventario

| Columna     | Tipo de Dato | Nullable | Valor por Defecto                                  |
| ----------- | ------------ | -------- | -------------------------------------------------- |
| id          | integer      | NO       | nextval('movimientos_inventario_id_seq'::regclass) |
| producto    | text         | YES      | -                                                  |
| cantidad    | integer      | NO       | -                                                  |
| descripcion | text         | NO       | -                                                  |
| fecha       | timestamp    | YES      | CURRENT_TIMESTAMP                                  |
| usuario     | text         | NO       | -                                                  |
| espacio     | text         | YES      | -                                                  |
| movimiento  | text         | YES      | -                                                  |

## productos

| Columna       | Tipo de Dato | Nullable | Valor por Defecto |
| ------------- | ------------ | -------- | ----------------- |
| id            | uuid         | NO       | gen_random_uuid() |
| nombre        | varchar      | NO       | -                 |
| descripcion   | text         | YES      | -                 |
| precio_compra | numeric      | NO       | -                 |
| stock         | integer      | YES      | 0                 |
| fecha_c       | timestamp    | YES      | now()             |
| categoria     | varchar      | YES      | -                 |
| fecha_v       | date         | YES      | -                 |
| imagen_url    | text         | YES      | -                 |
| precio_venta  | numeric      | YES      | -                 |

## proveedores

| Columna   | Tipo de Dato | Nullable | Valor por Defecto                       |
| --------- | ------------ | -------- | --------------------------------------- |
| id        | integer      | NO       | nextval('proveedores_id_seq'::regclass) |
| nombre    | varchar      | NO       | -                                       |
| contacto  | varchar      | YES      | -                                       |
| direccion | varchar      | YES      | -                                       |

## reportes

| Columna        | Tipo de Dato | Nullable | Valor por Defecto                    |
| -------------- | ------------ | -------- | ------------------------------------ |
| id             | integer      | NO       | nextval('reportes_id_seq'::regclass) |
| bien_id        | integer      | NO       | -                                    |
| responsable_id | integer      | NO       | -                                    |
| descripcion    | text         | NO       | -                                    |
| fecha          | timestamp    | YES      | now()                                |
| acciones       | text         | YES      | -                                    |
| cantidad       | integer      | YES      | -                                    |
| usuario_id     | uuid         | YES      | -                                    |

## salidas

| Columna  | Tipo de Dato | Nullable | Valor por Defecto |
| -------- | ------------ | -------- | ----------------- |
| id       | uuid         | NO       | gen_random_uuid() |
| producto | uuid         | NO       | -                 |
| cantidad | integer      | NO       | -                 |
| precio   | numeric      | NO       | -                 |
| fecha    | timestamp    | YES      | now()             |
| total    | numeric      | YES      | -                 |

## subcategorias

| Columna      | Tipo de Dato | Nullable | Valor por Defecto                         |
| ------------ | ------------ | -------- | ----------------------------------------- |
| id           | integer      | NO       | nextval('subcategorias_id_seq'::regclass) |
| categoria_id | integer      | NO       | -                                         |
| nombre       | varchar      | NO       | -                                         |
| codigo       | varchar      | NO       | -                                         |

## usuarios

| Columna    | Tipo de Dato | Nullable | Valor por Defecto               |
| ---------- | ------------ | -------- | ------------------------------- |
| id         | uuid         | NO       | -                               |
| nombre     | varchar      | YES      | -                               |
| rol        | varchar      | YES      | 'usuario'::character varying    |
| created_at | timestamptz  | YES      | now()                           |
| email      | text         | NO       | 'placeholder@example.com'::text |

## usuarios_accounts

| Columna        | Tipo de Dato | Nullable | Valor por Defecto |
| -------------- | ------------ | -------- | ----------------- |
| auth_user_id   | uuid         | NO       | -                 |
| nombre         | varchar      | YES      | -                 |
| email          | varchar      | NO       | -                 |
| rol            | text         | YES      | 'empleado'::text  |
| fecha_creacion | timestamp    | YES      | now()             |

## usuarios_back

| Columna      | Tipo de Dato | Nullable | Valor por Defecto                    |
| ------------ | ------------ | -------- | ------------------------------------ |
| nombre       | varchar      | YES      | -                                    |
| email        | varchar      | NO       | -                                    |
| id           | integer      | NO       | nextval('usuarios_id_seq'::regclass) |
| auth_user_id | uuid         | YES      | -                                    |

# Llaves Foráneas (Foreign Keys)

| Tabla Origen         | Columna Origen  | Tabla Destino | Columna Destino | Nombre Constraint                     | On Delete | On Update |
| -------------------- | --------------- | ------------- | --------------- | ------------------------------------- | --------- | --------- |
| bienes               | categoria_id    | categorias    | id              | bienes_categoria_id_fkey              | RESTRICT  | NO ACTION |
| bienes               | espacio_id      | espacios      | id              | bienes_espacio_id_fkey                | RESTRICT  | NO ACTION |
| bienes               | proveedor_id    | proveedores   | id              | bienes_proveedor_id_fkey              | NO ACTION | NO ACTION |
| bienes               | subcategoria_id | subcategorias | id              | bienes_subcategoria_id_fkey           | RESTRICT  | NO ACTION |
| bienes               | usuario_id      | usuarios      | id              | fk_bienes_usuario                     | SET NULL  | NO ACTION |
| documentos           | usuario_id      | usuarios      | id              | fk_documentos_usuario                 | SET NULL  | NO ACTION |
| historial_inventario | producto_id     | productos     | id              | historial_inventario_producto_id_fkey | CASCADE   | NO ACTION |
| ingresos             | producto        | bienes        | id              | ingresos_producto_fkey                | NO ACTION | NO ACTION |
| ingresos             | usuario_id      | usuarios      | id              | ingresos_usuario_id_fkey              | NO ACTION | NO ACTION |
| movimientos          | bien_id         | bienes        | id              | fk_bien_id                            | CASCADE   | NO ACTION |
| movimientos          | usuario_id      | usuarios      | id              | fk_movimientos_usuario                | SET NULL  | NO ACTION |
| reportes             | usuario_id      | usuarios      | id              | fk_reportes_usuario                   | SET NULL  | NO ACTION |
| reportes             | bien_id         | bienes        | id              | reportes_bien_id_fkey                 | CASCADE   | NO ACTION |
| reportes             | responsable_id  | usuarios_back | id              | reportes_responsable_id_fkey          | CASCADE   | NO ACTION |
| salidas              | producto        | productos     | id              | salidas_producto_id_fkey              | CASCADE   | NO ACTION |
| subcategorias        | categoria_id    | categorias    | id              | subcategorias_categoria_id_fkey       | CASCADE   | NO ACTION |

# Triggers

| Nombre Trigger                  | Tabla       | Definición o Función Asociada                                                                                                                                  |
| ------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| trigger_aumentar_stock          | ingresos    | `CREATE TRIGGER trigger_aumentar_stock AFTER INSERT ON public.ingresos FOR EACH ROW EXECUTE FUNCTION aumentar_stock()`                                         |
| trigger_sumar_stock_al_insertar | ingresos    | `CREATE TRIGGER trigger_sumar_stock_al_insertar AFTER INSERT ON public.ingresos FOR EACH ROW EXECUTE FUNCTION actualizar_stock_ingreso()`                      |
| trigger_actualizar_cantidad     | movimientos | `CREATE TRIGGER trigger_actualizar_cantidad AFTER INSERT OR DELETE OR UPDATE ON public.movimientos FOR EACH ROW EXECUTE FUNCTION actualizar_cantidad_bienes()` |
| trigger_descontar_stock         | salidas     | `CREATE TRIGGER trigger_descontar_stock AFTER INSERT ON public.salidas FOR EACH ROW EXECUTE FUNCTION descontar_stock()`                                        |
