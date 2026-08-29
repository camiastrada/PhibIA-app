import os
import smtplib
from email.mime.text import MIMEText

BREVO_SMTP_HOST = "smtp-relay.brevo.com"
BREVO_SMTP_PORT = 587


def send_reset_email(to_email: str, reset_link: str):
    login = os.getenv("BREVO_SMTP_LOGIN")
    password = os.getenv("BREVO_SMTP_KEY")

    subject = "Recuperar contraseña - phibIA"
    body = (
        "Recibimos una solicitud para restablecer tu contraseña.\n\n"
        f"Hacé clic en el siguiente enlace para elegir una nueva (válido por 1 hora):\n{reset_link}\n\n"
        "Si vos no pediste esto, podés ignorar este mensaje."
    )

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = "phibIA <phibia.support@gmail.com>"
    msg["To"] = to_email

    with smtplib.SMTP(BREVO_SMTP_HOST, BREVO_SMTP_PORT) as server:
        server.starttls()
        server.login(login, password)
        server.sendmail(msg["From"], [to_email], msg.as_string())
