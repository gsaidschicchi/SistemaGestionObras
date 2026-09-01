# Sistema Gestion Obras - Sprint 1 v0.5.2

CU01 - Ver, editar y eliminar observaciones desde Telegram.

Incluye lo validado en v0.5.1 y agrega:
- Listado de observaciones ACTIVAS de la obra actual.
- Detalle con tipificación, fecha, autor, ubicación y comentario.
- Edición de tipificación, ubicación y comentario.
- La edición conserva COD_USUARIO original y completa trazabilidad de modificación.
- OTROS continúa exigiendo comentario también al editar.
- Eliminación lógica con confirmación explícita.
- Al eliminar una observación, sus EVIDENCIAS pasan a ELIMINADA; el archivo físico en Drive se conserva para trazabilidad.
- Observaciones eliminadas dejan de aparecer en el listado operativo.
- No se permite editar/eliminar si la supervisión está FINALIZADA.

QA:
- CU00: 14 casos.
- CU01: 16 casos.
- QA_Sprint1 esperado: 30/30 OK.

Pendiente siguiente bloque:
- Finalizar supervisión desde Telegram.
- Consulta de observaciones en supervisiones finalizadas (solo lectura).
- PDF consolidado.

Prueba recomendada:
1. Reemplazar archivos conservando .git y .clasp.json.
2. clasp push.
3. Ejecutar QA_Sprint1().
4. Publicar nueva versión de la implementación web existente.
5. Telegram: Supervisiones en curso > AD566AF > Ver observaciones.
6. Abrir una observación, editar comentario y validar FECHA_ULT_MODIFICACION/COD_USUARIO_ULT_MODIFICACION.
7. Editar ubicación o tipificación.
8. Eliminar una observación y validar ESTADO=ELIMINADA en OBSERVACIONES y EVIDENCIAS.


## Sprint 1 v0.5.3 - Ajustes de edición de observaciones
- Telegram muestra nombre y apellido del autor, nunca el código interno de usuario.
- Al cambiar una tipificación a OTROS se solicita nuevamente el comentario descriptivo.
- Edición de observaciones permite agregar una o varias fotos nuevas.
- El detalle muestra correctamente coordenadas o referencia manual.
- La confirmación de eliminación muestra datos operativos de la observación y oculta detalles técnicos.
- Fechas de modificación y eliminación se formatean con fecha y hora.
