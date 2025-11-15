import os
import sys

# Esto permite importar tu app y la DB
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import db
from app.models import Especie

# RUTA donde tenés los audios de las especies
AUDIO_FOLDER = os.path.join("app", "static", "especie_audios")

def cargar_audios():
    for filename in os.listdir(AUDIO_FOLDER):
        if filename.endswith(".wav") or filename.endswith(".mp3"):
            nombre = os.path.splitext(filename)[0]

            especie = Especie.query.filter_by(nombre_comun=nombre).first()

            if especie:
                especie.ruta_audio = filename
                print(f"✔ Audio asignado a {especie.nombre_comun}: {filename}")
            else:
                print(f"⚠ No existe especie para el archivo: {filename}")

    db.session.commit()
    print("¡Audios cargados correctamente!")

if __name__ == "__main__":
    cargar_audios()
