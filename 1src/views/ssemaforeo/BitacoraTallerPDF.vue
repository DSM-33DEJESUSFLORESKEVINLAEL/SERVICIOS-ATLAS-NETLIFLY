<template>
    <div class="button-container">
        <button class="export-btn" @click="exportToPDF">Exportar a PDF</button>
        <button class="close-btn" @click="closeView">Cerrar</button>
      </div>
    <div class="container" ref="pdfContent">
      <div class="header">
        <div class="header-left">
          <img src="@/assets/atlas.png" alt="Logo" class="logo" />
          <div class="title">
            <h1>LLANTERA ATLAS, SA DE CV</h1>
            <h2>BITÁCORA DE TALLER</h2>
          </div>
        </div>
      </div>
  
      <div class="info">
        <p><span>Empresa:</span> {{ nombreempresa }}</p>
        <p><span>Base:</span> {{ reportData.length > 0 ? reportData[0].BASE : '' }}</p>
        <p><span>Análisis realizado por:</span> {{ usuario }}</p>
        <p><span>Realizado por:</span> {{ nombreusuario }}</p>
      </div>
  
      <p class="print-date">Fecha y hora de impresión: {{ getCurrentDateTime() }}</p>
  
      <table>
        <colgroup>
          <col span="5" class="col-bloque-1">
          <col span="5" class="col-bloque-2">
          <col span="5" class="col-bloque-3">
        </colgroup>
  
        <thead>
          <tr>
            <th colspan="5">Información de Unidad</th>
            <th colspan="5">Información Anterior</th>
            <th colspan="5">Cambio de Taller</th>
          </tr>
          <tr>
            <th></th>
            <th>Base</th>
            <th>Folio</th>
            <th>Posición</th>
            <th>Unidad</th>
            <th>MM</th>
            <th>OR</th>
            <th>Marca</th>
            <th>DOT</th>
            <th>Observación </th>
            <th>MM Actual</th>
            <th>OR Actual</th>
            <th>Marca Actual</th>
            <th>DOT Actual</th>
            <th>Fecha Taller</th>

          </tr>
        </thead>
  
        <tbody>
          <tr v-for="(item, index) in reportData" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ item.BASE }}</td>
            <td>{{ item.FOLIO }}</td>
            <td>{{ item.POSICION }}</td>
            <td>{{ item.UNIDAD }}</td>
            <td>{{ item.MM_ANTERIOR }}</td>
            <td>{{ item.OR_ANTERIOR }}</td>
            <td>{{ item.TMARCA_ANTERIOR }}</td>
            <td>{{ item.DOT_ANTERIOR }}</td>
            <td>{{ item.OBS_ANTERIOR }}</td>
            <td>{{ item.MM_ACTUAL }}</td>
            <td>{{ item.OR_ACTUAL }}</td>
            <td>{{ item.TMARCA_ACTUAL }}</td>
            <td>{{ item.DOT_ACTUAL }}</td>
            <td>{{ formatearFecha(item.FTALLER_ACTUAL) }}</td>

          </tr>
        </tbody>
  
        <tfoot>
          <tr>
            <td colspan="15">Total de registros: {{ reportData.length }}</td>
          </tr>
        </tfoot>
      </table>
  
      
    </div>
  </template>
  
  <script>
  import jsPDF from 'jspdf';
  import html2canvas from 'html2canvas';
  
  export default {
    data() {
      return {
        reportData: history.state?.reportData || [],
        nombreempresa: "",
        nombreusuario: "",
        usuario:"",
        pdfFileName: "bitacora_taller.pdf"
      };
    },
    created() {
      const datos = this.$route.params.data;
      if (datos) {
        this.reportData = JSON.parse(atob(datos));
      }
    },
    methods: {
      formatearFecha(dateString) {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      },
      getCurrentDateTime() {
        const now = new Date();
        return now.toLocaleString();
      },
      cargarUsuario() {
            const userData = localStorage.getItem("userData");
            if (userData) {
                try {
                    const parsedData = JSON.parse(userData);
                    this.nombreempresa = parsedData.NOMBREEMPRESA || "N/A";
                    this.nombreusuario = parsedData.NOMBREUSUARIO;
                    this.usuario = parsedData.USUARIO;

                } catch (error) {
                    console.error("Error al parsear datos de usuario:", error);
                    this.errorMessage = "❌ No se pudieron cargar los datos de usuario.";
                }
            }
        },
      exportToPDF() {
        const fileName = prompt("Ingrese el nombre del archivo PDF:", this.pdfFileName);
        if (!fileName) {
          alert("⚠️ Debe ingresar un nombre para el archivo PDF.");
          return;
        }
  
        const element = this.$refs.pdfContent;
        html2canvas(element, { scale: 2, useCORS: true }).then(canvas => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const imgWidth = 210;
          const pageHeight = 297;
          let imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 10;
  
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
  
          while (heightLeft > 0) {
            position = heightLeft - imgHeight + 20;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }
  
          pdf.save(fileName + ".pdf");
        });
      },
      closeView() {
        this.$router.go(-1);
      }
    },
    mounted() {
        this.cargarUsuario();
    }
  };
  </script>
  
  <style scoped>
  .title h1,
.title h2 {
    margin: 0;
    color: #000000;

}
  .container {
    width: 100%;
    max-width: 1300px;
    margin: auto;
    background: #ffffff;
    color: #000;
    padding: 5px;
    border-radius: 5px;
    font-family: Arial, sans-serif;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #000;
    padding-bottom: 25px;
    margin-bottom: 10px;
  }
  .header-left {
    display: flex;
    align-items: center;
}

  .info {
    display: flex;
    justify-content: space-between;
    background: #2a4a7b;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 10px;
    color: white;
  }
  
  .print-date {
    text-align: right;
    font-size: 14px;
    margin-top: 10px;
    font-weight: bold;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }
  
  thead {
    background-color: #1e3a5f;
    color: white;
  }
  
  th, td {
    border: 1px solid #070707;
    padding: 8px;
    text-align: left;
  }
  
  tfoot {
    background-color: #fdcc07;
    font-weight: bold;
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
.logo {
    width: 130px;
    height: auto;
    margin-right: 1px;
}
.close-btn {
    background-color: red;
    color: white;
}
  </style>
  