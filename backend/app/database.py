import psycopg2
import os

def get_db_connection():
    try:
        connection = psycopg2.connect(
            user="postgres",
            password="lib_password",
            host="127.0.0.1",
            port="5432",
            database="library_service_db"
        )
        return connection
    except Exception as error:
        print(f"Error connecting to PostgreSQL: {error}")
        raise error