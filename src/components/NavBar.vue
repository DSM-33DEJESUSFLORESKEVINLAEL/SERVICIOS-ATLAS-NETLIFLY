<template>
  <nav class="navbar">
    <div class="navbar-left">
      <!-- 🔥 Agregamos el logo aquí -->
      <button class="logout-button" @click="inicio">
        <img src="../assets/2 ATLAS.png" alt="Logo" class="navbar-logo" />
      </button>

   <!-- 📂 Menú de Navegación -->
   <ul class="nav-menu">
        <li class="dropdown" @click="toggleMenu('catalogos')" ref="catalogos">
          <span>📂 Catálogos</span>
          <ul class="dropdown-menu" v-if="menuOpen === 'catalogos'">
            <div class="dropdown-grid">
              <div>
                <li><router-link to="/catalogos/bases">🏢 Bases </router-link></li>
                <li><router-link to="/catalogos/marcas">🏷️ Marcas</router-link></li>
                <li><router-link to="/catalogos/tipo-unidad">🚛 Tipo de Unidad</router-link></li>
                <li><router-link to="/catalogos/marcas-renovado">♻️ Marcas Renovado</router-link></li>
                <li><router-link to="/catalogos/unidades">🚗 Unidades</router-link></li>
              </div>
              <div>
                <li><router-link to="/catalogos/empresas">🏢 Empresas</router-link></li>
                <li><router-link to="/catalogos/medidas">📏 Medidas</router-link></li>
                <li><router-link to="/catalogos/fallas">⚠️ Fallas</router-link></li>
                <li><router-link to="/catalogos/rango-carga">⚡ Rango de Carga</router-link></li>
                <li><router-link to="/catalogos/modelo-renovado">🔧 Modelo Renovado</router-link></li>
              </div>
            </div>
          </ul>
        </li>

        <li class="dropdown" @click="toggleMenu('piladesecho')" ref="piladesecho">
          <span>🗑️ Pila de Desecho</span>
          <ul class="dropdown-menu" v-if="menuOpen === 'piladesecho'">
            <div class="dropdown-grid">
            <li><router-link to="/piladesecho/consultas">🔍 Consultas</router-link></li>
            </div>
          </ul>
        </li>

        <li class="dropdown" @click="toggleMenu('semaforeo')" ref="semaforeo">
          <span>🚦 Semaforeo</span>
          <ul class="dropdown-menu" v-if="menuOpen === 'semaforeo'">
            <div class="dropdown-grid">
            <li><router-link to="/semaforeo/consultas">📊 Consultas</router-link></li>
            <li><router-link to="/semaforeo/analisis-milimetros">📏 Análisis de Milímetros</router-link></li>
            <li><router-link to="/semaforeo/bitacora-taller">🛠️ Bitácora de Taller</router-link></li>
            </div>
          </ul>
        </li>

        <li class="dropdown" @click="toggleMenu('inventario')" ref="inventario">
          <span>📦 Inventario</span>
          <ul class="dropdown-menu" v-if="menuOpen === 'inventario'">
            <div class="dropdown-grid">
            <li><router-link to="/inventario/existencias">📦 Existencias</router-link></li>
            <li><router-link to="/inventario/facturas">🧾 Facturas</router-link></li>
            </div>
          </ul>
        </li>
      </ul>
       <!-- ℹ️ Información del usuario -->
   <div class="navbar-right">
      <div class="user-info">
        <span>👤 USUARIO: <strong>{{ usuario }} </strong></span>
        <span> <strong>{{ nombreempresa }} / {{ base }}</strong></span>
      </div>
      
    </div>
    </div>

    <button class="logout-button" @click="logout">
        <i class="bi bi-box-arrow-right logout-icon"></i>
      </button>
  
  </nav>
</template>

<script>
export default {
  data() {
    return {
      menuOpen: null,
      usuario: "",
      empresa: "",
      base: "",
    };
  },
  methods: {
    toggleMenu(menu) {
    this.menuOpen = this.menuOpen === menu ? null : menu;
    
    // 🔥 Agrega la clase "active" al menú seleccionado
    this.$nextTick(() => {
      document.querySelectorAll(".dropdown").forEach((el) => {
        el.classList.remove("active");
      });
      if (this.menuOpen) {
        this.$refs[menu]?.classList.add("active");
      }
    });
  },
    closeMenu(event) {
      if (!this.$el.contains(event.target)) {
        this.menuOpen = null;
      }
    },
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
    logout() {
      localStorage.removeItem("userData");
      this.$router
        .push("/login")
        .catch((err) => console.warn("Navigation error:", err));
    },
    inicio() {
      this.$router
        .push("/inicio")
    },
  },
  mounted() {
    document.addEventListener("click", this.closeMenu);
    this.cargarUsuario();
  },
  beforeUnmount() {
    document.removeEventListener("click", this.closeMenu);
  },
};

</script>

<style scoped>
/* Aplicar Calibri a toda la página */
* {
  font-family: Calibri, sans-serif;
}

.navbar {
  background: linear-gradient(to bottom, #ffcc00, #faf7f7); /* Amarillo a negro */
 
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #ece5e5;
  height: 11vh;
  justify-content: center;

}



.navbar-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.navbar-logo {
  height: 50px;
  width: auto;
  margin-right: 20px;
}

.navbar-right {
  display: flex;
  gap: 2px;
  font-weight: bold;
}

.navbar ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 20px;
}

.navbar ul li {
  position: relative;
  padding: 10px 15px;
  cursor: pointer;
  font-weight: bold;
}

.navbar ul li a {
  text-decoration: none;
  color: black;
  font-weight: bold;
}

.navbar ul li a:hover,
.navbar ul li span:hover {
  text-decoration: underline;
}

/* Menú desplegable */
.dropdown-menu {
  position: absolute;
  background-color: #ffcc00;
  border: 1px solid #ccc;
  padding: 10px;
  list-style: none;
  left: 0;
  top: 100%;
  min-width: 200px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

/* Información del usuario */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 30%;
  white-space: nowrap;
}

.user-info {
  background: rgba(255, 255, 255, 0.6);
  padding: 6px 12px;
  border-radius: 5px;
  font-weight: bold;
  display: flex;
  align-items: center;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
  gap: 10px;
  max-width: 100%;
  overflow: hidden;
  font-size: 10px;
}

/* Estilos del menú desplegable */
.dropdown-menu li {
  padding: 8px 10px;
  transition: background-color 0.3s ease;
}

.dropdown-menu li:hover {
  background-color: #f4f5f8;
}

.dropdown-menu li a {
  color: #000000;
  text-decoration: none;
  display: block;
}

.dropdown-menu li a:hover {
  color: #161515;
}

.logout-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.logout-icon {
  font-size: 30px;
  color: black;
}

.logout-button:hover .logout-icon {
  color: #fffffe;
}

/* Estilos para resaltar el menú activo */
.dropdown-menu {
  position: absolute;
  background-color: #ffcc00;
  border: 1px solid #ccc;
  padding: 10px;
  list-style: none;
  left: 0;
  top: 100%;
  min-width: 200px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  z-index: 1000;
}

/* Pestaña superior en el menú */
.dropdown-menu::before {
  content: "▼";
  position: absolute;
  top: -10px;
  left: 15px;
  font-size: 16px;
  color: #ffcc00;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

/* Ítem de menú con efecto hover */
.dropdown-menu li {
  padding: 8px 10px;
  transition: background-color 0.3s ease;
  border-radius: 5px;
}

.dropdown-menu li:hover {
  background-color: #f8e287;
}

/* Efecto de pestaña activa en la barra de navegación */
.nav-menu .dropdown.active {
  background: rgba(255, 255, 255, 0.3);
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.2);
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

</style>

