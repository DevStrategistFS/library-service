import { NextResponse } from 'next/server';
import client from '@/lib/grpc-client';

export async function GET() {
  return new Promise((resolve) => {
    // Set a small timeout so the UI doesn't hang forever if Python is down
    const timeout = setTimeout(() => {
      resolve(NextResponse.json([], { status: 504 }));
    }, 5000);

    client.ListBooks({}, (err: any, response: any) => {
      clearTimeout(timeout);
      if (err) {
        console.error('gRPC Error:', err.message);
        // Return an empty array on error to prevent the .map() crash
        resolve(NextResponse.json([]));
      } else {
        const books = response && response.books ? response.books : [];
        resolve(NextResponse.json(books));
      }
    });
  });
}