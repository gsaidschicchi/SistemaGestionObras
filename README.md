# Sistema de Gestión y Supervisión de Obras — Sprint 1 v0.5.6

## Bloque incorporado
Reporte PDF de supervisión finalizada.

- Puede generarse inmediatamente al finalizar una supervisión.
- Puede generarse posteriormente desde `Supervisiones finalizadas`.
- Antes de generarlo pregunta si se desea agregar un comentario general de la obra.
- El comentario general pertenece a la versión del reporte y se persiste en REPORTES.
- Incluye solo observaciones y evidencias ACTIVAS.
- Sin observaciones: `Obra recorrida sin observaciones activas ni fallas registradas.`
- Evidencias fotográficas en grilla de hasta dos columnas, conservando proporción.
- Versionado V1, V2, etc.; la nueva versión queda VIGENTE y la anterior REEMPLAZADA.
- El PDF se guarda en la carpeta Drive de la obra y se envía por Telegram.

## Migración necesaria
Después de `clasp push`, ejecutar una vez `setupSprint1()` antes de probar Telegram. Esto agrega `COMENTARIO_GENERAL` a la hoja REPORTES sin perder las filas existentes.
