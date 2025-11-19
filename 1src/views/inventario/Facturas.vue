<template>
  <NavBar />
  <div class="home-container">
    <h1>Facturas</h1>

  <!-- Mensaje de Error -->
  <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    <!-- MENSAJE DE CARGA -->
    <div v-if="loading" class="loading-message">
      ⏳ Buscando datos en la base de datos, por favor espere...
    </div>


    <!-- FILTROS -->
    <div class="filters-container">
      <fieldset class="filters-box">
        <div class="filters-row">
          <label>Desde:
            <input type="date" v-model="filters.desde" class="compact-input" />
          </label>
          <label>Hasta:
            <input type="date" v-model="filters.hasta" class="compact-input" />
          </label>
          
          <!-- OPCIONES DE BASE -->
          <fieldset class="facturas-options">
            <legend>Facturas</legend>
            <label>
              <input type="radio" v-model="filters.baseOption" value="BASE" />
              Solo de esta base
            </label>
            <label>
              <input type="radio" v-model="filters.baseOption" value="TODAS" />
              Todas las bases
            </label>
          </fieldset>
        </div>
      </fieldset>
    </div>

    <!-- BOTONES -->
    <div class="buttons">
      <button @click="cargarFacturas">Cargar Facturas{{ loading ? "" : "" }}</button>
      <button @click="cargarDetalle">Cargar Detalle{{ loading ? "" : "" }}</button>
      <button :disabled="!selectedFactura && !selectedDetalle" @click="verFactura" class="btn-factura">
       Ver Factura
      </button>
      <button :disabled="!selectedFactura " @click="descargarPDF" class="btn-pdf"> 📄 Descargar PDF y XML</button>
      <ExportExcel :data="data" :disabled="!selectedFactura && !selectedDetalle" />
      <button @click="cerrarVista">Limpiar Tabla</button>
    </div>

    <!-- TABLA DE FACTURAS -->
    <div class="table-container" v-if="mostrarTabla === 'facturas' && data.length > 0">
      <table>
        <thead>
          <tr>
            <th>Empresa</th>
            <th>Factura</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Subtotal</th>
            <th>IVA</th>
            <th>Total</th>
            <th>UUID</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(factura, index) in data" :key="index" 
              @click="seleccionarFactura(factura)" 
              :class="{ 'selected-row': selectedFactura?.FACTURA === factura.FACTURA }">
            <td>{{ factura.EMPRESA }}</td>
            <td>{{ factura.FACTURA }}</td>
            <td>{{ formatearFecha(factura.FECHA) }}</td>
            <td>{{ factura.CLIENTE }}</td>
            <td>{{ formatearMoneda(factura.SUBTOTAL) }}</td>
            <td>{{ formatearMoneda(factura.IVA) }}</td>
            <td>{{ formatearMoneda(factura.TOTAL) }}</td>
            <td>{{ factura.RESULTADO6 }}</td>
          </tr>
        </tbody>
      </table>
    </div>


<!-- TABLA DE DETALLES -->
<div class="table-container"  v-if="mostrarTabla === 'detalles' && data.length > 0">
  <table>
    <thead>
      <tr>
        <th>Factura</th>
        <th>Fecha</th>
        <th>Cliente</th>
        <th>Nombre</th>
        <th>UUID</th>
        <th>Subtotal</th>
        <th>IVA</th>
        <th>Total</th>
        <th>Cantidad</th>
        <th>Descripción</th>
        <th>Precio</th>
        <th>Descuento</th>
        <th>Importe</th>
      </tr>
    </thead>
    <tbody>
          <tr v-for="(detalle, index) in data" 
    :key="index" 
    @click="seleccionarDetalle(detalle, index)" 
    :class="{ 'selected-row': selectedIndex === index }">

        
      <td>{{ detalle.FACTURA }}</td>
        <td>{{ formatearFecha(detalle.FECHA) }}</td>
        <td>{{ detalle.CLIENTE }}</td>
        <td>{{ detalle.NOMBRE }}</td>
        <td>{{ detalle.RESULTADO6 }}</td>
        <td>{{ formatearMoneda(detalle.SUBTOTAL) }}</td>
        <td>{{ formatearMoneda(detalle.IVA) }}</td>
        <td>{{ formatearMoneda(detalle.TOTAL) }}</td>
        <td>{{ detalle.CANTIDAD }}</td>
        <td>{{ detalle.MEDIDA }} {{ detalle.DESCRIPCION }}</td>
        <td>{{ formatearMoneda(detalle.PRECIO) }}</td>
        <td>{{ formatearMoneda(detalle.DESCUENTO) }}</td>
        <td>{{ formatearMoneda(detalle.IMPORTE) }}</td>
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
  components: { ExportExcel, NavBar },

 data() {
  const today = new Date();
  const primerDiaMes = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString().split('T')[0];
  const hoy = today.toISOString().split('T')[0];

  return {
    filters: {
      desde: localStorage.getItem('fechaDesde') || primerDiaMes,
      hasta: localStorage.getItem('fechaHasta') || hoy,
      baseOption: localStorage.getItem('baseOption') || "BASE",
        empresa: "",
        base: "",
        cliente: "",
        grupo: "",
        lugar: "",
      },
      data: [],
      mostrarTabla: "",
      selectedFactura: null, // Factura seleccionada
      loading: false, // 🔹 Agregado para evitar errores
      errorMessage: "", // Para almacenar mensajes de error
      selectedIndex: null,


    };
  },

  created() {
    this.cargarUsuario();
  },

  methods: {
    seleccionarDetalle(detalle, index) {
    this.selectedDetalle = detalle; // Guardar el detalle seleccionado
    this.selectedIndex = index; // Guardar el índice seleccionado
  },
    obtenerFechaActual() {
      const hoy = new Date();
      return hoy.toISOString().split("T")[0]; // Formato YYYY-MM-DD
    },
    
    formatearMoneda(valor) {
    if (isNaN(valor) || valor === null || valor === undefined) return "$0.00";
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(valor);
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

    // Convierte fechas al formato numérico esperado por la API
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
      this.filters.base = parsedData.BASE || "";
      this.filters.cliente = parsedData.CLIENTE || "";
      this.filters.grupo = parsedData.GRUPO || "";
      this.filters.lugar = parsedData.LUGAR || ""; // ✅ Asegurar que LUGAR se carga correctamente
      this.filters.emp_cte = parsedData.EMP_CTE || "";
    } catch (error) {
      console.error("Error al parsear datos de usuario:", error);
      this.errorMessage = "❌ No se pudieron cargar las bases";
    }
  }
  console.log("✅ LUGAR CARGADO:", this.filters.lugar); // 🔍 Verificar que el lugar se carga correctamente
},



async cargarFacturas() {
    try {
        this.errorMessage = "";
        this.loading = true;
        this.data= [];

        const lugar = this.filters.lugar;

        console.log("🔍 Tipo de opción seleccionada:", this.filters.baseOption);

        // Parámetros para la API
        const paramsToluca = [
            this.convertirFechaParaAPI(this.filters.desde),
            this.convertirFechaParaAPI(this.filters.hasta),
            this.filters.baseOption,
            this.filters.emp_cte,
            this.filters.cliente,
            this.filters.grupo,
            "TOLUCA", // 🔹 Se asegura de que sea TOLUCA
        ];

        const paramsSinaloa = [
            this.convertirFechaParaAPI(this.filters.desde),
            this.convertirFechaParaAPI(this.filters.hasta),
            this.filters.baseOption,
            this.filters.emp_cte,
            this.filters.cliente,
            this.filters.grupo,
            "SINALOA", // 🔹 Se asegura de que sea SINALOA
        ];

        let response = [];
        if (this.filters.baseOption === "BASE") {
            console.log(`📢 Enviando API con lugar: ${lugar}`);
            response = lugar === "TOLUCA"
                ? (await apiService.FacturasMstr(...paramsToluca))?.DATA || []
                : (await apiService.FacturasMstrSinaloa(...paramsSinaloa))?.DATA || [];
        } else {
            console.log(`📢 Enviando API con lugar: TOLUCA y SINALOA`);
            const [responseToluca, responseSinaloa] = await Promise.all([
                apiService.FacturasMstr(...paramsToluca),
                apiService.FacturasMstrSinaloa(...paramsSinaloa),
            ]);

            response = [...(responseToluca?.DATA || []), ...(responseSinaloa?.DATA || [])];
        }

        if (Array.isArray(response) && response.length > 0) {
            console.log("📢 Datos recibidos:", response);

      // Guardar en sessionStorage para persistencia al cambiar de vista
          sessionStorage.setItem("facturasData", JSON.stringify(response));
          sessionStorage.setItem("mostrarTabla", "facturas");

            // Asignamos los datos asegurando reactividad
            this.data = [...response];
            this.mostrarTabla = "facturas";

            // 🔹 Forzamos la actualización de Vue
            this.$nextTick(() => {
                this.$forceUpdate();
            });
        } else {
            this.errorMessage = "⚠️ No se encontraron facturas.";
            console.warn("⚠️ No se encontraron datos en la API.");
            console.log("📢 Datos recibidos para la tabla:", JSON.stringify(response, null, 2));
        }
    } catch (error) {
        console.error("❌ Error en cargarFacturas:", error);
        this.errorMessage = "❌ Ocurrió un error al cargar facturas.";
    } finally {
        this.loading = false;
    }
},



async cargarDetalle() {
    try {
        this.errorMessage = ""; // 🔹 Limpiar error antes de la consulta
        this.loading = true;
        this.data= [];

        console.log("🔍 Tipo de opción seleccionada:", this.filters.baseOption);

        // Parámetros para la API
        const paramsToluca = [
            this.filters.emp_cte,
            this.convertirFechaParaAPI(this.filters.desde),
            this.convertirFechaParaAPI(this.filters.hasta),
            this.filters.baseOption,
            this.filters.cliente,
            this.filters.grupo,
            "TOLUCA",
        ];

        const paramsSinaloa = [
        this.filters.emp_cte,
            this.convertirFechaParaAPI(this.filters.desde),
            this.convertirFechaParaAPI(this.filters.hasta),
            this.filters.baseOption,
            this.filters.cliente,
            this.filters.grupo,
            "SINALOA",
        ];

        let response = [];
        if (this.filters.baseOption === "BASE") {
            console.log(`📢 Enviando API con lugar: ${this.filters.lugar}`);
            response = this.filters.lugar === "TOLUCA"
                 ? (await apiService.FacturasMstrDet(...paramsToluca))?.DATA || []
                : (await apiService.FacturasMstrDetSinaloa(...paramsSinaloa))?.DATA || []
        } else {
            console.log("📢 Enviando API con lugar: TOLUCA y SINALOA");
            const [responseToluca, responseSinaloa] = await Promise.all([
                apiService.FacturasMstrDet(...paramsToluca),
                apiService.FacturasMstrDetSinaloa(...paramsSinaloa),
            ]);

            response = [...(responseToluca?.DATA || []), ...(responseSinaloa?.DATA || [])];
        }

        if (Array.isArray(response) && response.length > 0) {
            console.log("📢 Datos recibidos:", response);
                // Guardar en sessionStorage para persistencia al cambiar de vista
            sessionStorage.setItem("detallesData", JSON.stringify(response));
            sessionStorage.setItem("mostrarTabla", "detalles");
            this.data = [...response];
            this.mostrarTabla = "detalles";
            this.selectedFactura = null; // Reiniciar selección

            // 🔹 Forzar reactividad en Vue
            this.$nextTick(() => {
                this.$forceUpdate();
            });
        } else {
            this.errorMessage = "⚠️ No se encontraron detalles de facturas.";
            console.warn("⚠️ No se encontraron datos en la API.");
        }
    } catch (error) {
        console.error("❌ Error en consultaPilaDesecho:", error);
        this.errorMessage = "❌ Ocurrió un error en la consulta PilaDesecho";
    } finally {
        this.loading = false;
    }
},



    async descargarPDF() {
  if (!this.selectedFactura) {
    this.errorMessage = "⚠️ No se ha seleccionado ninguna factura.";
    return;
  }

  const facturaId = this.selectedFactura.FACTURA;

  // ✅ Asegurar que 'LUGAR' está definido
  if (!this.selectedFactura.LUGAR) {
    if (this.selectedFactura.EMPRESA === "1") {
      this.selectedFactura.LUGAR = "SINALOA"; // Corrección manual
    } else {
      this.selectedFactura.LUGAR = "TOLUCA";
    }
  }
  const lugar = this.selectedFactura.LUGAR; // Ahora siempre tendrá un valor
  try {
    let response;

    if (lugar === "SINALOA") {
      response = await apiService.DocFacturasSinaloa(facturaId, lugar);
    } else {
      response = await apiService.DocFacturas(facturaId, lugar);
    }

    console.log("📢 Respuesta recibida:", response);

    if (!response || !response.xml || !response.pdf) {
      throw new Error("No se recibieron archivos XML o PDF. Verifica la API.");
    }

    // ✅ Descargar XML y PDF
    this.descargarTexto(response.xml, `Factura_${facturaId}.xml`, "application/xml");
    this.descargarPDFDesdeBase64(response.pdf, `Factura_${facturaId}.pdf`);
    
    this.errorMessage = "✅ Archivos XML y PDF descargados correctamente.";
    console.log("📢 Respuesta completa de la API:", response);
    console.log("📂 Contenido del PDF recibido:", response.pdf ? response.pdf.substring(0, 50) + "..." : "No recibido");


  } catch (error) {
    console.error("❌ Error al descargar XML y PDF:", error);
    this.errorMessage = "❌ Error al descargar los archivos. Verifica la API.";
  }
  
},

descargarPDFDesdeBase64(base64, nombreArchivo) {
      try {
        if (!base64 || base64.length < 50) {
          console.error("❌ Base64 inválido o incompleto.");
          return;
        }

        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = nombreArchivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log("📄 PDF descargado con éxito:", nombreArchivo);
      } catch (error) {
        console.error("❌ Error al decodificar y descargar PDF:", error);
      }
    },


// Función para descargar XML como archivo de texto
descargarTexto(contenido, nombreArchivo, tipo) {
  const blob = new Blob([contenido], { type: tipo });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
},

// Función para descargar Base64 como archivo
descargarArchivo(base64, nombreArchivo, tipo) {
  const blob = this.base64ToBlob(base64, tipo);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
},

// Función para convertir Base64 a Blob
base64ToBlob(base64, tipo) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: tipo });
},

    cerrarVista() {
      console.log("🔴 Cerrando vista de facturas...");
      this.data = [];
      this.mostrarTabla = "";
    },

    seleccionarFactura(factura) {
      this.selectedFactura = factura;
    },

    verFactura() {
  if (!this.selectedFactura && !this.selectedDetalle) {
    console.warn("⚠️ No se ha seleccionado ninguna factura o detalle.");
    alert("⚠️ Debes seleccionar una factura o un detalle antes de continuar.");
    return;
  }

  // Determinar qué objeto se va a usar
  const factura = this.selectedFactura || this.selectedDetalle;

  // Verificar que los datos críticos existen antes de acceder a ellos
  if (!factura.FACTURA) {
    console.error("❌ Error: La factura seleccionada no tiene un número de FACTURA.");
    alert("⚠️ La factura seleccionada no contiene datos válidos.");
    return;
  }

  // Obtener los datos que necesitamos
  const facturaId = factura.FACTURA;
  const empresaId = factura.EMPRESA || "Desconocida"; // Evitar undefined
  const fechaId = factura.FECHA || "Sin fecha";
  const resultadosId = factura.RESULTADO6 || "N/A";
  const clienteId = factura.CLIENTE || "Sin cliente";
  const nombreId = factura.NOMBRE || "Sin nombre";

  console.log("🔍 Redirigiendo a VerFactura con datos:", {
    empresaId, facturaId, fechaId, resultadosId, clienteId, nombreId
  });

  // Redirigir a la vista de detalles pasando los parámetros
  this.$router.push({
    name: "VerFactura",
    params: { empresaId, facturaId, fechaId, resultadosId, clienteId, nombreId },
  });
},

    exportarExcel() {
      console.log("📊 Exportando datos a Excel...");
    },

    descargarXMLPDF() {
      console.log("📥 Descargando XML y PDF...");
    },

    irAVerFactura() {
      if (this.selectedFactura) {
        this.$router.push(`/inventario/verfactura`);
      } else {
        console.warn("⚠️ No se ha seleccionado ninguna factura.");
      }
    },
  },

 mounted() {
  this.cargarUsuario();

  // Restaura las fechas solo si no hay guardadas
  if (!localStorage.getItem('fechaDesde')) {
    this.filters.desde = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString().split('T')[0];
  }

  if (!localStorage.getItem('fechaHasta')) {
    this.filters.hasta = new Date().toISOString().split('T')[0];
  }

  if (!localStorage.getItem('baseOption')) {
    this.filters.baseOption = "BASE"; // Valor por defecto solo si no hay nada
  }

       // Establecer la fecha 'hasta' al valor almacenado o a la fecha actual si no hay valor
  // Recuperar facturas guardadas en sessionStorage
  const savedData = sessionStorage.getItem("facturasData");
  const savedTable = sessionStorage.getItem("mostrarTabla");
  // const savedDetalles = sessionStorage.getItem("detallesData");

  if (savedData) {
    this.data = JSON.parse(savedData);
    this.mostrarTabla = savedTable || "facturas";
    console.log("✅ Datos de facturas restaurados.");
  }

  // // Recuperar detalles si existían antes
  // if (savedDetalles) {
  //   this.data = JSON.parse(savedDetalles);
  //   this.mostrarTabla = "detalles";
  //   console.log("✅ Datos de detalles restaurados.");
  // }

  // Restaurar fecha "hasta" desde localStorage
  const fechaGuardada = localStorage.getItem("fechaHasta");
  this.filters.hasta = fechaGuardada ? fechaGuardada : this.obtenerFechaActual();

  console.log("✅ Fechas cargadas: Desde:", this.filters.desde, "Hasta:", this.filters.hasta);

  },
 watch: {
  "filters.desde"(newVal) {
    localStorage.setItem("fechaDesde", newVal || "");
  },
  "filters.hasta"(newVal) {
    localStorage.setItem("fechaHasta", newVal || "");
  },
  "filters.baseOption"(newVal) {
    localStorage.setItem("baseOption", newVal || "");
  }
},

};
</script>




<style scoped>
/* Alineación de los valores de Subtotal, IVA y Total */
td:nth-child(5), /* Subtotal */
td:nth-child(6), /* IVA */
td:nth-child(7)  /* Total */ {
  text-align: right;  /* Alinea los valores a la derecha */
  padding-right: 10px; /* Opcional: espacio entre el borde y el texto */
}

.home-container {
  width: 100%;
  max-width: 1265px;
  margin: auto;
  padding: 40px;
  background: linear-gradient(90deg, #fdcc07,  #fdcc07);
  font-family: "Poppins", sans-serif;
}

.filters-container {
  background: white;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.filters-box {
  border: 1px solid #1e3a5f;
  border-radius: 10px;
  padding: 20px;
  width: 80%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filters-row {
  display: flex;
  align-items: center;
  gap: 20px;
}

.compact-input {
  width: 140px;
  padding: 6px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.facturas-options {
  border: 1px solid #1e3a5f;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  gap: 10px;
}

legend {
  font-size: 14px;
  font-weight: bold;
  color: #1e3a5f;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 10px;
}

.buttons button {
  height: 45px;
  padding: 5px 16px;
  font-size: 14px;
  border-radius: 5px;
  border: none;
  background-color: #1e3a5f;
  color: white;
  cursor: pointer;
}

.buttons button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.buttons button:hover:not(:disabled) {
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

.sin-llanta {
  background-color: #007bff; /* azul */
  color: white;
  font-weight: bold;
}

/* Encabezados de tabla */
th {
  background-color: #1e3a5f; /* Azul oscuro */
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
  background-color: #f2f2f2; /* Gris claro */
}

tr:nth-child(odd) {
  background-color: #ffffff; /* Blanco */
}

/* Efecto hover en filas */
tr:hover {
  background-color: #ffd700; /* Amarillo dorado */
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
.selected-row {
  background-color: rgb(243, 251, 21) !important;
  font-weight: bold;
}

.no-data {
  text-align: center;
  font-size: 16px;
  color: #aaa;
  height: 50px;
}


</style>
