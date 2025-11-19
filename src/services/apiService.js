import axios from 'axios';
import { useAuthStore } from "../store/authStore";
 

const BASE_URL = 'http://atlastoluca.dyndns.org:20100/datasnap/rest/TServerMethods1'; 
const BASECULIACAN = 'http://atlastoluca.dyndns.org:18000/datasnap/rest/TServerMethods1';
const BASETOLUCA = 'http://atlastoluca.dyndns.org:8080/datasnap/rest/TServerMethods1'; 



// Función para generar el folio
const obtenerFolio = () => {
  const authStore = useAuthStore();
  const serieId = authStore.userData?.SERIE;

  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Mes con 2 dígitos
  const year = String(now.getFullYear()).slice(-2); // Últimos 2 dígitos del año

  return `${serieId}${month}${year}`;
};

// Servicio API
const apiService = {
  obtenerFolio, 


  //--------------------------------funciones para el logeo -------------------------------------------------------------
  async getUsuarios(usuario, contraseña) {
    try {
      const response = await axios.get(`${BASE_URL}/validaUsuario/${usuario}/${contraseña}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  },

  async getUsuarioEmpresaBase(param1, param2, param3, param4) {
    try {
      const response = await axios.get(`${BASE_URL}/usuarioEmpresaBase/${param1}/${param2}/${param3}/${param4}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuario empresa base:', error);
      return null;
    }
  },

  async getAccesos(param1, param2, param3) {
    try {
      const response = await axios.get(`${BASE_URL}/accesos/${param1}/${param2}/${param3}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener accesos:', error);
      return null;
    }
  },
  //--------------------------------funciones para los catalogos-------------------------------------------------------------

  async getEmpresasLista() {
    try {

      const response = await axios.get(`${BASE_URL}/empresasLista`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener empresas:', error);
      return null;
    }
  },

  async getFallasLista() {
    try {
      
      const authStore = useAuthStore();
      const empresaId = authStore.userData?.EMPRESA;
      const response = await axios.get(`${BASE_URL}/fallasLista/${empresaId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener fallas:', error);
      return null;
    }
  },

  async getMarcasLista() {
    try {
      const authStore = useAuthStore();
      const empresaId = authStore.userData?.EMPRESA;

      if (!empresaId) {
        console.warn("⚠️ No se encontró empresa en authStore.");
        return [];
      }

      const response = await axios.get(`${BASE_URL}/marcasLista/${empresaId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener marcas:', error);
      return [];
    }
  },

  async getMarcaRenovadoLista() {
    try {

       
      const authStore = useAuthStore();
      const empresaId = authStore.userData?.EMPRESA;

      if (!empresaId) {
        console.warn("⚠️ No se encontró empresa en authStore.");
        return [];
      }
      const response = await axios.get(`${BASE_URL}/marcaRenovadoLista/${empresaId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener marca renovado:', error);
      return null;
    }
  },

  async getMedidasLista() {
    try {

      const authStore = useAuthStore();
      const empresaId = authStore.userData?.EMPRESA;

      const response = await axios.get(`${BASE_URL}/medidasLista/${empresaId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener medidas:', error);
      return null;
    }
  },

  async getModeloRenLista() {
    try {
      
      
      const authStore = useAuthStore();
      const empresaId = authStore.userData?.EMPRESA;
      const response = await axios.get(`${BASE_URL}/modeloRenLista/${empresaId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener modelo renovado:', error);
      return null;
    }
  },

  async getRangoCargaLista() {
    try {
      const authStore = useAuthStore();
      const empresaId = authStore.userData?.EMPRESA;
      const response = await axios.get(`${BASE_URL}/rangoCargaLista/${empresaId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener rango de carga:', error);
      return null;
    }
  },

  async getTipoUnidadLista() {
    try {

      
      const authStore = useAuthStore();
      const empresaId = authStore.userData?.EMPRESA;

      if (!empresaId) {
        console.warn("⚠️ No se encontró empresa en authStore.");
        return [];
      }
      const response = await axios.get(`${BASE_URL}/tipoUnidadLista/${empresaId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener tipo de unidad:', error);
      return null;
    }
  },

  async getUnidadesLista(serie) {
    try {
      const authStore = useAuthStore();
      const empresaId = authStore.userData?.EMPRESA;
      const baseId = authStore.userData?.BASE;
  
      // Llamamos a obtenerFolio con la serie adecuada
      const folio = obtenerFolio(serie);
  
      // Construimos la URL correctamente con el folio generado
      const response = await axios.get(`${BASE_URL}/unidadesLista/${empresaId}/${baseId}/${folio}`);
      
      return response.data;
    } catch (error) {
      console.error("❌ Error al obtener unidades:", error);
      return null;
    }
  },
  

  async getBaseLista() {
    try {

      const authStore = useAuthStore();
      const empresaId = authStore.userData?.EMPRESA;

      if (!empresaId) {
        console.warn("⚠️ No se encontró empresa en authStore.");
        return [];
      }

      const response = await axios.get(`${BASE_URL}/ListaBases/${empresaId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener base lista:', error);
      return null;
    }
  },



  //--------------------------------funciones para el la pila desecho -------------------------------------------------------------
  async getcargaBasesxUsuario(param1, param2) {
    try {
      const response = await axios.get(`${BASE_URL}/basesxUsuario/${param1}/${param2}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener unidades:', error);
      return null;
    }
  },


  async ConsultaPilaDesecho(tipo, empresa, base, empresa2, base2, fecha1, fecha2, multiEmpresa, multiBase, marca, medida, renovado, milimetros, causaRetiro) {
    try {
      const response = await axios.get(`${BASE_URL}/consultaPilaDesecho/${tipo}/${empresa}/${base}/${empresa2}/${base2}/${fecha1}/${fecha2}/${multiEmpresa}/${multiBase}/${marca}/${medida}/${renovado}/${milimetros}/${causaRetiro}`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error en consultaPilaDesecho:', error);
      return null;
    }
  },
// -----------------------------------------------PDF RESUMEN GENERAL------------------------------------------------------------------
async marcaResumenGeneral(empresa, base, param1) {
  try {
    const response = await axios.get(`${BASE_URL}/marcaResumen/${empresa}/${base}/${param1}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error en marcaResumenGeneral:', error);
    return null;
  }
},

async medidaResumenGeneral(empresa, base, param1) {
  try {
    const response = await axios.get(`${BASE_URL}/medidaResumen/${empresa}/${base}/${param1}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error en medidaResumenGeneral:', error);
    return null;
  }
},
async orirenResumenGeneral(empresa, base, param1) {
  try {
    const response = await axios.get(`${BASE_URL}/oriRenResumen/${empresa}/${base}/${param1}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error en orirenResumenGeneral:', error);
    return null;
  }
},
async pisoResumenGeneral(empresa, base, param1) {
  try {
    const response = await axios.get(`${BASE_URL}/pisoResumen/${empresa}/${base}/${param1}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error en pisoResumenGeneral:', error);
    return null;
  }
},
async anioResumenGeneral(empresa, base, param1) {
  try {
    const response = await axios.get(`${BASE_URL}/anioResumen/${empresa}/${base}/${param1}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error en anioResumenGeneral:', error);
    return null;
  }
},
async CantidadResumenGeneral(empresa, base, param1) {
  try {
    const response = await axios.get(`${BASE_URL}/cantidadResumen/${empresa}/${base}/${param1}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error en CantidadResumenGeneral:', error);
    return null;
  }
},
  
// -----------------------------------------------PDF FALLA RESUMEN------------------------------------------------------------------
async fallaResumen(empresa, base, param1) {
  try {
    const response = await axios.get(`${BASE_URL}/fallaResumen/${empresa}/${base}/${param1}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error en fallaResumen:', error);
    return null;
  }
},
async fallaAreaResumen(empresa, base, param1){
  try {
    const response = await axios.get(`${BASE_URL}/fallaAreaResumen/${empresa}/${base}/${param1}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error en fallaAreaResumen:', error);
    return null;
  }
},
async cantidadResumen(empresa, base, param1){
  try {
    const response = await axios.get(`${BASE_URL}/cantidadResumen/${empresa}/${base}/${param1}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error en cantidadResumen:', error);
    return null;
  }
},





  //--------------------------------funciones para semaforeo -------------------------------------------------------------
  async Semaforeodetallereporte(param1, param2, param3) {
    try {
      const response = await axios.get(`${BASE_URL}/SemaforeoDetalleReporte/${param1}/${param2}/${param3}`);
      
      console.log("📢 URL generada para Semaforeodetallereporte:", response.config.url);
      return response.data;
    } catch (error) {
      console.error('❌ Error en Semaforeodetallereporte:', error);
      return null;
    }
  },

  async ConsultaSemaforeodetalle(param1, param2, param3, param4, param5, param6, param7) {
    try {
      const response = await axios.get(`${BASE_URL}/consultaSemaforeodetalle/${param1}/${param2}/${param3}/${param4}/${param5}/${param6}/${param7}`);
      
      console.log("📢 URL generada para consultaSemaforeodetalle:", response.config.url);
      return response.data;
    } catch (error) {
      console.error('❌ Error en consultaSemaforeodetalle:', error);
      return null;
    }
  },
  
  async ConsultaSemaforeoResumen(param1, param2, param3, param4, param5, param6, param7) {
    try {
      const response = await axios.get(`${BASE_URL}/consultaSemaforeoResumen/${param1}/${param2}/${param3}/${param4}/${param5}/${param6}/${param7}`);
      
      console.log("📢 URL generada para ConsultaSemaforeoResumen:", response.config.url);
      return response.data;
    } catch (error) {
      console.error('❌ Error en ConsultaSemaforeoResumen:', error);
      return null;
    }
  },
 
async ConsultaSemaforeoMM(param1, param2, param3, param4, param5, param6, param7,param8) {
  try {
    const response = await axios.get(`${BASE_URL}/consultaSemaforeoMM/${param1}/${param2}/${param3}/${param4}/${param5}/${param6}/${param7}/${param8}`);
    console.log("📢 URL generada para ConsultaSemaforeoMM:", response.config.url);
    return response.data;
  } catch (error) {
    console.error('❌ Error en ConsultaSemaforeoMM:', error);
    return null;
  }
},

async ConsultaBitacoraTaller(param1, param2, param3, param4, param5, param6, param7) {
  try {
    const response = await axios.get(`${BASE_URL}/consultaBitacoraTaller/${param1}/${param2}/${param3}/${param4}/${param5}/${param6}/${param7}`);
    console.log("📢 URL generada para consultaBitacoraTaller:", response.config.url);
    return response.data;
  } catch (error) {
    console.error('❌ Error en consultaBitacoraTaller:', error);
    return null;
  }
},
  //--------------------------------funciones para inventario -------------------------------------------------------------


  async InvExistencias(param1, param2) {
    try {
      const response = await axios.get(`${BASE_URL}/invExistencias/${param1}/${param2}`);
      console.log("📢 URL generada para invExistencias:", response.config.url);
      return response.data;
    } catch (error) {
      console.error('❌ Error en invExistencias:', error);
      return null;
    }
  },
  // BOTON DE FACTURA

  async FacturasMstr(param1, param2, param3, param4, param5, param6, param7) {
    try {
      const response = await axios.get(`${BASETOLUCA}/facturasMstr/${param1}/${param2}/${param3}/${param4}/${param5}/${param6}/${param7}`);
      console.log("📢 URL generada para facturasMstr:", response.config.url);
      return response.data;
    } catch (error) {
      console.error('❌ Error en facturasMstr:', error);
      return null;
    }
  }, 
  async FacturasMstrSinaloa(param1, param2, param3, param4, param5, param6, param7) {
    try {
        const response = await axios.get(`${BASECULIACAN}/facturasMstr/${param1}/${param2}/${param3}/${param4}/${param5}/${param6}/${param7}`);
        console.log("📢 URL generada para FacturasMstrSinaloa:", response.config.url);
        return response.data;
    } catch (error) {
        console.error('❌ Error en facturasMstrSinaloa:', error);
        return null;
    }
},

// BOTON DE DETALLE
  async FacturasMstrDet(param1, param2, param3, param4, param5, param6, param7) {
    try {
      const response = await axios.get(`${BASETOLUCA}/facturasMstrDet/${param1}/${param2}/${param3}/${param4}/${param5}/${param6}/${param7}`);
      console.log("📢 URL generada para facturasMstrDet:", response.config.url);
      return response.data;
    } catch (error) {
      console.error('❌ Error en facturasMstrDet:', error);
      return null;
    }
  },
  async FacturasMstrDetSinaloa(param1, param2, param3, param4, param5, param6, param7) {
    try {
      const response = await axios.get(`${BASECULIACAN}/facturasMstrDet/${param1}/${param2}/${param3}/${param4}/${param5}/${param6}/${param7}`);
      console.log("📢 URL generada para facturasMstrDet:", response.config.url);
      return response.data;
    } catch (error) {
      console.error('❌ Error en facturasMstrDet:', error);
      return null;
    }
  },


  
  async FacturasDetSinaloa(param1, param2) {
    try {
      const response = await axios.get(`${BASECULIACAN}/facturasdet/${param1}/${param2}`);
      console.log("📢 URL generada para facturasdet:", response.config.url);
      return response.data;
    } catch (error) {
      console.error('❌ Error en facturasdet:', error);
      return null;
    }
  },

  async FacturasDet(param1, param2) {
    try {
      const response = await axios.get(`${BASETOLUCA}/facturasdet/${param1}/${param2}`);
      console.log("📢 URL generada para facturasdet:", response.config.url);
      return response.data;
    } catch (error) {
      console.error('❌ Error en facturasdet:', error);
      return null;
    }
  },
  async DocFacturas(param1, param2) {
    try {
      const response = await axios.get(`${BASETOLUCA}/docFacturas/${param1}/${param2}`);
      console.log("📢 URL generada para docFacturas:", response.config.url);
      return response.data;
    } catch (error) {
      console.error('❌ Error en docFacturas:', error);
      return null;
    }
  },


  async DocFacturasSinaloa(param1, param2) {
    try {
      const response = await axios.get(`${BASECULIACAN}/docFacturas/${param1}/${param2}`);
      console.log("📢 URL generada para docFacturas:", response.config.url);
      return response.data;
    } catch (error) {
      console.error('❌ Error en docFacturas:', error);
      return null;
    }
  },
  
  
}; 





export default apiService;
