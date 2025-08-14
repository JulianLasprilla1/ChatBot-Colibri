# ChatBot Colibrí

API de chatbot sobre WhatsApp Cloud API preparada para futura integración con Chatwoot.

## Objetivo
Proveer una capa de ingestión de webhooks y orquestación de lógica conversacional (comandos, estados, menús) desacoplada de la plataforma de atención (Chatwoot) para poder escalar la lógica antes de integrarla.

## Características actuales
- Recepción de webhooks (verificación GET y mensajes POST).
- Respuestas a saludos + menú de botones (Asesor / Soporte / Ubicación).
- Envío de media (comando "media").
- Envío de ubicación.
- Marcado de mensajes como leídos.
- Router de comandos (textos y botones) extensible.
- Session store en memoria (estado simple por usuario).
- Stub de servicio Chatwoot (no activo hasta configurar credenciales).
- Logger central ligero.

## Arquitectura (Capas)
```
routes -> controller -> messageHandler -> { commandRouter, sessionStore }
								   \-> whatsappService -> sendToWhatsApp -> WhatsApp Cloud API
								   \-> chatwootService (stub)
```

## Requisitos
Node.js >= 18

## Variables de entorno
Copiar `.env-example` a `.env` y completar:
```
WEBHOOK_VERIFY_TOKEN=token_verificacion_meta
API_TOKEN=EAAG... (access token)
BUSINESS_PHONE=phone_number_id
BUSINESS_ACCOUNT_ID=account_id
API_VERSION=v20.0
PORT=3000

# Opcional (para activar stub más adelante)
CHATWOOT_BASE_URL=
CHATWOOT_TOKEN=
CHATWOOT_INBOX_ID=
```

## Instalación
```
npm install
```

## Ejecutar en desarrollo
```
npm run dev
```
Inicia en `http://localhost:3000`.

## Endpoint Webhook
- Verificación: `GET /webhook?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...`
- Recepción mensajes: `POST /webhook` (payload estándar de WhatsApp Cloud API)

## Flujo de ejemplo
1. Usuario envía "Hola".
2. Bot responde saludo personalizado y muestra menú (botones interactivos).
3. Usuario pulsa "Ubicación" -> recibe dirección + mensaje de ubicación.

## Extender comandos
En `messageHandler` se registra en el constructor:
```
this.router.registerText('palabra', async (ctx) => { /* lógica */ })
```

## Sesiones
`memoryStore` guarda `{ state, data }` por `userId`. Reemplazar por Redis para producción.

## Futuro Chatwoot
El stub `chatwootService` expondrá métodos para crear/actualizar conversaciones en una bandeja de Chatwoot. Se activará cuando se configuren `CHATWOOT_*`.

## Scripts
`npm run dev` -> nodemon (recarga)

## Producción
Usar: `node src/app.js` (crear script `start` sin nodemon si se desea)

## Licencia
MIT (si decides agregarla) – actualmente `package.json` indica ISC.

