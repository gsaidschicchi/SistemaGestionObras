# Sistema de Gestión y Supervisión de Obras — Sprint 1

## Alcance implementado
Sprint 1 incluye CU00 Alta y habilitación de usuario y CU01 Supervisión de obra.

El sistema utiliza arquitectura por capas y servicios técnicos independientes para Telegram, Google Sheets, Drive, PDF y BigQuery.

## Supervisión de obra
- Permite iniciar y mantener varias supervisiones EN_CURSO por supervisor, sobre obras distintas.
- Una obra no puede crear una segunda supervisión si ya posee una EN_CURSO.
- Una supervisión FINALIZADA queda cerrada para nuevas observaciones.
- El inicio y la finalización utilizan ScriptLock para proteger operaciones concurrentes.
- Las observaciones admiten tipificación, ubicación o referencia, evidencias fotográficas y comentario.
- Las eliminaciones de observaciones y evidencias son lógicas; la eliminación física se utiliza únicamente como compensación ante fallos de persistencia.

## Búsqueda de obras y BigQuery
- La búsqueda de obras se realiza contra `pm_obras_validas`, utilizando coincidencia por prefijo normalizado.
- El usuario selecciona una obra concreta entre las coincidencias encontradas.
- La familia se determina por regla de negocio: OC → OBRA_CIVIL, FO → FIBRA_OPTICA y código base terminado en letra + F → ACCESO_FTTH.
- La resolución del contratista NO consulta `pm_movimientos_raw` durante el uso normal del bot.
- `pm_obras_catalogo` conserva una fila por obra con el `Localizador_Destino` del movimiento ORED cuya `Requerido_Fecha` es la más reciente.
- Una vez seleccionada la obra, `DAL_Obra` consulta `pm_obras_catalogo` por coincidencia exacta normalizada.

## Actualización automática de BigQuery
`BigQueryUpdateService` reconstruye las tablas procesadas cuando detecta una nueva versión del archivo PM en Drive:

1. `pm_materiales`
2. `pm_obras_validas`
3. `pm_obras_catalogo`

Si la versión del archivo fuente ya fue procesada, la ejecución finaliza sin reconstruir las tablas. El RAW se utiliza únicamente durante este proceso de actualización.

## Contratistas y obras locales
- CONTRATISTAS: `ID_CONTRATISTA | LOCALIZADOR_DESTINO | NOMBRE_CONTRATISTA | ACTIVO`.
- Si un `Localizador_Destino` todavía no existe, se crea un contratista `CON###` con nombre inicial igual al localizador y `ACTIVO=SI`.
- OBRAS persiste `CODIGO_OBRA`, `ID_CONTRATISTA`, `FAMILIA` y `ACTIVA`.
- El nombre comercial del contratista puede ajustarse posteriormente sin modificar la relación técnica con el localizador.

## Reportes PDF
- El reporte se genera únicamente para supervisiones FINALIZADAS.
- Puede generarse inmediatamente al finalizar o posteriormente desde Supervisiones finalizadas.
- El comentario general pertenece a cada versión del reporte y se persiste en REPORTES.
- Incluye únicamente observaciones y evidencias ACTIVAS.
- Si no existen observaciones activas, informa que la obra fue recorrida sin fallas registradas.
- Las fotografías se incorporan conservando proporción.
- Los reportes se versionan V1, V2, etc.; la nueva versión queda VIGENTE y la anterior REEMPLAZADA.
- Las versiones anteriores se conservan físicamente en Drive.
- La generación y el versionado utilizan ScriptLock para evitar versiones duplicadas o múltiples reportes VIGENTES por concurrencia.
- El PDF se guarda en la carpeta Drive de la obra y puede enviarse por Telegram.

## QA Sprint 1
Suite automatizada vigente:
- CU00: 14/14 OK.
- CU01: 19/19 OK.
- Sprint 1: 33/33 OK.

Las integraciones físicas de BigQuery, Drive y generación/versionado de PDF se validan adicionalmente mediante pruebas de integración.

## Despliegue y migración
Después de desplegar cambios estructurales, ejecutar `setupSprint1()` únicamente cuando corresponda aplicar las migraciones definidas por el proyecto. No debe utilizarse como parte del flujo normal del bot.
