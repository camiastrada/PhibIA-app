from flask import Blueprint, jsonify
from .models import Imagen

imagenes_bp = Blueprint("reportes", __name__)


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
            "fecha_subida": imagen.fecha_subida.isoformat() if imagen.fecha_subida else None,
            "usuario": imagen.usuario.name,
            "ubicacion": imagen.ubicacion.descripcion,
            "latitud": imagen.latitud,        
            "longitud": imagen.longitud,      
        })

    return jsonify(resultado), 200
