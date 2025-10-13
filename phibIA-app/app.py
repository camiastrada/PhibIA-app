from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://phibia_user:user123@db/phibia_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

@app.route("/")
def home():
    return "Hola, Docker!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
