import sys
import os
import types

# Agregar el directorio padre al path para que encuentre 'app'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Stub del módulo de Machine Learning para permitir correr los tests sin
# instalar las dependencias pesadas (tensorflow, librosa).
_stub_ml = types.ModuleType('app.ml_model')
_stub_ml.load_model = lambda: None
_stub_ml.predict_species = lambda *a, **k: None
sys.modules['app.ml_model'] = _stub_ml
