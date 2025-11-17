from flask import jsonify, request
from .models import Usuario, Audio, Especie, Ubicacion
from datetime import datetime
from .ml_model import predict_species
from werkzeug.utils import secure_filename 
from . import db
import os
from flask_jwt_extended import (
    create_access_token, 
    jwt_required, 
    get_jwt_identity,
    unset_jwt_cookies,
    set_access_cookies,
    verify_jwt_in_request
)

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

    # Protected route example
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



    @app.route('/health', methods=['GET'])
    def health_check():
        """Health check endpoint para Docker"""
        return jsonify({'status': 'healthy'}), 200

    @app.route('/user/captures', methods=['GET'])
    @jwt_required()
    def get_user_detections():
        """
        Obtiene todas las detecciones (audios) del usuario autenticado
        """
        try:
            current_user_id = int(get_jwt_identity())
        except (TypeError, ValueError):
            return jsonify({'message': 'Invalid token subject'}), 422

        user = db.session.get(Usuario, current_user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 401

        # Obtener todos los audios del usuario con información relacionada
        audios = Audio.query.filter_by(usuario_id=current_user_id).order_by(Audio.fecha_grabacion.desc()).all()

        detections = []
        for audio in audios:
            detections.append({
                'audio_id': audio.audio_id,
                'ruta': audio.ruta,
                'fecha_grabacion': audio.fecha_grabacion.isoformat(),
                'especie': {
                    'id': audio.especie.especie_id,
                    'nombre_cientifico': audio.especie.nombre_cientifico,
                    'nombre_comun': audio.especie.nombre_comun,
                    'descripcion': audio.especie.descripcion,
                    'imagen': audio.especie.imagen
                },
                'ubicacion': {
                    'id': audio.ubicacion.ubicacion_id,
                    'descripcion': audio.ubicacion.descripcion
                }
            })

        return jsonify({
            'detections': detections,
            'total': len(detections)
        }), 200
    
    @app.route('/audio/<int:audio_id>', methods=['GET'])
    @jwt_required()
    def get_audio_file(audio_id):
        """
        Sirve el archivo de audio para reproducción
        """
        try:
            current_user_id = int(get_jwt_identity())
        except (TypeError, ValueError):
            return jsonify({'message': 'Invalid token subject'}), 422

        # Verificar que el audio existe y pertenece al usuario
        audio = Audio.query.filter_by(audio_id=audio_id, usuario_id=current_user_id).first()
        
        if not audio:
            return jsonify({'error': 'Audio not found or access denied'}), 404

        # Construir la ruta correcta del archivo
        # Si la ruta ya es absoluta y comienza con /, usarla directamente
        # Si no, construirla desde el directorio actual
        file_path = audio.ruta
        
        # Si la ruta no es absoluta, construirla
        if not os.path.isabs(file_path):
            file_path = os.path.join(os.getcwd(), file_path)
        
        print(f"Intentando servir archivo de audio: {file_path}")
        
        # Verificar que el archivo existe
        if not os.path.exists(file_path):
            print(f"Error: Archivo no encontrado en {file_path}")
            return jsonify({'error': f'Audio file not found on server: {file_path}'}), 404

        from flask import send_file
        
        # Detectar el tipo de archivo
        if file_path.endswith('.webm'):
            mimetype = 'audio/webm'
        elif file_path.endswith('.wav'):
            mimetype = 'audio/wav'
        else:
            mimetype = 'audio/mpeg'
            
        return send_file(file_path, mimetype=mimetype)

    @app.route('/audio/<int:audio_id>', methods=['DELETE'])
    @jwt_required()
    def delete_audio_file(audio_id):
        """
        Elimina un audio del usuario autenticado
        """
        try:
            current_user_id = int(get_jwt_identity())
        except (TypeError, ValueError):
            return jsonify({'message': 'Invalid token subject'}), 422

        # Verificar que el audio existe y pertenece al usuario
        audio = Audio.query.filter_by(audio_id=audio_id, usuario_id=current_user_id).first()
        
        if not audio:
            return jsonify({'error': 'Audio not found or access denied'}), 404

        # Intentar eliminar el archivo físico
        file_path = audio.ruta
        if not os.path.isabs(file_path):
            file_path = os.path.join(os.getcwd(), file_path)
        
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"Archivo de audio eliminado: {file_path}")
        except Exception as file_error:
            print(f"Error al eliminar archivo físico: {file_error}")
        
        # Eliminar el registro de la base de datos
        try:
            db.session.delete(audio)
            db.session.commit()
            return jsonify({'message': 'Audio deleted successfully'}), 200
        except Exception as db_error:
            db.session.rollback()
            return jsonify({'error': f'Error deleting audio from database: {str(db_error)}'}), 500

    @app.route('/species/<path:image_path>', methods=['GET'])
    def get_species_image(image_path):
        """
        Sirve las imágenes de las especies desde la carpeta db/photo
        """
        from flask import send_file
       
        print(f"=== GET SPECIES IMAGE ===")
        print(f"image_path recibido: '{image_path}'")
        
        # En Docker, la carpeta db está montada en /db
        # En desarrollo local, está en ../db
        if os.path.exists('/db'):
            base_path = '/db'
        else:
            base_path = os.path.join(os.path.dirname(os.path.dirname(os.getcwd())), 'db')
        
        file_path = os.path.join(base_path, image_path)
        
        print(f"Base path: {base_path}")
        print(f"Intentando servir imagen: {file_path}")
        print(f"¿Existe el archivo?: {os.path.exists(file_path)}")
        
        # Verificar que el archivo existe
        if not os.path.exists(file_path):
            print(f"Error: Imagen no encontrada en {file_path}")
            
            # Listar directorios disponibles para debugging
            print(f"Contenido de {base_path}:")
            if os.path.exists(base_path):
                print(os.listdir(base_path))
                
            photo_dir = os.path.join(base_path, 'photo')
            if os.path.exists(photo_dir):
                print(f"Archivos en {photo_dir}:")
                print(os.listdir(photo_dir))
            else:
                print(f"Directorio {photo_dir} no existe")
                
            return jsonify({'error': 'Image not found', 'path': file_path}), 404

        print(f"✓ Sirviendo imagen desde: {file_path}")
        return send_file(file_path, mimetype='image/png')

    @app.route('/informacion/especies', methods=['GET'])
    def obtener_especies():
        especies = Especie.query.all()

        resultado = [
            {
                "nombre_cientifico": e.nombre_cientifico,
                "nombre_comun": e.nombre_comun,
                "descripcion": e.descripcion,
                "imagen": e.imagen,
                "audio":  f"{request.host_url}audios/{e.ruta_audio}" if e.ruta_audio else None
            }  
            for e in especies
        ]

        return jsonify(resultado)

    @app.route("/audios/<filename>")
    def get_audio(filename):
        return send_from_directory("static/especie_audios", filename)