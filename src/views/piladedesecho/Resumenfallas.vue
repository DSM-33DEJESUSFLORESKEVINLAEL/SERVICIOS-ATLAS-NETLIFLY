<template>
  <div v-if="loading" class="loading-overlay">
    <div class="loading-message">🔄 Procesando... Por favor espera</div>
  </div>

  <div class="button-container">
    <button class="export-btn" @click="exportToPDF">Exportar a PDF</button>
    <button class="close-btn" @click="closeView">Cerrar</button>
  </div>
  <div class="container" ref="pdfContent">
    <div class="header">
      <div class="header-left">
        <img src="@/assets/atlas.png" alt="Logo" class="logo" />
        <div class="title">
          <h1>LLANTERA ATLAS, SA DE CV</h1>
          <h2>RESUMEN DE LLANTAS DESECHADAS</h2>
          <!-- <p>DEL {{ formatDate(fechaDesde) }} AL {{ formatDate(fechaHasta) }}</p> -->
                     <p>DEL {{ formatDate(fechaDesde) }} AL {{ formatDate(fechaHasta) }}</p>
        </div>
      </div>
      <div class="folio">
        <p>Folio</p>
        <p class="folio-number">{{ this.folio }}</p>
      </div>
    </div>
    <div class="info">
      <p><span>Empresa:</span> {{ nombreempresa }}</p>
      <p><span>Base:</span>{{ baseglobal }}</p>
      <p><span>Realizado por </span> {{ nombreusuario }}</p>

    </div>
    
    <div v-if="!loading && dataFallaResumen.length === 0" class="error-message">
      ⚠️ No se encontraron datos para el folio seleccionado.
    </div>

    <div class="total-llantas">
      <strong>Total llantas: </strong>{{ dataCantidadResumen && dataCantidadResumen.length > 0 ?
        dataCantidadResumen[0].CANTIDAD : 0 }}
    </div>
    <div class="charts-container">
      <h3>CAUSA DE FALLA</h3>
      <canvas id="fallaChart"></canvas>
      <h3>RESPONSABILIDAD</h3>
      <canvas id="responsabilidadChart"></canvas>
    </div>
    <p class="print-date">Fecha y hora de impresión: {{ getCurrentDateTime() }}</p>
  </div>
</template>


<script>
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import apiService from "@/services/apiService";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default {
  props: {
    folio: { type: String, required: true },
    base: { type: String, required: true, default: "" }
    // 🔴 Quitamos fechaDesde y fechaHasta de props porque vendrán por query
  },

  data() {
    return {
      reportDataResumen: [],
      reportData: [],
      nombreempresa: "",
      nombreusuario: "",
      baseglobal: this.base || "",
      desmontajeinmediato: "",
      desmantajeproxdesde: "",
      desmontajeproxhasta: "",
      buenascondiciones: "",
      pdfFileName: `Reporte_Resumen_fallas_${this.folio}`,
      urlGenerada: "",
      errorMessage: "",
      loading: false,
      fallaChart: null,
      responsabilidadChart: null,
      dataFallaResumen: [],
      dataFallaAreaResumen: [],
      dataCantidadResumen: [],
      fechaDesde: "",  // 🔵 fechas se guardan aquí ahora
      fechaHasta: ""
    };
  },

  created() {
    this.baseglobal = this.base || this.$route.params.base || "";
    // 🔵 Leemos fechas desde query params
    this.fechaDesde = this.$route.query.fechaDesde || "";
    this.fechaHasta = this.$route.query.fechaHasta || "";
  },

  mounted() {
    this.cargarUsuario();
    this.cargarDatosResumen();
  },

  methods: {
    async cargarDatosResumen() {
      this.errorMessage = "";
      this.loading = true;

      try {
        const userData = localStorage.getItem("userData");
        let empresa = "";

        if (userData) {
          const parsedData = JSON.parse(userData);
          empresa = parsedData.EMPRESA;
        }
        const base = this.base;
        const param1 = this.folio;

        const responseFallaResumen = await apiService.fallaResumen(
          empresa,
          base,
          param1
        );
        const responseFallaAreaResumen = await apiService.fallaAreaResumen(
          empresa,
          base,
          param1
        );
        const responseCantidadResumen = await apiService.cantidadResumen(
          empresa,
          base,
          param1
        );

        if (
          responseFallaResumen &&
          responseFallaAreaResumen &&
          responseCantidadResumen
        ) {
          this.dataFallaResumen = responseFallaResumen.DATA || [];
          this.dataFallaAreaResumen = responseFallaAreaResumen.DATA || [];
          this.dataCantidadResumen = responseCantidadResumen.DATA || [];

          this.generarGraficas();
        } else {
          this.errorMessage = "⚠️ No se encontraron todos los datos esperados.";
          this.dataFallaResumen = [];
          this.dataFallaAreaResumen = [];
          this.dataCantidadResumen = [];
        }
      } catch (error) {
        console.error("❌ Error en cargarDatosResumen:", error);
        this.errorMessage = "❌ Ocurrió un error al obtener los datos del resumen.";
      } finally {
        this.loading = false;
      }
    },

    generarGraficas() {
      if (this.fallaChart) this.fallaChart.destroy();
      if (this.responsabilidadChart) this.responsabilidadChart.destroy();

      const ctxFalla = document.getElementById("fallaChart").getContext("2d");
      this.fallaChart = new Chart(ctxFalla, {
        type: "bar",
        data: {
          labels: this.dataFallaResumen.map((item) => item.DESCRIPCION),
          datasets: [
            {
              label: "Cantidad",
              data: this.dataFallaResumen.map((item) => parseInt(item.CANTIDAD)),
              backgroundColor: "rgba(54, 162, 235, 0.7)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1
            }
          ]
        },
        options: {
          devicePixelRatio: 3,
          indexAxis: "x",
          scales: { y: { ticks: { color: "#000" } } }
        }
      });

      const ctxResponsabilidad = document
        .getElementById("responsabilidadChart")
        .getContext("2d");
      this.responsabilidadChart = new Chart(ctxResponsabilidad, {
        type: "bar",
        data: {
          labels: this.dataFallaAreaResumen.map((item) => item.AREA),
          datasets: [
            {
              label: "Cantidad",
              data: this.dataFallaAreaResumen.map((item) => parseInt(item.CANTIDAD)),
              backgroundColor: "rgba(255, 159, 64, 0.7)",
              borderColor: "rgba(255, 159, 64, 1)",
              borderWidth: 1
            }
          ]
        }
      });
    },

    cargarUsuario() {
      const userData = localStorage.getItem("userData");
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          this.nombreempresa = parsedData.NOMBREEMPRESA || "N/A";
          this.nombreusuario = parsedData.NOMBREUSUARIO || "N/A";
        } catch (error) {
          this.errorMessage = "❌ No se pudieron cargar los datos de usuario.";
        }
      }
    },

formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // ✅ solo +1
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
},



getCurrentDateTime() {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0"); // ✅ también aquí solo +1
  const year = now.getFullYear();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
},
    exportToPDF() {
      const fileName = prompt(
        "Ingrese el nombre del archivo PDF:",
        this.pdfFileName
      );
      if (!fileName) return;

      this.loading = true;
      this.$nextTick(() => {
        const element = this.$refs.pdfContent;
        if (!element) return;

        html2canvas(element, { scale: 5, useCORS: true })
          .then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const imgWidth = 210;
            const pageHeight = 297;
            let imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 10;

            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
              position = heightLeft - imgHeight + 20;
              pdf.addPage();
              pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
              heightLeft -= pageHeight;
            }

            pdf.save(fileName + ".pdf");
          })
          .catch((error) => {
            console.error("❌ Error al generar PDF:", error);
          })
          .finally(() => {
            this.loading = false;
          });
      });
    },

    closeView() {
      this.$router.go(-1);
    }
  }
};
</script>


<style scoped>
/* .container {
  width: 100%;
  max-width: 1300px;
  margin: auto;
  background: #ffffff;
  color: rgb(0, 0, 0);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
} */
.container {
  width: 100%;
  max-width: 1300px;
  margin: auto;
  background: #f5f7fa;
  /* 🔵 Un gris-azul muy claro */
  color: #000000;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #000000;
  padding-bottom: 25px;
  margin-bottom: 10px;
}

.folio-number {
  color: #000000;
  font-size: 16px;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  width: 110px;
  height: auto;
  margin-right: 10px;
}

.title h1,
.title h2 {
  margin: 0;
  color: #000000;

}

.folio {
  text-align: center;
  border: 2px solid #050505;
  padding: 25px;
  border-radius: 5px;
}

.folio p {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
}

.folio-number {
  color: #000000;
  font-size: 16px;
}

.info {
  display: flex;
  justify-content: space-between;
  background: #2a4a7b;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 30px;
}

.info p {
  margin: 0;
  font-size: 15px;
  color: #ffffff;

}

.info span {
  font-weight: bold;
  color: #fdcc07;
}



.button-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.export-btn,
.close-btn {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

.export-btn {
  background-color: #fdcc07;
  color: black;
}

.close-btn {
  background-color: red;
  color: white;
}



.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-message {
  background-color: #ffffff;
  color: #333;
  padding: 20px 40px;
  border-radius: 10px;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}



.error-message {
  background-color: #ffdddd;
  color: #d8000c;
  border: 1px solid #d8000c;
  padding: 10px;
  margin: 20px 0;
  text-align: center;
  border-radius: 5px;
  font-weight: bold;
}

.total-llantas {
  font-size: 18px;
  text-align: left;
  margin: 20px 0;
  color: #000;
}
</style>