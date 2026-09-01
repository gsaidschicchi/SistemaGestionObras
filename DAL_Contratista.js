// ======================================================
// DAL_CONTRATISTA.JS
// Persistencia física de CONTRATISTAS. Sin reglas de negocio.
// ======================================================
class DAL_Contratista {
  static buscarPorId(id) {
    return DAL_Base.buscarPrimero(Config.HOJAS.CONTRATISTAS, 4, f => String(f[0]) === String(id));
  }

  static buscarPorLocalizador(localizador) {
    const x = String(localizador || "").trim().toUpperCase();
    return DAL_Base.buscarPrimero(
      Config.HOJAS.CONTRATISTAS,
      4,
      f => String(f[1] || "").trim().toUpperCase() === x
    );
  }

  static listar() { return DAL_Base.filas(Config.HOJAS.CONTRATISTAS, 4); }
  static insertar(f) { return DAL_Base.insertar(Config.HOJAS.CONTRATISTAS, f); }
  static actualizar(n, f) { DAL_Base.actualizar(Config.HOJAS.CONTRATISTAS, n, f); }
}
