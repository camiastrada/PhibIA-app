import pytest
from app import create_app, db
from app.models import Usuario


@pytest.fixture()
def app():
    """Crea la aplicación de prueba"""
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['JWT_SECRET_KEY'] = 'test-secret-key'
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    """Cliente de prueba"""
    return app.test_client()


def extract_cookie_value(set_cookie_header: str, name: str) -> str | None:
    """Extrae el valor de una cookie del header Set-Cookie"""
    if not set_cookie_header:
        return None
    for part in set_cookie_header.split(';'):
        part = part.strip()
        if part.startswith(f'{name}='):
            return part.split('=', 1)[1]
    return None


# ========== TESTS DE REGISTRO ==========

def test_register_success(client):
    """Registro exitoso con datos válidos"""
    res = client.post('/register', json={
        'nombre_usuario': 'testuser',
        'email': 'test@example.com',
        'password': 'password123'
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data['message'] == 'Registration completed'


def test_register_missing_fields(client):
    """Registro falla si faltan campos"""
    res = client.post('/register', json={
        'nombre_usuario': 'testuser',
        'email': 'test@example.com'
        # Falta password
    })
    assert res.status_code == 400
    data = res.get_json()
    assert 'Missing data' in data['error']


def test_register_duplicate_email(client):
    """No se puede registrar el mismo email dos veces"""
    # Primer registro
    client.post('/register', json={
        'nombre_usuario': 'user1',
        'email': 'duplicate@example.com',
        'password': 'pass123'
    })
    
    # Segundo registro con mismo email
    res = client.post('/register', json={
        'nombre_usuario': 'user2',
        'email': 'duplicate@example.com',
        'password': 'pass456'
    })
    assert res.status_code == 400
    data = res.get_json()
    assert 'email is taken' in data['error']


# ========== TESTS DE LOGIN ==========

def test_login_success(client):
    """Login exitoso con credenciales correctas"""
    # Primero registrar usuario
    client.post('/register', json={
        'nombre_usuario': 'testuser',
        'email': 'test@example.com',
        'password': 'password123'
    })
    
    # Login
    res = client.post('/login', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data['message'] == 'Succesful login'
    assert 'user_info' in data
    assert data['user_info']['email'] == 'test@example.com'
    
    # Verificar que se creó la cookie
    set_cookie = res.headers.get('Set-Cookie')
    assert set_cookie is not None
    assert 'access_token_cookie=' in set_cookie
    assert 'HttpOnly' in set_cookie


def test_login_wrong_password(client):
    """Login falla con contraseña incorrecta"""
    # Registrar usuario
    client.post('/register', json={
        'nombre_usuario': 'testuser',
        'email': 'test@example.com',
        'password': 'password123'
    })
    
    # Intentar login con contraseña incorrecta
    res = client.post('/login', json={
        'email': 'test@example.com',
        'password': 'wrongpassword'
    })
    assert res.status_code == 401
    data = res.get_json()
    assert 'Wrong password or email' in data['message']


def test_login_nonexistent_user(client):
    """Login falla con usuario que no existe"""
    res = client.post('/login', json={
        'email': 'nonexistent@example.com',
        'password': 'password123'
    })
    assert res.status_code == 401
    data = res.get_json()
    assert 'Wrong password or email' in data['message']


def test_login_missing_credentials(client):
    """Login falla si faltan credenciales"""
    res = client.post('/login', json={
        'email': 'test@example.com'
        # Falta password
    })
    assert res.status_code == 400
    data = res.get_json()
    assert 'missing data' in data['message']


# ========== TESTS DE VERIFY TOKEN ==========

def test_verify_token_success(client):
    """Verificar token con cookie válida"""
    # Registrar y hacer login
    client.post('/register', json={
        'nombre_usuario': 'testuser',
        'email': 'test@example.com',
        'password': 'password123'
    })
    
    login_res = client.post('/login', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    
    # Extraer cookie
    set_cookie = login_res.headers.get('Set-Cookie')
    token_value = extract_cookie_value(set_cookie or '', 'access_token_cookie')
    
    # Verificar token
    res = client.get('/verify-token', headers={
        'Cookie': f'access_token_cookie={token_value}'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data['valid'] is True
    assert 'user_info' in data


def test_verify_token_without_cookie(client):
    """Verificar token falla sin cookie"""
    res = client.get('/verify-token')
    assert res.status_code == 401


def test_verify_token_invalid_cookie(client):
    """Verificar token falla con cookie inválida"""
    res = client.get('/verify-token', headers={
        'Cookie': 'access_token_cookie=invalid-token-12345'
    })
    assert res.status_code == 401  # Unprocessable Entity (JWT inválido)


# ========== TESTS DE LOGOUT ==========

def test_logout_success(client):
    """Logout exitoso elimina la cookie"""
    # Registrar y hacer login
    client.post('/register', json={
        'nombre_usuario': 'testuser',
        'email': 'test@example.com',
        'password': 'password123'
    })
    
    login_res = client.post('/login', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    
    # Extraer cookie
    set_cookie = login_res.headers.get('Set-Cookie')
    token_value = extract_cookie_value(set_cookie or '', 'access_token_cookie')
    
    # Logout
    res = client.post('/logout', headers={
        'Cookie': f'access_token_cookie={token_value}'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data['message'] == 'Logout successful'
    
    # Verificar que la cookie se eliminó
    set_cookie_header = res.headers.get('Set-Cookie')
    assert 'access_token_cookie=' in set_cookie_header
    # La cookie vacía indica que se borró
    assert 'Max-Age=0' in set_cookie_header or 'expires=' in set_cookie_header.lower()


def test_logout_without_cookie(client):
    """Logout falla sin cookie"""
    res = client.post('/logout')
    assert res.status_code == 401


def test_verify_after_logout(client):
    """Después del logout, verify-token debe fallar"""
    # Registrar y hacer login
    client.post('/register', json={
        'nombre_usuario': 'testuser',
        'email': 'test@example.com',
        'password': 'password123'
    })
    
    login_res = client.post('/login', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    
    set_cookie = login_res.headers.get('Set-Cookie')
    token_value = extract_cookie_value(set_cookie or '', 'access_token_cookie')
    
    # Logout
    client.post('/logout', headers={
        'Cookie': f'access_token_cookie={token_value}'
    })
    
    # Intentar verificar token después del logout
    # Nota: El token sigue siendo válido hasta que expire, pero la cookie se borró
    # En el navegador real, el navegador no enviaría la cookie después del logout
    res = client.get('/verify-token')
    assert res.status_code == 401


# ========== TESTS DE RUTAS PROTEGIDAS ==========

def test_protected_route_with_valid_token(client):
    """Acceder a ruta protegida con token válido"""
    # Registrar y hacer login
    client.post('/register', json={
        'nombre_usuario': 'testuser',
        'email': 'test@example.com',
        'password': 'password123'
    })
    
    login_res = client.post('/login', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    
    set_cookie = login_res.headers.get('Set-Cookie')
    token_value = extract_cookie_value(set_cookie or '', 'access_token_cookie')
    
    # Acceder a ruta protegida
    res = client.get('/protected-example', headers={
        'Cookie': f'access_token_cookie={token_value}'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert 'Hola' in data['message']
    assert 'autenticado' in data['message']


def test_protected_route_without_token(client):
    """Acceder a ruta protegida sin token falla"""
    res = client.get('/protected-example')
    assert res.status_code == 401


# ========== TEST DE FLUJO COMPLETO ==========

def test_complete_auth_flow(client):
    """Test del flujo completo: registro → login → acceso → logout"""
    # 1. Registro
    res = client.post('/register', json={
        'nombre_usuario': 'completeuser',
        'email': 'complete@example.com',
        'password': 'secure123'
    })
    assert res.status_code == 201
    
    # 2. Login
    res = client.post('/login', json={
        'email': 'complete@example.com',
        'password': 'secure123'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data['user_info']['name'] == 'completeuser'
    
    set_cookie = res.headers.get('Set-Cookie')
    token_value = extract_cookie_value(set_cookie or '', 'access_token_cookie')
    assert token_value is not None
    
    # 3. Verificar autenticación
    res = client.get('/verify-token', headers={
        'Cookie': f'access_token_cookie={token_value}'
    })
    assert res.status_code == 200
    assert res.get_json()['valid'] is True
    
    # 4. Acceder a ruta protegida
    res = client.get('/protected-example', headers={
        'Cookie': f'access_token_cookie={token_value}'
    })
    assert res.status_code == 200
    
    # 5. Logout
    res = client.post('/logout', headers={
        'Cookie': f'access_token_cookie={token_value}'
    })
    assert res.status_code == 200
    
    # 6. Verificar que ya no está autenticado
    res = client.get('/verify-token')
    assert res.status_code == 401


# ========== TESTS DE SEGURIDAD ==========

def test_cookie_httponly_flag(client):
    """Verificar que la cookie tiene el flag HttpOnly"""
    client.post('/register', json={
        'nombre_usuario': 'testuser',
        'email': 'test@example.com',
        'password': 'password123'
    })
    
    res = client.post('/login', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    
    set_cookie = res.headers.get('Set-Cookie')
    assert 'HttpOnly' in set_cookie


def test_cookie_path(client):
    """Verificar que la cookie tiene el path correcto"""
    client.post('/register', json={
        'nombre_usuario': 'testuser',
        'email': 'test@example.com',
        'password': 'password123'
    })
    
    res = client.post('/login', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    
    set_cookie = res.headers.get('Set-Cookie')
    assert 'Path=/' in set_cookie


def test_password_not_returned_in_response(client):
    """Verificar que la contraseña nunca se devuelve en las respuestas"""
    client.post('/register', json={
        'nombre_usuario': 'testuser',
        'email': 'test@example.com',
        'password': 'password123'
    })
    
    res = client.post('/login', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    
    data = res.get_json()
    assert 'password' not in str(data).lower()
    assert 'user_info' in data
    assert 'password' not in data['user_info']