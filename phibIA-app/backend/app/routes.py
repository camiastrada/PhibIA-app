from flask import jsonify, request, send_from_directory, send_file
from datetime import datetime
import os
from . import db
from .models import Usuario, Audio, Especie, Ubicacion
from .ml_model import predict_species
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    unset_jwt_cookies,
    set_access_cookies,
    verify_jwt_in_request
)
from werkzeug.utils import secure_filename
import traceback 

UPLOAD_FOLDER = "app/uploads"
IMAGE_UPLOAD_FOLDER = "app/uploads/images"
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def init_routes(app):

    @app.route("/")
    def home():
        return "App funcionando!"

    @app.route("/ubicaciones", methods=["GET"])  
    def get_ubicaciones():
        # Obtener ubicaciones con información de especie
        ubicaciones = db.session.query(
            Ubicacion, 
            Especie.nombre_comun,
            Audio.fecha_grabacion
        ).join(
            Audio, Ubicacion.ubicacion_id == Audio.ubicacion_id
        ).join(
            Especie, Audio.especie_id == Especie.especie_id
        ).all()

        result = [
            {
                "latitud": u.Ubicacion.latitud,
                "longitud": u.Ubicacion.longitud,
                "nombre": u.nombre_comun,
                "fecha_grabacion": u.fecha_grabacion.isoformat() if u.fecha_grabacion else None
            }
            for u in ubicaciones
        ]
        return jsonify(result)

    @app.route("/predict", methods=["POST"])
    def predict():
        try:
            current_user_id = None

            # Verificar token JWT (opcional)
            try:
                verify_jwt_in_request(optional=True)
                user_id = get_jwt_identity()
                if user_id:
                    current_user_id = int(user_id)
                    usuario = Usuario.query.get(current_user_id)
                    if not usuario:
                        current_user_id = None
            except Exception as e:
                print(f"Error verificando JWT: {e}")
                current_user_id = None

            # Usar usuario invitado si no hay token
            if current_user_id is None:
                usuario_invitado = Usuario.query.filter_by(name='Invitado').first()
                if not usuario_invitado:
                    return jsonify({"error": "Usuario invitado no encontrado"}), 500
                current_user_id = usuario_invitado.usuario_id

            # Revisar archivo
            if "audio" not in request.files:
                return jsonify({"error": "No se envió archivo"}), 400

            file = request.files["audio"]
            if file.filename == "":
                return jsonify({"error": "Nombre de archivo vacío"}), 400

            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            file_path = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(file_path)

            print(f"Archivo recibido y guardado en: {file_path}")

            # Obtener ubicación (opcional)
            latitud = request.form.get("latitud")
            longitud = request.form.get("longitud")

            if latitud is not None and longitud is not None:
                ubicacion = Ubicacion.query.filter_by(latitud=latitud, longitud=longitud).first()
                if not ubicacion:
                    ubicacion = Ubicacion(
                        descripcion="Ubicación del usuario",
                        latitud=latitud,
                        longitud=longitud
                    )
                    db.session.add(ubicacion)
                    db.session.commit()
            else:
                # Ubicación por defecto
                ubicacion = Ubicacion.query.filter_by(descripcion="Desconocida").first()
                if not ubicacion:
                    ubicacion = Ubicacion(
                        descripcion="Desconocida",
                        latitud=0.0,
                        longitud=0.0
                    )
                    db.session.add(ubicacion)
                    db.session.commit()

            # Predicción
            especie_predicha, confianza = predict_species(file_path)
            especie_id_str, nombre_cientifico = especie_predicha.split('-', 1)
            especie_id = int(especie_id_str)

            especie = Especie.query.filter_by(especie_id=especie_id).first()
            if not especie:
                return jsonify({"error": f"Especie con ID {especie_id} no encontrada"}), 404

            # Guardar audio
            nuevo_audio = Audio(
                ruta=file_path,
                fecha_grabacion=datetime.now(),
                especie_id=especie_id,
                usuario_id=current_user_id,
                ubicacion_id=ubicacion.ubicacion_id if ubicacion else None
            )
            db.session.add(nuevo_audio)
            db.session.commit()

            return jsonify({
                "prediccion": especie_predicha,
                "confianza": round(confianza, 2),
                "especie_info": {
                    "id": especie.especie_id,
                    "nombre_cientifico": especie.nombre_cientifico,
                    "nombre_comun": especie.nombre_comun,
                    "descripcion": especie.descripcion,
                    "imagen": especie.imagen
                },
                "audio_id": nuevo_audio.audio_id,
                "ubicacion": {
                    "latitud": latitud,
                    "longitud": longitud
                } if ubicacion else "Desconocido"
            })

        except Exception as e:
            try:
                os.remove(file_path)
            except:
                pass
            print(f"Error en predict: {str(e)}")
            return jsonify({"error": f"Error inesperado: {str(e)}"}), 500

    @app.route("/save-photo", methods=["POST"])
    def save_photo():
        try:
            if 'image' not in request.files:
                return jsonify({"error": "No se encontró la imagen"}), 400
            
            file = request.files['image']
            
            if file.filename == '':
                return jsonify({"error": "Nombre de archivo vacío"}), 400
            
            if file and allowed_file(file.filename):
                # Crear carpeta si no existe
                os.makedirs(IMAGE_UPLOAD_FOLDER, exist_ok=True)
                
                # Crear nombre único para el archivo
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"frog_{timestamp}_{secure_filename(file.filename)}"
                filepath = os.path.join(IMAGE_UPLOAD_FOLDER, filename)
                
                # Guardar el archivo
                file.save(filepath)
                
                # Obtener ubicación si está disponible
                lat = request.form.get('lat')
                lng = request.form.get('lng')
                
                
                return jsonify({
                    "message": "Foto guardada exitosamente",
                    "filename": filename,
                    "filepath": filepath,
                    "absolute_path": os.path.abspath(filepath),
                    "location": {
                        "lat": lat,
                        "lng": lng
                    } if lat and lng else None
                }), 200
            else:
                return jsonify({"error": "Tipo de archivo no permitido"}), 400
                
        except Exception as e:
            print(f"Error al guardar foto: {e}")
            return jsonify({"error": "Error interno del servidor"}), 500


    @app.route('/uploads/images/<filename>')
    def get_image(filename):
        try:
            return send_from_directory(IMAGE_UPLOAD_FOLDER, filename)
        except FileNotFoundError:
            return jsonify({"error": "Imagen no encontrada"}), 404

    # -----------------------------------------------
    #               AUTH ROUTES
    # -----------------------------------------------

    @app.route("/register", methods=["POST"])
    def register():
        data = request.get_json()
        name = data.get("nombre_usuario")
        email = data.get("email")
        password = data.get("password")

        if not name or not email or not password:
            return jsonify({"error": "Missing data"}), 400

        if Usuario.query.filter_by(email=email).first():
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

        if user is None or not user.check_password(password):
            return jsonify({'message': 'Wrong password or email'}), 401

        identity = str(user.usuario_id)
        access_token = create_access_token(identity=identity)

        response = jsonify({
            'message': 'Successful login',
            'user_info': {
                'id': user.usuario_id,
                'name': user.name,
                'email': user.email,
                'avatar_id': user.avatar_id,
                'background_color': user.background_color
            }
        })
        set_access_cookies(response, access_token)
        return response, 200

    @app.route("/api/user/profile", methods=["GET"])
    @jwt_required()
    def get_user_profile():
        user_id = get_jwt_identity()
        user = Usuario.query.get(user_id)

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

    @app.route("/update_background", methods=["PUT"])
    @jwt_required()
    def update_background():
        current_user_id = get_jwt_identity()
        data = request.get_json()
        color = data.get("background_color")

        if not color:
            return jsonify({"error": "Missing background_color"}), 400

        user = Usuario.query.get(current_user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        user.background_color = color
        db.session.commit()

        return jsonify({"message": "Background updated successfully", "background_color": color}), 200

    @app.route('/logout', methods=['POST'])
    @jwt_required()
    def logout():
        response = jsonify({'message': 'Logout successful'})
        unset_jwt_cookies(response)
        return response, 200

    @app.route('/verify-token', methods=['GET'])
    @jwt_required()
    def verify_token():
        try:
            current_user_id = int(get_jwt_identity())
        except Exception:
            return jsonify({'valid': False}), 422

        user = Usuario.query.get(current_user_id)

        if user:
            return jsonify({
                'valid': True,
                'user_info': {
                    'id': user.usuario_id,
                    'name': user.name,
                    'email': user.email
                }
            })
        else:
            return jsonify({'valid': False}), 422

    # HEALTHCHECK para Docker
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'healthy'}), 200