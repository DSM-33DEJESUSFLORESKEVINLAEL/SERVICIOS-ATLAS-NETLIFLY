<template>
  <router-view></router-view>
</template>

<script setup>
import { onMounted } from "vue";
import { useAuthStore } from "@/store/authStore";

const authStore = useAuthStore();

onMounted(() => {
  authStore.loadUserData(); // Cargar los datos del usuario al iniciar la app
});
</script>
