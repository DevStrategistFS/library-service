import { NextResponse } from 'next/server';
import client from '@/lib/grpc-client';

export async function POST(request: Request) {
  try {
    const { title, author, isbn } = await request.json();

    return new Promise((resolve) => {
      client.CreateBook({ title, author, isbn }, (err: any, response: any) => {
        if (err) {
          console.error('gRPC Create Error:', err);
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
        } else {
          // Return the new book ID and success message to the UI
          resolve(NextResponse.json({
            id: response.id,
            message: response.message
          }));
        }
      });
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid Request Body' }, { status: 400 });
  }
}