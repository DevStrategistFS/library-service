import grpc
import random
import codegen.library_pb2 as pb2
import codegen.library_pb2_grpc as pb2_grpc

def run_test():
    # 1. Establish connection to the server
    with grpc.insecure_channel('localhost:50051') as channel:
        stub = pb2_grpc.LibraryServiceStub(channel)

        print("--- STARTING gRPC INTEGRATION TEST ---")

        # Generate a random unique ISBN suffix to avoid database conflicts
        unique_id = random.randint(1000, 9999)
        random_isbn = f"978-3-16-148410-{unique_id}"

        # --- TEST 1: CREATE A BOOK ---
        print(f"\n[Test 1] Creating a unique book (ISBN suffix: {unique_id})...")
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

        # --- TEST 2: LIST ALL BOOKS ---
        print("\n[Test 2] Fetching library inventory...")
        try:
            # pb2.Empty() is used because the service doesn't require input for this call
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