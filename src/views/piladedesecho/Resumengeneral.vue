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
          <p>DEL {{ (fechaDesde) }} AL {{(fechaHasta) }}</p>
          <!-- <p>DEL {{ formatDate(fechaDesde) }} AL {{ formatDate(fechaHasta) }}</p> -->

        </div>
      </div>
      <div class="folio">
        <p>Folio</p>
        <p class="folio-number">{{ this.folio }}</p>
      </div>
    </div>
    <div class="info">
      <p><span>Empresa:</span> {{ nombreempresa }}</p>
      <!-- <p><span>Base:</span> {{ reportData.length > 0 ? reportData[0].BASE : '' }}</p> -->
      <p><span>Base:</span>{{ baseglobal }}</p>
      <p><span>Realizado por </span> {{ nombreusuario }}</p>
      <p><span>Total de llantas:</span> {{ totalLlantasMarca }}</p>
    </div>
    <div v-if="!loading && dataResumen.length === 0" class="error-message">
      ⚠️ No se encontraron datos para el folio seleccionado.
    </div>
    <div class="charts-container">
      <h3>MARCA</h3>
      <canvas id="marcaChart"></canvas>

      <h3>MEDIDA</h3>
      <canvas id="medidaChart"></canvas>

      <h3>ESTADO DEL CASCO</h3>
      <canvas id="orirenChart"></canvas>

      <h3>AÑO DE FABRICACIÓN</h3>
      <canvas id="anioChart"></canvas>

      <h3>PISO REMANENTE</h3>
      <canvas id="pisoChart"></canvas>
    </div>

    <p class="print-date">Fecha y hora de impresión: {{ getCurrentDateTime() }}</p>
  </div>
</template>

<script>
import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
import apiService from "@/services/apiService";
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables, ChartDataLabels);

export default {
  props: {
    folio: {
      type: String,
      required: true
    },
    base: {
      type: String,
      required: true,
      default: ''
    }
  },

  data() {
    return {
      reportDataResumen: [],
      reportData: [],
      nombreempresa: "",
      nombreusuario: "",
      baseglobal: this.base || "",
      pdfFileName: `Reporte_DE_LLANTAS_${this.folio}`,
      urlGenerada: "",
      errorMessage: "",
      loading: false,
      // 🔵 NUEVO: fechas que vienen por query
      fechaDesde: "",
      fechaHasta: "",

      dataResumen: [],  // Marca
      dataResumen1: [], // Medida
      dataResumen2: [], // Oriren
      dataResumen3: [], // Piso Remanente
      dataResumen4: [], // Año
      dataResumen5: [], // Total llantas
      marcaChart: null,
      medidaChart: null,
      orirenChart: null,
      pisoChart: null,
      anioChart: null,
    };
  },

  computed: {
    totalLlantasMarca() {
      return this.dataResumen.reduce(
        (suma, item) => suma + parseInt(item.CANTIDAD || 0), 0
      );
    }
    
  },

  created() {
    this.baseglobal = this.base || this.$route.params.base || "";
    // 🔵 Obtén fechas desde query params
    this.fechaDesde = this.$route.query.fechaDesde || "";
    this.fechaHasta = this.$route.query.fechaHasta || "";
  console.log('💡 fechas recibidas:', this.fechaDesde, this.fechaHasta); // Para depuración

    const datos = this.$route.params.data;
    if (datos) {
      this.reportData = JSON.parse(atob(datos));
      this.reportDataResumen = this.agruparPorBase(this.reportData);
    }
  },

  mounted() {
    this.cargarUsuario();
    this.cargarDatosGeneralResumen();
  },

  methods: {
   generarGraficas() {
  // Destruir gráficas anteriores si existen
  if (this.marcaChart) this.marcaChart.destroy();
  if (this.medidaChart) this.medidaChart.destroy();
  if (this.orirenChart) this.orirenChart.destroy();
  if (this.pisoChart) this.pisoChart.destroy();
  if (this.anioChart) this.anioChart.destroy();

  // Gráfica MARCA
  const ctxMarca = document.getElementById('marcaChart').getContext('2d');
  this.marcaChart = new Chart(ctxMarca, {
  type: 'bar',
  data: {
    labels: this.dataResumen.map(item => item.MARCA),
    datasets: [{
      label: 'Cantidad',
      data: this.dataResumen.map(item => parseInt(item.CANTIDAD)),
      backgroundColor: 'rgba(54, 162, 235, 0.7)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 3
    }]
  },
  options: {
    devicePixelRatio: 3,
    scales: {
      y: { ticks: { color: '#000', font: { size: 18 } }, grid: { color: '#d9e1ec' } },
      x: { ticks: { color: '#000', font: { size: 18 } }, grid: { color: '#d9e1ec' } }
    },
    plugins: {
      legend: { labels: { color: '#000', font: { size: 18 } } },
      tooltip: { backgroundColor: '#f5f7fa', titleColor: '#000', bodyColor: '#000' },
      datalabels: {
        color: '#000',
        anchor: 'center',    // CENTRADO en la barra
        align: 'center',     // CENTRADO en la barra
        font: {
          weight: 'bold',
          size: 18            // 🔵 TAMAÑO DEL NÚMERO
        }
      }
    }
  },
  plugins: [ChartDataLabels] // 🔥 Esto hace que se use
});

  // Gráfica MEDIDA (horizontal)
  const ctxMedida = document.getElementById('medidaChart').getContext('2d');
  this.medidaChart = new Chart(ctxMedida, {
    type: 'bar',
    data: {
      labels: this.dataResumen1.map(item => item.MEDIDA),
      datasets: [{
        label: 'Cantidad',
        data: this.dataResumen1.map(item => parseInt(item.CANTIDAD)),
        backgroundColor: 'rgba(0, 128, 0, 0.7)',
        borderColor: 'rgba(0, 128, 0, 1)',
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',  // 👈 Horizontal
      devicePixelRatio: 3,
      scales: {
        x: { ticks: { color: '#000', font: { size: 18 } }, grid: { color: '#d9e1ec' } },
        y: { ticks: { color: '#000', font: { size: 18 } }, grid: { color: '#d9e1ec' } }
      },
      plugins: {
      legend: { labels: { color: '#000', font: { size: 18 } } },
      tooltip: { backgroundColor: '#f5f7fa', titleColor: '#000', bodyColor: '#000' },
      datalabels: {
        color: '#000',
        anchor: 'center',    // CENTRADO en la barra
        align: 'center',     // CENTRADO en la barra
        font: {
          weight: 'bold',
          size: 18            // 🔵 TAMAÑO DEL NÚMERO
        }
      }
    }
  },
  plugins: [ChartDataLabels] // 🔥 Esto hace que se use
  });

  // Gráfica ESTADO DEL CASCO
  const ctxOriren = document.getElementById('orirenChart').getContext('2d');
  this.orirenChart = new Chart(ctxOriren, {
    type: 'bar',
    data: {
      labels: this.dataResumen2.map(item => item.ORIREN),
      datasets: [{
        label: 'Cantidad',
        data: this.dataResumen2.map(item => parseInt(item.CANTIDAD)),
        backgroundColor: 'rgba(30, 144, 255, 0.7)',
        borderColor: 'rgba(30, 144, 255, 1)',
        borderWidth: 1
      }]
    },
    options: {
      devicePixelRatio: 3,
      scales: {
        y: { ticks: { color: '#000', font: { size: 18 } }, grid: { color: '#d9e1ec' } },
        x: { ticks: { color: '#000', font: { size: 18 } }, grid: { color: '#d9e1ec' } }
      },
      plugins: {
      legend: { labels: { color: '#000', font: { size: 18 } } },
      tooltip: { backgroundColor: '#f5f7fa', titleColor: '#000', bodyColor: '#000' },
      datalabels: {
        color: '#000',
        anchor: 'center',    // CENTRADO en la barra
        align: 'center',     // CENTRADO en la barra
        font: {
          weight: 'bold',
          size: 18            // 🔵 TAMAÑO DEL NÚMERO
        }
      }
    }
  },
  plugins: [ChartDataLabels] // 🔥 Esto hace que se use
  });

  // Gráfica PISO REMANENTE
  const ctxPiso = document.getElementById('pisoChart').getContext('2d');
  this.pisoChart = new Chart(ctxPiso, {
    type: 'bar',
    data: {
      labels: this.dataResumen3.map(item => item.PISO_REMANENTE),
      datasets: [{
        label: 'Cantidad',
        data: this.dataResumen3.map(item => parseInt(item.CANTIDAD)),
        backgroundColor: 'rgba(255, 206, 86, 0.7)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1
      }]
    },
    options: {
      devicePixelRatio: 3,
      scales: {
        y: { ticks: { color: '#000', font: { size: 18 } }, grid: { color: '#d9e1ec' } },
        x: { ticks: { color: '#000', font: { size: 18 } }, grid: { color: '#d9e1ec' } }
      },
      plugins: {
      legend: { labels: { color: '#000', font: { size: 18 } } },
      tooltip: { backgroundColor: '#f5f7fa', titleColor: '#000', bodyColor: '#000' },
      datalabels: {
        color: '#000',
        anchor: 'center',    // CENTRADO en la barra
        align: 'center',     // CENTRADO en la barra
        font: {
          weight: 'bold',
          size: 18            // 🔵 TAMAÑO DEL NÚMERO
        }
      }
    }
  },
  plugins: [ChartDataLabels] // 🔥 Esto hace que se use
  });

  // Gráfica AÑO DE FABRICACIÓN
  const ctxAnio = document.getElementById('anioChart').getContext('2d');
  this.anioChart = new Chart(ctxAnio, {
    type: 'bar',
    data: {
      labels: this.dataResumen4.map(item => item.ANIO),
      datasets: [{
        label: 'Cantidad',
        data: this.dataResumen4.map(item => parseInt(item.CANTIDAD)),
        backgroundColor: 'rgba(0, 255, 255, 0.7)',
        borderColor: 'rgba(0, 255, 255, 1)',
        borderWidth: 1
      }]
    },
    options: {
      devicePixelRatio: 3,
      scales: {
        y: { ticks: { color: '#000', font: { size: 18 } }, grid: { color: '#d9e1ec' } },
        x: { ticks: { color: '#000', font: { size: 18 } }, grid: { color: '#d9e1ec' } }
      },
      plugins: {
      legend: { labels: { color: '#000', font: { size: 18 } } },
      tooltip: { backgroundColor: '#f5f7fa', titleColor: '#000', bodyColor: '#000' },
      datalabels: {
        color: '#000',
        anchor: 'center',    // CENTRADO en la barra
        align: 'center',     // CENTRADO en la barra
        font: {
          weight: 'bold',
          size: 18            // 🔵 TAMAÑO DEL NÚMERO
        }
      }
    }
  },
  plugins: [ChartDataLabels] // 🔥 Esto hace que se use
  });
},

    async cargarDatosGeneralResumen() {
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

        const responseResumen = await apiService.marcaResumenGeneral(
          empresa,
          base,
          param1
        );
        const responseResumen1 = await apiService.medidaResumenGeneral(
          empresa,
          base,
          param1
        );
        const responseResumen2 = await apiService.orirenResumenGeneral(
          empresa,
          base,
          param1
        );
        const responseResumen3 = await apiService.pisoResumenGeneral(
          empresa,
          base,
          param1
        );
        const responseResumen4 = await apiService.anioResumenGeneral(
          empresa,
          base,
          param1
        );
        const responseResumen5 = await apiService.CantidadResumenGeneral(
          empresa,
          base,
          param1
        );

        if (
          responseResumen &&
          responseResumen1 &&
          responseResumen2 &&
          responseResumen3 &&
          responseResumen4 &&
          responseResumen5
        ) {
          this.dataResumen = responseResumen.DATA || [];
          this.dataResumen1 = responseResumen1.DATA || [];
          this.dataResumen2 = responseResumen2.DATA || [];
          this.dataResumen3 = responseResumen3.DATA || [];
          this.dataResumen4 = responseResumen4.DATA || [];
          this.dataResumen5 = responseResumen5.DATA || [];

          this.generarGraficas();
        } else {
          this.errorMessage = "⚠️ No se encontraron todos los datos esperados.";
        }
      } catch (error) {
        this.errorMessage = "❌ Ocurrió un error al obtener los datos del resumen.";
      } finally {
        this.loading = false;
      }
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
  const date = new Date(dateString); // dateString es tipo YYYY-MM-DD
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); 
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
,

    getCurrentDateTime() {
      const now = new Date();
      const day = now.getDate().toString().padStart(2, "0");
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      const year = now.getFullYear();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    },

    closeView() {
      this.$router.go(-1);
    },

    exportToPDF() {
  const fileName = prompt("Ingrese el nombre del archivo PDF:", this.pdfFileName);
  if (!fileName) {
    alert("⚠️ Debe ingresar un nombre para el archivo PDF.");
    return;
  }

  this.loading = true;

  this.$nextTick(async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    let positionY = margin;

    // 🔵 LOGO
    const logo = new Image();
    logo.src = require('@/assets/atlas.png');
    await new Promise(resolve => { logo.onload = resolve; });

    pdf.addImage(logo, 'PNG', margin, positionY, 30, 25); // Logo pequeño
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('LLANTERA ATLAS, SA DE CV', pageWidth / 2, positionY + 10, { align: 'center' });

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text('RESUMEN DE LLANTAS DESECHADAS', pageWidth / 2, positionY + 18, { align: 'center' });

    // 🔵 FOLIO
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.rect(pageWidth - 50, positionY, 40, 15); // Cuadro de folio
    pdf.text('Folio', pageWidth - 30, positionY + 5, { align: 'center' });
    pdf.setFont('helvetica', 'bold');
    pdf.text(this.folio || '-', pageWidth - 30, positionY + 12, { align: 'center' });

    positionY += 30; // bajar después del encabezado

    // 🔵 EMPRESA - BASE - REALIZADO POR
    pdf.setFillColor(42, 74, 123); // azul fuerte
    pdf.rect(margin, positionY, pageWidth - margin * 2, 15, 'F');

    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');

    const col1X = margin + 5;
    const col2X = pageWidth / 2;
    const col3X = pageWidth - margin - 5;
    const textY = positionY + 10;

    pdf.text(`Empresa: ${this.nombreempresa || '-'}`, col1X, textY);
    pdf.text(`Base: ${this.baseglobal || '-'}`, col2X, textY, { align: 'center' });
    pdf.text(`Realizado por: ${this.nombreusuario || '-'}`, col3X, textY, { align: 'right' });

    positionY += 25; // dejar espacio después del header completo

    // 🔵 Secciones con gráficas
    const sections = [
      { title: 'MARCA', canvasId: 'marcaChart' },
      { title: 'MEDIDA', canvasId: 'medidaChart' },
      { title: 'ESTADO DEL CASCO', canvasId: 'orirenChart' },
      { title: 'AÑO DE FABRICACIÓN', canvasId: 'anioChart' },
      { title: 'PISO REMANENTE', canvasId: 'pisoChart' }
    ];

    for (const section of sections) {
      const canvas = document.getElementById(section.canvasId);
      if (!canvas) continue;

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const spaceNeeded = 10 + imgHeight + 10; // espacio para título + imagen + margen

      // 🛑 Validar si cabe el título + gráfica
      if (positionY + spaceNeeded > pageHeight - margin) {
        pdf.addPage();
        positionY = margin;
      }

      // 🔵 Título
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(section.title, pageWidth / 2, positionY, { align: 'center' });

      positionY += 10;

      // 🔵 Imagen de gráfica
      pdf.addImage(imgData, 'PNG', margin, positionY, imgWidth, imgHeight);

      positionY += imgHeight + 10;
    }

    // 🔵 Pie de página
    if (positionY > pageHeight - 20) {
      pdf.addPage();
      positionY = margin;
    }
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Fecha y hora de impresión: ${this.getCurrentDateTime()}`, margin, pageHeight - 10);

    pdf.save(fileName + '.pdf');
    this.loading = false;
  });
},



   
  }
};
</script> 

<style scoped>
.container {
  width: 100%;
  max-width: 1300px;
  margin: auto;
  background: #ffffff;
  /* Azul oscuro */
  color: rgb(0, 0, 0);
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
.titulo p {
  font-size: 14px;
  font-weight: bold;
  color: #525252;
  margin-top: 5px;
  background: #e3f2fd;
  padding: 5px 10px;
  border-radius: 5px;
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

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background: rgb(0, 0, 0);
  color: rgb(8, 8, 8);
  border-radius: 8px;
  overflow: hidden;
}

/* td {
    text-align: center;
    font-size: 12px;
    padding: 3px;
  } */
td {
  text-align: center;
  font-size: 11px;
  padding: 4px;
  white-space: nowrap;
}

thead th {
  background-color: #1e3a5f;
  color: white;
  font-size: 13px;
}


tr:nth-child(even) {
  background-color: #f2f2f2;
}

tr:nth-child(odd) {
  background-color: #ffffff;
}

tr:hover {
  background-color: #fdcc07;
  cursor: pointer;
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

/* --------------------------------------------------------------- */
.resumen-container {
  display: flex;
  justify-content: start;
  gap: 10px;
  margin-bottom: 15px;
  font-size: 13px;
  font-weight: bold;
}

.resumen-box {
  border: 1px solid black;
  padding: 5px 10px;
  text-align: center;
  border-radius: 4px;
  width: 90px;
}

.sin-llanta {
  background-color: #00f0ff;
}

.cero {
  background-color: black;
  color: white;
}

.rojas {
  background-color: red;
  color: white;
}

.amarillas {
  background-color: yellow;
}

.buenas {
  background-color: #3CB371;
  color: white;
}

.originales {
  background-color: white;
  border: 1px solid #999;
}

.renovadas {
  background-color: #f8f8ff;
  color: blue;
  border: 1px solid #999;
}

.sin-llanta {
  background-color: #00f0ff;
  /* Azul cielo */
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
</style>