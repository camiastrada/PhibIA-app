from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os 
from flask_jwt_extended import JWTManager


jwt = JWTManager()
db = SQLAlchemy()


def create_app():
    app = Flask(__name__)
    
    # ========== CONFIGURACIÓN CORS ==========
  
    allowed_origins = [
        'http://localhost:5173',  # Vite dev
        'http://localhost',        # nginx
        'http://localhost:80'      # nginx explícito
    ]
    CORS(app, 
         supports_credentials=True,
         origins=allowed_origins,
         allow_headers=["Content-Type"],
         expose_headers=["Set-Cookie"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )
    
    # ========== CONFIGURACIÓN BASE DE DATOS ==========
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"mysql+pymysql://{os.getenv('MYSQL_USER')}:"
        f"{os.getenv('MYSQL_PASSWORD')}@"
        f"{os.getenv('MYSQL_HOST')}:"
        f"{os.getenv('MYSQL_PORT')}/"
        f"{os.getenv('MYSQL_DATABASE')}"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # JWT con cookies HTTP-only
    app.config["JWT_SECRET_KEY"] = os.getenv('JWT_SECRET_KEY', 'secreto-default')
    app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
    app.config["JWT_COOKIE_HTTPONLY"] = True
    # En producción usar HTTPS y establecer la variable de entorno JWT_COOKIE_SECURE='True'
    app.config["JWT_COOKIE_SECURE"] = os.getenv('JWT_COOKIE_SECURE', 'False').lower() == 'true'
    app.config["JWT_COOKIE_SAMESITE"] = "Lax"
    app.config["JWT_COOKIE_CSRF_PROTECT"] = False
    #app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
    app.config["JWT_ACCESS_COOKIE_NAME"] = "access_token_cookie"
    app.config["JWT_COOKIE_PATH"] = "/"

    # Limitar tamaño máximo de subida a 50 MB (ajustable)
    # Esto evita que Flask intente procesar uploads demasiado grandes.
    app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB

    db.init_app(app)
    jwt.init_app(app)


    from .routes import init_routes
    init_routes(app)

    # Manejar 413 Request Entity Too Large y devolver JSON legible
    try:
        # import here to avoid top-level dependency issues
        from werkzeug.exceptions import RequestEntityTooLarge

        @app.errorhandler(RequestEntityTooLarge)
        def handle_file_too_large(e):
            return jsonify({"error": "Archivo demasiado grande. Límite: 50 MB"}), 413
    except Exception:
        # En entornos antiguos o por seguridad, si import falla simplemente no registrar
        pass
    
    return app
