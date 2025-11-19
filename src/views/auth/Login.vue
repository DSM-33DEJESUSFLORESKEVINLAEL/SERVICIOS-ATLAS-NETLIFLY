<template>
  <div class="login-container">
    <div class="login-box">
      <img src="../../assets/2 ATLAS.png" alt="Login Image" class="login-image" />
      <h2>Iniciar Sesión</h2>
      <form @submit.prevent="login">
        <div class="input-group">
          <label for="usuario"><span class="icon">&#128100;</span> Usuario:</label>
          <input type="text" v-model="usuario" @input="usuario = usuario.trim().replace(/\s+/g, '')" required />
        </div>
        <div class="input-group">
          <label for="password"><span class="icon">&#128274;</span> Contraseña:</label>
          <div class="password-container">
            <input :type="showPassword ? 'text' : 'password'" v-model="password" @input="password = password.trim().replace(/\s+/g, '')" required />
            <button type="button" @click="togglePassword" class="toggle-password">
              {{ showPassword ? "👁️" : "🙈" }}
            </button>
          </div>
        </div>
        <button type="submit" class="btn">Login</button>
      </form>
    </div>

    <!-- Modal para selección de empresa -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>Selecciona una empresa</h3>
        <ul>
          <li v-for="empresa in empresas" :key="empresa.BASE">
            <button @click="seleccionarEmpresa(empresa)">{{ empresa.NOMBRE_EMPRESA }} - {{ empresa.BASE }}</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>



<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import apiService from "../../services/apiService";

export default {
  setup() {
    const usuario = ref("ASESORIA");
    const password = ref("ASE19*");
    // const usuario = ref("WCLN");
    // const password = ref("WMT*CLN");
    //   const usuario = ref("WSMO");
    // const password = ref("WMT*SMO");
    const showPassword = ref(false);
    const router = useRouter();
    const showModal = ref(false);
    const empresas = ref([]);
    const selectedEmpresa = ref(null);

    const togglePassword = () => {
      showPassword.value = !showPassword.value;
    };

    const login = async () => {
      try {
        const userData = await apiService.getUsuarios(usuario.value, password.value);
        if (userData?.DATA?.length > 0) {
          empresas.value = userData.DATA;

          if (empresas.value.length > 1) {
            showModal.value = true;
          } else {
            seleccionarEmpresa(empresas.value[0]);
          }
        } else {
          alert("Credenciales incorrectas.");
        }
      } catch (error) {
        console.error("🚨 ERROR en la autenticación:", error);
        alert("Error al iniciar sesión.");
      }
    };

    const seleccionarEmpresa = async (empresa) => {
      try {
        showModal.value = false;
        selectedEmpresa.value = empresa;
        const userDatos = await apiService.getUsuarioEmpresaBase(
          usuario.value,
          password.value,
          empresa.EMPRESA,
          empresa.BASE
        );
        const detallesUsuario = userDatos.DATA[0];

        const user = {
          USUARIO: usuario.value,
          NOMBREUSUARIO: detallesUsuario.NOMBREUSUARIO,
          EMPRESA: detallesUsuario.EMPRESA,
          BASE: detallesUsuario.BASE,
          SERIE: detallesUsuario.SERIE,
          NOMBREEMPRESA: detallesUsuario.NOMBREEMPRESA,
          DESMONTAJE_INMEDIATO: detallesUsuario.DESMONTAJE_INMEDIATO,
          DESMONTAJE_PROX_DESDE: detallesUsuario.DESMONTAJE_PROX_DESDE,
          DESMONTAJE_PROX_HASTA: detallesUsuario.DESMONTAJE_PROX_HASTA,
          BUENAS_CONDICIONES: detallesUsuario.BUENAS_CONDICIONES,
          EMP_CTE: detallesUsuario.EMP_CTE,
          CLIENTE: detallesUsuario.CLIENTE,
          LUGAR: detallesUsuario.LUGAR,
          GRUPO: detallesUsuario.GRUPO,
        };
        localStorage.setItem("userData", JSON.stringify(user));
        router.push("/Inicio");
      } catch (error) {
        console.error("🚨 ERROR en la selección de empresa:", error);
        alert("Error al seleccionar la empresa.");
      }
    };

    return {
      usuario,
      password,
      showPassword,
      togglePassword,
      login,
      showModal,
      empresas,
      seleccionarEmpresa,
    };
  },
};
</script>

<style scoped>
/* Aplicar Calibri a toda la página */
* {
  font-family: Calibri, sans-serif;
}

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 97vh;
  background: linear-gradient(to bottom, #ffcc00, #f6dd1e); /* Amarillo a negro */
}

.login-box {
  background: rgba(255, 255, 255, 0.9);
  padding: 40px;
  border-radius: 15px;
  text-align: center;
  width: 350px;
  box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.login-image {
  width: 99px;
  height: auto;
  margin-bottom: 10px;
}

h2 {
  color: #333;
}

.input-group {
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-bottom: 15px;
}

.input-group label {
  font-size: 14px;
  color: #444;
  display: flex;
  align-items: center;
}

.password-container {
  display: flex;
  align-items: center;
  position: relative;
}

.password-container input {
  flex: 1;
  padding-right: 30px;
}

.toggle-password {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px; 
  width: 30px; 
  height: 30px; 
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-top: 5px;
}

.options {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #555;
}

button {
  background-color: #ffcc00;
  color: white;
  padding: 10px;
  border: none;
  cursor: pointer;
  width: 100%;
  border-radius: 5px;
  font-size: 16px;
}

button:hover {
  background: linear-gradient(to bottom, #d2a904, #d89505); /* Amarillo a negro */
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 90%;
}

.btn {
  background: linear-gradient(90deg, #ffcc00, #e6b800);
  color: #fcfafa;
  padding: 14px 36px;
  font-size: 18px;
  font-weight: bold;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease-in-out;
  border: 2px solid #ffcc00;
  box-shadow: 0 3px 10px rgba(238, 238, 237, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn:hover {
  background: linear-gradient(90deg, #e6b800, #cfa30f);
  border-color: #ffffff;
  transform: translateY(-3px);
  box-shadow: 0 5px 12px rgba(249, 249, 248, 0.7);
}

</style>

