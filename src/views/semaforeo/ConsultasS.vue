<template>
  <NavBar />
  <div class="home-container">
    <h1>Consultas De Semaforeo</h1>
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
          <label>
            Desde:
            <input type="date" v-model="filters.desde" class="large-input" />
          </label>
          <label>
            Hasta:
            <input type="date" v-model="filters.hasta" class="large-input" />
          </label>
          <!-- <label>
            Base:
            
            <select v-model="filters.baseinput" class="large-input">
              <option disabled value="">Seleccione una base</option>
              <option v-for="(item, index) in basesUsuario" :key="index" :value="item.BASE">
                {{ item.BASE }}
              </option>
            </select>

          </label> -->
          <label>
            Base:
            <select v-model="filters.baseinput"  :disabled="basesUsuario.length === 1" class="large-input">
              <option v-if="basesUsuario.length > 1" value=""></option>

              <option v-for="(item, index) in basesUsuario" :key="index" :value="item.BASE">
                {{ item.BASE }}
              </option>
            </select>
          </label>

        </div>
      </fieldset>
    </div>

    <!-- BOTONES -->
    <div class="buttons">
      <button @click="cargarDatosResumen()">Resumen {{ loading ? "Buscando datos..." : "" }}
      </button>

      <template v-if="habilitarBotones">
        <button @click="irAVerGrafica">Gráfica</button>
        <button @click="irAVerGrafica1">Reporte de Detalle</button>
        <ExportExcel :data="dataCaptura" :abled="!dataCaptura.length" />
        <button @click="cargarDatosCaptura()" :disabled="loading">Captura {{ loading ? "Buscando datos..." : ""
        }}</button>
      </template>
    </div>

    <!-- Mensaje de carga -->
    <p v-if="loading">Cargando datos, por favor espera...</p>

    <!-- TABLA RESUMEN -->

    <div class="table-container" v-if="mostrarTabla === 'resumen' && !loading">
      <table>
        <thead>
          <tr>
            <th>Folio</th>
            <!-- <th>Fecha</th> -->
            <th>Base</th>
            <th>Total Unidades</th>
            <th>Total Llantas</th>
            <th>Unidades Revisadas</th>
            <th>Llantas Revisadas</th>
            <th>Llantas Originales</th>
            <th>Llantas Renovadas</th>
            <th>Buenas Condiciones</th>
            <th>Desmontaje Próximo</th>
            <th>Desmontaje Inmediato</th>
            <th>Cero</th>
            <th>Sin Llanta</th>X
            <th>Unidades No Semaforeada</th>
            <th>Llantas No Semaforeada</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in dataCaptura" :key="index"
            :class="{ seleccionado: item.FOLIO === folioSeleccionado }" @click="seleccionarFolio(item)">

            <td>{{ item.FOLIO }}</td>
            <!-- <td>{{ formatearFecha(item.FECHA) }}</td> -->
            <td>{{ item.BASE }}</td>
            <td>{{ item.TOTAL_UNIDADES }}</td>
            <td>{{ item.TOTAL_LLANTAS }}</td>
            <td>{{ item.NUNIDADES_REVISADAS }}</td>
            <td>{{ item.LLANTAS_REVISADAS }}</td>
            <td>{{ item.LLANTAS_ORIGINALES }}</td>
            <td>{{ item.LLANTAS_RENOVADAS }}</td>
            <td>{{ item.BUENAS_CONDICIONES }}</td>
            <td>{{ item.DESMONTAJE_PROXIMO }}</td>
            <td>{{ item.DESMONTAJE_INMEDIATO }}</td>
            <td>{{ item.CERO }}</td>
            <td>{{ item.SIN_LLANTA }}</td>
            <td>{{ item.NOSEM_UNIDADES }}</td>
            <td>{{ item.NOSEM_LLANTAS }}</td>
          </tr>
        </tbody>
      </table>
    </div>


    <!-- TABLA CAPTURA -->
    <div class="table-container" v-if="mostrarTabla === 'captura' && !loading">
      <table>
        <thead>
          <tr>
            <th>Folio</th>
            <th>Fecha</th>
            <th>Empresa</th>
            <th>Nombre Empresa</th>
            <th>Base</th>
            <th>Operador</th>
            <th>Nombre Operador</th>
            <th>Semana</th>
            <th>Mes</th>
            <th>Registro</th>
            <th>Unidad</th>
            <th>Tipo Unidad</th>
            <th>Medida Dirección</th>
            <th>Medida Trasera</th>
            <th>MM1</th>
            <th>OR1</th>
            <th>DOT1</th>
            <th>TMARCA1</th>
            <th>OBS1</th>
            <th>MM2</th>
            <th>OR2</th>
            <th>DOT2</th>
            <th>TMARCA2</th>
            <th>OBS2</th>
            <th>MM3</th>
            <th>OR3</th>
            <th>DOT3</th>
            <th>TMARCA3</th>
            <th>OBS3</th>
            <th>MM4</th>
            <th>OR4</th>
            <th>DOT4</th>
            <th>TMARCA4</th>
            <th>OBS4</th>
            <th>MM5</th>
            <th>OR5</th>
            <th>DOT5</th>
            <th>TMARCA5</th>
            <th>OBS5</th>
            <th>MM6</th>
            <th>OR6</th>
            <th>DOT7</th>
            <th>TMARCA7</th>
            <th>OBS6</th>
            <th>MM7</th>
            <th>OR7</th>
            <th>DOT7_1</th>
            <th>TMARCA7_1</th>
            <th>OBS7</th>
            <th>MM8</th>
            <th>OR8</th>
            <th>DOT8</th>
            <th>TMARCA8</th>
            <th>OBS8</th>
            <th>ROJO</th>
            <th>AMARILLO</th>
            <th>VERDE</th>
            <th>ORIGINALES</th>
            <th>RENOVADAS</th>
            <th>Num Llantas</th>
            <th>MM Promedio</th>
            <th>MM Suma</th>
            <th>FSistema</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in dataCaptura" :key="index">

            <td>{{ item.FOLIO }}</td>
            <td>{{ formatearFecha(item.FECHA) }}</td>
            <td>{{ item.EMPRESA }}</td>
            <td>{{ item.NOMBRE_EMPRESA }}</td>
            <td>{{ item.BASE }}</td>
            <td>{{ item.OPERADOR }}</td>
            <td>{{ item.NOMBRE_OPERADOR }}</td>
            <td>{{ item.NUM_SEMANA }}</td>
            <td>{{ item.NUM_MES }}</td>
            <td>{{ item.REG }}</td>
            <td>{{ item.UNIDAD }}</td>
            <td>{{ item.TUNIDAD }}</td>
            <td>{{ item.MEDIDA_DIRECCION }}</td>
            <td>{{ item.MEDIDA_TRASERA }}</td>
            <td>{{ item.MM1 }}</td>
            <td>{{ item.OR1 }}</td>
            <td>{{ item.DOT1 }}</td>
            <td>{{ item.TMARCA1 }}</td>
            <td>{{ item.OBS1 }}</td>
            <td>{{ item.MM2 }}</td>
            <td>{{ item.OR2 }}</td>
            <td>{{ item.DOT2 }}</td>
            <td>{{ item.TMARCA2 }}</td>
            <td>{{ item.OBS2 }}</td>
            <td>{{ item.MM3 }}</td>
            <td>{{ item.OR3 }}</td>
            <td>{{ item.DOT3 }}</td>
            <td>{{ item.TMARCA3 }}</td>
            <td>{{ item.OBS3 }}</td>
            <td>{{ item.MM4 }}</td>
            <td>{{ item.OR4 }}</td>
            <td>{{ item.DOT4 }}</td>
            <td>{{ item.TMARCA4 }}</td>
            <td>{{ item.OBS4 }}</td>
            <td>{{ item.MM5 }}</td>
            <td>{{ item.OR5 }}</td>
            <td>{{ item.DOT5 }}</td>
            <td>{{ item.TMARCA5 }}</td>
            <td>{{ item.OBS5 }}</td>
            <td>{{ item.MM6 }}</td>
            <td>{{ item.OR6 }}</td>
            <td>{{ item.DOT7 }}</td>
            <td>{{ item.TMARCA7 }}</td>
            <td>{{ item.OBS6 }}</td>
            <td>{{ item.MM7 }}</td>
            <td>{{ item.OR7 }}</td>
            <td>{{ item.DOT7_1 }}</td>
            <td>{{ item.TMARCA7_1 }}</td>
            <td>{{ item.OBS7 }}</td>
            <td>{{ item.MM8 }}</td>
            <td>{{ item.OR8 }}</td>
            <td>{{ item.DOT8 }}</td>
            <td>{{ item.TMARCA8 }}</td>
            <td>{{ item.OBS8 }}</td>
            <td>{{ item.RETIRO }}</td>
            <td>{{ item.PROX_RETIRO }}</td>
            <td>{{ item.BUENAS }}</td>
            <td>{{ item.ORIGINALES }}</td>
            <td>{{ item.RENOVADAS }}</td>
            <td>{{ item.NUM_LLANTAS }}</td>
            <td>{{ item.MM_PROMEDIO }}</td>
            <td>{{ item.MM_SUMA }}</td>
            <td>{{ formatearFecha(item.FSISTEMA) }}</td>
          </tr>
        </tbody>
      </table>
    </div>


  </div>
</template>


<script>
import { nextTick } from "vue";
import NavBar from "../../components/NavBar.vue";
import apiService from "@/services/apiService";
import ExportExcel from "@/global/ExportExcel.vue";

export default {
  components: { NavBar, ExportExcel },
  data() {
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];
    const primerDiaMes = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString().split('T')[0];

    return {
      filters: {
        desde: localStorage.getItem('fechaDesdeSemaforeo') || primerDiaMes,
        hasta: localStorage.getItem('fechaHastaSemaforeo') || todayFormatted,
        baseinput: localStorage.getItem('baseInputSemaforeo') || "",
        multiEmpresa: false,
        multiBase: false,
      },
      folioSeleccionado: "",
      data: [],
      dataCaptura: [],
      basesUsuario: [],
      habilitarBotones: false,
      mostrarTabla: "resumen",
      loading: false,
      errorMessage: "",
    };
  },

  methods: {

    async buscarResumen() {
      await this.$nextTick();
      this.cargarDatosResumen();
    }
    ,
    formatearFecha(fechaISO) {
      if (!fechaISO) return "";
      const fecha = new Date(fechaISO);
      const dia = fecha.getDate().toString().padStart(2, "0");
      const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
      const anio = fecha.getFullYear();
      return `${dia}/${mes}/${anio}`;
    },

    seleccionarFolio(item) {
      this.folioSeleccionado = item.FOLIO;
      this.baseSeleccionada = item.BASE;
      localStorage.setItem("folioSeleccionado", item.FOLIO);
      localStorage.setItem("baseSeleccionada", item.BASE);
    },

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

    guardarFechasEnLocalStorage() {
      localStorage.setItem('fechaDesdeSemaforeo', this.filters.desde);
      localStorage.setItem('fechaHastaSemaforeo', this.filters.hasta);
    },


    // async cargaBasesxUsuario() {
    //   if (!this.filters.empresa || !this.usuario) return;
    //   try {
    //     const response = await apiService.getcargaBasesxUsuario(
    //       this.filters.empresa,
    //       this.usuario
    //     );
    //     this.basesUsuario = response?.DATA || [];

    //     // 🔄 Si la baseinput no está aún en las opciones, selecciona la primera
    //     const baseActual = this.filters.baseinput;
    //     const basesDisponibles = this.basesUsuario.map(b => b.BASE);

    //     if (!basesDisponibles.includes(baseActual)) {
    //       this.filters.baseinput = basesDisponibles[0] || "";
    //       localStorage.setItem("baseInputSemaforeo", this.filters.baseinput);
    //     }

    //     // Cargar datos directamente si ya hay una base seleccionada
    //     if (this.filters.baseinput) {
    //       this.cargarDatosResumen();
    //     }
    //   } catch (error) {
    //     console.error("Error al obtener bases:", error);
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
          localStorage.setItem("baseInputSemaforeo", "");
          this.habilitarBotones = false;
          return;
        }

        const basesDisponibles = this.basesUsuario.map(b => b.BASE);
        const baseGuardada = this.filters.baseinput; // viene de localStorage o ""

        if (this.basesUsuario.length === 1) {
          // Solo una base -> selección forzada y se deshabilita el select (por template)
          this.filters.baseinput = basesDisponibles[0];
          localStorage.setItem("baseInputSemaforeo", this.filters.baseinput);
        } else {
          // Varias bases -> si la guardada no existe, dejar en blanco
          if (!basesDisponibles.includes(baseGuardada)) {
            this.filters.baseinput = "";
            localStorage.setItem("baseInputSemaforeo", "");
          } 
        }
        // Si ya hay base seleccionada, cargar de una vez
        if (this.filters.baseinput) {
          this.cargarDatosResumen();
        } else {
          // si está en blanco, apaga botones hasta que elijan una
          this.habilitarBotones = false;
        }
      } catch (error) {
        console.error("Error al obtener bases:", error);
        this.errorMessage = "❌ No se pudieron cargar las bases disponibles.";
      }
    }
    ,
    async cargarDatosResumen() {
      this.guardarFechasEnLocalStorage();
      await this.$nextTick();
      this.errorMessage = "";
      this.loading = true;
      try {
        const response = await apiService.ConsultaSemaforeoResumen(
          this.filters.empresa,
          this.filters.base,
          this.filters.baseinput,
          this.convertirFechaParaAPI(this.filters.desde),
          this.convertirFechaParaAPI(this.filters.hasta),
          "1",
          "1"
        );
        if (response?.DATA?.length > 0) {
          this.dataCaptura = response.DATA;
          this.mostrarTabla = "resumen";
          this.habilitarBotones = true;
          localStorage.setItem("datosResumen", JSON.stringify(response.DATA));
        } else {
          this.errorMessage = "⚠️ No se encontraron datos para la consulta.";
          this.dataCaptura = [];
          this.habilitarBotones = false;
          localStorage.removeItem("datosResumen");
        }
      } catch (error) {
        console.error("❌ Error en consulta:", error);
        this.errorMessage = "❌ Ocurrió un error al obtener los datos.";
      } finally {
        this.loading = false;
      }
    },

    async cargarDatosCaptura() {
      this.errorMessage = "";
      this.loading = true;
      try {
        const response = await apiService.ConsultaSemaforeodetalle( 
          this.filters.empresa,
          this.filters.base,
          this.filters.baseinput,
          this.convertirFechaParaAPI(this.filters.desde),
          this.convertirFechaParaAPI(this.filters.hasta),
          this.filters.multiEmpresa ? "1" : "0",
          this.filters.multiBase ? "1" : "1"
        );

        if (response?.DATA?.length > 0) {
          this.dataCaptura = response.DATA;
          await nextTick();
          this.mostrarTabla = "captura";
        } else {
          this.errorMessage = "❌ No se pudieron cargar las bases de usuario.";
          this.dataCaptura = [];
        }
      } catch (error) {
        console.error("❌ Error en consulta de captura:", error);
        this.errorMessage = "❌ Error al obtener los datos de captura.";
      } finally {
        this.loading = false;
      }
    },
    irAVerGrafica() {
      // Guardar fechas antes de navegar
      localStorage.setItem('fechaDesdeSemaforeo', this.filters.desde);
      localStorage.setItem('fechaHastaSemaforeo', this.filters.hasta);
      this.$router.push("/inventario/grafica");
    }
    ,
    irAVerGrafica1() {
      if (!this.folioSeleccionado) {
        alert("Selecciona un folio para ver el reporte de detalle.");
        return;
      }
      this.$router.push({
        name: "Grafica1",
        params: {
          folio: this.folioSeleccionado,
          base: this.baseSeleccionada,
        }
      });
    }
  },
  mounted() {
    this.cargarUsuario();
    this.cargaBasesxUsuario();
    this.filters.multiEmpresa = this.filters.multiEmpresa ?? false;
    this.filters.multiBase = this.filters.multiBase ?? false;
    this.habilitarBotones = false;

    nextTick(() => {
      setTimeout(() => {
        const canvas = document.getElementById("miGrafico");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        // inicialización del gráfico, si es necesario
      }, 500);
    });
  },
  watch: {
    "filters.desde"(newValue) {
      localStorage.setItem('fechaDesdeSemaforeo', newValue);
    },
    "filters.hasta"(newValue) {
      localStorage.setItem('fechaHastaSemaforeo', newValue);
    },
    "filters.baseinput"(newValue) { // NUEVO
      localStorage.setItem('baseInputSemaforeo', newValue || '');
    }
  }
};
</script>

<style scoped>
.home-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(90deg, #fdcc07, #fdcc07);
  text-align: center;
  font-family: 'Poppins', sans-serif; 
  padding: 10px;
}

.form-container {
  background: white;
  padding: 10px;
  border-radius: 20px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.large-input {
  width: 100%;
  padding: 6px;
  font-size: 20px;
}

fieldset {
  border: 2px solid #1e3a5f;
  border-radius: 5px;
  padding: 15px;
}

legend {
  font-size: 18px;
  font-weight: bold;
  color: #1e3a5f;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 50px;
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.buttons button {
  height: 50px;
  padding: 15px 30px;
  font-size: 18px;
  border-radius: 5px;
  border: none;
  background-color: #1e3a5f;
  color: white;
  cursor: pointer;
}

.buttons button:hover {
  background-color: #1e3a5f;
}

/* Estilos para la tabla */
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

.seleccionado {
  background-color: #ffd700 !important;
  color: black;
}

select.large-input {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: white;
  margin: 0;
  padding: 6px;
  font-size: 20px;
}
</style>
