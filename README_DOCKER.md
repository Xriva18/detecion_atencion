# Docker Setup - Desarrollo

Este proyecto incluye configuración Docker para desarrollo con hot reload.

## Requisitos

- Docker
- Docker Compose

## Uso

### Iniciar todos los servicios

```bash
docker-compose up
```

O en modo detached (en segundo plano):

```bash
docker-compose up -d
```

### Detener los servicios

```bash
docker-compose down
```

### Reconstruir las imágenes

Si cambias las dependencias (requirements.txt o package.json):

```bash
docker-compose build
```

O reconstruir y reiniciar:

```bash
docker-compose up --build
```

### Ver logs

Todos los servicios:

```bash
docker-compose logs -f
```

Solo backend:

```bash
docker-compose logs -f backend
```

Solo frontend:

```bash
docker-compose logs -f frontend
```

## Servicios

### Backend (FastAPI)

- **Puerto**: 8000
- **URL**: http://localhost:8000
- **Documentación**: http://localhost:8000/docs
- **Hot reload**: Habilitado (cambios en código se reflejan automáticamente)

### Frontend (Next.js)

- **Puerto**: 3000
- **URL**: http://localhost:3000
- **Hot reload**: Habilitado (cambios en código se reflejan automáticamente)

## Notas de Desarrollo

- Los volúmenes están montados para que los cambios en el código se reflejen automáticamente
- Los `node_modules` y `.next` están excluidos del volumen para mejor rendimiento
- Ambos servicios están en la misma red Docker y pueden comunicarse entre sí

## Solución de Problemas

### Si el frontend no detecta cambios:

```bash
docker-compose restart frontend
```

### Si necesitas limpiar todo:

```bash
docker-compose down -v
docker system prune -a
```

### Reconstruir desde cero:

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```
