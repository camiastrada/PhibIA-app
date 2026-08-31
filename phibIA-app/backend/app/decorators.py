from functools import wraps
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import db
from .models import Usuario

def admin_required(fn):
    """Solo deja pasar si el usuario autenticado tiene rol 'admin'."""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        try:
            current_user_id = int(get_jwt_identity())
        except (TypeError, ValueError):
            return jsonify({'error': 'Invalid token subject'}), 422

        usuario = db.session.get(Usuario, current_user_id)
        if not usuario:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        if usuario.rol != 'admin':
            return jsonify({'error': 'Acceso restringido a administradores'}), 403

        return fn(*args, **kwargs)
    return wrapper