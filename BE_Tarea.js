// ======================================================
// BE_TAREA.JS
// Entidad operativa de tarea. Solo datos fuente.
// ======================================================
class BE_Tarea {
  constructor(ticket, obra, estadoEjecucionEC, estadoSupervision, estadoMaterialesCRM, ultimaEC) {
    this.Ticket = String(ticket || "").trim();
    this.Obra = String(obra || "").trim();
    this.EstadoEjecucionEC = String(estadoEjecucionEC || "").trim();
    this.EstadoSupervision = String(estadoSupervision || "").trim();
    this.EstadoMaterialesCRM = String(estadoMaterialesCRM || "").trim();
    this.UltimaEC = String(ultimaEC || "").trim();
  }
}
