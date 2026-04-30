import { NextResponse } from 'next/server';
import client from '@/lib/grpc-client';

/**
 * API Route to handle the Borrow action via gRPC.
 * This acts as the bridge between the React frontend and the Python backend.
 */
export async function POST(request: Request) {
  try {
    const { bookId } = await request.json();

    return new Promise((resolve) => {
      client.BorrowBook({ book_id: bookId, member_id: 1 }, (err: any, response: any) => {
        if (err) {
          console.error('--- gRPC Borrow Call Failed ---');
          console.error(err);
          resolve(
            NextResponse.json(
              { success: false, message: 'Backend service unavailable' },
              { status: 500 }
            )
          );
        } else {
          // Success response from the Python LibraryService
          resolve(
            NextResponse.json({
              success: response.success,
              message: response.message,
            })
          );
        }
      });
    });
  } catch (error) {
    console.error('--- Borrow API Route Error ---');
    console.error(error);
    return NextResponse.json(
      { success: false, message: 'Invalid request format' },
      { status: 400 }
    );
  }
}