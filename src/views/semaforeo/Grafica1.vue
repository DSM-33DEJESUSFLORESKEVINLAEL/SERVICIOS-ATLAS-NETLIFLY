<template>
  <div v-if="loading" class="loading-overlay">
    <div class="loading-message">🔄 Procesando... Por favor espera</div>
  </div>

  <div class="button-container">
    <button class="export-btn" @click="exportToPDF">Exportar a PDF</button>
    <button class="close-btn" @click="closeView">Cerrar</button>
  </div>
  <div class="container" ref="pdfContent">
    <div class="header">
      <div class="header-left">
        <div class="title">
          <img :src="logoAtlas" alt="Logo" class="logo" />
          <h1>LLANTERA ATLAS, SA DE CV</h1>
          <h2>INSPECCION DE LLANTA (SEMAFOREO)</h2>
        </div>
      </div>
      <div class="folio">
        <p>Folio</p>
        <p class="folio-number">{{ reportData.length > 0 ? reportData[0].FOLIO : '' }}</p>
      </div>
    </div>
    <div class="info">
      <p><span>Empresa:</span> {{ nombreempresa }}</p>
      <p><span>Base:</span>{{ baseglobal }}</p>
      <p><span>Realizado por </span> {{ nombreusuario }}</p>
    </div>
<div v-if="!loading && reportChunks?.[currentPage]?.length === 0">

  ⚠️ No se encontraron datos para el folio seleccionado.
</div>


    <p class="print-date">Fecha y hora de impresión: {{ getCurrentDateTime() }}</p>

    <!-- RESUMEN DE LLANTAS -->
    <div class="resumen-container">
      <div class="resumen-box sin-llanta">Sin llanta<br>{{ resumen.SIN_LLANTA }}</div>
      <div class="resumen-box cero">Cero<br>{{ resumen.CERO }}</div>
      <div class="resumen-box rojas">Rojas<br>{{ resumen.ROJAS }}</div>
      <div class="resumen-box amarillas">Amarillas<br>{{ resumen.AMARILLAS }}</div>
      <div class="resumen-box buenas">Buenas<br>{{ resumen.BUENAS }}</div>
      <div class="resumen-box originales">Originales<br>{{ resumen.ORIGINALES }}</div>
      <div class="resumen-box renovadas">Renovadas<br>{{ resumen.RENOVADAS }}</div>
    </div>

    <!-- TABLA RESUMEN POR BASE -->
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Unidad</th>
          <th>Tipo de unidad</th>
          <th>Medida Dirección</th>
          <th>Medida Trasera</th>
          <th v-for="pos in 12" :key="'pos-header-' + pos">P{{ pos }}<br>MM | OR</th>
          <th>Piso Promedio</th>
          <th>Observación</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="reportChunks[currentPage]">
        <tr v-for="(item, index) in reportChunks[currentPage]" :key="index">
          <td>{{ index + 1 + currentPage * chunkSize }}</td>
          <td>{{ item.UNIDAD }}</td>
          <td>{{ item.TUNIDAD }}</td>
          <td>{{ item.MEDIDA_DIRECCION }}</td>
          <td>{{ item.MEDIDA_TRASERA }}</td>
          <td v-for="pos in 12" :key="'pos-' + pos">
            <div :style="getEstiloMM(item['MM' + pos], item['OBS' + pos], item['BIT' + pos])">
              <strong>{{ item['MM' + pos] ?? '' }}</strong>
            </div>
            <div>{{ item['OR' + pos] ?? '' }}</div>
          </td>
          <td><strong>{{ item.MM_PROMEDIO }}</strong></td>
          <td>{{ item.OBS }}</td>
        </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script>
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import apiService from "@/services/apiService";
import logoAtlas from "@/assets/atlas.png"; // ✅ importa como módulo


export default {
  props: {
  folio: {
    type: String,
    required: true
  },
  base: {
    type: String,
    required: true,
    default: ''
  }
},

  data() {
    return {
      reportData: [],
      logoAtlas: logoAtlas, // ✅ disponible para el template
      reportDataResumen: [],
      chunkSize: 25, // puedes ajustar esto
      nombreempresa: "",
      nombreusuario: "",
      baseglobal: this.base || "",
      desmontajeinmediato: "",
      desmantajeproxdesde: "",
      desmontajeproxhasta: "",
      buenascondiciones: "",
      pdfFileName: `Reporte_Folio_${this.folio}`,
      urlGenerada: "",
      currentPage: 0, // ✅ AGREGAR ESTA LÍNEA
      resumen: {
        SIN_LLANTA: 0,
        CERO: 0,
        ROJAS: 0,
        AMARILLAS: 0,
        BUENAS: 0,
        ORIGINALES: 0,
        RENOVADAS: 0
      },
      errorMessage: "",
      loading: false,
    };
  },
  
 computed: {
  reportChunks() {
    const chunks = [];
    if (Array.isArray(this.reportData)) {
      for (let i = 0; i < this.reportData.length; i += this.chunkSize) {
        chunks.push(this.reportData.slice(i, i + this.chunkSize));
      }
    }
    return chunks.length > 0 ? chunks : [[]]; // <- esto garantiza que siempre haya al menos un array
  }
}
,
  created() {
  this.baseglobal = this.base || this.$route.params.base || "";
  const datos = this.$route.params.data;

  if (datos) {
    this.reportData = JSON.parse(atob(datos));
    this.reportDataResumen = this.agruparPorBase(this.reportData);
  }
},


  mounted() {
    this.cargarUsuario();
    this.cargarDatosCaptura();
  },
  methods: {
    getEstiloMM(mm, obs, bit) {
  const baseEstilo = {
    padding: '6px',
    textAlign: 'center',
    borderRadius: '4px',
    fontWeight: 'bold',
    color: 'white',
  };

  // 1. Sin llanta (MM vacío o null y sí hay OBS)
  if ((!mm || mm.toString().trim() === '') && obs && obs.trim() !== '') {
    return {
      ...baseEstilo,
      padding: '13px',
      backgroundColor: 'blue',
    };
  }

  // 2. Si BIT es "B" (buen estado según BIT)
  if (bit === 'B') {
    return {
      ...baseEstilo,
      backgroundColor: '#FF80FF', // Magenta claro
    };
  }

  // 3. Cero
  if (mm === 0 || mm === '0') {
    return {
      ...baseEstilo,
      backgroundColor: 'black',
    };
  }

  // Asegurar número válido para comparaciones
  const mmNum = parseInt(mm);

  // 4. Rojas
  if (mmNum > 0 && mmNum <= 3) {
    return {
      ...baseEstilo,
      backgroundColor: 'red',
    };
  }

  // 5. Amarillas
  if (mmNum >= 4 && mmNum <= 6) {
    return {
      ...baseEstilo,
      backgroundColor: 'yellow',
      color: 'black',
    };
  }

  // 6. Buenas
  if (mmNum >= 7) {
    return {
      ...baseEstilo,
      backgroundColor: 'green',
    };
  }

  // Valor por defecto (sin color)
  return {
    padding: '2px',
    textAlign: 'center',
  };
},

    calcularResumen() {
  const resumen = {
    SIN_LLANTA: 0,
    CERO: 0,
    ROJAS: 0,
    AMARILLAS: 0,
    BUENAS: 0,
    ORIGINALES: 0,
    RENOVADAS: 0
  };

  const retiro = parseInt(this.desmontajeinmediato ?? "2");
  const amarilloHasta = parseInt(this.desmontajeproxhasta ?? "4");
  const buenasCond = parseInt(this.buenascondiciones ?? "5");

  this.reportData.forEach(item => {
    for (let i = 1; i <= 12; i++) {
      const mmLimpio = String(item[`MM${i}`] ?? "").trim().toUpperCase();
      const orLimpio = String(item[`OR${i}`] ?? "").trim().toUpperCase();
      const obsLimpio = String(item[`OBS${i}`] ?? "").trim().toUpperCase();

      // 🟦 SIN LLANTA
      if ((mmLimpio === "" || mmLimpio === "NULL") && obsLimpio !== "") {
        resumen.SIN_LLANTA++;
        continue; // 👈 IMPORTANTE: no cuentes nada más si está sin llanta
      }

      const mmNum = parseInt(mmLimpio);
      if (isNaN(mmNum)) continue;

      // ⚫ CERO
      if (mmNum === 0) resumen.CERO++;
      // 🔴 ROJAS
      else if (mmNum > 0 && mmNum <= retiro) resumen.ROJAS++;
      // 🟡 AMARILLAS
      else if (mmNum >= retiro + 1 && mmNum <= amarilloHasta) resumen.AMARILLAS++;
      // 🟢 BUENAS
      else if (mmNum >= buenasCond) resumen.BUENAS++;

      // ✅ SOLO contar OR y R si hay MM válido
      if (orLimpio === "O") resumen.ORIGINALES++;
      if (orLimpio === "R") resumen.RENOVADAS++;
    }
  });

  this.resumen = resumen;
},  
    // async cargarDatosCaptura() {
    //   this.errorMessage = "";
    //   this.loading = true;

    //   try {
    //     const userData = localStorage.getItem("userData");
    //     let empresa = "", base = "";

    //     if (userData) {
    //       const parsedData = JSON.parse(userData);
    //       empresa = parsedData.EMPRESA;
    //       base = parsedData.BASE;
    //     }

    //     const url = `http://atlastoluca.dyndns.org:20100/datasnap/rest/TServerMethods1/Semaforeodetallereporte/${empresa}/${base}/${this.folio}`;
    //     this.urlGenerada = url;
    //     console.log("🔎 Folio recibido:", this.folio);
    //     console.log("🔗 URL generada para consulta:", url);

    //     const response = await apiService.Semaforeodetallereporte(empresa, base, this.folio);

    //     if (response?.DATA?.length > 0) {
    //       this.reportData = response.DATA;
    //       this.calcularResumen();
    //     } else {
    //       console.warn("⚠️ No se encontraron datos.");
    //     }

    //   } catch (error) {
    //     console.error("❌ Error en consulta de captura:", error);
    //     this.errorMessage = "❌ Error al obtener los datos de captura.";
    //   } finally {
    //     this.loading = false;
    //   }
    // },
    async cargarDatosCaptura() {
  this.errorMessage = "";
  this.loading = true;

  try {
    const userData = localStorage.getItem("userData");
    let empresa = "";

    if (userData) {
      const parsedData = JSON.parse(userData);
      empresa = parsedData.EMPRESA;
    }

    const base = this.baseglobal; // ✅ CORRECTO

    const url = `http://atlastoluca.dyndns.org:20100/datasnap/rest/TServerMethods1/Semaforeodetallereporte/${empresa}/${this.base}/${this.folio}`;
    this.urlGenerada = url;
    console.log("🔎 Folio recibido:", this.folio);
    console.log("📍 Base recibida:", base);
    console.log("🔗 URL generada para consulta:", url);

    const response = await apiService.Semaforeodetallereporte(empresa, base, this.folio);

    if (response?.DATA?.length > 0) {
      this.reportData = response.DATA;
      this.calcularResumen();
    } else {
      console.warn("⚠️ No se encontraron datos.");
    }

  } catch (error) {
    console.error("❌ Error en consulta de captura:", error);
    this.errorMessage = "❌ Error al obtener los datos de captura.";
  } finally {
    this.loading = false;
  }
},

    cargarUsuario() {
      const userData = localStorage.getItem("userData");
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          this.nombreempresa = parsedData.NOMBREEMPRESA || "N/A";
          this.nombreusuario = parsedData.NOMBREUSUARIO || "N/A";
          // this.baseglobal = parsedData.BASE || "";
          this.desmontajeinmediato = parsedData.DESMONTAJE_INMEDIATO || "2";
          this.desmantajeproxdesde = parsedData.DESMONTAJE_PROX_DESDE || "3";
          this.desmontajeproxhasta = parsedData.DESMONTAJE_PROX_HASTA || "4";
          this.buenascondiciones = parsedData.BUENAS_CONDICIONES || "5";
        } catch (error) {
          console.error("❌ Error al parsear datos de usuario:", error);
          this.errorMessage = "❌ No se pudieron cargar los datos de usuario.";
        }
      }
    },

    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },

    getCurrentDateTime() {
      const now = new Date();
      const day = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    },

   
//     exportToPDF() {
//   const fileName = prompt("Ingrese el nombre del archivo PDF:", this.pdfFileName);
//   if (!fileName) {
//     alert("⚠️ Debe ingresar un nombre para el archivo PDF.");
//     return;
//   }

//   this.loading = true; // Mostrar mensaje

//   this.$nextTick(() => {
//     const element = this.$refs.pdfContent;
//     if (!element) {
//       this.loading = false;
//       alert("⚠️ No se pudo capturar el contenido para exportar.");
//       return;
//     }

//     html2canvas(element, { scale: 2, useCORS: true }).then(canvas => {
//       const imgData = canvas.toDataURL("image/png");
//       const pdf = new jsPDF("p", "mm", "a4");
//       const imgWidth = 210;
//       const pageHeight = 297;
//       let imgHeight = (canvas.height * imgWidth) / canvas.width;
//       let heightLeft = imgHeight;
//       let position = 10;

//       pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
//       heightLeft -= pageHeight;

//       while (heightLeft > 0) {
//         position = heightLeft - imgHeight + 20;
//         pdf.addPage();
//         pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
//         heightLeft -= pageHeight;
//       }

//       pdf.save(fileName + ".pdf");
//     }).catch(error => {
//       console.error("❌ Error al generar PDF:", error);
//       alert("⚠️ Ocurrió un error al generar el PDF.");
//     }).finally(() => {
//       this.loading = false; // Ocultar mensaje
//     });
//   });
// },
// async exportToPDF() {
//   const fileName = prompt("Ingrese el nombre del archivo PDF:", this.pdfFileName || "reporte_semaforo");
//   if (!fileName) return;

//   this.loading = true;

//   await this.$nextTick(); // Esperar renderizado

//   const element = this.$refs.pdfContent;
//   if (!element) {
//     this.loading = false;
//     alert("❌ No se encontró el contenedor del reporte (pdfContent).");
//     return;
//   }

//   // 1️⃣ Validar carga de imágenes
//   const images = element.querySelectorAll("img");
//   const imagenesFallidas = [];

//   await Promise.all(Array.from(images).map(img =>
//     new Promise(resolve => {
//       if (img.complete && img.naturalHeight !== 0) {
//         resolve();
//       } else {
//         img.onload = resolve;
//         img.onerror = () => {
//           imagenesFallidas.push(img.src);
//           resolve();
//         };
//       }
//     })
//   ));

//   if (imagenesFallidas.length > 0) {
//     console.warn("⚠️ Imágenes no cargadas:", imagenesFallidas);
//     this.loading = false;
//     alert(`❌ No se pudo cargar una o más imágenes para el PDF:\n\n${imagenesFallidas.join('\n')}`);
//     return;
//   }

//   try {
//   const canvas = await html2canvas(element, {
//     scale: 2,
//     useCORS: true,
//     scrollY: -window.scrollY,
//     logging: true,
//   });

//   const imgData = canvas.toDataURL("image/png");

//   // Validar que el base64 generado es PNG válido
//   if (!imgData || !imgData.startsWith("data:image/png")) {
//     throw new Error("El canvas no generó una imagen PNG válida.");
//   }

//   const pdf = new jsPDF("p", "mm", "a4");
//   const imgWidth = 210;
//   const pageHeight = 297;
//   const imgHeight = (canvas.height * imgWidth) / canvas.width;

//   let heightLeft = imgHeight;
//   let position = 0;

//   pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
//   heightLeft -= pageHeight;

//   while (heightLeft > 0) {
//     position = heightLeft - imgHeight;
//     pdf.addPage();
//     pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
//     heightLeft -= pageHeight;
//   }

//   pdf.save(fileName + ".pdf");
// } catch (error) {
//   console.error("❌ Error al generar el PDF:", error);

//   if (error.message?.includes("Incomplete or corrupt PNG")) {
//     alert("❌ Error al generar el PDF: una imagen PNG está corrupta (posiblemente el canvas generado por html2canvas). Revisa si hay contenido oculto o muy grande.");
//   } else if (error.message?.includes("canvas") || error.message?.includes("toDataURL")) {
//     alert("❌ Error al convertir canvas a imagen. Posiblemente el DOM es muy complejo o una imagen no se ha cargado completamente.");
//   } else {
//     alert(`❌ Error inesperado al generar PDF:\n${error.message}`);
//   }
// }
// }
async exportToPDF() {
  const fileName = prompt("Ingrese el nombre del archivo PDF:", "Reporte_Folio");
  if (!fileName) return;

  this.loading = true;
  const pdf = new jsPDF("p", "mm", "a4");

  for (let i = 0; i < this.reportChunks.length; i++) {
    this.currentPage = i;
    await this.$nextTick();

    const element = this.$refs.pdfContent;
    if (!element) {
      alert("❌ No se encontró el contenedor del PDF.");
      this.loading = false;
      return;
    }

    // Esperar carga completa de imágenes
    try {
      const images = element.querySelectorAll("img");
      await Promise.all(Array.from(images).map((img, idx) => {
        return new Promise((resolve, reject) => {
          if (img.complete && img.naturalHeight > 0) return resolve();
          img.onload = resolve;
          img.onerror = () => reject(new Error(`❌ Imagen ${idx + 1} no cargó correctamente.`));
        });
      }));
    } catch (error) {
      alert(`❌ Error cargando imágenes: ${error.message}`);
      this.loading = false;
      return;
    }

    // Capturar canvas y agregar a PDF
    try {
      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        scrollY: -window.scrollY,
        backgroundColor: "#ffffff"
      });

      const imgData = canvas.toDataURL("image/png");

      if (!imgData.startsWith("data:image/png")) {
        throw new Error("El canvas no generó una imagen PNG válida.");
      }

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    } catch (error) {
      console.error("❌ Error al convertir canvas:", error);
      alert(`❌ Error al convertir canvas a imagen. Posiblemente el DOM es muy complejo o una imagen no se cargó completamente.\n\nDetalle técnico: ${error.message}`);
      this.loading = false;
      return;
    }
  }

  try {
    pdf.save(`${fileName}.pdf`);
    this.loading = false;
  } catch (error) {
    alert("❌ Error al guardar el PDF: " + error.message);
    this.loading = false;
  }
},

    closeView() {
      this.$router.go(-1);
    },

    agruparPorBase(data) {
      // Implementa si necesitas usar esta función
      return data;
    }
  }
};
</script>


<style scoped>
.container {
  width: 100%;
  max-width: 1300px;
  margin: auto;
  background: #ffffff;
  /* Azul oscuro */
  color: rgb(0, 0, 0);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #000000;
  padding-bottom: 25px;
  margin-bottom: 10px;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  width: 110px;
  height: auto;
  margin-right: 10px;
}

.title h1,
.title h2 {
  margin: 0;
  color: #000000;

}

.folio {
  text-align: center;
  border: 2px solid #050505;
  padding: 25px;
  border-radius: 5px;
}

.folio p {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
}

.folio-number {
  color: #000000;
  font-size: 16px;
}

.info {
  display: flex;
  justify-content: space-between;
  background: #2a4a7b;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 30px;
}

.info p {
  margin: 0;
  font-size: 15px;
  color: #ffffff;

}

.info span {
  font-weight: bold;
  color: #fdcc07;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background: rgb(0, 0, 0);
  color: rgb(8, 8, 8);
  border-radius: 8px;
  overflow: hidden;
}

/* td {
  text-align: center;
  font-size: 12px;
  padding: 3px;
} */
td {
  text-align: center;
  font-size: 11px;
  padding: 4px;
  white-space: nowrap;
}

thead th {
  background-color: #1e3a5f;
  color: white;
  font-size: 13px;
}


tr:nth-child(even) {
  background-color: #f2f2f2;
}

tr:nth-child(odd) {
  background-color: #ffffff;
}

tr:hover {
  background-color: #fdcc07;
  cursor: pointer;
}



.button-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.export-btn,
.close-btn {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

.export-btn {
  background-color: #fdcc07;
  color: black;
}

.close-btn {
  background-color: red;
  color: white;
}

/* --------------------------------------------------------------- */
.resumen-container {
  display: flex;
  justify-content: start;
  gap: 10px;
  margin-bottom: 15px;
  font-size: 13px;
  font-weight: bold;
}

.resumen-box {
  border: 1px solid black;
  padding: 5px 10px;
  text-align: center;
  border-radius: 4px;
  width: 90px;
}

.sin-llanta {
  background-color: #00f0ff;
}

.cero {
  background-color: black;
  color: white;
}

.rojas {
  background-color: red;
  color: white;
}

.amarillas {
  background-color: yellow;
}

.buenas {
  background-color: #3CB371;
  color: white;
}

.originales {
  background-color: white;
  border: 1px solid #999;
}

.renovadas {
  background-color: #f8f8ff;
  color: blue;
  border: 1px solid #999;
}
.sin-llanta {
  background-color: #00f0ff; /* Azul cielo */
}


.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-message {
  background-color: #ffffff;
  color: #333;
  padding: 20px 40px;
  border-radius: 10px;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}



.error-message {
  background-color: #ffdddd;
  color: #d8000c;
  border: 1px solid #d8000c;
  padding: 10px;
  margin: 20px 0;
  text-align: center;
  border-radius: 5px;
  font-weight: bold;
}

</style>