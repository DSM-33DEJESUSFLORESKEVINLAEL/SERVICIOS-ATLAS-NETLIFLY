<template>
    <div>
      <!-- <h2>Reporte de Semáforo</h2> -->
      <canvas id="miGrafico"></canvas>
      <button @click="exportarGrafica">📤 Exportar Gráfica</button>
    </div>
  </template>
  
  
  <script>
  import { Chart, registerables } from "chart.js";
  import { nextTick } from "vue";
  
  Chart.register(...registerables);
  
  export default {
    data() {
      return {
        chartInstance: null, // Referencia a la gráfica
      };
    },
    mounted() {
      nextTick(() => {
        this.generarGrafica();
      });
    },
    methods: {
      generarGrafica() {
        const canvas = document.getElementById("miGrafico");
  
        if (!canvas) {
          console.warn("⚠️ No se encontró el canvas para la gráfica.");
          return;
        }
  
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          console.error("⚠️ No se pudo obtener el contexto del canvas.");
          return;
        }
  
        this.chartInstance = new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["Verde", "Amarillo", "Rojo", "Negro"],
            datasets: [
              {
                label: "Cantidad",
                data: [3742, 647, 148, 51],
                backgroundColor: ["green", "yellow", "red", "black"],
              },
            ],
          },
          options: {
            responsive: true,
          },
        });
      },
  
      exportarGrafica() {
        const canvas = document.getElementById("miGrafico");
  
        if (!canvas) {
          alert("⚠️ No se encontró la gráfica para exportar.");
          console.error("⚠️ No se encontró el canvas para exportar.");
          return;
        }
  
        const imagen = canvas.toDataURL("image/png"); // Convierte la gráfica en imagen
        const link = document.createElement("a");
        link.href = imagen;
        link.download = "grafica_semaforo.png";
        link.click();
      },
    },
  };
  </script>
  
  
  <style scoped>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .modal-content {
    background: white;
    padding: 20px;
    width: 80%;
    max-width: 600px;
    border-radius: 10px;
    text-align: center;
  }
  </style>
  