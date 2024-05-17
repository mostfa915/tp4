const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
require('dotenv').config()
const Record = require('./RecordModel');

// Charge le service gRPC et le fichier .proto
const PROTO_PATH = __dirname + '/my-service.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const serviceProto = grpc.loadPackageDefinition(packageDefinition).myservice;

//config database
const connectDB = require('./config')
connectDB()

// Define gRPC service implementation functions
function getRecord(call, callback) {
    const id = call.request.id;

    Record.findById(id)
        .then(record => {
            if (!record) {
                // If no record found, return an error
                const error = new Error(`Record with ID ${id} not found`);
                error.code = grpc.status.NOT_FOUND;
                throw error;
            }
            callback(null, { record });
        })
        .catch(err => {
            console.error(err);
            callback({
                code: grpc.status.INTERNAL,
                details: err.message
            }, null);
        });
}

function CreatePost(call, callback) {
    const { name, description } = call.request;
    const newRecord = new Record({ name, description });

    newRecord.save()
        .then(record => {
            callback(null, { id: record._id });
        })
        .catch(err => {
            console.error('Error creating post:', err);
            callback(err, null);
        });
}


// Démarre le serveur grpc
const server = new grpc.Server();
server.addService(serviceProto.MyService.service, { getRecord, CreatePost });
server.bindAsync(
    '127.0.0.1:50051',
    grpc.ServerCredentials.createInsecure(),
    () => {
        console.log('listening on port 50051');
        server.start()
    }
)