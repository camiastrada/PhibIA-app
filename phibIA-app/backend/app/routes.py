from flask import jsonify
from . import db 
from .models import Usuario

def init_routes(app):
    @app.route("/")
    def home():
        return "App funcionando!"