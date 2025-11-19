<template>
  <NavBar />
  <div class="home-container">
    <h1 class="title">Lista de Medidas</h1>

    <!-- Botones de exportación -->
    <center>
      <ExportExcel :data="medidas" fileName="Lista_de_medidas" sheetName="Medidas" />
      <ExportPDF :data="medidas" fileName="Lista_de_medidas" />
    </center> 

    <!-- Tabla de medidas -->
    <div class="table-container">
      <table v-if="medidas.length" class="styled-table">
        <thead>
          <tr>
            <th>Medida</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="medida in medidas" :key="medida.MEDIDA">
            <td>{{ medida.MEDIDA }}</td>
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
    const medidas = ref([]);
    const authStore = useAuthStore();

    const cargarMedidas = async (forceReload = false) => {
      if (!authStore.userData || !authStore.userData.EMPRESA) {
        console.warn("⚠️ No se encontró empresa en authStore. No se pueden obtener medidas.");
        return;
      }

      const empresaId = authStore.userData.EMPRESA;
      console.log(`🔹 Obteniendo medidas para la empresa: ${empresaId}`);

      if (!forceReload && medidas.value.length > 0) {
        console.log("🔹 Los datos ya están cargados. Usa reload para actualizar.");
        return;
      }

      try {
        const response = await apiService.getMedidasLista();

        if (!response || !response.DATA || !Array.isArray(response.DATA)) {
          console.error("🚨 La API no devolvió datos válidos:", response);
          return;
        }

        medidas.value = response.DATA.filter(
          (medida) => medida.EMPRESA === empresaId
        ).map((medida) => ({
          EMPRESA: medida.EMPRESA,
          MEDIDA: medida.MEDIDA
        }));

        console.log("✅ Medidas filtradas obtenidas:", medidas.value);
      } catch (error) {
        console.error("🚨 Error al obtener medidas:", error);
      }
    };

    // Función para recargar medidas manualmente
    const reloadMedidas = () => {
      console.log("🔄 Recargando medidas...");
      cargarMedidas(true);
    };

    // Recargar medidas cuando cambie la empresa autenticada
    watchEffect(() => {
      if (authStore.userData && authStore.userData.EMPRESA) {
        cargarMedidas();
      }
    });

    return { medidas, reloadMedidas };
  },
};
</script>

<style scoped>
.home-container {
  width: 100%;
  max-width: 1250px;
  margin: auto;
  padding: 40px;
  background: linear-gradient(90deg, #fdcc07, #fdcc07);
  font-family: "Poppins", sans-serif;
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
