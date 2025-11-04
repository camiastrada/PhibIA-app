from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os 
from flask_jwt_extended import JWTManager


jwt = JWTManager()
db = SQLAlchemy()


def create_app():
    app = Flask(__name__)
    
    # ========== CONFIGURACIÓN CORS ==========
    CORS(app, 
         supports_credentials=True,
         origins=[os.getenv('FRONTEND_ORIGIN', 'http://localhost:5173')],
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

    db.init_app(app)
    jwt.init_app(app)

    from .routes import init_routes
    init_routes(app)
    
    return app