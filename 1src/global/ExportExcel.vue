<template>
  <button class="export-button" @click="exportToExcel">
    📤 Exportar a Excel
  </button>
</template>

<script>
import * as XLSX from "xlsx";

export default {
  props: {
    data: { type: Array, required: true },
  },
  methods: {
    exportToExcel() {
      if (!this.data.length) {
        console.warn("⚠️ No hay datos para exportar.");
        return;
      }

      const userFileName = prompt("Ingrese el nombre del archivo:");
      if (!userFileName) return;

      // 🔄 Formatear campos antes de exportar
      const dataFormateada = this.data.map((row) => {
        const newRow = { ...row };
        Object.keys(newRow).forEach((key) => {
          const upperKey = key.toUpperCase();

          // ✅ Formatear fechas
          if (
            upperKey.includes("FECHA") ||
            upperKey.includes("FSISTEMAS") ||
            upperKey.includes("FSISTEMA") ||
            upperKey.includes("FTALLER_ACTUAL") ||
            upperKey.includes("FSEMAFOREO")
          ) {
            newRow[key] = this.formatearFecha(newRow[key]);
          }

          // 🎯 Cambiar nombres de columnas
          if (upperKey === "RETIRO") {
            newRow.ROJO = newRow[key]; // crea columna ROJO
            delete newRow[key]; // elimina la columna original
          }
          if (upperKey === "PROX_RETIRO") {
            newRow.AMARILLO = newRow[key]; // crea columna AMARILLO
            delete newRow[key];
          }
          if (upperKey === "BUENAS") {
            newRow.VERDE = newRow[key]; // crea columna VERDE
            delete newRow[key];
          }
        });
        return newRow;
      });

      const ws = XLSX.utils.json_to_sheet(dataFormateada);
      XLSX.utils.sheet_add_aoa(ws, [Object.keys(dataFormateada[0])], { origin: "A1" });

      ws["!cols"] = Object.keys(dataFormateada[0]).map(() => ({ wch: 20 }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Datos");
      XLSX.writeFile(wb, `${userFileName}.xlsx`);

      console.log(`✅ Archivo Excel "${userFileName}.xlsx" generado.`);
    },

    formatearFecha(fechaISO) {
      if (!fechaISO) return "";
      const fecha = new Date(fechaISO);
      const dia = fecha.getDate().toString().padStart(2, "0");
      const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
      const anio = fecha.getFullYear();

      const horas = fecha.getHours().toString().padStart(2, "0");
      const minutos = fecha.getMinutes().toString().padStart(2, "0");
      const segundos = fecha.getSeconds().toString().padStart(2, "0");

      return `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
    },
  },
};
</script>

<style scoped>
.export-button {
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.export-button:hover {
  background-color: #45a049;
}
</style>
