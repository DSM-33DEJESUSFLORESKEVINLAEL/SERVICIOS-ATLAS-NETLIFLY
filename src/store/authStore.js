import { defineStore } from "pinia";
import { useRouter } from "vue-router";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    userData: null, // Inicialmente vacío, se cargará después
  }),

  actions: {
    setUserData(data) {
      // console.log("🔹 Guardando datos en authStore:", data);
      this.userData = data;
      localStorage.setItem("userData", JSON.stringify(data));
    },

    loadUserData() {
      // console.log("🔹 Cargando datos desde localStorage...");
      const storedData = localStorage.getItem("userData");
      if (storedData) {
        this.userData = JSON.parse(storedData);
      }
    },

    clearUserData() {
      console.log("🧹 Eliminando usuario de localStorage...");
      this.userData = null;
      localStorage.removeItem("userData");
    },

    logout() {
      console.log("🚪 Cerrando sesión...");
      this.clearUserData(); // Borra los datos del usuario
      const router = useRouter();
      router.push("/login"); // Redireccionar al login
    },
  },
});
