/**
 * @fileoverview Función helper que envía cualquier payload a la API de WhatsApp Cloud.
 *               Usa axios y toma el token y demás config desde env.
 */
import axios from 'axios';
import config from '../config/env.js';

/**
 * Envía un objeto `data` como cuerpo JSON a la WhatsApp Cloud API.
 *
 * @async
 * @param {Object} data  Payload completo según la especificación de WhatsApp Cloud API.
 * @returns {Promise<Object>} La respuesta de la API en JSON.
 * @throws {Error} Si la petición falla.
 */
export default async function sendToWhatsApp(data) {
  const url = `https://graph.facebook.com/${config.API_VERSION}/${config.BUSINESS_PHONE}/messages`;

  try {
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${config.API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (err) {
    console.error('Error sending to WhatsApp:', err.response?.data || err.message);
    throw err;
  }
}
