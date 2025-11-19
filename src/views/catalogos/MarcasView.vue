<template>
      <NavBar />
  <div class="home-container">
    <h1 class="title">Lista de Marcas</h1>
    <!-- Botones de exportación -->
    <center>
    <ExportExcel :data="marcas" fileName="Lista_de_Marcas" sheetName="Marcas" />
    <ExportPDF :data="marcas" fileName="Lista_de_Marcas" />
     </center> 
    <!-- Tabla de marcas -->
    <div class="table-container">
      <table v-if="marcas.length" class="styled-table">
        <thead>
          <tr>
            <th>Marca</th>
            <th>Procedencia</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="marca in marcas" :key="marca.MARCA">
            <td>{{ marca.MARCA }}</td>
            <td>{{ marca.PROCEDENCIA  }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty-message">Cargando datos...</p>
    </div>
  </div>
</template>

<script>
import { ref, watchEffect } from "vue";
import apiService from "@/services/apiService";
import { useAuthStore } from "@/store/authStore";
import NavBar from "../../components/NavBar.vue";
import ExportExcel from "@/global/ExportExcel.vue";
import ExportPDF from "@/global/ExportPDF.vue";


export default {
  components: { ExportExcel,  ExportPDF,NavBar },

  setup() {
    const marcas = ref([]);
    const authStore = useAuthStore();

    const cargarMarcas = async (forceReload = false) => {
      if (!authStore.userData || !authStore.userData.EMPRESA) {
        console.warn(
          "⚠️ No se encontró empresa en authStore. No se pueden obtener marcas."
        );
        return;
      }

      const empresaId = authStore.userData.EMPRESA;
      console.log(`🔹 Obteniendo marcas para la empresa: ${empresaId}`);

      if (!forceReload && marcas.value.length > 0) {
        console.log("🔹 Los datos ya están cargados. Usa reload para actualizar.");
        return;
      }

      try {
        const response = await apiService.getMarcasLista();

        if (!response || !response.DATA || !Array.isArray(response.DATA)) {
          console.error("🚨 La API no devolvió datos válidos:", response);
          return;
        }

        marcas.value = response.DATA.filter(
          (marca) => marca.EMPRESA === empresaId
        ).map((marca) => ({
          EMPRESA: marca.EMPRESA,
          MARCA: typeof marca.MARCA === "string" ? marca.MARCA : String(marca.MARCA),
          PROCEDENCIA: marca.PROCEDENCIA ,
        }));

        console.log("✅ Marcas filtradas obtenidas:", marcas.value);
      } catch (error) {
        console.error("🚨 Error al obtener marcas:", error);
      }
    };

    // Función para recargar marcas manualmente
    const reloadMarcas = () => {
      console.log("🔄 Recargando marcas...");
      cargarMarcas(true);
    };

    // Esperar cambios en authStore.userData y recargar marcas automáticamente
    watchEffect(() => {
      if (authStore.userData && authStore.userData.EMPRESA) {
        cargarMarcas();
      }
    });

    return { marcas, reloadMarcas };
  },
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
.title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.reload-button {
  background-color: #1c3b72;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.reload-button:hover {
  background-color: #1c3b72;
}

.table-container {
  display: flex;
  justify-content: center;
  overflow-x: auto;
  padding: 20px;
}

.styled-table {
  width: 80%;
  border-collapse: collapse;
  font-family: Arial, sans-serif;
  font-size: 16px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.styled-table thead {
  background-color: #1c3b72;
  color: white;
  font-weight: bold;
}

.styled-table th,
.styled-table td {
  padding: 12px;
  border: 1px solid #ddd;
  text-align: left;
}

.styled-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.styled-table tbody tr:hover {
  background-color: #e3f2fd;
  transition: background-color 0.3s;
}

.empty-message {
  text-align: center;
  font-size: 18px;
  color: gray;
  margin-top: 20px;
}
</style>
