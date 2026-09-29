/**
 * Base de la API. Es el PREFIJO, no el origen del backend: siempre relativo.
 *
 * Uso:  fetch(`${API_URL}/user/captures`)
 *
 * Se mantiene relativo a propósito. Un origen absoluto (ej. http://localhost:5000)
 * sólo funciona si el navegador corre en la misma máquina que el backend: al
 * acceder desde un celular o desde otra PC por un túnel de puertos, "localhost"
 * apunta al dispositivo del cliente, la request falla y la app cree que hay
 * sesión de invitado.
 *
 * Vite reemplaza import.meta.env.VITE_* en tiempo de build, no en runtime.
 * Para inyectarla hay que declararla como ARG/ENV en el Dockerfile.
 */
export const API_URL = import.meta.env.VITE_API_URL ?? "/api";
