<template>
  <NavBar />
  <div class="home-container">
    <h1 class="title">Lista de Rangos de Carga</h1>

    <!-- Botones de exportación -->
    <center>
      <ExportExcel :data="rangosCarga" fileName="Lista_de_Rango_Carga" sheetName="RangoCarga" />
      <ExportPDF :data="rangosCarga" fileName="Lista_de_Rango_Carga" />
    </center> 

    <!-- Tabla de Rango de Carga -->
    <div class="table-container">
      <table v-if="rangosCarga.length" class="styled-table">
        <thead>
          <tr>
            <th>Rango de Carga</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rango in rangosCarga" :key="rango.RC">
            <td>{{ rango.RC }}</td>
            <td>{{ rango.DESCRIPCION }}</td>
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
  components: { ExportExcel, ExportPDF, NavBar },

  setup() {
    const rangosCarga = ref([]);
    const authStore = useAuthStore();

    const cargarRangosCarga = async (forceReload = false) => {
      if (!authStore.userData || !authStore.userData.EMPRESA) {
        console.warn("⚠️ No se encontró empresa en authStore. No se pueden obtener datos.");
        return;
      }

      const empresaId = authStore.userData.EMPRESA;
      console.log(`🔹 Obteniendo rangos de carga para la empresa: ${empresaId}`);

      if (!forceReload && rangosCarga.value.length > 0) {
        console.log("🔹 Los datos ya están cargados. Usa reload para actualizar.");
        return;
      }

      try {
        const response = await apiService.getRangoCargaLista();

        if (!response || !response.DATA || !Array.isArray(response.DATA)) {
          console.error("🚨 La API no devolvió datos válidos:", response);
          return;
        }

        rangosCarga.value = response.DATA.filter(
          (rango) => rango.EMPRESA === empresaId
        ).map((rango) => ({
          RC: rango.RC,
          DESCRIPCION: rango.DESCRIPCION 
        }));

        console.log("✅ Rangos de carga filtrados obtenidos:", rangosCarga.value);
      } catch (error) {
        console.error("🚨 Error al obtener rangos de carga:", error);
      }
    };

    // Función para recargar rangos de carga manualmente
    const reloadRangosCarga = () => {
      console.log("🔄 Recargando rangos de carga...");
      cargarRangosCarga(true);
    };

    // Recargar datos cuando cambie la empresa autenticada
    watchEffect(() => {
      if (authStore.userData && authStore.userData.EMPRESA) {
        cargarRangosCarga();
      }
    });

    return { rangosCarga, reloadRangosCarga };
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
