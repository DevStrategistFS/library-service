import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

// Pointing to your shared proto file in the project root
const PROTO_PATH = path.resolve(process.cwd(), '../proto/library.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const libraryProto: any = grpc.loadPackageDefinition(packageDefinition).library;

// Connect to the Python server running on 50051
const client = new libraryProto.LibraryService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

export default client;