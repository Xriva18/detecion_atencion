from google import genai
from google.genai import types
from core.config import settings
import json
import asyncio
import re

class AIService:
    def __init__(self):
        print(f"[AIService] Inicializando servicio de IA con SDK Async...")
        self.client = None
        if settings.gemini_api_key:
            # Inicializamos el cliente. 
            # NOTA: En el nuevo SDK, no necesitamos configuración extra para async,
            # se usa accediendo a .aio después.
            self.client = genai.Client(api_key=settings.gemini_api_key)
            print(f"[AIService] ✅ Cliente Google GenAI configurado")
        else:
            print("[AIService] ⚠️ WARNING: GEMINI_API_KEY not set. AI features will not work.")

    async def _generate_with_retry(self, prompt: str, schema_config=None) -> str:
        """
        Función interna que maneja los reintentos y el cambio de modelo.
        """
        if not self.client:
            raise Exception("Cliente IA no configurado")

        # Lista de modelos por prioridad. 
        # Si el 2.0 falla por cuota, intentamos el 1.5 que es más estable.
        models_to_try = ["gemini-2.0-flash", "gemini-1.5-flash"]
        
        last_error = None

        for model_name in models_to_try:
            # Intentaremos hasta 3 veces por cada modelo
            for attempt in range(3):
                try:
                    print(f"[AIService] 🔄 Intentando con {model_name} (Intento {attempt+1})...")
                    
                    # Configuración para respuesta JSON si se requiere
                    config = {}
                    if schema_config:
                        config['response_mime_type'] = 'application/json'
                        config['response_schema'] = schema_config

                    # LLAMADA ASÍNCRONA REAL (.aio)
                    response = await self.client.aio.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config=config
                    )
                    
                    if not response.text:
                        raise Exception("Respuesta vacía de Gemini")

                    return response.text

                except Exception as e:
                    error_str = str(e)
                    last_error = e
                    print(f"[AIService] ⚠️ Error en {model_name} intento {attempt+1}: {e}")

                    # Si es error de cuota (429) o servidor sobrecargado
                    if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                        wait_time = 15 * (attempt + 1) # Esperar 15s, 30s, 45s
                        print(f"[AIService] ⏳ Cuota excedida. Esperando {wait_time} segundos...")
                        await asyncio.sleep(wait_time)
                    else:
                        # Si es otro tipo de error (ej. prompt invalido), no reintentamos este modelo
                        break 
            
            # Si llegamos aquí, el modelo falló 3 veces, pasamos al siguiente modelo (1.5-flash)
            print(f"[AIService] ⏭️ Cambiando de modelo por fallos en {model_name}...")

        raise Exception(f"Fallaron todos los intentos y modelos. Último error: {last_error}")

    async def summarize_text(self, text: str) -> str:
        """
        Generates a summary of the provided text.
        """
        if not self.client: return "Error: AI not configured."
        
        # Recortar texto para evitar errores de tokens masivos si el video es muy largo
        safe_text = text[:15000] 
        prompt = f"Por favor, proporciona un resumen conciso en español del siguiente contenido de video:\n\n{safe_text}"
        
        try:
            result_text = await self._generate_with_retry(prompt)
            print(f"[AIService] ✅ Resumen generado.")
            return result_text
        except Exception as e:
            print(f"[AIService] ❌ Error final generando resumen: {e}")
            return "No se pudo generar el resumen automáticamente."

    async def generate_quiz(self, text: str, attention_score: float, num_questions: int = 5) -> list:
        """
        Generates a quiz based on the text.
        """
        print(f"[AIService] 🧠 Iniciando generación de quiz...")
        
        if not self.client:
            return [{"question": "Error IA", "options": ["Error"], "correct_answer": "Error"}]

        # Ajuste de dificultad
        if attention_score > 0.8:
            difficulty = "desafiante (análisis)"
        elif attention_score > 0.5:
            difficulty = "moderada (comprensión)"
        else:
            difficulty = "simple (memoria)"

        prompt = f"""
        Actúa como un profesor. Crea un cuestionario de {num_questions} preguntas en ESPAÑOL basado en el texto.
        
        Contexto:
        - Dificultad: {difficulty}
        - Texto base: {text[:10000]}

        FORMATO REQUERIDO:
        Devuelve ÚNICAMENTE un JSON Array válido. Ejemplo:
        [
          {{
            "question": "¿Pregunta?",
            "options": ["A", "B", "C", "D"],
            "correct_answer": "A"
          }}
        ]
        NO uses bloques de código markdown (```json). Solo el texto JSON crudo.
        """

        try:
            # Usamos _generate_with_retry que maneja los 429 errors
            response_text = await self._generate_with_retry(prompt)
            
            # Limpieza agresiva del JSON por si el modelo incluye markdown
            cleaned_text = response_text.replace("```json", "").replace("```", "").strip()
            
            # A veces el modelo añade texto antes o después, buscamos el array [...]
            match = re.search(r'\[.*\]', cleaned_text, re.DOTALL)
            if match:
                cleaned_text = match.group(0)

            quiz_data = json.loads(cleaned_text)
            print(f"[AIService] ✅ Quiz generado correctamente con {len(quiz_data)} preguntas")
            return quiz_data

        except json.JSONDecodeError:
            print(f"[AIService] ❌ Error: La IA no devolvió un JSON válido: {response_text[:100]}...")
            return [{"question": "Error de formato IA", "options": ["Reintentar"], "correct_answer": "Reintentar"}]
        except Exception as e:
            print(f"[AIService] ❌ Error fatal generando quiz: {e}")
            return [{"question": "Error de conexión con IA", "options": ["Reintentar"], "correct_answer": "Reintentar"}]

ai_service = AIService()