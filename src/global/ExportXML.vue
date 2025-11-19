<template>
  <button class="export-button xml-button" @click="exportToXML">
    📄 Exportar a XML
  </button>
</template>

<script>
import * as js2xmlparser from "js2xmlparser";

export default {
  props: {
    data: { type: Array, required: true },
  },
  methods: {
    exportToXML() {
      if (!this.data.length) {
        console.warn("⚠️ No hay datos para exportar.");
        return;
      }

      // Solicitar nombre del archivo al usuario
      const userFileName = prompt("Ingrese el nombre del archivo:", "Lista_Facturas");
      if (!userFileName) return;

      try {
        const xmlObject = { registros: { registro: this.data } };
        const xmlData = js2xmlparser.parse("Facturas", xmlObject);

        const blob = new Blob([xmlData], { type: "application/xml" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${userFileName}.xml`;
        a.click();
        URL.revokeObjectURL(a.href);

        console.log(`✅ Archivo XML "${userFileName}.xml" generado.`);
      } catch (error) {
        console.error("🚨 Error al generar XML:", error);
      }
    },
  },
};
</script>

<style scoped>
.xml-button {
  background-color: #ff9800;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}
.xml-button:hover {
  background-color: #e68900;
}
</style>
