<template>
  <NavBar />
  <div class="home-container">
    <h1 class="title">Unidades</h1>

    <!-- Botones de exportación -->
    <center>
      <ExportExcel :data="unidades" fileName="Lista_de_Unidades" sheetName="Unidades" />
      <ExportPDF :data="unidades" fileName="Lista_de_Unidades" />
    </center>

    <!-- Mostrar totales -->
    <h1 class="title1">
      Total de unidades: {{ totalUnidades }} | Total de llantas: {{ totalLlantas }}
    </h1>

    <!-- Tabla de unidades -->
    <div class="table-container">
      <table v-if="unidades.length" class="styled-table">
        <thead>
          <tr>
            <th>Empresa</th>
            <th>Base</th>
            <th>Folio</th>
            <th>Unidad</th>
            <th>Tipo de Unidad</th>
            <th>Estado</th>
            <th>Ejes</th>
            <th>Número de Llantas</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="unidad in unidades" :key="unidad.UNIDAD">
            <td>{{ unidad.EMPRESA }}</td>
            <td>{{ unidad.BASE }}</td>
            <td>{{ unidad.FOLIO }}</td>
            <td>{{ unidad.UNIDAD }}</td>
            <td>{{ unidad.TUNIDAD }}</td>
            <td>{{ unidad.STATUS }}</td>
            <td>{{ unidad.EJES }}</td>
            <td>{{ unidad.NUM_LLANTAS }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty-message">Cargando datos...</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, watchEffect } from "vue";
import apiService from "@/services/apiService";
import { useAuthStore } from "@/store/authStore";
import NavBar from "../../components/NavBar.vue";
import ExportExcel from "@/global/ExportExcel.vue";
import ExportPDF from "@/global/ExportPDF.vue";

export default {
  components: { ExportExcel, ExportPDF, NavBar },

  setup() {
    const unidades = ref([]);
    const authStore = useAuthStore();

    // Computed properties para obtener los totales
    const totalUnidades = computed(() => unidades.value.length);
    const totalLlantas = computed(() => unidades.value.reduce((sum, unidad) => sum + (parseInt(unidad.NUM_LLANTAS) || 0), 0));

    const cargarUnidades = async (forceReload = false) => {
      if (!authStore.userData || !authStore.userData.EMPRESA) {
        console.warn("⚠️ No se encontró empresa en authStore. No se pueden obtener unidades.");
        return;
      }

      const empresaId = authStore.userData.EMPRESA;
      // console.log(`🔹 O
      // bteniendo unidades para la empresa: ${empresaId}`);

      if (!forceReload && unidades.value.length > 0) {
        console.log("🔹 Los datos ya están cargados. Usa reload para actualizar.");
        return;
      }

      try {
        const response = await apiService.getUnidadesLista("C"); // Cambia "C" por el prefijo necesario en obtenerFolio

        if (!response || !response.DATA || !Array.isArray(response.DATA)) {
          console.error("🚨 La API no devolvió datos válidos:", response);
          return;
        }

        unidades.value = response.DATA.filter(
          (unidad) => unidad.EMPRESA === empresaId
        ).map((unidad) => ({
          EMPRESA: unidad.EMPRESA,
          BASE: unidad.BASE,
          FOLIO: unidad.FOLIO,
          UNIDAD: unidad.UNIDAD,
          TUNIDAD: unidad.TUNIDAD,
          STATUS: unidad.STATUS,
          EJES: unidad.EJES,
          NUM_LLANTAS: unidad.NUM_LLANTAS
        }));

        console.log("✅ Unidades filtradas obtenidas:", unidades.value);
      } catch (error) {
        console.error("🚨 Error al obtener unidades:", error);
      }
    };

    // Función para recargar unidades manualmente
    const reloadUnidades = () => {
      console.log("🔄 Recargando unidades...");
      cargarUnidades(true);
    };

    // Recargar unidades cuando cambie la empresa autenticada
    watchEffect(() => {
      if (authStore.userData && authStore.userData.EMPRESA) {
        cargarUnidades();
      }
    });

    return { unidades, totalUnidades, totalLlantas, reloadUnidades };
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
}

.title1 {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
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
  width: 100%;
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
