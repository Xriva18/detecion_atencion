from fastapi import FastAPI

app = FastAPI(title="API de Detección de Atención", version="1.0.0")


@app.get("/api/saludo")
async def saludo():
    """
    Endpoint que devuelve un saludo 'Hello World'
    """
    return {"mensaje": "Hello World"}

