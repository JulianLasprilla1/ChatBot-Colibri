/**
 * @fileoverview Punto de entrada de la aplicación Express.
 *                Configura middleware, rutas y servidor HTTP.
 */

import express from 'express';
import config from './config/env.js';
import webhookRoutes from './routes/webhookRoutes.js';

const app = express();

// Middleware para parsear cuerpos JSON en las peticiones entrantes
app.use(express.json());

/**
 * Rutas principales de la aplicación.
 * Todas las rutas definidas en webhookRoutes se montan en la raíz '/'.
 */
app.use('/', webhookRoutes);

/**
 * Ruta de diagnóstico en la raíz.
 * Responde con un mensaje simple para indicar que el servidor está activo.
 *
 * @name GET /
 * @param {express.Request} req  Objeto de petición de Express
 * @param {express.Response} res Objeto de respuesta de Express
 */
app.get('/', (req, res) => {
  res.send(`<pre>Nothing to see here.
Checkout README.md to start.</pre>`);
});

/**
 * Inicia el servidor HTTP en el puerto definido en la configuración.
 * El puerto se obtiene de config.PORT.
 *
 * @fires express#listen
 */
app.listen(config.PORT, () => {
  console.log(`Server is listening on port: ${config.PORT}`);
});
