import grpc
from concurrent import futures
import os
import sys

# Ensure the backend root is in the path for codegen imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import codegen.library_pb2 as pb2
import codegen.library_pb2_grpc as pb2_grpc
from database import get_db_connection

class LibraryService(pb2_grpc.LibraryServiceServicer):

    def CreateBook(self, request, context):
        # Server-side validation
        if not request.title or len(request.title.strip()) < 2:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details('Title must be at least 2 characters.')
            return pb2.BookResponse(message="Validation Failed: Invalid Title")

        if not request.isbn or len(request.isbn.strip()) < 10:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details('A valid ISBN is required.')
            return pb2.BookResponse(message="Validation Failed: Invalid ISBN")

        print(f"Adding Book: {request.title}")
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            query = "INSERT INTO books (title, author, isbn) VALUES (%s, %s, %s) RETURNING id"
            cursor.execute(query, (request.title, request.author, request.isbn))
            book_id = cursor.fetchone()[0]
            conn.commit()
            return pb2.BookResponse(id=book_id, message="Book created successfully!")
        except Exception as e:
            conn.rollback()
            return pb2.BookResponse(message=f"Database Error: {str(e)}")
        finally:
            cursor.close()
            conn.close()

    def ListBooks(self, request, context):
        print("Fetching inventory...")
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            # Query for available books
            cursor.execute("SELECT id, title, author, isbn FROM books WHERE is_borrowed = FALSE")
            rows = cursor.fetchall()
            books_list = [
                pb2.BookRequest(id=row[0], title=row[1], author=row[2], isbn=row[3])
                for row in rows
            ]
            return pb2.BookList(books=books_list)
        except Exception as e:
            print(f"Database Error: {e}")
            return pb2.BookList()
        finally:
            cursor.close()
            conn.close()

    def BorrowBook(self, request, context):
        print(f"Borrow Request: Book {request.book_id}")
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            # Atomic update for borrowing
            query = "UPDATE books SET is_borrowed = TRUE WHERE id = %s AND is_borrowed = FALSE RETURNING title"
            cursor.execute(query, (request.book_id,))
            result = cursor.fetchone()
            if result:
                conn.commit()
                return pb2.ActionResponse(success=True, message=f"Borrowed: {result[0]}")
            else:
                return pb2.ActionResponse(success=False, message="Book already out or not found.")
        except Exception as e:
            conn.rollback()
            return pb2.ActionResponse(success=False, message=str(e))
        finally:
            cursor.close()
            conn.close()

    def ReturnBook(self, request, context):
        # Implementation for returning a book
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            query = "UPDATE books SET is_borrowed = FALSE WHERE id = %s RETURNING title"
            cursor.execute(query, (request.book_id,))
            result = cursor.fetchone()
            if result:
                conn.commit()
                return pb2.ActionResponse(success=True, message=f"Returned: {result[0]}")
            return pb2.ActionResponse(success=False, message="Return failed.")
        except Exception as e:
            conn.rollback()
            return pb2.ActionResponse(success=False, message=str(e))
        finally:
            cursor.close()
            conn.close()

    def CreateMember(self, request, context):
        # Registration logic for members
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            query = "INSERT INTO members (name, email) VALUES (%s, %s) RETURNING id"
            cursor.execute(query, (request.name, request.email))
            member_id = cursor.fetchone()[0]
            conn.commit()
            return pb2.MemberResponse(id=member_id, message="Member registered.")
        except Exception as e:
            conn.rollback()
            return pb2.MemberResponse(message=str(e))
        finally:
            cursor.close()
            conn.close()

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    pb2_grpc.add_LibraryServiceServicer_to_server(LibraryService(), server)
    server.add_insecure_port('[::]:50051')
    print("Library Service gRPC Server running on port 50051...")
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()