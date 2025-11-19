<template>
  <NavBar />
  <div class="home-container">
    <h1>Bitácora de Taller</h1>

    <!-- Mensaje de Error -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    <!-- MENSAJE DE CARGA -->
    <div v-if="loading" class="loading-message">
      ⏳ Buscando datos en la base de datos, por favor espere...
    </div>


    <!-- FORMULARIO DE FILTROS -->
    <div class="form-container">
      <fieldset>
        <legend>Filtros de búsqueda</legend>
        <div class="filters">
          <div class="filter-row">
            <label>Desde:
              <input type="date" v-model="filters.desde" class="compact-input" />
            </label>
            <label>Hasta:
              <input type="date" v-model="filters.hasta" class="compact-input" />
            </label>
            <!-- <label>
            Base:
            <select v-model="filters.baseinput" class="compact-input">
               <option value=""></option> 
              <option v-for="(item, index) in basesUsuario" :key="index" :value="item.BASE">
                {{ item.BASE }}
              </option>
            </select>
          </label> -->
            <label>
              Base:
              <select v-model="filters.baseinput" class="compact-input" :disabled="basesUsuario.length === 1">
                <!-- Opción en blanco SOLO cuando hay 2+ bases -->
                <option v-if="basesUsuario.length > 1" value=""></option>

                <option v-for="(item, index) in basesUsuario" :key="index" :value="item.BASE">
                  {{ item.BASE }}
                </option>
              </select>
            </label>

          </div>
        </div>
      </fieldset>
    </div>

    <!-- BOTONES -->
    <div class="buttons">
      <button @click="cargarDatosconsultaBitacoraTaller">Consultar {{ loading ? "Buscando datos..." : "" }}
      </button>
      <ExportExcel :data="data" :abled="!data.length" />
      <button @click="cargarDatospdf()">
        {{ loading ? "Buscando datos..." : "Imprimir PDF" }}
      </button>
    </div>

    <!-- NÚMERO DE REGISTROS -->
    <p class="registro-info">
      Número de registros: <strong>{{ totalRegistros }}</strong>
    </p>
    <!-- TABLA -->
    <div class="table-container" v-if="mostrarTabla === 'resumen' && !loading">
      <table>
        <thead>
          <tr>
            <th>Base</th>
            <th>Folio</th>
            <th>Posición</th>
            <th>Unidad</th>
            <th>MM Anterior</th>
            <th>OR Anterior</th>
            <th>Marca Anterior</th>
            <th>DOT Anterior</th>
            <th>Observación Anterior</th>
            <th>MM Actual</th>
            <th>OR Actual</th>
            <th>Fecha Taller Actual</th>
            <th>Marca Actual</th>
            <th>DOT Actual</th>
            <th>Causa Cambio</th>
            <th>Quemado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in data" :key="index">
            <td>{{ item.BASE }}</td>
            <td>{{ item.FOLIO }}</td>
            <td>{{ item.POSICION }}</td>
            <td>{{ item.UNIDAD }}</td>
            <td>{{ item.MM_ANTERIOR }}</td>
            <td>{{ item.OR_ANTERIOR }}</td>
            <td>{{ item.TMARCA_ANTERIOR }}</td>
            <td>{{ item.DOT_ANTERIOR }}</td>
            <td>{{ item.OBS_ANTERIOR }}</td>
            <td>{{ item.MM_ACTUAL }}</td>
            <td>{{ item.OR_ACTUAL }}</td>
            <td>{{ formatearFecha(item.FTALLER_ACTUAL) }}</td>
            <td>{{ item.TMARCA_ACTUAL }}</td>
            <td>{{ item.DOT_ACTUAL }}</td>
            <td>{{ item.CAUSA_CAMBIO }}</td>
            <td>{{ item.QUEMADO }}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script>
import NavBar from "../../components/NavBar.vue";
import apiService from "@/services/apiService";
import ExportExcel from "@/global/ExportExcel.vue";

export default {
  components: { NavBar, ExportExcel },

  data() {
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];
    const primerDiaMes = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];

    return {
      filters: {
        desde: localStorage.getItem('fechaDesdeBitacoraTaller') || primerDiaMes,
        hasta: localStorage.getItem('fechaHastaBitacoraTaller') || todayFormatted,
        // baseinput: "",
        baseinput: localStorage.getItem('baseInputBitacoraTaller') || '',
        multiEmpresa: false,
        multiBase: false,
      },
      data: [],
      totalRegistros: 0, // Contador de registros
      dataCaptura: [],
      basesUsuario: [],
      habilitarBotones: false,
      mostrarTabla: "bitacora",
      loading: false, // 🔹 Agregado para evitar errores

    };
  },
  methods: {
    formatearFecha(fechaISO) {
      if (!fechaISO) return "";
      const fecha = new Date(fechaISO);
      const dia = fecha.getDate().toString().padStart(2, "0");
      const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
      const anio = fecha.getFullYear();
      return `${dia}/${mes}/${anio}`;
    },
    // 🟢 Convierte fechas ISO a formato compatible con API (número de días desde 30/12/1899)
    convertirFechaParaAPI(isoDate) {
      if (!isoDate) return "0";
      const baseDate = new Date("1899-12-30");
      const targetDate = new Date(isoDate);
      return Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));
    },

    cargarUsuario() {
      const userData = localStorage.getItem("userData");
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          this.filters.empresa = parsedData.EMPRESA || "";
          this.usuario = parsedData.USUARIO || "";
          this.filters.base = parsedData.BASE || "";
        } catch (error) {
          console.error("Error al parsear datos de usuario:", error);
        }
      }
    },
    cargarDatospdf() {
      if (!this.data.length) {
        alert("⚠️ No hay datos para generar el PDF.");
        return;
      }

      const jsonString = JSON.stringify(this.data);
      const encodedData = btoa(jsonString); // Codifica los datos en Base64

      this.$router.push({
        path: `/semaforeo/bitacora-taller-pdf/${encodedData}`
      });
    },


    // async cargaBasesxUsuario() {
    //   if (!this.filters.empresa || !this.usuario) return;

    //   try {
    //     const response = await apiService.getcargaBasesxUsuario(
    //       this.filters.empresa,
    //       this.usuario
    //     );

    //     this.basesUsuario = response?.DATA || [];

    //     if (this.basesUsuario.length === 0) {
    //       this.errorMessage = "⚠️ No se encontraron bases disponibles para el usuario.";
    //       this.filters.baseinput = ""; // Limpiar base seleccionada
    //       return;
    //     }

    //     const baseActual = this.filters.baseinput;
    //     const basesDisponibles = this.basesUsuario.map(b => b.BASE);

    //     if (!basesDisponibles.includes(baseActual)) {
    //       this.filters.baseinput = basesDisponibles[0]; // Asignar primera base válida
    //       localStorage.setItem("baseInputBitacoraTaller", this.filters.baseinput);
    //     }

    //     // Si ya hay base válida, puedes cargar datos automáticamente si lo deseas
    //     // this.cargarDatosconsultaBitacoraTaller();
    //   } catch (error) {
    //     console.error("❌ Error al obtener bases:", error);
    //     this.errorMessage = "❌ No se pudieron cargar las bases de usuario.";
    //   }
    // },
    async cargaBasesxUsuario() {
  if (!this.filters.empresa || !this.usuario) return;

  try {
    const response = await apiService.getcargaBasesxUsuario(
      this.filters.empresa,
      this.usuario
    );

    this.basesUsuario = response?.DATA || [];

    if (this.basesUsuario.length === 0) {
      this.errorMessage = "⚠️ No se encontraron bases disponibles para el usuario.";
      this.filters.baseinput = "";
      localStorage.setItem("baseInputBitacoraTaller", "");
      return;
    }

    const basesDisponibles = this.basesUsuario.map(b => b.BASE);
    const baseGuardada = this.filters.baseinput; // localStorage o ''

    if (this.basesUsuario.length === 1) {
      // Solo una base → selección forzada
      this.filters.baseinput = basesDisponibles[0];
      localStorage.setItem("baseInputBitacoraTaller", this.filters.baseinput);
    } else {
      // Varias → si la guardada no existe, dejar en blanco
      if (!basesDisponibles.includes(baseGuardada)) {
        this.filters.baseinput = "";
        localStorage.setItem("baseInputBitacoraTaller", "");
      }
    }

    // Si ya hay base seleccionada, puedes cargar automáticamente:
    // if (this.filters.baseinput) this.cargarDatosconsultaBitacoraTaller();

  } catch (error) {
    console.error("❌ Error al obtener bases:", error);
    this.errorMessage = "❌ No se pudieron cargar las bases de usuario.";
  }
},

    async cargarDatosconsultaBitacoraTaller() {
      try {
        this.errorMessage = ""; // 🔹 Limpiar error antes de la consulta
        this.loading = true;

        const response = await apiService.ConsultaBitacoraTaller(
          this.filters.empresa,
          this.filters.base,
          this.filters.baseinput,
          this.convertirFechaParaAPI(this.filters.desde),
          this.convertirFechaParaAPI(this.filters.hasta),
          this.filters.multiEmpresa ? "1" : "0", // 🔹 Convierte a "true"/"false"
          this.filters.multiBase ? "1" : "1" // 🔹 Convierte a "true"/"false"
        );

        if (response?.DATA) {
          this.data = response.DATA;
          this.totalRegistros = response.DATA.length; // ✅ Contar registros
          this.mostrarTabla = "resumen";
        } else {
          this.data = [];
          this.totalRegistros = 0; // ✅ Si no hay datos, mostrar 0
          this.errorMessage = "⚠️ No se encontraron datos para la consulta.";

        }
      } catch (error) {
        console.error("❌ Error al obtener bitácora de taller:", error);
        this.errorMessage = "❌ No se pudieron cargar las bitácora de taller";

        this.totalRegistros = 0;
      } finally {
        this.loading = false; // Ocultar mensaje de carga
      }
    },
  },
  mounted() {
    this.cargarUsuario();
    this.cargaBasesxUsuario();

    if (!localStorage.getItem('fechaDesdeBitacoraTaller')) {
      this.filters.desde = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ).toISOString().split('T')[0];
    }
    if (!localStorage.getItem('fechaHastaBitacoraTaller')) {
      this.filters.hasta = new Date().toISOString().split('T')[0];
    }
  },
  watch: {
    'filters.desde'(newVal) {
      localStorage.setItem('fechaDesdeBitacoraTaller', newVal || '');
    },
    'filters.hasta'(newVal) {
      localStorage.setItem('fechaHastaBitacoraTaller', newVal || '');
    },
    'filters.baseinput'(newVal) {
      localStorage.setItem('baseInputBitacoraTaller', newVal || '');
    }
  },


};
</script>

<style scoped>
/* Contenedor principal */
.home-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(90deg, #fdcc07, #fdcc07);
  text-align: center;
  font-family: 'Poppins', sans-serif; 
  padding: 10px;
}

/* Estilos del formulario */
.form-container {
  background: white;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
}

/* Diseño más compacto */
.filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 5px;
  /* Menos espacio entre elementos */
  align-items: center;
}

/* Inputs más compactos */
.compact-input {
  width: 140px;
  /* Tamaño más compacto */
  padding: 4px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.filter-row label {
  display: flex;
  flex-direction: column;
  font-size: 16px;
  font-weight: bold;
}

/* Alinear mejor los filtros */
.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  /* Reducir espacio entre los filtros */
  align-items: center;
}

/* Espaciado de los filtros */
fieldset {
  border: 3px solid #1e3a5f;
  padding: 5px;
  margin-bottom: 10px;
  border-radius: 5px;
}

legend {
  font-size: 20px;
  font-weight: bold;
  color: #1e3a5f;
}



.filter-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

/* Botones */
.buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 15px;
}

.buttons button {
  height: 45px;
  padding: 10px 15px;
  font-size: 16px;
  border-radius: 5px;
  border: none;
  background-color: #1e3a5f;
  color: white;
  cursor: pointer;
}

.buttons button:hover {
  background-color: #1e3a5f;
}

/* Estilo para mostrar los registros */
.registro-info {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 15px;
}

/* Tabla */
.table-container {
  overflow-x: auto;
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-family: "Poppins", sans-serif;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

/* Encabezados de tabla */
th {
  background-color: #1e3a5f;
  /* Azul oscuro */
  color: white;
  padding: 12px;
  text-align: left;
  font-size: 16px;
  font-weight: bold;
}

/* Filas de la tabla */
td {
  border: 1px solid #ddd;
  padding: 10px;
  font-size: 14px;
  color: #333;
}

/* Alternar colores en las filas */
tr:nth-child(even) {
  background-color: #f2f2f2;
  /* Gris claro */
}

tr:nth-child(odd) {
  background-color: #ffffff;
  /* Blanco */
}

/* Efecto hover en filas */
tr:hover {
  background-color: #ffd700;
  /* Amarillo dorado */
  cursor: pointer;
}

/* Bordes redondeados para las primeras y últimas celdas de la tabla */
th:first-child,
td:first-child {
  border-left: none;
}

th:last-child,
td:last-child {
  border-right: none;
}

/* Ajuste para dispositivos móviles */
@media (max-width: 768px) {
  table {
    font-size: 12px;
  }

  th,
  td {
    padding: 8px;
  }
}

.error-message {
  background-color: #ffdddd;
  color: #d8000c;
  border: 1px solid #d8000c;
  padding: 10px;
  margin: 10px 0;
  text-align: center;
  border-radius: 5px;
  font-weight: bold;
}

/* Mensaje de carga */
.loading-message {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #856404;
  padding: 10px;
  margin: 10px 0;
  text-align: center;
  border-radius: 5px;
  font-weight: bold;
}
</style>
