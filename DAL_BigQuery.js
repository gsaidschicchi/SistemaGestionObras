// ======================================================
// DAL_BIGQUERY.JS
// Acceso físico genérico a BigQuery. Sin reglas de negocio.
// ======================================================
class DAL_BigQuery {
  static ejecutarConsulta(sql, queryParameters = []) {
    const request = {
      query: sql,
      useLegacySql: false,
      timeoutMs: 10000,
      maxResults: 10000
    };

    if (queryParameters.length) {
      request.parameterMode = "NAMED";
      request.queryParameters = queryParameters;
    }

    let respuesta = BigQuery.Jobs.query(request, Config.BIGQUERY.PROJECT_ID);

    if (!respuesta.jobReference) {
      return respuesta.rows || [];
    }

    const jobId = respuesta.jobReference.jobId;
    const location = respuesta.jobReference.location || Config.BIGQUERY.LOCATION;

    while (!respuesta.jobComplete) {
      Utilities.sleep(250);
      respuesta = BigQuery.Jobs.getQueryResults(
        Config.BIGQUERY.PROJECT_ID,
        jobId,
        { location: location, maxResults: 10000 }
      );
    }

    const filas = (respuesta.rows || []).slice();
    let pageToken = respuesta.pageToken;

    while (pageToken) {
      const pagina = BigQuery.Jobs.getQueryResults(
        Config.BIGQUERY.PROJECT_ID,
        jobId,
        { location: location, maxResults: 10000, pageToken: pageToken }
      );

      if (pagina.rows) filas.push.apply(filas, pagina.rows);
      pageToken = pagina.pageToken;
    }

    return filas;
  }

  static parametroString(nombre, valor) {
    return {
      name: nombre,
      parameterType: { type: "STRING" },
      parameterValue: { value: String(valor || "") }
    };
  }
}
