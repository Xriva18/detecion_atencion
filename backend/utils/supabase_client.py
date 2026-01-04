"""
Cliente de Supabase para la aplicación.
"""
from supabase import create_client, Client

from core.config import settings


def get_supabase_client() -> Client:
    """
    Crea y retorna una instancia del cliente de Supabase.
    
    Returns:
        Client: Cliente de Supabase configurado con las credenciales del entorno
    """
    return create_client(settings.supabase_url, settings.supabase_key)

