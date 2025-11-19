<template>
  <NavBar />
  <div class="home-container">
    <div class="content">
      <video autoplay loop muted class="navbar-video">
        <source src="../../../public/videos/LOGO2.mp4" type="video/mp4" />
      </video>
      <h1>Bienvenido a nuestra plataforma {{ usuario }}</h1>
    </div>
    
    <button class="buttons" @click="descargarManual()" >MANUAL DE USUARIO </button>
  </div>
  
</template>

<script>
import NavBar from '../../components/NavBar.vue';
export default {
  components: {
    NavBar
  },

  data() {
    return {
      usuario: "",
      empresa: "",
      base: "",
    };
  },
  methods: 
  {
    cargarUsuario() {
      const userData = localStorage.getItem("userData");
      console.log("🔹 Verificando localStorage:", userData);

      if (userData) {
        const parsedData = JSON.parse(userData);
        console.log("✅ Datos obtenidos del localStorage:", parsedData);

        this.usuario = parsedData.NOMBREUSUARIO || "Desconocido";
        this.empresa = parsedData.EMPRESA || "N/A";
        this.nombreempresa = parsedData.NOMBREEMPRESA || "N/A";
        this.base = parsedData.BASE || "N/A";
      } else {
        console.warn("⚠️ No se encontraron datos en localStorage.");
      }
    },
    descargarManual() {
  const manualUrl = "/Manual_Usuario_SALLC.pdf"; // Ruta relativa desde public/
  window.open(manualUrl, "_blank"); // Abre el PDF en una nueva pestaña
}
  
  },
  mounted(){
    this.cargarUsuario();

  }
};
</script>

<style scoped>
.home-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(90deg, #fdcc07, #ff9900);
  text-align: center;
  font-family: 'Poppins', sans-serif;
  color: white;
  padding: 10px;
}
.buttons {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(90deg, #fdcc07, #ff9900);
  margin-bottom: 20px;
}

.content {
  background: rgba(255, 255, 255, 0.2);
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  max-width: 800px;
  backdrop-filter: blur(10px);
}

.navbar-video {
  width: 500px;
  height: auto;
  border-radius: 10px;
  margin-bottom: 15px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
}

h1 {
  font-size: 2.5rem;
  font-weight: bold;
  text-transform: uppercase;
}

p {
  font-size: 1.2rem;
  margin-top: 10px;
  opacity: 0.9;
}
</style>
