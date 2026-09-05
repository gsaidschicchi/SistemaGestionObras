// ======================================================
// QA_ENTORNO.JS
// Entorno aislado de pruebas. Solo crea/elimina recursos TEST_.
// ======================================================
class QA_Entorno {
  static get PREFIJO(){ return "TEST_"; }
  static get PROP_DRIVE_ID(){ return "QA_TEST_ROOT_FOLDER_ID"; }

  static preparar(){
    this.limpiar();
    this.crearHoja("TEST_ROLES",Config.HEADERS.ROLES);
    const carpeta=this.crearCarpetaDrive();
    Logger.log(`[QA] Entorno preparado. Carpeta Drive=${carpeta.getName()} (${carpeta.getId()})`);
    return {hojas:["TEST_ROLES"],driveFolderId:carpeta.getId()};
  }

  static crearHoja(nombre,headers){
    this._validarNombre(nombre);
    const ss=DataSourceSheets.obtenerSpreadsheet();
    const previa=ss.getSheetByName(nombre);
    if(previa) ss.deleteSheet(previa);
    const h=ss.insertSheet(nombre);
    if(!DataSourceSheets._hojas) DataSourceSheets._hojas={};
    DataSourceSheets._hojas[nombre]=h;
    h.getRange(1,1,1,headers.length).setValues([headers]);
    return h;
  }

  static cargarRoles(rows){
    const h=DataSourceSheets.obtenerSpreadsheet().getSheetByName("TEST_ROLES");
    if(!h) throw new Error("No existe TEST_ROLES. Ejecutá QA_Entorno.preparar().");
    if(h.getLastRow()>1) h.getRange(2,1,h.getLastRow()-1,h.getLastColumn()).clearContent();
    if(rows&&rows.length) h.getRange(2,1,rows.length,4).setValues(rows);
  }

  static crearCarpetaDrive(){
    const root=DriveService.carpetaRaiz();
    const nombre=`TEST_QA_SPRINT2_${Utilities.formatDate(new Date(),Session.getScriptTimeZone(),"yyyyMMdd_HHmmss")}`;
    const carpeta=root.createFolder(nombre);
    PropertiesService.getScriptProperties().setProperty(this.PROP_DRIVE_ID,carpeta.getId());
    return carpeta;
  }

  static carpetaDrive(){
    const id=PropertiesService.getScriptProperties().getProperty(this.PROP_DRIVE_ID);
    return id?DriveApp.getFolderById(id):null;
  }

  static limpiar(){
    const ss=DataSourceSheets.obtenerSpreadsheet();
    ss.getSheets().filter(h=>h.getName().startsWith(this.PREFIJO)).forEach(h=>ss.deleteSheet(h));
    if(DataSourceSheets._hojas) Object.keys(DataSourceSheets._hojas).filter(n=>n.startsWith(this.PREFIJO)).forEach(n=>delete DataSourceSheets._hojas[n]);
    this._limpiarDrive();
    Logger.log("[QA] Limpieza terminada: hojas TEST_ y carpeta Drive QA eliminadas.");
  }

  static verificarLimpieza(){
    const ss=DataSourceSheets.obtenerSpreadsheet();
    const hojas=ss.getSheets().map(h=>h.getName()).filter(n=>n.startsWith(this.PREFIJO));
    const id=PropertiesService.getScriptProperties().getProperty(this.PROP_DRIVE_ID);
    if(hojas.length||id) throw new Error(`Limpieza incompleta. Hojas=${hojas.join(",")||"ninguna"}; DriveId=${id||"ninguno"}`);
    return "Sin hojas TEST_ ni carpeta Drive QA registrada.";
  }

  static _limpiarDrive(){
    const props=PropertiesService.getScriptProperties();
    const id=props.getProperty(this.PROP_DRIVE_ID);
    if(!id) return;
    try{
      const carpeta=DriveApp.getFolderById(id);
      const root=DriveService.carpetaRaiz();
      const nombre=carpeta.getName();
      const padres=carpeta.getParents();
      let dentroRaiz=false;
      while(padres.hasNext()) if(padres.next().getId()===root.getId()) dentroRaiz=true;
      if(!nombre.startsWith("TEST_QA_SPRINT2_")||!dentroRaiz) throw new Error("Protección QA: la carpeta no cumple las condiciones seguras de eliminación.");
      carpeta.setTrashed(true);
      props.deleteProperty(this.PROP_DRIVE_ID);
    }catch(e){
      Logger.log(`[QA][ERROR LIMPIEZA DRIVE] ${e.message}`);
      throw e;
    }
  }

  static _validarNombre(nombre){if(!String(nombre||"").startsWith(this.PREFIJO))throw new Error("Protección QA: solo se permiten hojas con prefijo TEST_.");}
}

function QA_limpiarEntornoPruebas(){
  QA_Entorno.limpiar();
  return QA_Entorno.verificarLimpieza();
}
