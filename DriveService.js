// ======================================================
// DRIVESERVICE.JS
// Integración técnica con Google Drive.
// ======================================================
class DriveService {
  static carpetaRaiz() {
    const props = PropertiesService.getScriptProperties();
    const id = props.getProperty("DRIVE_ROOT_FOLDER_ID");
    if (id) return DriveApp.getFolderById(id);

    const nombre = "Sistema Gestión y Supervisión de Obras";
    const existentes = DriveApp.getFoldersByName(nombre);
    const carpeta = existentes.hasNext() ? existentes.next() : DriveApp.createFolder(nombre);
    props.setProperty("DRIVE_ROOT_FOLDER_ID", carpeta.getId());
    return carpeta;
  }

  static carpetaObra(codigo) {
    const root = this.carpetaRaiz();
    const sup = this._sub(root, "Supervisiones");
    return this._sub(sup, codigo);
  }

  static guardarArchivoObra(codigoObra, blob, nombreArchivo) {
    const archivo = this.carpetaObra(codigoObra).createFile(blob.setName(nombreArchivo));
    return archivo;
  }

  static eliminarArchivo(fileId) {
    if (!fileId) return;
    try {
      DriveApp.getFileById(fileId).setTrashed(true);
    } catch (e) {
      console.error(`[DRIVE] No se pudo eliminar archivo compensatorio ${fileId}: ${e.message}`);
    }
  }

  static _sub(parent, nombre) {
    const it = parent.getFoldersByName(nombre);
    return it.hasNext() ? it.next() : parent.createFolder(nombre);
  }
}
