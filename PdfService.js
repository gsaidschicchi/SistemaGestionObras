// ======================================================
// PDFSERVICE.JS
// Composición visual del reporte. No contiene reglas de negocio.
// ======================================================
class PdfService {
  static generar(datos) {
    const doc = DocumentApp.create(`TMP_${datos.nombreArchivo}`);
    const body = doc.getBody();
    body.clear();

    const titulo = body.appendParagraph("REPORTE DE SUPERVISIÓN DE OBRA");
    titulo.setHeading(DocumentApp.ParagraphHeading.HEADING1).setAlignment(DocumentApp.HorizontalAlignment.CENTER);

    body.appendParagraph("");
    this._campo(body, "Obra", datos.obra.CodigoObra);
    this._campo(body, "Contratista", this._mostrar(datos.contratista || "-"));
    this._campo(body, "Familia", this._mostrar(datos.obra.Familia));
    this._campo(body, "Estado", this._mostrar(datos.supervision.Estado));
    body.appendParagraph("");
    this._campo(body, "Inicio", this._fecha(datos.supervision.FechaInicio));
    this._campo(body, "Finalización", this._fecha(datos.supervision.FechaFinalizacion));

    if (String(datos.comentarioGeneral || "").trim()) {
      this._seccion(body, "COMENTARIO GENERAL");
      body.appendParagraph(String(datos.comentarioGeneral).trim());
    }

    this._seccion(body, "OBSERVACIONES");
    if (!datos.observaciones.length) {
      body.appendParagraph("Obra recorrida sin observaciones activas ni fallas registradas.");
    } else {
      datos.observaciones.forEach((item, i) => this._observacion(body, item, i + 1));
    }

    doc.saveAndClose();
    Utilities.sleep(300);
    const archivoDoc = DriveApp.getFileById(doc.getId());
    const pdf = archivoDoc.getAs(MimeType.PDF).setName(datos.nombreArchivo);
    archivoDoc.setTrashed(true);
    return pdf;
  }

  static _observacion(body, item, numero) {
    if (numero > 1) body.appendPageBreak();
    const p = body.appendParagraph(`${String(numero).padStart(2,"0")} — ${item.tipificacion.Descripcion}`);
    p.setHeading(DocumentApp.ParagraphHeading.HEADING2);
    this._campo(body, "Fecha", this._fecha(item.observacion.FechaHora));
    this._campo(body, "Supervisor", item.autor);
    this._campo(body, "Ubicación", item.ubicacion);
    if (String(item.observacion.Comentario || "").trim()) this._campo(body, "Comentario", item.observacion.Comentario);

    if (item.evidencias.length) {
      body.appendParagraph("EVIDENCIA FOTOGRÁFICA").setBold(true);
      this._fotos(body, item.evidencias);
    }
  }

  static _fotos(body, evidencias) {
    for (let i = 0; i < evidencias.length; i += 2) {
      const lote = evidencias.slice(i, i + 2);
      const tabla = body.appendTable([lote.map(() => "")]);
      tabla.setBorderWidth(0);
      lote.forEach((e, idx) => {
        try {
          const blob = DriveApp.getFileById(e.DriveFileId).getBlob();
          const img = tabla.getCell(0, idx).appendImage(blob);
          this._ajustarImagen(img, lote.length === 1 ? 430 : 220, 300);
        } catch (err) {
          tabla.getCell(0, idx).appendParagraph("Evidencia no disponible");
        }
      });
    }
  }

  static _ajustarImagen(img, maxW, maxH) {
    const w = img.getWidth(), h = img.getHeight();
    const escala = Math.min(maxW / w, maxH / h, 1);
    img.setWidth(Math.round(w * escala));
    img.setHeight(Math.round(h * escala));
  }

  static _campo(body, etiqueta, valor) {
    const p = body.appendParagraph("");
    p.appendText(`${etiqueta}: `).setBold(true);
    p.appendText(String(valor == null || valor === "" ? "-" : valor));
  }

  static _seccion(body, titulo) {
    body.appendParagraph("");
    body.appendParagraph(titulo).setHeading(DocumentApp.ParagraphHeading.HEADING2);
  }

  static _fecha(fecha) { return fecha ? Utilities.formatDate(new Date(fecha), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm") : "-"; }
  static _mostrar(v) { return String(v || "-").replace(/_/g, " "); }
}
