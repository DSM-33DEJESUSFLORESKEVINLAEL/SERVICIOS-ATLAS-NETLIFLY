<template>
  <NavBar />
  <div class="inventory-container">
    <h1>Existencias</h1>

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
        <legend>Filtros de búsqueda</legend>
        <div class="filters-row">
          <!-- <label>
            Base:
            <select v-model="filters.baseinput" class="large-input">
              <option value=""></option> 
              <option v-for="(item, index) in basesUsuario" :key="index" :value="item.BASE">
                {{ item.BASE }}
              </option>
            </select>
          </label>   -->
          
    <label>
  Base:
  <select
    v-model="filters.baseinput"
    class="large-input"
    :disabled="basesUsuario.length === 1"
  >
    <!-- opción en blanco SOLO cuando hay 2+ bases -->
    <option v-if="basesUsuario.length > 1" value=""></option>

    <option
      v-for="(item, index) in basesUsuario"
      :key="index"
      :value="item.BASE"
    >
      {{ item.BASE }}
    </option>
  </select>
</label>

        </div>
      </fieldset>
    </div> 

    <!-- BOTÓN RESUMEN -->
    <div class="buttons">
      <button  @click="habilitarBotones= true; cargarExistencias()" class="btn-resumen">Resumen  {{ loading ? "Buscando datos..." : "" }}
      </button>
    </div>

    <!-- TABLA DE EXISTENCIAS -->
    <div class="table-container full-width" v-if="mostrarTabla === 'existencias' && !loading"> 
      <table>
        <thead>
          <tr>
            <th>Empresa</th>
            <th>Base</th>
            <th>Artículo</th>
            <th>Precio</th>
            <th>Existencia</th>
            <th>Clasificación</th>
            <th>Descripción</th>
            <th>Stock mínimo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in data" :key="index">
            <td>{{ item.EMPRESA }}</td>
            <td>{{ item.BASE }}</td>
            <td>{{ item.ARTICULO }}</td>
            <td>{{ formatCurrency(item.PRECIO) }}</td> <!-- Ahora correctamente referenciado -->
            <td>{{ item.EXISTENCIA }}</td>
            <td>{{ item.CLASIFICACION }}</td>
            <td>{{ item.DESCRIPCION }}</td>
            <td>{{ item.STOCK_MINIMO }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import NavBar from "../../components/NavBar.vue";
import apiService from "@/services/apiService";

export default {
  components: { NavBar },
  data() {
    return {
      filters: { baseinput: "" },
      data: [],
      basesUsuario: [],
      habilitarBotones: false,
      mostrarTabla: "existencias",
      loading: false, // 🔹 Agregado para evitar errores
      errorMessage: "", // Para almacenar mensajes de error

    };
  },
  methods: {
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
   
 
//     async cargaBasesxUsuario() {
//   if (!this.filters.empresa || !this.usuario) return;

//   try {
//     const response = await apiService.getcargaBasesxUsuario(
//       this.filters.empresa,
//       this.usuario
//     );

//     this.basesUsuario = response?.DATA || [];

//     if (this.basesUsuario.length === 0) {
//       this.errorMessage = "⚠️ No se encontraron bases disponibles para el usuario.";
//       this.filters.baseinput = "";
//       return;
//     }

//     const baseActual = this.filters.baseinput;
//     const basesDisponibles = this.basesUsuario.map(b => b.BASE);

//     if (!basesDisponibles.includes(baseActual)) {
//       this.filters.baseinput = basesDisponibles[0]; // Asignar primera base válida
//       localStorage.setItem("baseInputExistencias", this.filters.baseinput);
//     }

//     // Opcional: cargar existencias automáticamente si hay base válida
//     // this.cargarExistencias();
//   } catch (error) {
//     console.error("❌ Error al obtener bases:", error);
//     this.errorMessage = "❌ No se pudieron cargar las bases de usuario.";
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
      this.filters.baseinput = "";
      localStorage.setItem("baseInputExistencias", "");
      return;
    }

    const bases = this.basesUsuario.map(b => b.BASE);
    const baseGuardada = this.filters.baseinput;

    if (this.basesUsuario.length === 1) {
      // solo una: seleccionar y bloquear (bloqueo lo hace el template)
      this.filters.baseinput = bases[0];
      localStorage.setItem("baseInputExistencias", this.filters.baseinput);
    } else {
      // varias: si la guardada ya no existe, dejar en blanco
      if (!bases.includes(baseGuardada)) {
        this.filters.baseinput = "";
        localStorage.setItem("baseInputExistencias", "");
      }
    }

    // opcional: autoload si ya hay base seleccionada
    // if (this.filters.baseinput) this.cargarExistencias();

  } catch (error) {
    console.error("❌ Error al obtener bases:", error);
    this.errorMessage = "❌ No se pudieron cargar las bases de usuario.";
  }
}
,
    async cargarExistencias() {
      try {
        this.errorMessage = ""; // 🔹 Limpiar error antes de la consulta
        this.loading = true;

        const response = await apiService.InvExistencias(
          this.filters.empresa,
          this.filters.baseinput
        );
        if (response?.DATA) {
          this.data = response.DATA;
          this.mostrarTabla = "existencias";
        } else {
          this.errorMessage = "⚠️ No se encontraron datos para la consulta.";
          this.data = [];
        }
      } catch (error) {
        this.errorMessage = "❌ Ocurrió un error al obtener los datos.";
      } finally {
        this.loading = false;

      }
    },

    
    formatCurrency(value) {
      if (!value) return "$0.00";
      return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);
    },
  },
  mounted() {
    this.cargarUsuario();
    this.cargaBasesxUsuario();
  },
};
</script>

<style scoped>
/* Fondo amarillo degradado */
.inventory-container {
  max-width: 1350px;
  margin: auto;
  padding: 20px;
  font-family: "Poppins", sans-serif;
  background: linear-gradient(90deg, #fdcc07, #fdcc07);
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  height: 80vh;

}

/* FILTROS */
.filters-container {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.filters-box {
  border: 2px solid #1e3a5f;
  border-radius: 10px;
  padding: 20px;
  width: 80%;
  padding: 35px;

}

.filters-row {
  display: flex;
  align-items: center;
  gap: 20px;
}

.large-input {
  width: 100%;
  padding: 6px;
  font-size: 16px;
}

.compact-input {
  width: 140px;
  padding: 6px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

select {
  padding: 5px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

/* BOTÓN RESUMEN */
.buttons {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.btn-resumen {
  background-color: #1e3a5f;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;
}

.btn-resumen:hover {
  background-color: #1e3a5f;
}

/* TABLA */
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

/* Deshabilitar botón durante la carga */
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
