<template>
  <NavBar />
  <div class="factura-container" v-if="factura">
    <div class="factura-header">
      <fieldset>

      <div class="factura-info">
        <p><strong>Empresa:</strong> {{ factura.empresa }}</p>
        <p><strong>Fecha:</strong> {{ formatearFecha(factura.fecha ) }}</p>
        <p><strong>Factura:</strong> <span class="factura-numero">{{ factura.id }}</span></p>
      </div>
    </fieldset>
    <fieldset>

      <div class="factura-info">
        <p><strong>UUID:</strong> {{ factura.uuid}}</p>
        <p><strong>Cliente:</strong> {{ factura.cliente }} - {{ factura.nombre }}</p>
      </div>
    </fieldset>

    </div>

    <table class="factura-table">
      <thead>
        <tr>
          <th>Cantidad</th>
          <th>Descripción</th>
          <th>Precio</th>
          <th>Importe</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in factura.items" :key="item.ARTICULO">
          <td>{{ formatNumber(item.CANTIDAD) }}</td>
          <td>{{ item.MEDIDA }} {{ item.DESCRIPCION.toUpperCase() }}</td>
          <td>{{ formatCurrency(item.PRECIO) }}</td>
          <td>{{ formatCurrency(item.IMPORTE) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="factura-totales">
      <p><strong>Subtotal:</strong> {{ formatCurrency(factura.subtotal) }}</p>
      <p><strong>IVA:</strong> {{ formatCurrency(factura.iva) }}</p>
      <p><strong>Total:</strong> {{ formatCurrency(factura.total) }}</p>
    </div>

    <button class="factura-btn" @click="cerrarVista">Cerrar</button>

  </div>

  <div v-else>
    <p>Cargando factura...</p>
  </div>
</template>

<script>
import NavBar from "@/components/NavBar.vue";
import apiService from "@/services/apiService";

export default {
  components: { NavBar },
  data() {
    return {
      factura: null,
    };
  },
  computed: {
    empresaId() {
      return this.$route.params.empresaId;
    },
    facturaId() {
      return this.$route.params.facturaId;
    },
    fechaId() { 
      return this.$route.params.fechaId;
    },
    resultadosId() {
      return this.$route.params.resultadosId;
    },
    clienteId() {
      return this.$route.params.clienteId;
    },
    nombreId() {
      return this.$route.params.nombreId;
    },
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
    async cargarDetalle() {
      try {
        if (!this.facturaId || !this.empresaId) {
          console.warn("⚠️ No se recibió un ID de factura o empresa válido.");
          return;
        }

        console.log("🔍 Cargando detalles de factura:", this.facturaId, "Empresa:", this.empresaId);

        const response = this.empresaId === "1"
          ? await apiService.FacturasDetSinaloa(this.empresaId, this.facturaId)
          : await apiService.FacturasDet(this.empresaId, this.facturaId);

        if (response?.DATA) {
          console.log("✅ Factura cargada correctamente:", response.DATA);
          
          // Convertir datos correctamente
          const items = response.DATA.map(item => ({
            CANTIDAD: parseInt(item.CANTIDAD) || 0,
            MEDIDA: item.MEDIDA || "",
            DESCRIPCION: item.DESCRIPCION || "",
            PRECIO: parseFloat(item.PRECIO) || 0,
            IMPORTE: parseFloat(item.IMPORTE) || 0,
          }));

          const subtotal = items.reduce((acc, item) => acc + item.IMPORTE, 0);
          const iva = subtotal * 0.16; // Suponiendo 16% de IVA  
          const total = subtotal + iva;

          this.factura = {
            empresa: this.empresaId,
            fecha: this.fechaId,
            uuid: this.resultadosId,
            cliente: this.clienteId,
            nombre: this.nombreId,
            id: response.DATA[0]?.FACTURA || "N/A",
            items: items,
            subtotal: subtotal,
            iva: iva,
            total: total,
          };
        } else {
          console.warn("⚠️ No se encontraron detalles de la factura.");
          this.factura = null;
        }
      } catch (error) {
        console.error("❌ Error al cargar factura:", error);
      }
    },
    formatCurrency(value) {
      return isNaN(value) ? "$0.00" : new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
      }).format(value);
    },
    formatNumber(value) {
      return isNaN(value) ? "0" : new Intl.NumberFormat("es-MX").format(value);
    },
    cerrarVista() {
  console.log("🔴 Cerrando vista de facturas...");
  this.$router.push("/inventario/facturas"); // Usa el path directamente
},
  },
  watch: {
    facturaId: {
      immediate: true,
      handler() {
        this.cargarDetalle();
      },
    },
    empresaId: {
      immediate: true,
      handler() {
        this.cargarDetalle();
      },
    },
    
  },
};
</script>

<style scoped>
/* Contenedor principal */
.factura-container {
  width: 100%;
  max-width: 1265px;
  margin: auto;
  padding: 30px;
  background: #f4f4f4;
  font-family: "Arial", sans-serif;
  color: #333;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Cabecera de la factura */
.factura-header {
  width: 100%;
  background: #1e3a5f;
  color: white;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.factura-header p {
  margin: 5px 0;
}

/* Tablas de información */
.factura-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.factura-table th {
  background-color: #1e3a5f;
  color: white;
  padding: 12px;
  text-align: left;
  font-size: 14px;
}

.factura-table td {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  font-size: 14px;
}

.factura-table tr:nth-child(even) {
  background: #f8f8f8;
}

.factura-table tr:hover {
  background: #e0e0e0;
}

/* Totales */
.factura-totales {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  text-align: right;
}

.factura-totales p {
  font-size: 16px;
  font-weight: bold;
  margin: 5px 0;
}

/* Botón de cerrar */
.factura-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #1e3a5f;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  font-size: 16px;
  transition: background 0.3s ease-in-out;
}

.factura-btn:hover {
  background-color: #142a43;
}

/* Mensaje de error */
.error-message {
  background-color: #ffecec;
  color: #d8000c;
  border: 1px solid #d8000c;
  padding: 10px;
  text-align: center;
  border-radius: 5px;
  font-weight: bold;
  margin: 10px 0;
}
</style>
