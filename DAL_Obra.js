// ======================================================
// DAL_OBRA.JS
// Acceso físico a obras locales y catálogo PM de BigQuery.
// ======================================================
class DAL_Obra {

  static buscarPorCodigo(codigo) {
    return DAL_Base.buscarPrimero(
      Config.HOJAS.OBRAS,
      4,
      f => String(f[0]).toUpperCase() === String(codigo).toUpperCase()
    );
  }

  static buscarTexto(texto) {
    const t = String(texto).toUpperCase();

    return DAL_Base.buscarTodos(
      Config.HOJAS.OBRAS,
      4,
      f => String(f[0]).toUpperCase().includes(t)
    );
  }

  // ======================================================
  // BIGQUERY - BÚSQUEDA DE OBRAS
  // ======================================================

  static buscarExternasPorPrefijo(obraNormalizada) {
    const sql = `
      SELECT OBRA
      FROM \`${Config.BIGQUERY.PROJECT_ID}.${Config.BIGQUERY.DATASET_PM}.${Config.BIGQUERY.TABLA_OBRAS_PM}\`
      WHERE STARTS_WITH(
        REGEXP_REPLACE(UPPER(TRIM(OBRA)), r'[^A-Z0-9]', ''),
        @obra
      )
      ORDER BY OBRA
      LIMIT ${Config.BIGQUERY.LIMITE_BUSQUEDA_OBRAS}
    `;

    return DAL_BigQuery.ejecutarConsulta(
      sql,
      [DAL_BigQuery.parametroString("obra", obraNormalizada)]
    );
  }

  static buscarExternaPorCodigo(obraNormalizada) {
    const sql = `
      SELECT OBRA
      FROM \`${Config.BIGQUERY.PROJECT_ID}.${Config.BIGQUERY.DATASET_PM}.${Config.BIGQUERY.TABLA_OBRAS_PM}\`
      WHERE REGEXP_REPLACE(
        UPPER(TRIM(OBRA)),
        r'[^A-Z0-9]',
        ''
      ) = @obra
      ORDER BY OBRA
      LIMIT 1
    `;

    const filas = DAL_BigQuery.ejecutarConsulta(
      sql,
      [DAL_BigQuery.parametroString("obra", obraNormalizada)]
    );

    return filas.length ? filas[0] : null;
  }

  // ======================================================
  // BIGQUERY - LOCALIZADOR / CONTRATISTA
  // Consulta el catálogo procesado, NO el RAW.
  // ======================================================

  static buscarLocalizadorDestinoPorObra(obraNormalizada) {
    const sql = `
      SELECT LOCALIZADOR_DESTINO
      FROM \`${Config.BIGQUERY.PROJECT_ID}.${Config.BIGQUERY.DATASET_PM}.${Config.BIGQUERY.TABLA_OBRAS_CATALOGO}\`
      WHERE REGEXP_REPLACE(
        UPPER(TRIM(OBRA)),
        r'[^A-Z0-9]',
        ''
      ) = @obra
        AND LOCALIZADOR_DESTINO IS NOT NULL
        AND TRIM(LOCALIZADOR_DESTINO) <> ''
      ORDER BY LOCALIZADOR_DESTINO
      LIMIT 1
    `;

    const filas = DAL_BigQuery.ejecutarConsulta(
      sql,
      [DAL_BigQuery.parametroString("obra", obraNormalizada)]
    );

    return filas.length && filas[0].f && filas[0].f[0]
      ? String(filas[0].f[0].v || "").trim()
      : "";
  }

  // ======================================================
  // GOOGLE SHEETS - OBRAS
  // ======================================================

  static insertar(fila) {
    return DAL_Base.insertar(
      Config.HOJAS.OBRAS,
      fila
    );
  }

  static actualizar(nroFila, fila) {
    DAL_Base.actualizar(
      Config.HOJAS.OBRAS,
      nroFila,
      fila
    );
  }
}