<template>
  <button class="export-button pdf-button" @click="exportToPDF">
    📕 Exportar a PDF
  </button>
</template>

<script>
import jsPDF from "jspdf";
import "jspdf-autotable";

export default {
  props: {
    data: { type: Array, required: true },
  },
  methods: {
    exportToPDF() {
      if (!this.data.length) {
        console.warn("⚠️ No hay datos para exportar.");
        return;
      }

      // Solicitar nombre del archivo al usuario
      const userFileName = prompt("Ingrese el nombre del archivo:");
      if (!userFileName) return;

      const doc = new jsPDF({
        orientation: "landscape", // Cambiamos la orientación a horizontal
        unit: "mm",
        format: "a4",
      });

      doc.text("Reporte de Datos", 14, 10);

      // Convertir los datos a formato de tabla
      const headers = [Object.keys(this.data[0])];

      // Convertimos cada objeto en una fila
      const rows = this.data.map((item) => Object.values(item));

      doc.autoTable({
        head: headers,
        body: rows,
        startY: 20,
        theme: "striped",
        styles: {
          fontSize: 8, // Reducimos el tamaño de la fuente
          overflow: "linebreak", // Permitir saltos de línea en los textos largos
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [255, 192, 0], // Fondo amarillo
          textColor: [0, 0, 0], // Texto negro
          fontSize: 10, // Tamaño de fuente del encabezado
          halign: "center",
        },
        columnStyles: {
          0: { cellWidth: 20 }, // Ancho de la primera columna
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 },
          6: { cellWidth: 30 },
          7: { cellWidth: 40 },
        },
      });

      doc.save(`${userFileName}.pdf`);
      console.log(`✅ Archivo PDF "${userFileName}.pdf" generado.`);
    },
  },
};
</script>

<style scoped>
.pdf-button {
  background-color: #f44336;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}
.pdf-button:hover {
  background-color: #d32f2f;
}
</style>
