# Sistema Gestión de Obras — Sprint 1 v0.5.5

## Bloque implementado
Finalización de supervisión (CU01).

### Flujo Telegram
- Desde una obra EN_CURSO se puede seleccionar `Finalizar supervisión`.
- Antes de persistir se muestra un resumen con obra, fecha de inicio y cantidad de observaciones activas.
- Si no existen observaciones activas, se informa explícitamente que puede finalizar igualmente.
- La finalización requiere confirmación explícita.
- `Cancelar` conserva la supervisión EN_CURSO y vuelve a la obra activa.
- Al confirmar se registra `FINALIZADA`, `FECHA_FINALIZACION` y `COD_USUARIO_FINALIZACION`.
- Luego de finalizar se limpia la obra activa de la sesión.
- Las supervisiones finalizadas continúan disponibles desde `Supervisiones finalizadas` en modo consulta.
- La generación de PDF queda separada para el siguiente bloque.

## QA
CU01 incorpora 19 casos automáticos, incluyendo registro de fecha/usuario finalizador y prevención de doble finalización.

## Base
Construido sobre v0.5.4 estable con buscador de obras en BigQuery.
