import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "@/store/authStore"; // ✅ Importar correctamente

const pinia = createPinia();
const app = createApp(App);

app.use(pinia); // 📌 Registrar Pinia antes de acceder a stores
app.use(router);

app.mount("#app");

// 🔹 Cargar userData después de que Pinia esté listo
const authStore = useAuthStore(); // 🔥 Ahora está importado correctamente
authStore.loadUserData();
