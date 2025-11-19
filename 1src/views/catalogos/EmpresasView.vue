<template>
  <NavBar />
  <div class="home-container">
    <h1 class="title">Lista de Empresas</h1>

    <!-- Botones de exportación -->
    <center>
      <ExportExcel :data="empresas" fileName="Lista_de_Empresas" sheetName="Empresas" />
      <ExportPDF :data="empresas" fileName="Lista_de_Empresas" />
    </center>

    <!-- Tabla de empresas -->
    <div class="table-container">
      <table v-if="empresas.length" class="styled-table">
        <thead>
          <tr>
            <th>ID Empresa</th>
            <th>Nombre</th>
            <th>Desmontaje Inmediato</th>
            <th>Desmontaje Próx Desde</th>
            <th>Desmontaje Próx Hasta</th>
            <th>Buenas Condiciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="empresa in empresas" :key="empresa.EMPRESA">
            <td>{{ empresa.EMPRESA }}</td>
            <td>{{ empresa.NOMBRE }}</td>
            <td>{{ empresa.DESMONTAJE_INMEDIATO }}</td>
            <td>{{ empresa.DESMONTAJE_PROX_DESDE }}</td>
            <td>{{ empresa.DESMONTAJE_PROX_HASTA }}</td>
            <td>{{ empresa.BUENAS_CONDICIONES }}</td>
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
    const empresas = ref([]);
    const authStore = useAuthStore();

    const cargarEmpresas = async (forceReload = false) => {
      if (!authStore.userData || !authStore.userData.EMPRESA) {
        console.warn("⚠️ No se encontró empresa en authStore. No se pueden obtener datos.");
        return;
      }

      const empresaId = authStore.userData.EMPRESA;
      console.log(`🔹 Obteniendo datos para la empresa: ${empresaId}`);

      if (!forceReload && empresas.value.length > 0) {
        console.log("🔹 Los datos ya están cargados. Usa reload para actualizar.");
        return;
      }

      try {
        const response = await apiService.getEmpresasLista();

        if (!response || !response.DATA || !Array.isArray(response.DATA)) {
          console.error("🚨 La API no devolvió datos válidos:", response);
          return;
        }

        empresas.value = response.DATA.map((empresa) => ({
          EMPRESA: empresa.EMPRESA,
          NOMBRE: empresa.NOMBRE,
          DESMONTAJE_INMEDIATO: empresa.DESMONTAJE_INMEDIATO,
          DESMONTAJE_PROX_DESDE: empresa.DESMONTAJE_PROX_DESDE,
          DESMONTAJE_PROX_HASTA: empresa.DESMONTAJE_PROX_HASTA,
          BUENAS_CONDICIONES: empresa.BUENAS_CONDICIONES
        }));

        console.log("✅ Empresas obtenidas:", empresas.value);
      } catch (error) {
        console.error("🚨 Error al obtener empresas:", error);
      }
    };

    // Función para recargar empresas manualmente
    const reloadEmpresas = () => {
      console.log("🔄 Recargando empresas...");
      cargarEmpresas(true);
    };

    // Recargar empresas cuando cambie la empresa autenticada
    watchEffect(() => {
      if (authStore.userData && authStore.userData.EMPRESA) {
        cargarEmpresas();
      }
    });

    return { empresas, reloadEmpresas };
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
