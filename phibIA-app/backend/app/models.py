from datetime import date
from flask_sqlalchemy import SQLAlchemy
from . import db
import bcrypt;

class Usuario(db.Model):
    __tablename__ = 'usuarios'

    usuario_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), nullable=False, unique=True)
    email = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(100), nullable=False)
    register_date = db.Column(db.Date, nullable=False, default=date.today)

    # Relaciones
    audios = db.relationship('Audio', back_populates='usuario')
    especies = db.relationship('UsuarioEspecie', back_populates='usuario')

    def __repr__(self):
        return f'<Usuario {self.name}>'
    
    def set_password(self, password_plain):
        self.password = bcrypt.hashpw(
            password_plain.encode('utf-8'), 
            bcrypt.gensalt()
        ).decode('utf-8')

    def check_password(self, password_plain):
        return bcrypt.checkpw(
            password_plain.encode('utf-8'), 
            self.password.encode('utf-8')
        )    
   

class Especie(db.Model):
    __tablename__ = 'especies'

    especie_id = db.Column(db.Integer, primary_key=True)
    nombre_cientifico = db.Column(db.String(40), nullable=False)
    nombre_comun = db.Column(db.String(20))
    descripcion = db.Column(db.String(250))
    imagen = db.Column(db.String(100))

    # Relaciones
    audios = db.relationship('Audio', back_populates='especie')
    usuarios = db.relationship('UsuarioEspecie', back_populates='especie')

    def __repr__(self):
        return f'<Especie {self.nombre_cientifico}>'

class Ubicacion(db.Model):
    __tablename__ = 'ubicaciones'

    ubicacion_id = db.Column(db.Integer, primary_key=True)
    descripcion = db.Column(db.String(100), nullable=False)

    # Relación
    audios = db.relationship('Audio', back_populates='ubicacion')

    def __repr__(self):
        return f'<Ubicacion {self.descripcion}>'

class Audio(db.Model):
    __tablename__ = 'audios'

    audio_id = db.Column(db.Integer, primary_key=True)
    ruta = db.Column(db.String(100), nullable=False)
    fecha_grabacion = db.Column(db.DateTime, nullable=False)
    
    # Claves foráneas
    especie_id = db.Column(db.Integer, db.ForeignKey('especies.especie_id'), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.usuario_id'), nullable=False)
    ubicacion_id = db.Column(db.Integer, db.ForeignKey('ubicaciones.ubicacion_id'), nullable=False)

    # Relaciones
    especie = db.relationship('Especie', back_populates='audios')
    usuario = db.relationship('Usuario', back_populates='audios')
    ubicacion = db.relationship('Ubicacion', back_populates='audios')

    def __repr__(self):
        return f'<Audio {self.audio_id}>'

class UsuarioEspecie(db.Model):
    __tablename__ = 'usuarios_especies'

    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.usuario_id'), primary_key=True)
    especie_id = db.Column(db.Integer, db.ForeignKey('especies.especie_id'), primary_key=True)
    fecha_registro = db.Column(db.DateTime, nullable=False)

    # Relaciones
    usuario = db.relationship('Usuario', back_populates='especies')
    especie = db.relationship('Especie', back_populates='usuarios')

    def __repr__(self):
        return f'<UsuarioEspecie usuario={self.usuario_id}, especie={self.especie_id}>'