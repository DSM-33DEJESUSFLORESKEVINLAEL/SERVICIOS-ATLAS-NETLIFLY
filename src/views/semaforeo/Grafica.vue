<template>
  <div class="report-container">
    <div class="button-container">
      <button class="export-btn" @click="exportarPDF">📄 Exportar a PDF</button>
      <button class="close-btn" @click="cerrar">❌ Cerrar</button>
    </div>
    <div id="reporte" class="reporte">
      <!-- ENCABEZADO -->
      <div class="encabezado">
        <img src="@/assets/atlas.png" alt="Logo" class="logo" />
        <div class="titulo">
          <h2>LLANTERA ATLAS</h2>
          <h3>RESUMEN DE SEMÁFORO</h3>
          <!-- <p>DEL {{ localFilters.desde || "SIN FECHA" }} AL {{ localFilters.hasta || "SIN FECHA" }}</p> -->
          <p>DEL {{ formatoFecha(localFilters.desde) }} AL {{ formatoFecha(localFilters.hasta) }}</p>
        </div>
      </div>

      <!-- DATOS GENERALES -->
      <div class="info">
        <p><strong>Empresa:</strong> {{ empresa }}</p>
        <p><strong>Fecha de impresión:</strong> {{ obtenerFechaActual() }}</p>
      </div>
  <!-- <table v-if="esMesActual" class="tabla-avance"> -->
<table v-if="esMesActual()" class="tabla-avance"> 

  <tbody>
    <tr>
      <td>
        <strong>Número total de días en el mes:</strong> {{ diasDelMes }}
        &nbsp;&nbsp;&nbsp;
        <strong>Día actual:</strong> {{ diaActual }}
        &nbsp;&nbsp;&nbsp;
        <strong>Porcentaje ideal de avance:</strong> {{ calcularAvanceIdeal() }}
      </td>
    </tr>
  </tbody>
</table>




      <!-- TABLA DE DATOS -->
      <table class="tabla">
        <thead>
          <tr>
            <th>No.</th>
            <th>Folio</th>
            <th>Base/Cedis</th>
            <th>Total Unidades</th>
            <th>Total Llantas</th>
            <th>Unidades Revisadas</th>
            <th>Llantas Revisadas</th>
            <th>% Avance</th>
            <th>Verde</th>
            <th>% Verde</th>
            <th>Amarillo</th>
            <th>% Amarillo</th>
            <th>Rojo</th>
            <th>% Rojo</th>
            <th>Negro</th>
            <th>% Negro</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(fila, index) in datosTabla" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ fila.FOLIO }}</td>
            <td>{{ fila.BASE }}</td>
            <td>{{ fila.TOTAL_UNIDADES }}</td>
            <td>{{ fila.TOTAL_LLANTAS }}</td>
            <td>{{ fila.NUNIDADES_REVISADAS }}</td>
            <td>{{ fila.LLANTAS_REVISADAS }}</td>
            <td>{{ calcularPorcentajeAvance(fila.NUNIDADES_REVISADAS, fila.TOTAL_UNIDADES) }}</td>
            <td :class="obtenerClaseColor(fila.BUENAS_CONDICIONES, 'verde')">
              {{ fila.BUENAS_CONDICIONES }}
            </td>
            <td
              :class="obtenerClaseColor(calcularPorcentaje(fila.BUENAS_CONDICIONES, fila.LLANTAS_REVISADAS), 'verde')">
              {{ calcularPorcentaje(fila.BUENAS_CONDICIONES, fila.LLANTAS_REVISADAS) }}
            </td>
            <td :class="obtenerClaseColor(fila.DESMONTAJE_PROXIMO, 'amarillo')">
              {{ fila.DESMONTAJE_PROXIMO }}
            </td>
            <td
              :class="obtenerClaseColor(calcularPorcentaje(fila.DESMONTAJE_PROXIMO, fila.LLANTAS_REVISADAS), 'amarillo')">
              {{ calcularPorcentaje(fila.DESMONTAJE_PROXIMO, fila.LLANTAS_REVISADAS) }}
            </td>
            <td :class="obtenerClaseColor(fila.DESMONTAJE_INMEDIATO, 'rojo')">
              {{ fila.DESMONTAJE_INMEDIATO }}
            </td>
            <td
              :class="obtenerClaseColor(calcularPorcentaje(fila.DESMONTAJE_INMEDIATO, fila.LLANTAS_REVISADAS), 'rojo')">
              {{ calcularPorcentaje(fila.DESMONTAJE_INMEDIATO, fila.LLANTAS_REVISADAS) }}
            </td>
            <td :class="obtenerClaseColor(fila.CERO, 'negro')">
              {{ fila.CERO }}
            </td>
            <td :class="obtenerClaseColor(calcularPorcentaje(fila.CERO, fila.LLANTAS_REVISADAS), 'negro')">
              {{ calcularPorcentaje(fila.CERO, fila.LLANTAS_REVISADAS) }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- GRÁFICO -->
      <div class="grafico-container">
        <canvas id="grafico" width="1600" height="800" style="width: 800px; height: 400px;"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ChartDataLabels from "chartjs-plugin-datalabels";

Chart.register(ChartDataLabels, ...registerables);

export default {
  data() {
    return {
      datosTabla: [],
      empresa: "",
      localFilters: {
        desde: "",
        hasta: "",
      },
      diasDelMes: 30,
      diaActual: new Date().getDate(),
      chart: null,
    };
  },

  mounted() {
  const params = this.$route.query;
  if (params.desde && params.hasta) {
    this.localFilters.desde = this.convertirAFormatoISO(params.desde);
    this.localFilters.hasta = this.convertirAFormatoISO(params.hasta);
  } else {
    this.cargarFechasDesdeLocalStorage();
  }

  // ⚠️ Solo ajusta fechas si vienen vacías
  if (!this.localFilters.desde || !this.localFilters.hasta) {
    this.ajustarFechasAlMesActual();
  }

  this.cargarUsuario();
  this.cargarDatos();
  this.generarGrafico();
},
  methods: {
    cargarFechasDesdeLocalStorage() {
      this.localFilters.desde = localStorage.getItem('fechaDesdeSemaforeo') || '';
      this.localFilters.hasta = localStorage.getItem('fechaHastaSemaforeo') || '';
    },

    calcularPorcentaje(valor, total) {
      if (!total || total === 0) return "0%";
      return ((valor / total) * 100).toFixed(2) + "%";
    },

    calcularPorcentajeAvance(revisadas, total) {
      if (!total || total === 0) return "0%";
      return ((revisadas / total) * 100).toFixed(2) + "%";
    },

    calcularAvanceIdeal() {
      return ((this.diaActual / this.diasDelMes) * 100).toFixed(2) + "%";
    },

    ajustarFechasAlMesActual() {
      const ahora = new Date();
      const mesActual = ahora.getMonth();
      const añoActual = ahora.getFullYear();

      let fechaDesde = new Date(this.localFilters.desde);
      let fechaHasta = new Date(this.localFilters.hasta);

      if (
        isNaN(fechaDesde) || isNaN(fechaHasta) ||
        fechaDesde.getMonth() !== mesActual || fechaDesde.getFullYear() !== añoActual ||
        fechaHasta.getMonth() !== mesActual || fechaHasta.getFullYear() !== añoActual
      ) {
        const ultimoDia = new Date(añoActual, mesActual + 1, 0).getDate();
        this.localFilters.desde = `${añoActual}-${String(mesActual + 1).padStart(2, "0")}-01`;
        this.localFilters.hasta = `${añoActual}-${String(mesActual + 1).padStart(2, "0")}-${ultimoDia}`;
        localStorage.setItem('fechaDesdeSemaforeo', this.localFilters.desde);
        localStorage.setItem('fechaHastaSemaforeo', this.localFilters.hasta);
      }
    },

    cargarUsuario() {
      const userData = localStorage.getItem("userData");
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          this.empresa = parsedData.NOMBREEMPRESA || "No definida";
        } catch (error) {
          console.error("Error al parsear datos de usuario:", error);
        }
      }
    },

    cargarDatos() {
      const datosGuardados = localStorage.getItem("datosResumen");
      if (datosGuardados) {
        this.datosTabla = JSON.parse(datosGuardados);
      }
    },

    generarGrafico() {
      const ctx = document.getElementById("grafico");
      if (this.chart) this.chart.destroy();

      this.chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Verde", "Amarillo", "Rojo", "Negro", "Sin Llanta"],
          datasets: [
            {
              label: "Cantidad",
              data: this.obtenerTotalesGrafico(),
              backgroundColor: ["green", "yellow", "red", "black", "gray"],
            },
          ],
        },
        options: { responsive: false, maintainAspectRatio: false }
      });
    },

    obtenerTotalesGrafico() {
      if (!this.datosTabla.length) return [0, 0, 0, 0, 0];
      return [
        this.datosTabla.reduce((sum, item) => sum + (parseInt(item.BUENAS_CONDICIONES) || 0), 0),
        this.datosTabla.reduce((sum, item) => sum + (parseInt(item.DESMONTAJE_PROXIMO) || 0), 0),
        this.datosTabla.reduce((sum, item) => sum + (parseInt(item.DESMONTAJE_INMEDIATO) || 0), 0),
        this.datosTabla.reduce((sum, item) => sum + (parseInt(item.CERO) || 0), 0),
        this.datosTabla.reduce((sum, item) => sum + (parseInt(item.SIN_LLANTA) || 0), 0),
      ];
    },

    exportarPDF() {
      const elemento = document.getElementById("reporte");
      html2canvas(elemento).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF();
        pdf.addImage(imgData, "PNG", 0, 0, 210, 297); // tamaño carta
        pdf.save("reporte_semaforo.pdf");
      });
    },


cerrar() {
  // O bien navegas a una ruta anterior
  this.$router.back();
  
  // O emites un evento si este componente es hijo en un modal
  // this.$emit('close');
},
    formatoFecha(fecha) {
      if (!fecha) return "SIN FECHA";
      const [year, month, day] = fecha.split("-");
      return `${day}/${month}/${year}`;
    },

    obtenerFechaActual() {
      return new Date().toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    obtenerClaseColor(valor, tipo) {
      switch (tipo) {
        case "verde":
          return "bg-verde";
        case "amarillo":
          return "bg-amarillo";
        case "rojo":
          return "bg-rojo";
        case "negro":
          return "bg-negro";
        default:
          return "";
      }
    },

    esMesActual() {
      const ahora = new Date();
      const mesActual = ahora.getMonth();
      const anioActual = ahora.getFullYear();

      // Parsear fechas con año, mes y día numéricos para evitar GMT offset
      const desdeParts = this.localFilters.desde.split("-");
      const hastaParts = this.localFilters.hasta.split("-");

      const desde = new Date(
        Number(desdeParts[0]), 
        Number(desdeParts[1]) - 1, 
        Number(desdeParts[2])
      );

      const hasta = new Date(
        Number(hastaParts[0]), 
        Number(hastaParts[1]) - 1, 
        Number(hastaParts[2])
      );

      return (
        desde.getFullYear() === anioActual &&
        hasta.getFullYear() === anioActual &&
        desde.getMonth() === mesActual &&
        hasta.getMonth() === mesActual
      );
    },

    convertirAFormatoISO(fecha) {
      if (!fecha) return '';
      const partes = fecha.includes('/') ? fecha.split('/') : fecha.split('-');
      if (partes.length !== 3) return '';
      let year, month, day;

      if (fecha.includes('-') && partes[0].length === 4) {
        return fecha;
      }

      if (partes[2].length === 4) {
        day = partes[0].padStart(2, '0');
        month = partes[1].padStart(2, '0');
        year = partes[2];
      } else {
        month = partes[0].padStart(2, '0');
        day = partes[1].padStart(2, '0');
        year = partes[2];
      }

      return `${year}-${month}-${day}`;
    }
  },
};
</script>
<style scoped>
/* Contenedor de botones */
.button-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

/* Botones Exportar y Cerrar */
.export-btn,
.close-btn {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  /* font-weight: bold; */
  transition: all 0.3s ease-in-out;
}

/* Exportar */
.export-btn {
  background-color: #fdcc07;
  color: black;
}
.export-btn:hover {
  background-color: #e6b800;
}

/* Cerrar */
.close-btn {
  background-color: red;
  color: white;
}
.close-btn:hover {
  background-color: #c82333;
}

/* Estilo General */
.report-container {
  width: 100%;
  max-width: 1000px;
  margin: auto;
  padding: 20px;
  background: #fdfdfd;
  border-radius: 10px;
  font-family: "Arial", sans-serif;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1);
}

/* Encabezado */
.encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 4px solid #1c3b72;
  padding-bottom: 15px;
}

.logo {
  width: 200px;
  height: auto;
}

.titulo {
  text-align: center;
  flex-grow: 1;
}

.titulo h2 {
  font-size: 24px;
  color: #1c3b72;
  font-weight: bold;
  margin-bottom: 5px;
}

.titulo h3 {
  font-size: 18px;
  color: #525252;
  font-weight: normal;
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

/* Información General */
.info {
  margin: 15px 0;
  text-align: left;
  font-size: 14px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 5px;
  border-left: 6px solid #1c3b72;
}

/* Tabla de datos */
.tabla {
  width: 90%;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 9px;
  text-align: center;
}

.tabla th {
  background: #1c3b72;
  color: white;
  padding: 12px;
  border: 1px solid #ccc;
  font-weight: bold;
}

.tabla td {
  padding: 10px;
  border: 1px solid #ddd;
}

.tabla tr:nth-child(even) {
  background: #f8f9fa;
}

.tabla tr:hover {
  background: #e9ecef;
}

/* Colores por tipo */
.bg-verde {
  background-color: #28a745 !important;
  color: white !important;
  font-weight: bold;
}

.bg-amarillo {
  background-color: #ffc107 !important;
  color: black !important;
  font-weight: bold;
}

.bg-rojo {
  background-color: #dc3545 !important;
  color: white !important;
  font-weight: bold;
}

.bg-negro {
  background-color: #343a40 !important;
  color: white !important;
  font-weight: bold;
}

/* Gráfico */
.grafico-container {
  width: 100%;
  height: auto;
  margin-top: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: #f1f3f5;
  border-radius: 8px;
}

canvas {
  max-width: 90%;
  height: auto;
}

/* Pie de página */
.pie-pagina {
  margin-top: 20px;
  text-align: center;
  font-size: 12px;
  color: #666;
  padding-top: 10px;
  border-top: 2px solid #1c3b72;
}

/* Diseño responsivo */
@media screen and (max-width: 768px) {
  .encabezado {
    flex-direction: column;
    text-align: center;
  }

  .logo {
    margin-bottom: 10px;
  }

  .tabla th,
  .tabla td {
    font-size: 11px;
    padding: 8px;
  }

  .grafico-container {
    padding: 10px;
  }

  .tabla-avance {
    width: 100%;
    margin: 20px 0;
    border-collapse: collapse;
    background-color: #e3f2fd;
    border: 2px solid #1c3b72;
    border-radius: 14px;
    font-size: 14px;
  }

  .tabla-avance td {
    padding: 10px;
    border-right: 1px solid #ccc;
    text-align: center;
    font-weight: bold;
    color: #333;
  }

  .tabla-avance td:last-child {
    border-right: none;
  }

  .tabla-resumen {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
    border: 1px solid #1c3b72;
    font-size: 14px;
  }

  .tabla-resumen td {
    background-color: #eafbea;
    padding: 8px 15px;
    font-weight: bold;
    color: #333;
    text-align: left;
  }
}
</style>

<!-- <style scoped>


.btn-cerrar {
  background: linear-gradient(45deg, #dc3545, #a71d2a); /* Rojo */
  color: white;
}

.btn-cerrar:hover {
  background: linear-gradient(45deg, #c82333, #93121f); /* Rojo más oscuro al hover */
}

/* Estilo General */
.report-container {
  width: 100%;
  max-width: 1000px;
  margin: auto;
  padding: 20px;
  background: #fdfdfd;
  border-radius: 10px;
  font-family: "Arial", sans-serif;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1);
}

/* Botón de exportación */
button {
  padding: 12px 20px;
  background: linear-gradient(45deg, #1c3b72, #4675b9);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  border-radius: 5px;
  transition: all 0.3s ease-in-out;
}

button:hover {
  background: linear-gradient(45deg, #162d56, #3a6398);
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
  font-weight: bold;
  transition: all 0.3s ease-in-out;
}

.export-btn {
  background-color: #fdcc07;
  color: black;
}

.export-btn:hover {
  background-color: #e6b800;
}

.close-btn {
  background-color: red;
  color: white;
}

.close-btn:hover {
  background-color: #c82333;
}


/* Encabezado */
.encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 4px solid #1c3b72;
  padding-bottom: 15px;
}

.logo {
  width: 200px;
  height: auto;
}

.titulo {
  text-align: center;
  flex-grow: 1;
}

.titulo h2 {
  font-size: 24px;
  color: #1c3b72;
  font-weight: bold;
  margin-bottom: 5px;
}

.titulo h3 {
  font-size: 18px;
  color: #525252;
  font-weight: normal;
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

/* Información General */
.info {
  margin: 15px 0;
  text-align: left;
  font-size: 14px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 5px;
  border-left: 6px solid #1c3b72;
}

/* Tabla de datos */
.tabla {
  width: 90%;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 9px;
  text-align: center;
}

.tabla th {
  background: #1c3b72;
  color: white;
  padding: 12px;
  border: 1px solid #ccc;
  font-weight: bold;
}

.tabla td {
  padding: 10px;
  border: 1px solid #ddd;
}

.tabla tr:nth-child(even) {
  background: #f8f9fa;
}

.tabla tr:hover {
  background: #e9ecef;
}

/* Estilos de colores empresariales */
.bg-verde {
  background-color: #28a745 !important;
  color: white !important;
  font-weight: bold;
}

.bg-amarillo {
  background-color: #ffc107 !important;
  color: black !important;
  font-weight: bold;
}

.bg-rojo {
  background-color: #dc3545 !important;
  color: white !important;
  font-weight: bold;
}

.bg-negro {
  background-color: #343a40 !important;
  color: white !important;
  font-weight: bold;
}

/* Gráfico */
.grafico-container {
  width: 100%;
  height: auto;
  margin-top: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: #f1f3f5;
  border-radius: 8px;
}

canvas {
  max-width: 90%;
  height: auto;
}

/* Pie de página */
.pie-pagina {
  margin-top: 20px;
  text-align: center;
  font-size: 12px;
  color: #666;
  padding-top: 10px;
  border-top: 2px solid #1c3b72;
}

/* Diseño responsivo */
@media screen and (max-width: 768px) {
  .encabezado {
    flex-direction: column;
    text-align: center;
  }

  .logo {
    margin-bottom: 10px;
  }

  .tabla th,
  .tabla td {
    font-size: 11px;
    padding: 8px;
  }

  .grafico-container {
    padding: 10px;
  }

  /* Tabla de resumen tipo avance */
  .tabla-avance {
    width: 100%;
    margin: 20px 0;
    border-collapse: collapse;
    background-color: #e3f2fd;
    border: 2px solid #1c3b72;
    border-radius: 14px;
    font-size: 14px;
  }

  .tabla-avance td {
    padding: 10px;
    border-right: 1px solid #ccc;
    text-align: center;
    font-weight: bold;
    color: #333;
  }

  .tabla-avance td:last-child {
    border-right: none;
  }

  .tabla-resumen {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
    border: 1px solid #1c3b72;
    font-size: 14px;
  }

  .tabla-resumen td {
    background-color: #eafbea;
    /* verde muy claro */
    padding: 8px 15px;
    font-weight: bold;
    color: #333;
    text-align: left;
  }
}
</style> -->
