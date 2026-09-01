# Sistema Gestion Obras - Sprint 1 v0.5.1

CU01 - Reportar observación desde Telegram.

Incluye:
- Flujo de observación sobre la obra activa.
- Tipificaciones activas filtradas por familia.
- Ubicación compartida por Telegram o referencia manual.
- Una o varias fotos obligatorias.
- Comentario opcional; obligatorio para OTROS.
- Resumen y confirmación explícita antes de persistir.
- Antes de confirmar, las fotos permanecen solo como file_id en CONTEXTO_FLUJO.
- Al confirmar, las fotos se descargan desde Telegram y se guardan en Drive.
- Alta de OBSERVACIONES y EVIDENCIAS con compensación best-effort ante errores.
- Carpeta Drive automática: Sistema Gestión y Supervisión de Obras / Supervisiones / <OBRA>.
- Ajustes UX: saludo/rol solo en menú principal; valores visuales sin guiones bajos.
- Formato fecha/hora visible en Sheets para supervisiones, observaciones y evidencias.

Pendiente siguiente bloque:
- Ver, editar y eliminar observaciones.
- Finalizar supervisión desde Telegram.
- PDF consolidado.

Prueba recomendada:
1. Reemplazar archivos en la carpeta local conservando .git y .clasp.json.
2. clasp push
3. Ejecutar setupSprint1() una vez para aplicar formatos de fecha/hora.
4. Ejecutar QA_Sprint1().
5. Publicar una nueva versión de la implementación web existente.
6. En Telegram recuperar AD566AF y seleccionar Reportar observación.
7. Completar tipificación, ubicación, foto, comentario y confirmar.
8. Verificar OBSERVACIONES, EVIDENCIAS y Drive.
