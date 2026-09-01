# Sistema Gestion Obras - Sprint 1 v0.5.0

Inicio de CU01 - Supervisión de obra.

Bloque implementado:
- Menú operativo para SUPERVISOR y ADMINISTRADOR.
- Inicio de nueva supervisión desde Telegram.
- Búsqueda de obra por código completo o parcial.
- Selección cuando existen varias coincidencias.
- Confirmación explícita antes de crear la supervisión.
- Alta de SUPERVISION EN_CURSO con FECHA_INICIO y COD_USUARIO_INICIO.
- Recuperación de una supervisión EN_CURSO existente sin duplicarla.
- Consulta simple de supervisiones en curso y finalizadas.
- Sesión Telegram conserva la obra activa.

Pendiente para los próximos bloques de CU01:
- Reportar observación.
- Ver, editar y eliminar observaciones.
- Finalizar supervisión desde Telegram.
- Evidencias y PDF.

Prueba recomendada:
1. clasp push
2. Ejecutar QA_Sprint1()
3. Publicar una nueva versión de la implementación web existente.
4. En Telegram enviar Hola.
5. Seleccionar Iniciar nueva supervisión.
6. Buscar una obra existente.
7. Confirmar el inicio.
8. Verificar la nueva fila en SUPERVISIONES.
