# Sistema Gestión de Obras — Sprint 1 v0.2

Estructura reorganizada con criterio **1 clase/componente = 1 archivo**.

## Importante al integrar
- **No reemplazar** tu carpeta `.git`.
- **No reemplazar** tu `.clasp.json`.
- `appsscript.json` es idéntico al manifest original del proyecto al momento de generar esta versión.
- Copiar/reemplazar los `.js`, `README.md` y `appsscript.json` dentro de la carpeta local vinculada por clasp.

## Primeras funciones a ejecutar en Apps Script
1. `setupSprint1()` — crea/verifica las hojas requeridas.
2. `QA_CU00()` — test BLL del alta/habilitación de usuario.
3. `QA_CU01()` — test BLL de supervisión/observaciones.
4. `QA_Sprint1()` — corre CU00 + CU01.

Los QA utilizan `QA_Repo` en memoria y no escriben en las hojas productivas.
