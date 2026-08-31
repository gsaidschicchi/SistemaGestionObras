# Sistema Gestion Obras - Sprint 1 v0.4

Corrección de integración Telegram / Apps Script.

Cambios principales:
- Mantiene appsscript.json en la raíz del proyecto.
- Respuesta Telegram mediante el propio HTTP del webhook para evitar una llamada UrlFetch adicional.
- Deduplicación de update_id con CacheService durante 6 horas.
- No crea una fila de SESIONES_TELEGRAM por cada saludo de un usuario no registrado.
- Cache interno de Spreadsheet/Sheet durante cada ejecución.
- Inserciones con setValues en lugar de appendRow.
- diagnosticoIntegracion() permite medir lectura de Sheets sin modificar datos.

Prueba recomendada:
1. clasp push
2. Ejecutar QA_Sprint1()
3. Publicar Nueva versión de la implementación web existente.
4. En Telegram enviar "hola" una sola vez.
5. Tocar "Dar de alta" una sola vez.
6. Revisar Apps Script > Ejecuciones. El log [WEBHOOK] informa total_ms.

Si sigue tardando decenas de segundos, ejecutar diagnosticoIntegracion() y revisar sus tiempos antes de avanzar con CU00.
