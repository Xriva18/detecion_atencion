# Guía de Verificación - Sistema de Detección de Atención

Esta guía te ayudará a verificar que todo esté configurado correctamente antes de usar la aplicación.

## ✅ Checklist de Verificación

### 1. Backend en Puerto 8000

**Verificar que el servidor backend esté corriendo:**

```bash
# En la carpeta backend
cd backend
uvicorn main:app --reload
```

**Verificación:**

- Abre tu navegador y ve a: `http://localhost:8000/docs`
- Deberías ver la documentación interactiva de Swagger
- Busca el endpoint `/ws/detect/blink` en la lista de endpoints WebSocket

**Si no funciona:**

- Verifica que no haya otro proceso usando el puerto 8000
- Verifica que todas las dependencias estén instaladas: `pip install -r requirements.txt`

---

### 2. Variables de Entorno del Frontend

**Crear archivo `.env.local` en la carpeta `frontend/`:**

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

**Verificación:**

1. Crea el archivo `.env.local` en `frontend/.env.local`
2. Agrega la línea anterior
3. Reinicia el servidor de desarrollo de Next.js
4. Abre la consola del navegador (F12)
5. Deberías ver: `[WebSocket] Construyendo conexión a: ws://localhost:8000/ws/detect/blink`

**Si no funciona:**

- Verifica que el archivo se llame exactamente `.env.local` (con el punto al inicio)
- Verifica que esté en la carpeta `frontend/` (no en `frontend/src/`)
- Reinicia el servidor de desarrollo después de crear/modificar el archivo

---

### 3. Endpoint WebSocket Disponible

**Verificar que el endpoint esté registrado:**

El endpoint `/ws/detect/blink` debe estar disponible en el backend. Verifica:

1. **En el código del backend:**

   - Archivo: `backend/endpoints/websockets/blink_detection.py`
   - Debe tener: `@router.websocket("/ws/detect/blink")`

2. **En el registro de rutas:**

   - Archivo: `backend/endpoints/routes.py`
   - Debe incluir: `app.include_router(blink_detection.router)`

3. **En la documentación de Swagger:**
   - Ve a: `http://localhost:8000/docs`
   - Busca endpoints que comiencen con `/ws/`
   - Deberías ver `/ws/detect/blink` y `/ws/blink/count`

---

## 🔍 Verificación Rápida

Ejecuta estos comandos para verificar rápidamente:

### Backend

```bash
# Verificar que el backend responda
curl http://localhost:8000/docs

# O simplemente abre en el navegador:
# http://localhost:8000/docs
```

### Frontend

```bash
# En la carpeta frontend, verifica que las variables estén cargadas
# (Next.js las carga automáticamente, pero puedes verificar en la consola del navegador)
```

---

## 🐛 Solución de Problemas Comunes

### Error: "WebSocket is closed before the connection is established"

**Causas posibles:**

1. El backend no está corriendo
2. El backend está en un puerto diferente
3. Las variables de entorno no están configuradas
4. El endpoint no está registrado correctamente

**Solución:**

1. Verifica que el backend esté corriendo: `http://localhost:8000/docs`
2. Verifica el archivo `.env.local` en `frontend/`
3. Reinicia ambos servidores (backend y frontend)
4. Revisa la consola del navegador para ver la URL exacta que se está intentando usar

### Error: "URL base del WebSocket no está configurada"

**Causa:** Falta el archivo `.env.local` o la variable `NEXT_PUBLIC_API_BASE_URL`

**Solución:**

1. Crea `frontend/.env.local`
2. Agrega: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`
3. Reinicia el servidor de desarrollo

### El WebSocket se conecta pero no recibe respuestas

**Causas posibles:**

1. El formato del mensaje enviado es incorrecto
2. Error en el procesamiento de la imagen en el backend

**Solución:**

1. Revisa la consola del navegador para ver los mensajes enviados
2. Revisa los logs del backend para ver si hay errores
3. Verifica que la imagen se esté enviando en formato Base64 correcto

---

## 📝 Notas Importantes

- **Variables de entorno**: Next.js solo carga variables que comienzan con `NEXT_PUBLIC_`
- **Reinicio necesario**: Después de crear/modificar `.env.local`, debes reiniciar el servidor de desarrollo
- **Puerto del backend**: Por defecto es 8000, pero puedes cambiarlo si es necesario (ajusta también las variables de entorno)
- **WebSocket vs HTTP**: El sistema usa WebSocket para comunicación en tiempo real, pero también tiene endpoints HTTP para operaciones puntuales

---

## ✅ Verificación Final

Una vez que todo esté configurado:

1. ✅ Backend corriendo en `http://localhost:8000`
2. ✅ Frontend corriendo en `http://localhost:3000`
3. ✅ Archivo `.env.local` creado con `NEXT_PUBLIC_API_BASE_URL`
4. ✅ Consola del navegador muestra: `[BlinkDetectionWS] Conectado exitosamente`
5. ✅ La página de parpadeos funciona y detecta parpadeos en tiempo real

Si todos estos puntos están verificados, ¡el sistema está listo para usar! 🎉





