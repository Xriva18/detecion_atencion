"""
Cargador del modelo L2CS-Net para estimación de mirada.

Este módulo maneja la carga y caché del modelo L2CS-Net pre-entrenado.
L2CS-Net es una CNN (backbone ResNet50) que predice los ángulos
Pitch y Yaw de la mirada directamente desde la imagen.

El modelo usa un enfoque de "Appearance-based gaze estimation"
que no requiere calibración del usuario.
"""
import os
import torch
import torch.nn as nn
from torchvision import models
from typing import Optional
import urllib.request
from pathlib import Path


class L2CSNet(nn.Module):
    """
    Implementación de L2CS-Net para estimación de mirada.
    
    Arquitectura:
    - Backbone: ResNet50 pre-entrenado
    - Cabeza: Clasificación binning + Regresión para Pitch y Yaw
    
    El modelo usa un enfoque de clasificación (bins) combinado con
    regresión para predecir ángulos de mirada con alta precisión.
    """
    
    def __init__(self, num_bins: int = 90):
        """
        Inicializa L2CS-Net.
        
        Args:
            num_bins: Número de bins para clasificación de ángulos
        """
        super(L2CSNet, self).__init__()
        self.num_bins = num_bins
        
        # Backbone ResNet50
        resnet = models.resnet50(weights=None)
        
        # Remover la última capa FC
        self.features = nn.Sequential(*list(resnet.children())[:-1])
        
        # Cabezas de clasificación para Pitch y Yaw
        self.fc_yaw = nn.Linear(2048, num_bins)
        self.fc_pitch = nn.Linear(2048, num_bins)
        
        # Índices para softmax
        self.idx_tensor = torch.arange(num_bins, dtype=torch.float32)
    
    def forward(self, x: torch.Tensor) -> tuple:
        """
        Forward pass.
        
        Args:
            x: Tensor de imagen (B, 3, 224, 224)
            
        Returns:
            Tuple (yaw_predicted, pitch_predicted) en grados
        """
        # Extraer features
        features = self.features(x)
        features = features.view(features.size(0), -1)
        
        # Predicción de clasificación
        yaw_logits = self.fc_yaw(features)
        pitch_logits = self.fc_pitch(features)
        
        # Softmax
        yaw_softmax = torch.softmax(yaw_logits, dim=1)
        pitch_softmax = torch.softmax(pitch_logits, dim=1)
        
        # Mover idx_tensor al mismo dispositivo
        idx_tensor = self.idx_tensor.to(x.device)
        
        # Calcular ángulos esperados (regresión suave)
        # Rango: -90° a +90° dividido en num_bins
        yaw_predicted = torch.sum(yaw_softmax * idx_tensor, dim=1) * (180.0 / self.num_bins) - 90.0
        pitch_predicted = torch.sum(pitch_softmax * idx_tensor, dim=1) * (180.0 / self.num_bins) - 90.0
        
        return yaw_predicted, pitch_predicted


class GazeModelLoader:
    """
    Singleton para cargar y cachear el modelo L2CS-Net.
    """
    
    _instance: Optional['GazeModelLoader'] = None
    _model: Optional[L2CSNet] = None
    _device: Optional[torch.device] = None
    
    # URL de descarga del modelo (placeholder - necesita URL real)
    MODEL_URL = "https://github.com/Ahmednull/L2CS-Net/releases/download/v1.0/L2CSNet_gaze360.pkl"
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        pass
    
    @classmethod
    def get_model_path(cls) -> Path:
        """Retorna la ruta donde se guarda el modelo."""
        # Buscar en el directorio models del backend
        backend_dir = Path(__file__).parent.parent
        models_dir = backend_dir / "models"
        models_dir.mkdir(exist_ok=True)
        return models_dir / "L2CSNet_gaze360.pkl"
    
    @classmethod
    def download_model(cls, force: bool = False) -> bool:
        """
        Descarga el modelo si no existe.
        
        Args:
            force: Si True, descarga aunque ya exista
            
        Returns:
            True si se descargó exitosamente o ya existe
        """
        model_path = cls.get_model_path()
        
        if model_path.exists() and not force:
            print(f"[GazeModelLoader] Modelo ya existe en {model_path}")
            return True
        
        print(f"[GazeModelLoader] Descargando modelo desde {cls.MODEL_URL}...")
        
        try:
            # Crear directorio si no existe
            model_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Descargar
            urllib.request.urlretrieve(cls.MODEL_URL, str(model_path))
            
            print(f"[GazeModelLoader] ✅ Modelo descargado en {model_path}")
            return True
            
        except Exception as e:
            print(f"[GazeModelLoader] ❌ Error descargando modelo: {e}")
            print("[GazeModelLoader] Por favor descarga manualmente L2CSNet_gaze360.pkl")
            return False
    
    @classmethod
    def load_model(cls, device: Optional[str] = None) -> Optional[L2CSNet]:
        """
        Carga el modelo L2CS-Net.
        
        Args:
            device: Dispositivo ('cuda', 'cpu', o None para auto-detectar)
            
        Returns:
            Modelo cargado o None si falla
        """
        # Retornar modelo cacheado si ya está cargado
        if cls._model is not None:
            return cls._model
        
        # Determinar dispositivo
        if device is None:
            device = 'cuda' if torch.cuda.is_available() else 'cpu'
        cls._device = torch.device(device)
        
        print(f"[GazeModelLoader] Usando dispositivo: {cls._device}")
        
        model_path = cls.get_model_path()
        
        # Verificar si existe el modelo
        if not model_path.exists():
            print(f"[GazeModelLoader] ⚠️ Modelo no encontrado en {model_path}")
            # Intentar descargar
            if not cls.download_model():
                return None
        
        try:
            # Crear modelo
            model = L2CSNet(num_bins=90)
            
            # Cargar pesos
            print(f"[GazeModelLoader] Cargando pesos desde {model_path}...")
            
            # Cargar checkpoint
            checkpoint = torch.load(str(model_path), map_location=cls._device)
            
            # Los pesos pueden estar en 'state_dict' o directamente
            if isinstance(checkpoint, dict) and 'state_dict' in checkpoint:
                state_dict = checkpoint['state_dict']
            elif isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
                state_dict = checkpoint['model_state_dict']
            else:
                state_dict = checkpoint
            
            # Remover prefijos si existen (ej: 'module.')
            new_state_dict = {}
            for k, v in state_dict.items():
                name = k.replace('module.', '')
                new_state_dict[name] = v
            
            model.load_state_dict(new_state_dict, strict=False)
            model.to(cls._device)
            model.eval()
            
            cls._model = model
            print("[GazeModelLoader] ✅ Modelo cargado exitosamente")
            
            return model
            
        except Exception as e:
            print(f"[GazeModelLoader] ❌ Error cargando modelo: {e}")
            return None
    
    @classmethod
    def get_device(cls) -> torch.device:
        """Retorna el dispositivo actual."""
        if cls._device is None:
            cls._device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        return cls._device
    
    @classmethod
    def is_loaded(cls) -> bool:
        """Verifica si el modelo está cargado."""
        return cls._model is not None
    
    @classmethod
    def unload(cls):
        """Descarga el modelo de memoria."""
        if cls._model is not None:
            del cls._model
            cls._model = None
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            print("[GazeModelLoader] Modelo descargado de memoria")
