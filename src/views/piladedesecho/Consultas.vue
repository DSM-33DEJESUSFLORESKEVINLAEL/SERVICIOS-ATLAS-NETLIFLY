<template>
  <NavBar />
  <div class="home-container">
    <h1>Consultas De Pila Desecho</h1>

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
          <label>Desde:
            <input type="date" v-model="filters.desde" class="large-input" /></label>
          <label>Hasta:
            <input type="date" v-model="filters.hasta" class="large-input" /></label>
          <!-- <label>Base:
            <select v-model="filters.base" class="large-input">
               <option value=""></option> 
              <option v-for="(item, index) in basesUsuario" :key="index" :value="item.BASE">
                {{ item.BASE }}
              </option>
            </select>
          </label> -->
          <label>Base:
            <select v-model="filters.base" class="large-input" :disabled="basesUsuario.length === 1">
              <!-- Muestra opción en blanco SOLO si hay más de una base -->
              <option v-if="basesUsuario.length > 1" value=""></option>

              <option v-for="(item, index) in basesUsuario" :key="index" :value="item.BASE">
                {{ item.BASE }}
              </option>
            </select>
          </label>


        </div>
        <div class="filters"><!-- filtros -->
          <label>Marca:
            <input type="text" v-model="filters.marca" @input="convertirMayusculas('marca')"
              class="large-input" /></label>
          <label>Medida:
            <input type="text" v-model="filters.medida" @input="convertirMayusculas('medida')"
              class="large-input" /></label>
          <label>Estado del casco:
            <select v-model="filters.renovado" class="large-input">
              <option value=""></option>
              <option value="OR">OR</option>
              <option value="RN">RN</option>
              <option value="RN1">RN1</option>
              <option value="RN2">RN2</option>
              <option value="RN3">RN3</option>
              <option value="RN4">RN4</option>
              <option value="RN5">RN5</option>
              <option value="RNC">RNC</option>
            </select>
          </label>
          <label>Milímetros:
            <input type="text" v-model="filters.milimetros" class="large-input" /></label>
          <label>Causa primaria de retiro:
            <input type="text" v-model="filters.causaRetiro" @input="convertirMayusculas('causaRetiro')"
              class="large-input" />
          </label>
          <!-- filtros -->
        </div>
      </fieldset>
    </div>

    <!-- BOTONES PARA CAMBIAR TABLA -->
    <div class="buttons">
      <button @click="cargarDatosTabla('detalle')">📋 Detalle {{ loading ? "" : "" }}</button>

      <!-- <button @click="irResumengeneral" :disabled="!detalleSeleccionado">Resumen General</button>
      <button @click="irResumenfallas" :disabled="!detalleSeleccionado">Resumen fallas</button> -->
      <button v-if="detalleSeleccionado" @click="irResumengeneral">Resumen General</button>
      <button v-if="detalleSeleccionado" @click="irResumenfallas">Resumen fallas</button>

    </div>
    <div class="buttons">
      <span>Agrupado por:</span>
      <button @click="cargarDatosTabla('marca')">🏷️ Marca {{ loading ? "" : "" }}</button>
      <button @click="cargarDatosTabla('medida')">📏 Medida {{ loading ? "" : "" }}</button>
      <button @click="cargarDatosTabla('renovado')">🔄 Renovado {{ loading ? "" : "" }}</button>
      <button @click="cargarDatosTabla('milimetros')">📐 Milímetros {{ loading ? "" : "" }}</button>
      <button @click="cargarDatosTabla('anio')">📆 Año {{ loading ? "" : "" }}</button>
      <button @click="cargarDatosTabla('causaRetiro')">
        ⚠️ Causa de retiro {{ loading ? "" : "" }}
      </button>
      <!-- Botón de exportar -->
      <ExportExcel :data="data" :abled="!data.length" />
      <!-- <button @click="irResumengeneral">Resumen General</button>
       <button @click="irResumenfallas">Resumen fallas</button> -->


    </div>

    <div>
      <p>Número de Registros: {{ totalRegistros }}</p>


    </div>

    <!-- TABLAS SEGÚN BOTÓN SELECCIONADO -->
    <div class="table-container">
      <table v-if="tablaActual === 'detalle'">
        <thead>
          <tr>
            <th>Folio</th>
            <th>Fecha</th>
            <th>Base</th>
            <th>Sistema Medida</th>
            <th>Operador</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Medida</th>
            <th>Piso Remanente</th>
            <th>Rango de Carga</th>
            <th>Oriren</th>
            <th>Marca Renovado</th>
            <th>Modelo Renovado</th>
            <th>Serie</th>
            <th>DOT</th>
            <th>Año</th>
            <th>Falla 1</th>
            <th>Falla 2</th>
            <th>Falla 3</th>
            <th>Falla 4</th>
            <th>Falla 5</th>
            <th>Descripción</th>
            <th>Área</th>
          </tr>
        </thead>
        <tbody>
          <!-- <tr v-for="(item, index) in data" :key="index"> -->
          <!-- <tr v-for="(item, index) in data" :key="index"
            :class="{ seleccionado: item.FOLIO === folioSeleccionado }" @click="seleccionarFolio(item)"> -->
          <tr v-for="(item, index) in data" :key="index" :class="{ seleccionado: index === filaSeleccionadaIndex }"
            @click="seleccionarFolio(item, index)">

            <td>{{ item.FOLIO }}</td>
            <!-- <td>{{ item.FECHA }}</td> -->
            <td>{{ formatearFecha(item.FECHA) }}</td>
            <td>{{ item.BASE }}</td>
            <td>{{ item.SIS_MEDIDA }}</td>
            <td>{{ item.OPERADOR }}</td>
            <td>{{ item.MARCA }}</td>
            <td>{{ item.MODELO }}</td>
            <td>{{ item.MEDIDA }}</td>
            <td>{{ item.PISO_REMANENTE }}</td>
            <td>{{ item.RANGO_CARGA }}</td>
            <td>{{ item.ORIREN }}</td>
            <td>{{ item.MARCA_REN }}</td>
            <td>{{ item.MODELO_REN }}</td>
            <td>{{ item.SERIE }}</td>
            <td>{{ item.DOT }}</td>
            <td>{{ item.ANIO }}</td>
            <td>{{ item.FALLA1 }}</td>
            <td>{{ item.FALLA2 }}</td>
            <td>{{ item.FALLA3 || "N/A" }}</td>
            <td>{{ item.FALLA4 || "N/A" }}</td>
            <td>{{ item.FALLA5 || "N/A" }}</td>
            <td>{{ item.DESCRIPCION }}</td>
            <td>{{ item.AREA }}</td>
          </tr>
        </tbody>
      </table>

      <table v-else-if="tablaActual === 'marca'">
        <thead>
          <tr>
            <th>Base</th>
            <th>Marca</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in data" :key="index">
            <td>{{ item.BASE }}</td>
            <td>{{ item.MARCA }}</td>
            <td>{{ item.CANTIDAD }}</td>
          </tr>
        </tbody>
      </table>

      <table v-else-if="tablaActual === 'medida'">
        <thead>
          <tr>
            <th>Base</th>
            <th>Medida</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in data" :key="index">
            <td>{{ item.BASE }}</td>
            <td>{{ item.MEDIDA }}</td>
            <td>{{ item.CANTIDAD }}</td>
          </tr>
        </tbody>
      </table>

      <table v-else-if="tablaActual === 'renovado'">
        <thead>
          <tr>
            <th>Base</th>
            <th>Oriren</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in data" :key="index">
            <td>{{ item.BASE }}</td>
            <td>{{ item.ORIREN }}</td>
            <td>{{ item.CANTIDAD }}</td>
          </tr>
        </tbody>
      </table>

      <table v-else-if="tablaActual === 'milimetros'">
        <thead>
          <tr>
            <!-- <th>Empresa</th> -->
            <th>Base</th>
            <th>Piso Remanente</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in data" :key="index">
            <td>{{ item.BASE }}</td>
            <td>{{ item.PISO_REMANENTE }}</td>
            <td>{{ item.CANTIDAD }}</td>
          </tr>
        </tbody>
      </table>

      <table v-else-if="tablaActual === 'anio'">
        <thead>
          <tr>
            <th>Base</th>
            <th>Año</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in data" :key="index">
            <td>{{ item.BASE }}</td>
            <td>{{ item.ANIO }}</td>
            <td>{{ item.CANTIDAD }}</td>
          </tr>
        </tbody>
      </table>

      <table v-else-if="tablaActual === 'causaRetiro'">
        <thead>
          <tr>
            <th>Base</th>
            <th>Falla 1</th>
            <th>Descripcion</th>
            <th>Area</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in data" :key="index">
            <td>{{ item.BASE }}</td>
            <td>{{ item.FALLA1 }}</td>
            <td>{{ item.DESCRIPCION }}</td>
            <td>{{ item.AREA }}</td>
            <td>{{ item.CANTIDAD }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import NavBar from "../../components/NavBar.vue";
import ExportExcel from "@/global/ExportExcel.vue";
import apiService from "@/services/apiService";

export default {
  components: { NavBar, ExportExcel },
  data() {
    const today = new Date();
    const todayFormatted = new Date().toISOString().split("T")[0]; // Obtiene la fecha de hoy en formato YYYY-MM-DD
    const primerDiaMes = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0]; // Convierte a formato YYYY-MM-DD

    return {
      filters: {
        desde: primerDiaMes, // Se establece el primer día del mes actual
        hasta: todayFormatted,
        empresa: "",
        // base: "",
        base: localStorage.getItem('baseSeleccionadaPilaDesecho') || "", // <-- aquí cargamos desde localStorage
        marca: "",
        medida: "",
        renovado: "", // ✅ Aquí debería almacenar el valor seleccionado
        milimetros: "",
        causaRetiro: "",
      },
      usuario: "",
      basesUsuario: [],
      data: [],
      tablaActual: "detalle",
      totalRegistros: 0, // Contador de registros
      loading: false, // 🔹 Agregado para evitar errores
      errorMessage: "", // Para almacenar mensajes de error
      folioSeleccionado: "", // <- Nuevo
      filaSeleccionadaIndex: null,
      detalleSeleccionado: false, // 🔵 Nuevo estado para habilitar botones

    };
  },

  methods: {
    async cargarDatosTabla(tipo) {
      console.log(
        `🟢 Cargando datos para la tabla marca: ${this.filters.marca}`
      );
      console.log(
        `🟢 Cargando datos para la tabla medida: ${this.filters.medida}`
      );
      await this.consultaPilaDesecho(tipo);
      console.log("✅ Datos obtenidos:", this.data);

      this.tablaActual = tipo;

      // 🔵 Activar detalleSeleccionado solo si el tipo es 'detalle'
      this.detalleSeleccionado = tipo === "detalle";
    },

    convertirMayusculas(campo) {
      if (this.filters[campo]) {
        this.filters[campo] = this.filters[campo].toUpperCase();
      }
    },
    // 🟢 Convierte fechas ISO a formato compatible con API (número de días desde 30/12/1899)
    convertirFechaParaAPI(isoDate) {
      if (!isoDate) return "0";
      const baseDate = new Date("1899-12-30");
      const targetDate = new Date(isoDate);
      return Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));
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
        console.log("este es mi base:", this.filters.base)
      }
    }
    ,

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
    //       this.filters.base = ""; // limpiar valor actual si no hay bases
    //       return;
    //     }

    //     const baseActual = this.filters.base;
    //     const basesDisponibles = this.basesUsuario.map(b => b.BASE);

    //     if (!basesDisponibles.includes(baseActual)) {
    //       this.filters.base = basesDisponibles[0]; // Selecciona automáticamente la primera base
    //       localStorage.setItem("baseSeleccionadaPilaDesecho", this.filters.base);
    //     }

    //     // Opcional: auto-consultar datos si ya hay base válida
    //     // this.cargarDatosTabla("detalle");
    //   } catch (error) {
    //     console.error("❌ Error al obtener bases:", error);
    //     this.errorMessage = "❌ No se pudieron cargar las bases disponibles.";
    //   }
    // }
    // ,
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
      this.filters.base = "";
      return;
    }

    const baseActual = this.filters.base;
    const basesDisponibles = this.basesUsuario.map(b => b.BASE);

    // Si la base guardada no existe en la lista actual…
    if (!basesDisponibles.includes(baseActual)) {
      // …y solo hay una, seleccionarla automáticamente
      // …si hay varias, dejar en blanco
      this.filters.base = (this.basesUsuario.length === 1)
        ? basesDisponibles[0]
        : "";

      localStorage.setItem("baseSeleccionadaPilaDesecho", this.filters.base);
    }

  } catch (error) {
    console.error("❌ Error al obtener bases:", error);
    this.errorMessage = "❌ No se pudieron cargar las bases disponibles.";
  }
}
,
    async consultaPilaDesecho(tipo) {
      try {
        this.errorMessage = ""; // 🔹 Limpiar error antes de la consulta
        this.loading = true;

        this.data = [];

        // Obtener la empresa y base desde localStorage
        const userData = localStorage.getItem("userData");
        let empresaLocalStorage = "";
        let baseLocalStorage = "";
        if (userData) {
          try {
            const parsedData = JSON.parse(userData);
            empresaLocalStorage = parsedData.EMPRESA || "";
            baseLocalStorage = parsedData.BASE || "";
          } catch (error) {
            console.error("Error al parsear datos de usuario desde localStorage:", error);
          }
        }

        // Validación explícita: Si Marca o Medida están vacías, se envían como string vacío
        const params = {
          tipo,
          empresa: empresaLocalStorage, // ✅ Viene de localStorage
          base: baseLocalStorage, // ✅ Base obtenida de localStorage
          empresa2: empresaLocalStorage, // ✅ Base seleccionada en el select de basesUsuario
          base2: this.filters.base,
          fecha1: this.convertirFechaParaAPI(this.filters.desde),
          fecha2: this.convertirFechaParaAPI(this.filters.hasta),
          multiEmpresa: this.filters.multiEmpresa ?? 0,
          multiBase: this.filters.multiBase ?? -1,
          marca: (this.filters.marca.trim() || "").replace(/\//g, "*"),   // ⬅️ Reemplaza '/' con '*'
          medida: (this.filters.medida.trim() || "").replace(/\//g, "*"), // ⬅️ Reemplaza '/' con '*'
          renovado: this.filters.renovado || "",
          milimetros: this.filters.milimetros || "",
          causaRetiro: this.filters.causaRetiro || "",
        };

        console.log("📢 Parámetros enviados a la API:", params);

        const response = await apiService.ConsultaPilaDesecho(
          params.tipo,
          params.empresa,
          params.base,
          params.empresa2,
          params.base2,
          params.fecha1,
          params.fecha2,
          params.multiEmpresa,
          params.multiBase,
          params.marca,   // ✅ Marca con '/' reemplazados por '*'
          params.medida,  // ✅ Medida con '/' reemplazados por '*'
          params.renovado,
          params.milimetros,
          params.causaRetiro
        );

        if (response?.DATA?.length > 0) {
          this.data = response.DATA;
          this.totalRegistros = response.DATA.length;
          console.log("✅ Registros obtenidos:", this.totalRegistros);
        } else {
          console.warn("⚠️ No se encontraron datos.");
          this.errorMessage = "⚠️ No se encontraron datos para la consulta.";
        }
      } catch (error) {
        console.error("❌ Error en consultaPilaDesecho:", error);
        this.errorMessage = "❌ Ocurrió un error en la consulta PilaDesecho";
      } finally {
        this.loading = false;
      }
    },
    seleccionarFolio(item, index) {
      this.folioSeleccionado = item.FOLIO;
      this.baseSeleccionada = item.BASE;
      this.filaSeleccionadaIndex = index;
      console.log("🔎 Folio seleccionado:", item.FOLIO);
      console.log("📍 Base seleccionada:", item.BASE);

      localStorage.setItem("folioSeleccionado", item.FOLIO);
      localStorage.setItem("baseSeleccionada", item.BASE);

    },

    // irResumengeneral() {
    //   if (!this.folioSeleccionado) {
    //     alert("Selecciona un folio para ver el Resumen General.");
    //     return;
    //   }
    //   this.$router.push({
    //     name: "Resumengeneral",
    //     params: {
    //       folio: this.folioSeleccionado,
    //       base: this.baseSeleccionada
    //     }
    //   });
    // },

    // irResumenfallas() {
    //   if (!this.folioSeleccionado) {
    //     alert("Selecciona un folio para ver el Resumen de fallas.");
    //     return;
    //   }
    //   this.$router.push({
    //     name: "Resumenfallas",
    //     params: {
    //       folio: this.folioSeleccionado,
    //       base: this.baseSeleccionada
    //     }
    //   });
    // }
    irResumengeneral() {
      if (!this.folioSeleccionado) {
        alert("Selecciona un folio para ver el Resumen General.");
        return;
      }

      this.$router.push({
        name: "Resumengeneral",
        params: {
          folio: this.folioSeleccionado,
          base: this.baseSeleccionada
        },
        query: {
          fechaDesde: this.filters.desde,  // 📅 Directo del filtro actual
          fechaHasta: this.filters.hasta
        }
      });
    },
    irResumenfallas() {
      if (!this.folioSeleccionado) {
        alert("Selecciona un folio para ver el Resumen de fallas.");
        return;
      }

      const fechaDesdeGuardada = localStorage.getItem('fechaDesdeSeleccionada') || '';
      const fechaHastaGuardada = localStorage.getItem('fechaHastaSeleccionada') || '';

      this.$router.push({
        name: "Resumenfallas",
        params: {
          folio: this.folioSeleccionado,
          base: this.baseSeleccionada
        },
        query: {
          fechaDesde: fechaDesdeGuardada,
          fechaHasta: fechaHastaGuardada
        }
      });
    },

  },

  mounted() {
    this.cargarUsuario();
    this.cargaBasesxUsuario();

    // Primero establecer por defecto
    this.filters.desde = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).toISOString().split('T')[0];

    this.filters.hasta = new Date().toISOString().split('T')[0];

    // 🟢 Luego leer desde localStorage si existen
    const fechaDesdeGuardada = localStorage.getItem('fechaDesdeSeleccionada');
    const fechaHastaGuardada = localStorage.getItem('fechaHastaSeleccionada');
    const baseGuardada = localStorage.getItem('baseSeleccionadaPilaDesecho'); // NUEVO

    if (fechaDesdeGuardada) this.filters.desde = fechaDesdeGuardada;
    if (fechaHastaGuardada) this.filters.hasta = fechaHastaGuardada;
    if (baseGuardada) this.filters.base = baseGuardada; // NUEVO
  },

  watch: {
    'filters.desde'(nuevoValor) {
      localStorage.setItem('fechaDesdeSeleccionada', nuevoValor || '');
    },
    'filters.hasta'(nuevoValor) {
      localStorage.setItem('fechaHastaSeleccionada', nuevoValor || '');
    },
    'filters.base'(nuevoValor) {
      localStorage.setItem('baseSeleccionadaPilaDesecho', nuevoValor || '');
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
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

fieldset {
  border: 2px solid #1e3a5f;
  border-radius: 5px;
  padding: 15px;
}

legend {
  font-size: 14px;
  font-weight: bold;
  color: #1e3a5f;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

label {
  display: flex;
  flex-direction: column;
  font-weight: bold;
}

/* Estilos de los botones */
.buttons1 {
  height: 40px;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 5px;
}

.buttons1 button {
  height: 40px;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 5px;
  border: none;
  background-color: #1e3a5f;
  color: white;
  cursor: pointer;
  transition: background 0.3s ease;
}

.buttons1 button:hover {
  background-color: #1e3a5f;
}

.export-button {
  background-color: #28a745;
}

.export-button:hover {
  background-color: #218838;
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 18px;
}

.buttons button {
  height: 40px;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 5px;
  border: none;
  background-color: #1e3a5f;
  color: white;
  cursor: pointer;
  transition: background 0.3s ease;
}

.buttons button:hover {
  background-color: #1e3a5f;
}

.export-button {
  background-color: #28a745;
}

.export-button:hover {
  background-color: #218838;
}

/* Estilos de la tabla */
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
  font-size: 14px;
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

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.filters label {
  display: flex;
  flex-direction: column;
  visibility: visible;
  /* Asegura que no estén ocultos */
}

.large-input {
  width: 100%;
  padding: 3px;
  font-size: 20px;
  border-radius: 5px;
  border: 1px solid #ccc;
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
