
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os 
from flask_jwt_extended import JWTManager

jwt = JWTManager()

db = SQLAlchemy()



def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"mysql+pymysql://{os.getenv('MYSQL_USER')}:"
        f"{os.getenv('MYSQL_PASSWORD')}@"
        f"{os.getenv('MYSQL_HOST')}:"
        f"{os.getenv('MYSQL_PORT')}/"
        f"{os.getenv('MYSQL_DATABASE')}"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config["JWT_SECRET_KEY"] = "Asyevc_sd16774I_2J376_sp22"
    
    db.init_app(app)
    jwt.init_app(app) # For Login and session data

    from .routes import init_routes
    init_routes(app)
    
    return app


