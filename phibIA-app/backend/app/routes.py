from flask import jsonify, request
from .models import Usuario
from .ml_model import predict_species
from . import db
import os
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity


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
        print(f"Archivo recibido y guardado en: {file_path}") 

        try:
            especie_predicha, confianza = predict_species(file_path)
            return jsonify({
                "prediccion": especie_predicha,
                "confianza": round(confianza, 2)  
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500


    @app.route("/register", methods=["POST"])
    def register():
        data = request.get_json()
        name = data.get("nombre_usuario")
        email = data.get("email")
        password = data.get("password")

        if not name or not email or not password:
            return jsonify({"error": "Missing data"}), 400

        if Usuario.query.filter((Usuario.email == email)
        ).first():
            return jsonify({"error": "This email is taken"}), 400

        new_user = Usuario(name=name, email=email) 
        new_user.set_password(password)

        try: 
            db.session.add(new_user)
            db.session.commit()
            return jsonify({'message': 'Registration completed'}), 201
        except Exception as e:
            return jsonify({'message': 'Error in database', 'error': str(e)}), 500


    @app.route('/login', methods=['POST'])
    def login():
        data = request.get_json()
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'message': 'There is missing data'}), 400

       
        user = Usuario.query.filter_by(email=email).first()

        if user is None:
            return jsonify({'message': 'Wrong password or email'}), 401

        if user.check_password(password):
            user_identity = user.usuario_id
            access_token = create_access_token(identity=str(user.usuario_id))
            return jsonify({
                'message': 'Succesful login',
                'access_token': access_token, 
                'user_info': { 
                    'id': user.usuario_id,
                    'name': user.name,
                    'email': user.email,
                    'avatar_id': user.avatar_id,
                    'background_color': user.background_color
                }
            }), 200

        else:
            return jsonify({'message': 'Wrong password or email'}), 401        
        
    @app.route("/api/user/profile", methods=["GET"])
    @jwt_required()
    def get_user_profile():
        user_id = get_jwt_identity() 
        user = Usuario.query.filter_by(usuario_id=user_id).first()

        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        return jsonify({
            "id": user.usuario_id,
            "name": user.name,
            "email": user.email,
            "avatar_id": user.avatar_id,
            "background_color": user.background_color
        })
    
    @app.route("/update_avatar", methods=["PUT"])
    @jwt_required()
    def update_avatar():
        current_user_id = get_jwt_identity()
        data = request.get_json()

        avatar_id = data.get("avatar_id")
        if avatar_id is None:
            return jsonify({"error": "Missing avatar_id"}), 400

        user = Usuario.query.get(current_user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        user.avatar_id = avatar_id
        db.session.commit()

        return jsonify({"message": "Avatar updated successfully", "avatar_id": avatar_id}), 200
