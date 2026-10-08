from flask import Blueprint, jsonify
from .models import Imagen
from datetime import timezone

imagenes_bp = Blueprint("reportes", __name__)


def fecha_iso_utc(fecha):
    if not fecha:
        return None
    return fecha.replace(tzinfo=timezone.utc).isoformat()


@imagenes_bp.route("/reportes/publicas", methods=["GET"])
def obtener_imagenes_publicas():

    imagenes = (
        Imagen.query
        .filter_by(estado="confirmada")
        .order_by(Imagen.fecha_subida.desc())
        .all()
    )

    resultado = []

    for imagen in imagenes:
        resultado.append({
            "imagen_id": imagen.imagen_id,
            "fecha_subida": fecha_iso_utc(imagen.fecha_subida),
            "usuario": imagen.usuario.name,
            "ubicacion": imagen.ubicacion.descripcion,
            #"latitud": imagen.latitud,        
            #"longitud": imagen.longitud,     
            "latitud": imagen.ubicacion.latitud if imagen.ubicacion else None,
            "longitud": imagen.ubicacion.longitud if imagen.ubicacion else None, 
        })

    return jsonify(resultado), 200
