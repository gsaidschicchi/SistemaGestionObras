// ============================================================================
// SERVICIO TÉCNICO - ACTUALIZACIÓN DE TABLAS BIGQUERY
// ============================================================================

class BigQueryUpdateService {

  // ==========================================================================
  // ACTUALIZACIÓN AUTOMÁTICA
  // El proceso puede ejecutarse periódicamente sin depender del horario exacto
  // de actualización del archivo fuente. Antes de procesar, se compara la
  // versión disponible en Drive con la última procesada.
  //
  // Si el archivo no cambió, el proceso finaliza sin reconstruir las tablas.
  // ==========================================================================

  static actualizar() {
    const archivo = this._obtenerArchivoFuente();

    if (!archivo) {
      Logger.log("No se encontró el archivo fuente PM.");
      return;
    }

    const fechaArchivo = archivo.getLastUpdated();
    const fechaArchivoISO = fechaArchivo.toISOString();

    const propiedades =
      PropertiesService.getScriptProperties();

    const ultimaVersionProcesada =
      propiedades.getProperty(
        "ULTIMA_ACTUALIZACION_ARCHIVO_PM"
      );

    if (ultimaVersionProcesada === fechaArchivoISO) {
      Logger.log(
        "La versión actual del archivo PM ya fue procesada."
      );
      return;
    }

    Logger.log(
      "Nueva versión PM detectada: " +
      fechaArchivoISO
    );


    // ------------------------------------------------------------------------
    // 1. PM_MATERIALES
    // ------------------------------------------------------------------------

    DAL_BigQuery.ejecutarConsulta(
      this._sqlMateriales()
    );


    // ------------------------------------------------------------------------
    // 2. PM_OBRAS_VALIDAS
    // ------------------------------------------------------------------------

    DAL_BigQuery.ejecutarConsulta(
      this._sqlObrasValidas()
    );


    // ------------------------------------------------------------------------
    // 3. PM_OBRAS_CATALOGO
    // ------------------------------------------------------------------------

    DAL_BigQuery.ejecutarConsulta(
      this._sqlObrasCatalogo()
    );


    // ------------------------------------------------------------------------
    // Registrar actualización únicamente si todo terminó correctamente.
    // ------------------------------------------------------------------------

    const ahora = new Date();

    propiedades.setProperty(
      "ULTIMA_ACTUALIZACION_ARCHIVO_PM",
      fechaArchivoISO
    );

    propiedades.setProperty(
      "ULTIMA_ACTUALIZACION_BIGQUERY_PM",
      ahora.toISOString()
    );

    Logger.log(
      "Actualización BigQuery finalizada correctamente."
    );
  }


  // ==========================================================================
  // ARCHIVO FUENTE
  // ==========================================================================

  static _obtenerArchivoFuente() {
    const carpetas =
      DriveApp.getFoldersByName(
        Config.PM.NOMBRE_CARPETA
      );

    if (!carpetas.hasNext()) {
      return null;
    }

    const carpeta = carpetas.next();

    const archivos =
      carpeta.getFilesByName(
        Config.PM.NOMBRE_ARCHIVO
      );

    if (!archivos.hasNext()) {
      return null;
    }

    return archivos.next();
  }


  // ==========================================================================
  // SQL - PM_MATERIALES
  // Consolida materiales correspondientes a movimientos ORED.
  // ==========================================================================

  static _sqlMateriales() {
    return `
      CREATE OR REPLACE TABLE
      \`${Config.BIGQUERY.PROJECT_ID}.${Config.BIGQUERY.DATASET_PM}.pm_materiales\`
      AS

      SELECT
        TRIM(Motivo) AS OBRA,
        TRIM(Articulo) AS ARTICULO,
        ANY_VALUE(TRIM(UDM)) AS UDM,
        SUM(Cantidad_Solicitada) AS CANTIDAD_PM

      FROM
        \`${Config.BIGQUERY.PROJECT_ID}.${Config.BIGQUERY.DATASET_PM}.${Config.BIGQUERY.TABLA_MOVIMIENTOS_PM}\`

      WHERE
        UPPER(TRIM(Motivo_Tarea)) = 'ORED'

        AND NOT CONTAINS_SUBSTR(
          UPPER(TRIM(Motivo)),
          'MTPM'
        )

        AND NOT CONTAINS_SUBSTR(
          UPPER(TRIM(Motivo)),
          'RF'
        )

        AND Motivo IS NOT NULL
        AND TRIM(Motivo) <> ''

        AND Articulo IS NOT NULL
        AND TRIM(Articulo) <> ''

      GROUP BY
        TRIM(Motivo),
        TRIM(Articulo)
    `;
  }


  // ==========================================================================
  // SQL - PM_OBRAS_VALIDAS
  // Genera el catálogo liviano utilizado para buscar obras desde el bot.
  // ==========================================================================

  static _sqlObrasValidas() {
    return `
      CREATE OR REPLACE TABLE
      \`${Config.BIGQUERY.PROJECT_ID}.${Config.BIGQUERY.DATASET_PM}.${Config.BIGQUERY.TABLA_OBRAS_PM}\`
      AS

      SELECT DISTINCT
        TRIM(OBRA) AS OBRA

      FROM
        \`${Config.BIGQUERY.PROJECT_ID}.${Config.BIGQUERY.DATASET_PM}.pm_materiales\`

      WHERE
        OBRA IS NOT NULL
        AND TRIM(OBRA) <> ''
    `;
  }


  // ==========================================================================
  // SQL - PM_OBRAS_CATALOGO
  //
  // REGLA DE NEGOCIO - ÚLTIMA EC DE LA OBRA
  //
  // La búsqueda inicial de obras se realiza por prefijo en PM_OBRAS_VALIDAS.
  // Una vez que el usuario selecciona una obra concreta, la relación con la EC
  // se obtiene mediante coincidencia exacta del campo Motivo.
  //
  // Una misma obra puede tener distintos Localizador_Destino en su histórico.
  // Para determinar la EC vigente se toma el movimiento ORED correspondiente
  // a la Requerido_Fecha más reciente de esa obra.
  //
  // Esta regla queda centralizada en la construcción del catálogo para poder
  // modificar el criterio en el futuro sin alterar el flujo de búsqueda.
  // ==========================================================================

  static _sqlObrasCatalogo() {
    return `
      CREATE OR REPLACE TABLE
      \`${Config.BIGQUERY.PROJECT_ID}.${Config.BIGQUERY.DATASET_PM}.${Config.BIGQUERY.TABLA_OBRAS_CATALOGO}\`
      AS

      SELECT
        OBRA,
        LOCALIZADOR_DESTINO,
        REQUERIDO_FECHA

      FROM (
        SELECT
          TRIM(Motivo) AS OBRA,
          TRIM(Localizador_Destino) AS LOCALIZADOR_DESTINO,
          Requerido_Fecha AS REQUERIDO_FECHA,

          ROW_NUMBER() OVER (
            PARTITION BY
              REGEXP_REPLACE(
                UPPER(TRIM(Motivo)),
                r'[^A-Z0-9]',
                ''
              )

            ORDER BY
              Requerido_Fecha DESC
          ) AS ORDEN

        FROM
          \`${Config.BIGQUERY.PROJECT_ID}.${Config.BIGQUERY.DATASET_PM}.${Config.BIGQUERY.TABLA_MOVIMIENTOS_PM}\`

        WHERE
          UPPER(TRIM(Motivo_Tarea)) = 'ORED'

          AND Motivo IS NOT NULL
          AND TRIM(Motivo) <> ''

          AND Localizador_Destino IS NOT NULL
          AND TRIM(Localizador_Destino) <> ''

          AND Requerido_Fecha IS NOT NULL
      )

      WHERE
        ORDEN = 1
    `;
  }
}


// ============================================================================
// EJECUCIÓN MANUAL / TRIGGER
// Punto de entrada utilizado tanto para ejecución manual como para el trigger.
// ============================================================================

function actualizarBigQuery() {
  BigQueryUpdateService.actualizar();
}

