// ======================================================
// DRIVESERVICE.JS
// Integración técnica con Google Drive.
// ======================================================
class DriveService {
  static carpetaRaiz(){const id=PropertiesService.getScriptProperties().getProperty("DRIVE_ROOT_FOLDER_ID");if(!id)throw new Error("Falta DRIVE_ROOT_FOLDER_ID.");return DriveApp.getFolderById(id);}
  static carpetaObra(codigo){const root=this.carpetaRaiz();const sup=this._sub(root,"Supervisiones");return this._sub(sup,codigo);}
  static _sub(parent,nombre){const it=parent.getFoldersByName(nombre);return it.hasNext()?it.next():parent.createFolder(nombre);}
}
