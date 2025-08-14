import OpenAI from 'openai';
import config from '../config/env.js';
import logger from '../logger/index.js';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: config.DEEPSEEK_API_KEY,
  defaultHeaders: {
    // Puedes personalizar estos headers si tienes sitio propio:
    // 'HTTP-Referer': 'https://tusitio.com',
    // 'X-Title': 'ChatBot-Colibri',
  },
});

const MODEL = 'deepseek/deepseek-chat-v3-0324:free';

export async function askOpenRouter(question) {
  const prompt = `Eres un asistente experto en productos de tecnología. Responde solo preguntas sobre productos tecnológicos (computadores, celulares, gadgets, hardware, software, etc). Si la pregunta no es de tecnología, responde: "Solo puedo responder sobre productos de tecnología."\n\nPregunta: ${question}`;
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'user', content: prompt }
      ],
    });
    return completion.choices?.[0]?.message?.content?.trim() || 'No se obtuvo respuesta de la IA.';
  } catch (err) {
    logger.error('[OpenRouter] Error detalle:', err?.error || err.message);
    throw err;
  }
}
