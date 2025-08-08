/**
 * @fileoverview Servidor Express para manejar webhooks de WhatsApp Cloud API.
 *               Recibe mensajes entrantes, responde con un "echo" y marca los mensajes como leídos.
 *               También expone punto de verificación de webhook y una ruta raíz de prueba.
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import express from "express";
import axios from "axios";
import 'dotenv/config';

const app = express();

// Middleware para parsear cuerpo de las peticiones como JSON
app.use(express.json());

// Variables de entorno necesarias para la configuración
const {
  WEBHOOK_VERIFY_TOKEN,  // Token usado para verificar la suscripción del webhook
  API_TOKEN,             // Token de acceso para llamar a la API de WhatsApp Cloud
  BUSINESS_PHONE,        // ID o número de teléfono registrado en WhatsApp Cloud API
  API_VERSION,           // Versión de la API de WhatsApp Cloud (por ejemplo "v17.0")
  PORT                   // Puerto en el que el servidor escuchará
} = process.env;

/**
 * Maneja peticiones POST al endpoint /webhook.
 * - Registra en consola el payload entrante.
 * - Si viene un mensaje de texto, envía un "echo" de vuelta al remitente.
 * - Marca el mensaje entrante como leído.
 *
 * @name POST /webhook
 * @param {express.Request} req  Objeto de petición de Express
 * @param {express.Response} res Objeto de respuesta de Express
 */
app.post("/webhook", async (req, res) => {
  // Loguea el cuerpo completo de la petición para depuración
  console.log("Incoming webhook message:", JSON.stringify(req.body, null, 2));

  // Extrae el primer mensaje de texto si existe
  const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];

  // Procesa solo si el mensaje es de tipo texto
  if (message?.type === "text") {
    try {
      // ENVÍA RESPUESTA: hace un POST a la API de WhatsApp Cloud para devolver el echo
      await axios({
        method: "POST",
        url: `https://graph.facebook.com/${API_VERSION}/${BUSINESS_PHONE}/messages`,
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
        data: {
          messaging_product: "whatsapp",
          to: message.from,
          text: {
            body: "Echo: " + message.text.body
          },
          context: {
            message_id: message.id  // Responde como hilo de conversación
          },
        },
      });

      // MARCA COMO LEÍDO: notifica a WhatsApp que el mensaje ha sido leído
      await axios({
        method: "POST",
        url: `https://graph.facebook.com/${API_VERSION}/${BUSINESS_PHONE}/messages`,
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
        data: {
          messaging_product: "whatsapp",
          status: "read",
          message_id: message.id,
        },
      });

    } catch (error) {
      console.error("Error al procesar o responder el mensaje:", error.response?.data || error.message);
      // Opcionalmente podrías responder con un error HTTP 500 aquí
    }
  }

  // Siempre responde con 200 OK para que WhatsApp no reintente el webhook
  res.sendStatus(200);
});

/**
 * Maneja peticiones GET al endpoint /webhook para verificación inicial.
 * WhatsApp envía una petición de suscripción con query params que debes
 * validar y devolver el `hub.challenge` si el token es correcto.
 *
 * @name GET /webhook
 * @param {express.Request} req  Objeto de petición de Express
 * @param {express.Response} res Objeto de respuesta de Express
 */
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // Verifica que sea una suscripción válida
  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    console.log("Webhook verified successfully!");
    // Devuelve el challenge para completar la verificación
    res.status(200).send(challenge);
  } else {
    // Tokens inválidos → rechaza con 403 Forbidden
    res.sendStatus(403);
  }
});

/**
 * Ruta raíz de diagnóstico.
 * Responde con un mensaje simple indicando que no hay contenido en /
 *
 * @name GET /
 * @param {express.Request} req  Objeto de petición de Express
 * @param {express.Response} res Objeto de respuesta de Express
 */
app.get("/", (req, res) => {
  res.send(`<pre>Nothing to see here.
Checkout README.md to start.</pre>`);
});

/**
 * Inicia el servidor HTTP en el puerto especificado por la variable de entorno PORT.
 * @fires express#listen
 */
app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
