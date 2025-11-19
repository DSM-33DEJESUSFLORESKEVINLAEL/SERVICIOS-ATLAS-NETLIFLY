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
                    <h2>ANÁLISIS DE MILÍMETROS</h2>
                </div>
            </div>
            <div class="folio">
                <p>Folio</p>
                <p class="folio-number">{{ reportData.length > 0 ? reportData[0].FOLIO : '' }}</p>
            </div>
        </div>
        <div class="info">
            <p><span>Empresa:</span> {{ nombreempresa }}</p>
            <!-- <p><span>Base:</span> {{ reportData.length > 0 ? reportData[0].BASE : '' }}</p> -->
            <p><span>Base:</span>{{ baseglobal }}</p>
            <p><span>Análisis realizado por:</span> {{ reportData.length > 0 ? reportData[0].USUARIO : '' }}</p>
            <p><span>Realizado por </span> {{ nombreusuario }}</p>
        </div>
        <p class="print-date">Fecha y hora de impresión: {{ getCurrentDateTime() }}</p>
        <!-- TABLA RESUMEN POR BASE -->
        <!-- <div v-if="reportDataResumen && reportDataResumen.length" class="table-container">
            <h3>Resumen Análisis Milímetros</h3>
            <table>
                <thead>
                    <tr>
                        <th>Base</th>
                        <th>Sin llanta</th>
                        <th>0 mm</th>
                        <th>1 mm</th>
                        <th>2 mm</th>
                        <th>3 mm</th>
                        <th>3 mm sin cobertura</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in reportDataResumen" :key="index">
                        <td>{{ item.BASE }}</td>
                        <td class="sin-llanta">{{ item.SIN_LLANTA }}</td>
                        <td class="cero-mm">{{ item.CERO }}</td>
                        <td class="uno-mm">{{ item.UNO }}</td>
                        <td class="dos-mm">{{ item.DOS }}</td>
                        <td class="tres-mm">{{ item.TRES }}</td>
                        <td class="tres-sin-obs">{{ item.TRES_SIN_OBS }}</td>
                    </tr>
                    <tr class="total-row">
                        <td><strong>Totales</strong></td>
                        <td class="sin-llantas"><strong>{{ calcularTotalesResumen().SIN_LLANTA }}</strong></td>
                        <td class="cero-mms"><strong>{{ calcularTotalesResumen().CERO }}</strong></td>
                        <td class="uno-mms"><strong>{{ calcularTotalesResumen().UNO }}</strong></td>
                        <td class="dos-mms"><strong>{{ calcularTotalesResumen().DOS }}</strong></td>
                        <td class="tres-mms"><strong>{{ calcularTotalesResumen().TRES }}</strong></td>
                        <td class="tres-sin-obss"><strong>{{ calcularTotalesResumen().TRES_SIN_OBS }}</strong></td>
                    </tr>
                    <tr>
                        <td><strong>Totales Rojo mm</strong></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td><strong>{{ sumarTresValores(calcularTotalesResumen()) }}</strong></td>
                        <td></td>
                        <td></td>
                    </tr>

                </tbody>
            </table>
        </div> -->

        <!-- TABLA RESUMEN POR BASE -->
<div v-if="reportDataResumen && reportDataResumen.length" class="table-container">
  <h3>Resumen Análisis Milímetros</h3>
  <table class="resumen-mm">
    <thead>
      <tr>
        <th>Base</th>
        <th>Sin llanta</th>
        <th>0 mm</th>
        <th>1 mm</th>
        <th>2 mm</th>
        <th>3 mm</th>
        <th>3 mm sin cobertura</th>
        <th>4 mm</th>
        <th>4 mm sin cobertura</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in reportDataResumen" :key="index">
        <td>{{ item.BASE }}</td>
        <td class="sin-llanta">{{ item.SIN_LLANTA }}</td>
        <td class="cero-mm">{{ item.CERO }}</td>
        <td class="uno-mm">{{ item.UNO }}</td>
        <td class="dos-mm">{{ item.DOS }}</td>
        <td class="tres-mm">{{ item.TRES }}</td>
        <td class="tres-sin-obs">{{ item.TRES_SIN_OBS }}</td>
        <td class="cuatro-mm">{{ item.CUATRO }}</td>
        <td class="cuatro-sin-obs">{{ item.CUATRO_SIN_OBS }}</td>
      </tr>

      <tr class="total-row">
        <td><strong>Totales</strong></td>
        <td class="sin-llantas"><strong>{{ calcularTotalesResumen().SIN_LLANTA }}</strong></td>
        <td class="cero-mms"><strong>{{ calcularTotalesResumen().CERO }}</strong></td>
        <td class="uno-mms"><strong>{{ calcularTotalesResumen().UNO }}</strong></td>
        <td class="dos-mms"><strong>{{ calcularTotalesResumen().DOS }}</strong></td>
        <td class="tres-mms"><strong>{{ calcularTotalesResumen().TRES }}</strong></td>
        <td class="tres-sin-obss"><strong>{{ calcularTotalesResumen().TRES_SIN_OBS }}</strong></td>
        <td class="cuatro-mms"><strong>{{ calcularTotalesResumen().CUATRO }}</strong></td>
        <td class="cuatro-sin-obss"><strong>{{ calcularTotalesResumen().CUATRO_SIN_OBS }}</strong></td>
      </tr>

      <tr>
        <td><strong>Totales Rojo mm</strong></td>
        <td></td>
        <td></td>
        <td></td>
        <td><strong>{{ sumarTresValores(calcularTotalesResumen()) }}</strong></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    </tbody>
  </table>
</div>

        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Base</th>
                    <th>Folio</th>
                    <th>Unidad</th>
                    <th>Fecha de semáforo</th>
                    <th>Posición</th>
                    <th>Milímetros</th>
                    <th>Marca</th>
                    <th>Dot</th>
                    <th>Observación</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in reportData" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td>{{ item.BASE }}</td>
                    <td>{{ item.FOLIO }}</td>
                    <td>{{ item.UNIDAD }}</td>
                    <td>{{ formatDate(item.FSEMAFOREO) }}</td>
                    <td>{{ item.POSICION }}</td>
                    <td>{{ item.MM }}</td>
                    <td>{{ item.TMARCA }}</td>
                    <td>{{ item.DOT }}</td>
                    <td>{{ item.OBS }}</td>
                </tr>
            </tbody>
        </table>
        <div class="button-container">
            <button class="export-btn" @click="exportToPDF">Exportar a PDF</button>
            <button class="close-btn" @click="closeView">Cerrar</button>
        </div>
    </div>
</template>

<script>
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default {
    data() {
        return {
            reportDataResumen: [], // para la tabla resumen
            reportData: history.state?.reportData || [], // Obtiene los datos del `state`
            nombreempresa: "",
            nombreusuario: "",
            baseglobal: "",
            pdfFileName: "" // Nombre predeterminado del archivo
        };
    },
    created() {
        const datos = this.$route.params.data;
        if (datos) {
            this.reportData = JSON.parse(atob(datos)); // Decodifica Base64
            this.reportDataResumen = this.agruparPorBase(this.reportData);

        }
    },

    // --------------------
    // methods: {
    //     calcularTotalesResumen() {
    //         return this.reportDataResumen.reduce(
    //             (acum, item) => {
    //                 acum.SIN_LLANTA += item.SIN_LLANTA || 0;
    //                 acum.CERO += item.CERO || 0;
    //                 acum.UNO += item.UNO || 0;
    //                 acum.DOS += item.DOS || 0;
    //                 acum.TRES += item.TRES || 0;
    //                 acum.TRES_SIN_OBS += item.TRES_SIN_OBS || 0;
    //                 return acum;
    //             },
    //             { SIN_LLANTA: 0, CERO: 0, UNO: 0, DOS: 0, TRES: 0, TRES_SIN_OBS: 0 }
    //         );
    //     },
    //     sumarTresValores(item) {
    //         const uno = parseInt(item.UNO) || 0;
    //         const dos = parseInt(item.DOS) || 0;
    //         const tres = parseInt(item.TRES) || 0;

    //         return uno + dos + tres;
    //     },
    //     agruparPorBase(data) {
    //         const resultado = [];
    //         data.forEach(item => {
    //             let base = resultado.find(r => r.BASE === item.BASE);
    //             if (!base) {
    //                 base = { BASE: item.BASE, SIN_LLANTA: 0, CERO: 0, UNO: 0, DOS: 0, TRES: 0, TRES_SIN_OBS: 0 };
    //                 resultado.push(base);
    //             }
    //             const mm = parseInt(item.MM);
    //             if (mm === 0 && (item.OBS === 'SIN LLANTA' || item.OBS === 'DESPRENDIMIENTO DE LLANTA')) base.SIN_LLANTA++;
    //             else if (mm === 0) base.CERO++;
    //             else if (mm === 1) base.UNO++;
    //             else if (mm === 2) base.DOS++;
    //             else if (mm === 3) {
    //                 base.TRES++;
    //                 if (item.OBS === 'DESGASTE IRREGULAR') base.TRES_SIN_OBS++;
    //             }
    //         });
    //         return resultado;
    //     },
 
methods: {
  calcularTotalesResumen() {
    return this.reportDataResumen.reduce(
      (acum, item) => {
        acum.SIN_LLANTA     += item.SIN_LLANTA || 0;
        acum.CERO           += item.CERO || 0;
        acum.UNO            += item.UNO || 0;
        acum.DOS            += item.DOS || 0;
        acum.TRES           += item.TRES || 0;
        acum.TRES_SIN_OBS   += item.TRES_SIN_OBS || 0;
        acum.CUATRO         += item.CUATRO || 0;
        acum.CUATRO_SIN_OBS += item.CUATRO_SIN_OBS || 0;
        return acum;
      },
      { SIN_LLANTA: 0, CERO: 0, UNO: 0, DOS: 0, TRES: 0, TRES_SIN_OBS: 0, CUATRO: 0, CUATRO_SIN_OBS: 0 }
    );
  },

  sumarTresValores(item) {
    const uno  = parseInt(item.UNO)  || 0;
    const dos  = parseInt(item.DOS)  || 0;
    const tres = parseInt(item.TRES) || 0;
    return uno + dos + tres;
  },

  // Igual que en la vista principal: DOT -> años, aceptando solo dígitos
  aniosDesdeDOT(dot) {
    if (dot == null) return -1;
    const s = String(dot).trim();
    if (!/^\d+$/.test(s)) return -1; // cualquier carácter no numérico => -1

    let yy = null;
    if (s.length === 3) yy = s.substring(1, 3); // Copy(DOT,2,2)
    else if (s.length === 4) yy = s.substring(2, 4); // Copy(DOT,3,2)
    else return -1;

    const n = Number("20" + yy);
    if (!Number.isFinite(n)) return -1;
    return new Date().getFullYear() - n;
  },

  // Resumen por BASE con 3/3_sin_cobertura y 4/4_sin_cobertura
  agruparPorBase(data) {
    const resultado = [];
    data.forEach((item) => {
      let base = resultado.find((r) => r.BASE === item.BASE);
      if (!base) {
        base = {
          BASE: item.BASE,
          SIN_LLANTA: 0,
          CERO: 0,
          UNO: 0,
          DOS: 0,
          TRES: 0,
          TRES_SIN_OBS: 0,
          CUATRO: 0,
          CUATRO_SIN_OBS: 0,
        };
        resultado.push(base);
      }

      const mm   = parseInt(item.MM, 10);
      const obs  = (item.OBS || "").trim().toUpperCase();
      const age  = this.aniosDesdeDOT(item.DOT);

      if (mm === 0 && (obs === "SIN LLANTA" || obs === "DESPRENDIMIENTO DE LLANTA")) {
        base.SIN_LLANTA++;
      } else if (mm === 0) {
        base.CERO++;
      } else if (mm === 1) {
        base.UNO++;
      } else if (mm === 2) {
        base.DOS++;
      } else if (mm === 3) {
        base.TRES++;
        if (age !== -1 && age > 7) base.TRES_SIN_OBS++;
      } else if (mm === 4) {
        base.CUATRO++;
        if (age !== -1 && age > 7) base.CUATRO_SIN_OBS++;
      }
    });
    return resultado;
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
        imprimir() {
            window.print(); // Imprime la página
        },
        cargarUsuario() {
            const userData = localStorage.getItem("userData");
            if (userData) {
                try {
                    const parsedData = JSON.parse(userData);
                    this.nombreempresa = parsedData.NOMBREEMPRESA || "N/A";
                    this.nombreusuario = parsedData.NOMBREUSUARIO;
                    this.baseglobal = parsedData.BASE;
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

            this.$nextTick(() => {
                const element = this.$refs.pdfContent;
                if (!element) {
                    alert("⚠️ No se pudo capturar el contenido para exportar. Intente de nuevo.");
                    return;
                }

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
                }).catch(error => {
                    console.error("Error al generar PDF:", error);
                    alert("⚠️ Ocurrió un error al generar el PDF. Intente de nuevo.");
                });
            });
        },
        closeView() {
            this.$router.go(-1); // Regresa a la vista anterior
        }
    },
    mounted() {
        this.cargarUsuario();
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

thead {
    background-color: #1e3a5f;
    color: rgb(5, 5, 5);
}

th,
td {
    border: 1px solid #070707;
    padding: 8px;
    text-align: left;
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

/* ---------------------------------- */
.sin-llanta {
    background-color: aqua;
    color: black;
}

.cero-mm {
    background-color: black;
    color: yellow;
}

.uno-mm {
    background-color: red;
    color: yellow;
}

.dos-mm {
    background-color: red;
    color: yellow;
}

.tres-mm {
    background-color: red;
    color: yellow;
}

.tres-sin-obs {
    background-color: orange;
    color: black;
}

.resumen-mm th,
.resumen-mm td {
    width: 14.2%;
    /* 100% / 7 columnas */
    text-align: center;
}

.total-row {
    background-color: #e3e3e3;
    font-weight: bold;
}
</style>