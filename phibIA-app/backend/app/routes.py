from flask import jsonify, request, make_response
from .models import Usuario
from .ml_model import predict_species
from . import db
import os
from flask_jwt_extended import (
    create_access_token, 
    jwt_required, 
    get_jwt_identity,
    unset_jwt_cookies,
    set_access_cookies
)

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
            # Asegurar que el 'sub' (subject) sea string para PyJWT
            user_identity = str(user.usuario_id)
            access_token = create_access_token(identity=user_identity)
            response = jsonify({
                'message': 'Succesful login',
                'user_info': { 
                    'id': user.usuario_id,
                    'name': user.name,
                    'email': user.email
                }
            })
            set_access_cookies(response, access_token)
            return response, 200
        else:
            return jsonify({'message': 'Wrong password or email'}), 401        

    @app.route('/logout', methods=['POST'])
    @jwt_required()
    def logout():
        """
        Cierra la sesión eliminando la cookie del token
        """
        response = jsonify({'message': 'Logout successful'})
        unset_jwt_cookies(response)  # Elimina la cookie
        return response, 200


    @app.route('/verify-token', methods=['GET'])
    @jwt_required()
    def verify_token():
        try:
            current_user_id = int(get_jwt_identity())
        except (TypeError, ValueError):
            # El token está presente pero el 'sub' es malformado/incorrecto -> 422
            return jsonify({'valid': False}), 422
        user = db.session.get(Usuario, current_user_id)
        
        if user:
            return jsonify({
                'valid': True,
                'user_info': {
                    'id': user.usuario_id,
                    'name': user.name,
                    'email': user.email
                }
            }), 200
        else:
            
            return jsonify({'valid': False}), 422

    #ejemplo para prueba
    @app.route('/protected-example', methods=['GET'])
    @jwt_required()
    def protected_example():
        """
        Ejemplo de ruta protegida
        """
        try:
            current_user_id = int(get_jwt_identity())
        except (TypeError, ValueError):
            # Token presente pero subject malformado -> 422
            return jsonify({'message': 'Invalid token subject'}), 422

        user = db.session.get(Usuario, current_user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 401

        return jsonify({
            'message': f'Hola {user.name}, estás autenticado!'
        }), 200