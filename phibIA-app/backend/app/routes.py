from flask import jsonify, request
from . import db 
from .models import Usuario
from .ml_model import predict_species
import os

UPLOAD_FOLDER = "app/uploads"

def init_routes(app):
    @app.route("/")
    def home():
        return "App funcionando!"


    @app.route("/predict", methods=["POST"])
    def predict():
        if "audio" not in request.files:
            return jsonify({"error": "No se envió archivo"}), 400

        file = request.files["audio"]
        if file.filename == "":
            return jsonify({"error": "Nombre de archivo vacío"}), 400

        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)

        try:
            especie_predicha = predict_species(file_path)
            return jsonify({"prediccion": especie_predicha})
        except Exception as e:
            return jsonify({"error": str(e)}), 500