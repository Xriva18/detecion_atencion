from fastapi import APIRouter

router = APIRouter()


@router.get("/api/saludo")
async def saludo():
    """
    Endpoint que devuelve un saludo 'Hello World'
    """
    return {"mensaje": "Hello World"}

