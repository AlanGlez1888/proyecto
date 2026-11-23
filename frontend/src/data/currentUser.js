import { reactive } from 'vue'

const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');

export const currentUser = reactive({
  idAlumno: storedUser.idAlumno || null,
  name: storedUser.nombreCompleto || 'Usuario', 
  email: storedUser.correo || '',             
  rol: storedUser.rol || 'estudiante'       
});

export function setUser(userData) {
  if (!userData) return;
  
  // These must match the keys inside the 'user' object from res.json in authController.js
  currentUser.idAlumno = userData.idAlumno || null;
  currentUser.nombreCompleto = userData.nombreCompleto || 'Usuario';
  currentUser.correo = userData.correo || '';
  currentUser.rol = userData.rol || 'estudiante';
  
  sessionStorage.setItem('user', JSON.stringify(currentUser));
}

export function clearUser() {
  currentUser.idAlumno = null;
  currentUser.nombreCompleto = 'Usuario';
  currentUser.correo = '';
  currentUser.rol = 'estudiante';
  
  sessionStorage.removeItem('user');
}