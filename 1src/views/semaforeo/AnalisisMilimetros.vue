<template>
  <NavBar />
  <div class="home-container">
    <h1>Análisis Milímetros</h1>

    <!-- Mensaje de Error -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    <!-- MENSAJE DE CARGA -->
    <div v-if="loading" class="loading-message">
      ⏳ Buscando datos en la base de datos, por favor espere...
    </div>

    <!-- FORMULARIO DE FILTROS -->
    <div class="form-container full-width">
      <fieldset>
        <legend>Filtros de búsqueda</legend>
        <div class="filters">
          <div class="filter-row">
            <label>Desde: <input type="date" v-model="filters.desde" class="large-input" /></label>
            <label>Hasta: <input type="date" v-model="filters.hasta" class="large-input" /></label>
            <!-- <label>
              Base:
              <select v-model="filters.baseinput" class="large-input">
                 <option value="TODAS"></option> 
                <option v-for="(item, index) in basesUsuario" :key="index" :value="item.BASE">
                  {{ item.BASE }}
                </option>
              </select>
            </label> -->
            <label>
              Base:
              <select v-model="filters.baseinput" class="large-input" :disabled="basesUsuario.length === 1">
                <!-- Opción en blanco SOLO si hay 2+ bases -->
                <option v-if="basesUsuario.length > 1" value=""></option>

                <option v-for="(item, index) in basesUsuario" :key="index" :value="item.BASE">
                  {{ item.BASE }}
                </option>
              </select>
            </label>

          </div>
          <!-- <div class="filter-row">
            <label>Tipo de marca:
              <select v-model="filters.tipoMarca" class="large-input">
                <option value="PREMIUM">PREMIUM</option>
                <option value="OTRAS">OTRAS</option>
              </select>
            </label>
          </div> -->
          <div class="filter-row">
            <label>Operador:
              <select v-model="filters.operador" class="large-input">
                <option value=""></option>
                <option value="=">=</option>
                <option value="<">&lt;</option>
                <option value="<=">&lt;=</option>
                <option value=">">&gt;</option>
                <option value=">=">&gt;=</option>
                <option value="<>">&lt;&gt;</option>
              </select>
            </label>

            <label>Milímetros:<input type="number" v-model="filters.milimetros" class="large-input" /></label>
          </div>
        </div>
      </fieldset>
    </div>

    <!-- BOTONES -->
    <div class="buttons full-width">
      <button @click="cargarDatosConsultaSemaforeoMM()" :disabled="loading">
        {{ loading ? "Buscando datos..." : "Consulta" }}
      </button>
      <template v-if="habilitarBotones">
        <ExportExcel :data="data" :abled="!data.length" />

        <button @click="cargarDatospdf()" :disabled="loading">
          {{ loading ? "Buscando datos..." : "Imprimir PDF" }}
        </button>
      </template>
    </div>

    <!-- <p v-if="data.length">Número de registros: {{ data.length }}</p> -->
    <!-- RESUMEN POR BASE -->
    <!-- <div v-if="resumenAnalisis.length" class="table-container"> -->
    <!-- <div v-if="resumenAnalisis && resumenAnalisis.length" class="table-container"> -->
    <div v-if="mostrarTabla === 'resumen' && !loading && resumenAnalisis && resumenAnalisis.length"
      class="table-container">
      <h3>Resumen Análisis Milímetros</h3>
      <table class="resumen-mm">
        <thead>
          <tr>
            <th>Base</th>
            <th>Sin llanta</th>
            <th>0 mm</th>
            <th>1 mm</th>
            <th>2 mm</th>
            <th>3 mm</th>
            <th>3 mm sin cobertura</th>
            <th>4 mm</th>
            <th>4 mm sin cobertura</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in resumenAnalisis" :key="index">
            <td>{{ item.BASE }}</td>
            <td class="sin-llanta">{{ item.SIN_LLANTA }}</td>
            <td class="cero-mm">{{ item.CERO }}</td>
            <td class="uno-mm">{{ item.UNO }}</td>
            <td class="dos-mm">{{ item.DOS }}</td>
            <td class="tres-mm">{{ item.TRES }}</td>
            <td class="tres-sin-obs">{{ item.TRES_SIN_OBS }}</td>
            <td class="cuatro-mm">{{ item.CUATRO }}</td>
            <td class="cuatro-sin-obs">{{ item.CUATRO_SIN_OBS }}</td>
          </tr>
        </tbody>
      </table>
    </div>


    <!-- TABLA -->
    <div class="table-container full-width" v-if="mostrarTabla === 'resumen' && !loading">
      <table>
        <thead>
          <tr>
            <th>Base</th>
            <th>Folio</th>
            <th>Fecha de semaforeo</th>
            <th>Unidad</th>
            <th>Posición</th>
            <th>MM</th>
            <th>Tmarca</th>
            <th>Obs</th>
            <th>Dot</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in data" :key="index">
            <td>{{ item.BASE }}</td>
            <td>{{ item.FOLIO }}</td>
            <!-- <td>{{ item.FSEMAFOREO }}</td> -->
            <td>{{ formatearFecha(item.FSEMAFOREO) }}</td>
            <td>{{ item.UNIDAD }}</td>
            <td>{{ item.POSICION }}</td>
            <td>{{ item.MM }}</td>
            <td>{{ item.TMARCA }}</td>
            <td>{{ item.OBS }}</td>
            <td>{{ item.DOT }}</td>
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
    const todayFormatted = new Date().toISOString().split("T")[0];
    const primerDiaMes = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0];

    return {
      // filters: {
      //   desde: localStorage.getItem("fechaDesdeAnalisisMM") || primerDiaMes,
      //   hasta: localStorage.getItem("fechaHastaAnalisisMM") || todayFormatted,
      //   baseinput: localStorage.getItem("baseInputAnalisisMM") || "TODAS",
      //   tipoMarca: "",
      //   operador: "<",
      //   milimetros: "5",
      //   empresa: "",
      //   base: "",
      // },
      filters: {
        desde: localStorage.getItem("fechaDesdeAnalisisMM") || primerDiaMes,
        hasta: localStorage.getItem("fechaHastaAnalisisMM") || todayFormatted,
        baseinput: localStorage.getItem("baseInputAnalisisMM") || "", // ⬅️ antes "TODAS"
        tipoMarca: "",
        operador: "<",
        milimetros: "5",
        empresa: "",
        base: "",
      },

      data: [],
      basesUsuario: [],
      habilitarBotones: false,
      mostrarTabla: "resumen",
      loading: false,
      errorMessage: "",
      resumenAnalisis: [],
      usuario: "",
    };
  },

  methods: {
    formatearFecha(fechaISO) {
      if (!fechaISO) return "";
      const f = new Date(fechaISO);
      const dd = String(f.getDate()).padStart(2, "0");
      const mm = String(f.getMonth() + 1).padStart(2, "0");
      const yy = f.getFullYear();
      const hh = String(f.getHours()).padStart(2, "0");
      const mi = String(f.getMinutes()).padStart(2, "0");
      const ss = String(f.getSeconds()).padStart(2, "0");
      return `${dd}/${mm}/${yy} ${hh}:${mi}:${ss}`;
    },


    convertirFechaParaAPI(isoDate) {
      if (!isoDate) return "0";
      // isoDate viene como 'YYYY-MM-DD'
      const [Y, M, D] = isoDate.split("-").map(Number);
      const MS_PER_DAY = 24 * 60 * 60 * 1000;

      // Construye ambas fechas en UTC (sin horas / sin TZ)
      const baseUTC = Date.UTC(1899, 11, 30);       // 1899-12-30
      const targetUTC = Date.UTC(Y, M - 1, D);      // YYYY-MM-DD

      return Math.floor((targetUTC - baseUTC) / MS_PER_DAY);
    },

    cargarUsuario() {
      const userData = localStorage.getItem("userData");
      if (!userData) return;
      try {
        const u = JSON.parse(userData);
        this.filters.nombreempresa = u.NOMBREEMPRESA || "";
        this.filters.empresa = u.EMPRESA || "";
        this.usuario = u.USUARIO || "";
        this.filters.base = u.BASE || "";
      } catch (e) {
        console.error("Error al parsear datos de usuario:", e);
        this.errorMessage = "❌ No se pudieron cargar los datos de usuario.";
      }
    },

    // async cargaBasesxUsuario() {
    //   if (!this.filters.empresa || !this.usuario) return;
    //   try {
    //     const resp = await apiService.getcargaBasesxUsuario(
    //       this.filters.empresa,
    //       this.usuario
    //     );
    //     this.basesUsuario = resp?.DATA || [];

    //     if (this.basesUsuario.length === 0) {
    //       this.errorMessage = "⚠️ No se encontraron bases disponibles para el usuario.";
    //       this.filters.baseinput = "TODAS";
    //       return;
    //     }

    //     const bases = this.basesUsuario.map((b) => b.BASE);
    //     if (!bases.includes(this.filters.baseinput)) {
    //       this.filters.baseinput = bases[0];
    //       localStorage.setItem("baseInputAnalisisMM", this.filters.baseinput);
    //     }
    //   } catch (err) {
    //     console.error("❌ Error al obtener bases:", err);
    //     this.errorMessage = "❌ No se pudieron cargar las bases de usuario.";
    //   }
    // },

    async cargaBasesxUsuario() {
      if (!this.filters.empresa || !this.usuario) return;

      try {
        const resp = await apiService.getcargaBasesxUsuario(
          this.filters.empresa,
          this.usuario
        );
        this.basesUsuario = resp?.DATA || [];

        if (this.basesUsuario.length === 0) {
          this.errorMessage = "⚠️ No se encontraron bases disponibles para el usuario.";
          this.filters.baseinput = "";
          localStorage.setItem("baseInputAnalisisMM", "");
          return;
        }

        const bases = this.basesUsuario.map(b => b.BASE);
        const baseGuardada = this.filters.baseinput; // viene de localStorage o "TODAS"

        if (this.basesUsuario.length === 1) {
          // Solo una base → selección forzada
          this.filters.baseinput = bases[0];
          localStorage.setItem("baseInputAnalisisMM", this.filters.baseinput);
        } else {
          // Varias → si la guardada no existe, dejar en blanco
          if (!bases.includes(baseGuardada)) {
            this.filters.baseinput = "";
            localStorage.setItem("baseInputAnalisisMM", "");
          }
        }
      } catch (err) {
        console.error("❌ Error al obtener bases:", err);
        this.errorMessage = "❌ No se pudieron cargar las bases de usuario.";
      }
    }
    ,
    async cargarDatosConsultaSemaforeoMM() {
      this.errorMessage = "";
      this.loading = true;
      try {
        const resp = await apiService.ConsultaSemaforeoMM(
          this.usuario,
          this.filters.empresa,
          this.filters.baseinput,
          this.convertirFechaParaAPI(this.filters.desde),
          this.convertirFechaParaAPI(this.filters.hasta),
          this.filters.operador,
          this.filters.tipoMarca,
          this.filters.milimetros
        );

        if (resp?.DATA?.length) {
          this.data = resp.DATA;
          this.resumenAnalisis = this.agruparPorBase(this.data);
          this.debugTresSinCobertura(); // <-- temporal
          this.habilitarBotones = true;
          this.mostrarTabla = "resumen";
        } else {
          this.errorMessage = "⚠️ No se encontraron datos para la consulta.";
          this.data = [];
          this.resumenAnalisis = [];
        }
      } catch (err) {
        console.error("❌ Error en la consulta:", err);
        this.errorMessage = "❌ Ocurrió un error al obtener los datos.";
      } finally {
        this.loading = false;
      }
    },

    cargarDatospdf() {
      const encoded = btoa(JSON.stringify(this.data));
      this.$router.push({ path: `/semaforeo/analisis-milimetros-pdf/${encoded}` });
    },

    // ===== DOT → antigüedad (años) como en Delphi =====
    aniosDesdeDOT(dot) {
      if (dot == null) return -1;
      const s = String(dot).trim();

      // Solo aceptar dígitos puros
      if (!/^\d+$/.test(s)) return -1;

      let yy = null;
      if (s.length === 3) yy = s.substring(1, 3);
      else if (s.length === 4) yy = s.substring(2, 4);
      else return -1;

      const n = Number("20" + yy);
      if (!Number.isFinite(n)) return -1;

      return new Date().getFullYear() - n;
    },
    // ===== DEBUG: ¿Quiénes están contando como 3 mm sin cobertura? =====
    debugTresSinCobertura() {
      const registros = this.data.map(r => {
        const mm = parseInt(r.MM, 10);
        const sDOT = (r.DOT ?? "").toString().trim();
        let anio = -1;

        if (sDOT.length === 3) {
          const yy = sDOT.substring(1, 3);
          const n = parseInt("20" + yy, 10);
          anio = isNaN(n) ? -1 : (new Date().getFullYear() - n);
        } else if (sDOT.length === 4) {
          const yy = sDOT.substring(2, 4);
          const n = parseInt("20" + yy, 10);
          anio = isNaN(n) ? -1 : (new Date().getFullYear() - n);
        } // otros largos => -1

        return {
          BASE: r.BASE,
          FOLIO: r.FOLIO,
          MM: mm,
          DOT: sDOT,
          ANIOS: anio,
          OBS: (r.OBS || "").trim(),
          LARGO_DOT: sDOT.length,
        };
      });

      const tresSinCoberturaVue = registros.filter(x => x.MM === 3 && x.ANIOS !== -1 && x.ANIOS > 7);
      console.table(tresSinCoberturaVue);

      // Resumen por patrón de DOT para ver rarezas
      const porLargo = tresSinCoberturaVue.reduce((acc, x) => {
        acc[x.LARGO_DOT] = (acc[x.LARGO_DOT] || 0) + 1;
        return acc;
      }, {});
      console.log("Conteo por largo de DOT:", porLargo);

      // Si sospechas de valores dudosos (p. ej. '.123', 'A123', '  123'),
      // muestra los que NO son puros dígitos:
      const noDigitos = tresSinCoberturaVue.filter(x => !/^\d+$/.test(x.DOT));
      if (noDigitos.length) {
        console.warn("DOT con caracteres no numéricos:", noDigitos);
      }

      console.log("Total 3 mm sin cobertura (Vue):", tresSinCoberturaVue.length);
    }
    ,
    // ===== Resumen por BASE con CUATRO y CUATRO_SIN_OBS =====
    agruparPorBase(data) {
      const resultado = [];
      data.forEach((item) => {
        let base = resultado.find((r) => r.BASE === item.BASE);
        if (!base) {
          base = {
            BASE: item.BASE,
            SIN_LLANTA: 0,
            CERO: 0,
            UNO: 0,
            DOS: 0,
            TRES: 0,
            TRES_SIN_OBS: 0,
            CUATRO: 0,
            CUATRO_SIN_OBS: 0,
          };
          resultado.push(base);
        }

        const mm = parseInt(item.MM, 10);
        const obs = (item.OBS || "").trim().toUpperCase();
        const anios = this.aniosDesdeDOT(item.DOT);

        if (mm === 0 && (obs === "SIN LLANTA" || obs === "DESPRENDIMIENTO DE LLANTA")) {
          base.SIN_LLANTA++;
        } else if (mm === 0) {
          base.CERO++;
        } else if (mm === 1) {
          base.UNO++;
        } else if (mm === 2) {
          base.DOS++;
        } else if (mm === 3) {
          base.TRES++;
          if (anios !== -1 && anios > 7) base.TRES_SIN_OBS++;
        } else if (mm === 4) {
          base.CUATRO++;
          if (anios !== -1 && anios > 7) base.CUATRO_SIN_OBS++;
        }
      });
      return resultado;
    },
  },

  mounted() {
    this.cargarUsuario();
    this.cargaBasesxUsuario();
    this.filters.multiEmpresa = this.filters.multiEmpresa ?? false;
    this.filters.multiBase = this.filters.multiBase ?? false;
    this.filters.desde =
      localStorage.getItem("fechaDesdeAnalisisMM") ||
      new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split("T")[0];
    this.filters.hasta =
      localStorage.getItem("fechaHastaAnalisisMM") ||
      new Date().toISOString().split("T")[0];
  },

  watch: {
    "filters.desde"(v) {
      localStorage.setItem("fechaDesdeAnalisisMM", v);
    },
    "filters.hasta"(v) {
      localStorage.setItem("fechaHastaAnalisisMM", v);
    },
    "filters.baseinput"(v) {
      localStorage.setItem("baseInputAnalisisMM", v || "");
    },
  },
};
</script>

<style scoped>
.home-container {
  width: 100%;
  max-width: 1285px;
  margin: auto;
  padding: 30px;
  background: linear-gradient(90deg, #fdcc07, #fdcc07);
  font-family: "Poppins", sans-serif;
}

.form-container {
  width: 100%;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.full-width {
  width: 95%;
}

.large-input {
  width: 100%;
  padding: 6px;
  font-size: 16px;
}

fieldset {
  border: 2px solid #1e3a5f;
  border-radius: 5px;
  padding: 15px;
  width: 95%;
}

legend {
  font-size: 18px;
  font-weight: bold;
  color: #1e3a5f;
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 15px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
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

/* Deshabilitar botón durante la carga */
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* ---------------- */
.resumen-mm {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  font-size: 14px;
  margin-bottom: 20px;
}

.resumen-mm th {
  background-color: #1e3a5f;
  color: white;
  padding: 8px;
}

.resumen-mm td {
  border: 1px solid #ddd;
  padding: 8px;
  font-weight: bold;
}

.sin-llanta {
  background-color: aqua;
  color: black;
}

.cero-mm {
  background-color: black;
  color: yellow;
}

.uno-mm {
  background-color: red;
  color: yellow;
}

.dos-mm {
  background-color: red;
  color: yellow;
}

.tres-mm {
  background-color: red;
  color: yellow;
}

.tres-sin-obs {
  background-color: orange;
  color: black;
}

.cuatro-mm {
  background-color: red;
  color: yellow;
}

.cuatro-sin-obs {
  background-color: orange;
  color: black;
}
</style>
