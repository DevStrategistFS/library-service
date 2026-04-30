import grpc
import random
import os
import sys

# Ensure the backend root is in the path for codegen imports
# This allows the script to find the 'codegen' folder when run from the root directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import codegen.library_pb2 as pb2
import codegen.library_pb2_grpc as pb2_grpc

def run_test():
    # 1. Establish connection to the server
    with grpc.insecure_channel('localhost:50051') as channel:
        stub = pb2_grpc.LibraryServiceStub(channel)

        print("--- STARTING gRPC INTEGRATION TEST ---")

        # --- TEST 1: CREATE A MEMBER ---
        # This populates your currently empty MEMBERS table
        print("\n[Test 1] Registering a new member...")
        try:
            member_req = pb2.MemberRequest(name="Ankur Rohit", email="ankur@example.com")
            member_resp = stub.CreateMember(member_req)
            print(f"Result: {member_resp.message} (Assigned ID: {member_resp.id})")
        except Exception as e:
            print(f"Result: CreateMember failed: {e}")

        # --- TEST 2: CREATE A BOOK (Positive Test) ---
        unique_id = random.randint(1000, 9999)
        random_isbn = f"978-3-16-148410-{unique_id}"
        print(f"\n[Test 2] Creating a unique book (ISBN suffix: {unique_id})...")
        new_book = pb2.BookRequest(
            title="The Clean Coder",
            author="Robert C. Martin",
            isbn=random_isbn
        )

        try:
            create_resp = stub.CreateBook(new_book)
            print(f"Result: {create_resp.message} (Assigned ID: {create_resp.id})")
        except Exception as e:
            print(f"Result: CreateBook failed: {e}")

        # --- TEST 3: SERVER-SIDE VALIDATION (Negative Test) ---
        # This verifies the 'if not request.title' logic in your main.py
        print("\n[Test 3] Testing validation logic (Sending empty title)...")
        invalid_book = pb2.BookRequest(title="", author="Author", isbn="123")
        try:
            stub.CreateBook(invalid_book)
            print("Result: Fail (Server should have rejected this)")
        except grpc.RpcError as e:
            print(f"Result: Success (Correctly rejected). Status: {e.code()}, Details: {e.details()}")

        # --- TEST 4: LIST ALL BOOKS ---
        print("\n[Test 4] Fetching library inventory...")
        try:
            # Note: Ensure your proto definition uses pb2.Empty() or similar
            list_resp = stub.ListBooks(pb2.Empty())

            if not list_resp.books:
                print("Result: Library is currently empty.")
            else:
                print(f"Result: Successfully retrieved {len(list_resp.books)} book(s):")
                for index, book in enumerate(list_resp.books, 1):
                    print(f"  {index}. {book.title} | Author: {book.author} | ISBN: {book.isbn}")
        except Exception as e:
            print(f"Result: ListBooks failed: {e}")

        print("\n--- TEST SUITE COMPLETE ---")

if __name__ == '__main__':
    run_test()