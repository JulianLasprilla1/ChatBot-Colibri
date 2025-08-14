/**
 * @fileoverview Carga y expone las variables de entorno necesarias para la aplicación.
 */
import dotenv from 'dotenv';
dotenv.config();

const {
  WEBHOOK_VERIFY_TOKEN,
  API_TOKEN,
  BUSINESS_PHONE,
  BUSINESS_ACCOUNT_ID,
  API_VERSION,
  PORT,
  ENABLE_TEST_ENDPOINT
} = process.env;

// Validación básica de variables obligatorias
['WEBHOOK_VERIFY_TOKEN', 'API_TOKEN', 'BUSINESS_PHONE', 'API_VERSION'].forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required env var ${key}`);
  }
});

export default {
  WEBHOOK_VERIFY_TOKEN,
  API_TOKEN,
  BUSINESS_PHONE,
  BUSINESS_ACCOUNT_ID,
  API_VERSION,
  PORT: parseInt(PORT, 10) || 3000,
  ENABLE_TEST_ENDPOINT: ENABLE_TEST_ENDPOINT === 'true'
};
