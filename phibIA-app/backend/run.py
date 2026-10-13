from app import create_app, db
import time
import os

app = create_app()

def wait_for_db():
    """Esperar a que la base de datos esté lista"""
    max_retries = 30
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            with app.app_context():
                db.engine.connect()
                print("Conectado a la base de datos")
                return True
        except Exception as e:
            retry_count += 1
            print(f"Esperando a la base de datos... ({retry_count}/{max_retries})")
            time.sleep(2)
    
    print("No se pudo conectar a la base de datos")
    return False

# Se ejecuta al importar el módulo (no solo bajo __main__) para que gunicorn
# -que importa "run:app" en vez de correr este archivo como script- también
# espere la base y cree las tablas antes de servir requests.
if wait_for_db():
    with app.app_context():
        db.create_all()
else:
    raise RuntimeError("No se pudo conectar a la base de datos")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=os.getenv("FLASK_ENV") == "development")