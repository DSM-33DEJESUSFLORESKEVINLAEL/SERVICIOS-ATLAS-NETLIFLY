import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/menu/Home.vue';  
import Dashboard from '../views/menu/Dashboard.vue'; 
import Inicio from '../views/menu/Inicio.vue'; 
import Login from '../views/auth/Login.vue';
import Register from '../views/auth/Register.vue';
import BasesView from '../views/catalogos/BasesView.vue';
import EmpresasView from '../views/catalogos/EmpresasView.vue';
import FallasView from '../views/catalogos/FallasView.vue';
import MarcasRenovadoView from '../views/catalogos/MarcasRenovadoView.vue';
import MarcasView from '../views/catalogos/MarcasView.vue';
import MedidasView from '../views/catalogos/MedidasView.vue';
import ModeloRenovadoView from '../views/catalogos/ModeloRenovadoView.vue';
import RangoCargaView from '../views/catalogos/RangoCargaView.vue';
import TipoUnidadView from '../views/catalogos/TipoUnidadView.vue';
import UnidadesView from '../views/catalogos/UnidadesView.vue';
import UsuariosView from '../views/catalogos/UsuariosView.vue';
import { useAuthStore } from '../store/auth';
import Consultas from '@/views/piladedesecho/Consultas.vue';
import Listado from '@/views/piladedesecho/Listado.vue';
import AnalisisMilimetros from '@/views/semaforeo/AnalisisMilimetros.vue';
import AnalisisSemaforeo from '@/views/semaforeo/AnalisisSemaforeo.vue';
import BitacoraTaller from '@/views/semaforeo/BitacoraTaller.vue';
import Compras from '@/views/inventario/Compras.vue';
import Existencias from '@/views/inventario/Existencias.vue';
import Facturas from '@/views/inventario/Facturas.vue';
import MovimientoInventario from '@/views/inventario/MovimientoInventario.vue';
import OrdenesTrabajo from '@/views/inventario/OrdenesTrabajo.vue';
import ConsultasS from '@/views/semaforeo/ConsultasS.vue';
import VerFactura from '@/views/inventario/VerFactura.vue';
import Grafica from '@/views/semaforeo/Grafica.vue';
import Grafica1 from '@/views/semaforeo/Grafica1.vue';
import AnalisisMilimetrosPDF from '@/views/semaforeo/AnalisisMilimetrosPDF.vue';
import BitacoraTallerPDF from '@/views/semaforeo/BitacoraTallerPDF.vue';
import Resumenfallas from '@/views/piladedesecho/Resumenfallas.vue';
import Resumengeneral from '@/views/piladedesecho/Resumengeneral.vue';



const routes = [
  { path: '/', component: Home },
  { path: '/inicio', component: Inicio },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },

  // Rutas de los catálogos
  { path: '/catalogos/bases', component: BasesView },
  { path: '/catalogos/empresas', component: EmpresasView },
  { path: '/catalogos/fallas', component: FallasView },
  { path: '/catalogos/marcas-renovado', component: MarcasRenovadoView },
  { path: '/catalogos/marcas', component: MarcasView },
  { path: '/catalogos/medidas', component: MedidasView },
  { path: '/catalogos/modelo-renovado', component: ModeloRenovadoView },
  { path: '/catalogos/rango-carga', component: RangoCargaView },
  { path: '/catalogos/tipo-unidad', component: TipoUnidadView },
  { path: '/catalogos/unidades', component: UnidadesView },
  { path: '/catalogos/usuarios', component: UsuariosView },

  // Rutas de pila de desecho
  { path: "/piladesecho/consultas", component: Consultas },
  { path: "/piladesecho/listado", component: Listado },
  { path: "/piladesecho/Resumenfallas/:folio/:base", name: 'Resumenfallas', component: Resumenfallas, props: true },
  { path: "/piladesecho/Resumengeneral/:folio/:base", name: 'Resumengeneral', component: Resumengeneral, props: true },


  // Rutas de semaforeo
  { path: "/semaforeo/analisis-milimetros", component: AnalisisMilimetros },
  { path: "/semaforeo/consultas", component: ConsultasS },
  { path: "/semaforeo/analisis-semaforeo", component: AnalisisSemaforeo },
  { path: "/semaforeo/bitacora-taller", component: BitacoraTaller },
  { path: "/semaforeo/analisis-milimetros-pdf", component: AnalisisMilimetrosPDF },
  { path: '/semaforeo/Grafica1/:folio/:base', name: 'Grafica1',component: Grafica1,props: true},
  
  



  // Rutas de inventario
  { path: "/inventario/compras", component: Compras },
  { path: "/inventario/existencias", component: Existencias },
  { path: "/inventario/facturas", component: Facturas },
  // { path: "/inventario/verfactura", component: VerFactura, props: true },
  { path: "/inventario/verfactura/:empresaId/:facturaId/:fechaId/:resultadosId/:clienteId/:nombreId", name: "VerFactura", component: VerFactura, props: true },
  { path: "/inventario/grafica", component: Grafica },
  {path: "/semaforeo/analisis-milimetros-pdf/:data", component: AnalisisMilimetrosPDF, props: true },
  {path: "/semaforeo/bitacora-taller-pdf/:data", component: BitacoraTallerPDF , props: true },

  

  { path: "/inventario/movimiento-inventario", component: MovimientoInventario },
  { path: "/inventario/ordenes-trabajo", component: OrdenesTrabajo },

  // 🔹 Ruta comodín para evitar que Vue Router capture rutas de la API
  { path: "/:pathMatch(.*)*", redirect: "/" }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;
