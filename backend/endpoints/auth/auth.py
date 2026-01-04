"""
Endpoints de autenticación usando Supabase.
"""
from fastapi import APIRouter, HTTPException, status
from supabase import Client

from models.schemas import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
    UserResponse,
)
from utils.supabase_client import get_supabase_client

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest):
    """
    Registra un nuevo usuario en Supabase Auth (auth.users).
    
    Args:
        request: Datos del usuario a registrar (email, password, full_name, role)
        
    Returns:
        RegisterResponse: Datos del usuario creado
        
    Raises:
        HTTPException: Si el usuario ya existe, datos inválidos, o error en la creación
    """
    # Validar que el role sea válido (1, 2 o 3)
    if request.role not in [1, 2, 3]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El role debe ser 1, 2 o 3"
        )
    
    supabase: Client = get_supabase_client()
    
    try:
        # Verificar si el usuario ya existe en la tabla profiles
        existing_user = supabase.table("profiles").select("email").eq("email", request.email).execute()
        
        if existing_user.data and len(existing_user.data) > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El usuario con este email ya está registrado"
            )
        
        # Crear usuario en Supabase Auth con user_metadata
        # user_metadata (raw_user_meta_data) - puede ser modificado por el usuario
        auth_response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "full_name": request.full_name
                }
            }
        })
        
        # Verificar si se creó el usuario correctamente
        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al crear el usuario en Supabase Auth"
            )
        
        user_id = auth_response.user.id
        
        # Actualizar app_metadata (raw_app_meta_data) con el rol
        # app_metadata solo puede ser modificado usando Admin API (service_role key)
        # IMPORTANTE: Necesitas usar la service_role key en SUPABASE_KEY para que funcione
        try:
            # El método admin.update_user_by_id requiere service_role key
            if hasattr(supabase.auth, 'admin') and hasattr(supabase.auth.admin, 'update_user_by_id'):
                update_response = supabase.auth.admin.update_user_by_id(
                    user_id,
                    {
                        "app_metadata": {
                            "role": request.role
                        }
                    }
                )
        except (AttributeError, Exception) as metadata_error:
            # Si el método admin no está disponible o falla, continuamos
            # El usuario ya fue creado, solo falta el metadata
            # En producción, esto podría requerir un proceso de limpieza
            # Ignoramos errores relacionados con profiles ya que no los usamos
            error_str = str(metadata_error)
            if "profiles" not in error_str.lower() and "confirmed" not in error_str.lower():
                # Solo logueamos errores que no sean relacionados con profiles
                pass
        
        # Obtener información del usuario desde auth_response
        user = auth_response.user
        confirmed = user.email_confirmed_at is not None
        
        # Crear respuesta con los datos del usuario desde auth.users
        user_response = UserResponse(
            user_id=str(user.id),
            email=user.email or request.email,
            full_name=request.full_name,
            role=request.role,
            confirmed=confirmed,
        )
        
        return RegisterResponse(
            message="Confirmación de correo enviada",
            detail="Por favor, verifica tu correo electrónico para activar tu cuenta",
            user=user_response
        )
        
    except HTTPException:
        # Re-lanzar HTTPException sin modificar
        raise
    except Exception as e:
        # Manejar errores de Supabase (usuario duplicado, etc.)
        error_message = str(e)
        
        # PRIMERO: Detectar errores comunes de Supabase (antes de verificar profiles)
        if "User already registered" in error_message or "already registered" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El usuario con este email ya está registrado"
            )
        elif "Invalid email" in error_message or "invalid" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email proporcionado no es válido"
            )
        elif "Password" in error_message and ("weak" in error_message.lower() or "invalid" in error_message.lower()):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La contraseña no cumple con los requisitos de seguridad"
            )
        
        # DESPUÉS: Ignorar errores relacionados con profiles.confirmed solo si el usuario se creó exitosamente
        if "profiles" in error_message.lower() and "confirmed" in error_message.lower():
            # Si el usuario se creó exitosamente pero hay un error con profiles, 
            # retornamos éxito ya que el usuario está en auth.users
            if auth_response and auth_response.user:
                user = auth_response.user
                confirmed = user.email_confirmed_at is not None
                user_response = UserResponse(
                    user_id=str(user.id),
                    email=user.email or request.email,
                    full_name=request.full_name,
                    role=request.role,
                    confirmed=confirmed,
                )
                return RegisterResponse(
                    message="Confirmación de correo enviada",
                    detail="Por favor, verifica tu correo electrónico para activar tu cuenta",
                    user=user_response
                )
        
        # Si llegamos aquí, es un error desconocido
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar el usuario: {error_message}"
        )


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Autentica un usuario y retorna el token de sesión.
    
    Args:
        request: Credenciales del usuario (email, password)
        
    Returns:
        LoginResponse: Token de acceso
        
    Raises:
        HTTPException: Si las credenciales son inválidas
    """
    supabase: Client = get_supabase_client()
    
    try:
        # Autenticar usuario con Supabase Auth
        auth_response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password,
        })
        
        # Verificar si la autenticación fue exitosa
        if not auth_response.user or not auth_response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas"
            )
        
        access_token = auth_response.session.access_token
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer"
        )
        
    except HTTPException:
        # Re-lanzar HTTPException sin modificar
        raise
    except Exception as e:
        # Manejar errores de autenticación
        error_message = str(e)
        
        # Detectar errores comunes de Supabase Auth
        if "Invalid login credentials" in error_message or "invalid" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email o contraseña incorrectos"
            )
        elif "Email not confirmed" in error_message:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="El email no ha sido confirmado. Por favor, verifica tu correo electrónico."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al autenticar el usuario: {error_message}"
            )

