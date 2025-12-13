# Backend - API FastAPI

## Instalación

1. Instalar las dependencias:
```bash
pip install -r requirements.txt
```

2. (Opcional) Configurar variables de entorno:
```bash
# Crear archivo .env con:
PYTHONDONTWRITEBYTECODE=1
```

**Nota:** El código ya está configurado para evitar la generación de `__pycache__` automáticamente. Si prefieres usar variables de entorno, crea un archivo `.env` con `PYTHONDONTWRITEBYTECODE=1`.

## Ejecución

Para ejecutar el servidor en modo desarrollo:
```bash
uvicorn main:app --reload
```

El servidor estará disponible en: `http://localhost:8000`

## Endpoints

### GET /api/saludo
Devuelve un saludo "Hello World"

**Respuesta:**
```json
{
  "mensaje": "Hello World"
}
```

## Documentación

Una vez que el servidor esté corriendo, puedes acceder a:
- Documentación interactiva (Swagger): `http://localhost:8000/docs`
- Documentación alternativa (ReDoc): `http://localhost:8000/redoc`

