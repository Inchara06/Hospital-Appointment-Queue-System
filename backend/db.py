
import psycopg2
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from the project folder
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def get_db_connection():
    try:
        connection = psycopg2.connect(
            host=os.getenv("DB_HOST"),
            database=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            port=os.getenv("DB_PORT")
        )

        return connection

    except psycopg2.Error as error:
        print("Database connection failed:", error)
        return None
