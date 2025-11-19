<template>
  <div class="home-container">
    <div class="logo-container">
      <img src="../../assets/2 ATLAS.png" alt="Company Logo" class="login-image" />
    </div>
    <div class="button-container">
      <router-link to="/Login" class="btn">Ingresar</router-link>
    </div>
  </div>
</template>

<script>
</script>

<style scoped>
.home-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom, #ffcc00, #faf7f7); /* Amarillo degradado */
  text-align: center;
  padding: 20px;
}

.logo-container {
  background: rgba(255, 204, 0, 0.1);
  padding: 40px;
  border-radius: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(247, 245, 245, 0.3);
  border: 2px solid rgba(255, 204, 0, 0.5);
  backdrop-filter: blur(10px);
  max-width: 400px;
  transition: transform 0.3s ease-in-out;
}

.logo-container:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(232, 231, 230, 0.4);
}

.login-image {
  width: 430px;
  height: auto;
  filter: drop-shadow(3px 3px 6px rgba(255, 204, 0, 0.5));
}

.button-container {
  display: flex;
  gap: 20px;
  margin-top: 30px;
}

.btn {
  background: linear-gradient(90deg, #ffcc00, #e6b800);
  color: #000;
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
