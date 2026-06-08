from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL") 

SECRET_KEY = "mysecretkey"
ALGORITHM = "HS256" # Algorithm used for encoding and decoding JWT tokens
ACCESS_TOKEN_EXPIRE_MINUTES = 30   


MAIL_USERNAME = os.getenv("MAIL_USERNAME", "")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "")
MAIL_FROM = os.getenv("MAIL_FROM","")
MAIL_SERVER = os.getenv("MAIL_SERVER","")
MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
MAIL_STARTTLS = os.getenv("MAIL_STARTTLS", "True")=="True"
MAIL_SSL_TLS = os.getenv("MAIL_SSL_TLS", "False")=="True"
MAIL_USE_CREDENTIALS = os.getenv("MAIL_USE_CREDENTIALS", "True")=="True"