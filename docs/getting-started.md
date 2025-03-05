# Getting Started with Aircast Protocol

This guide will help you set up and start using the Aircast Protocol in your applications.

## Installation

### Prerequisites

Before you begin, you'll need to install:

- [Protocol Buffers compiler](https://github.com/protocolbuffers/protobuf/releases) (protoc) version 3.0 or higher
- Language-specific protobuf plugins:
    - For Go: `go install google.golang.org/protobuf/cmd/protoc-gen-go@latest`
    - For TypeScript: `npm install --save-dev ts-proto`
    - For Python: Python protobuf package is included with the protoc installation

### Clone the Repository

```bash
git clone https://github.com/pavliha/aircast-protocol.git
cd aircast-protocol
```

## Code Generation

Generate code for your preferred language:

### Go

```bash
protoc --go_out=./gen/go --go_opt=paths=source_relative ./proto/*.proto
```

### TypeScript

```bash
# Install required packages
npm install --save-dev ts-proto

# Generate TypeScript code
protoc \
  --plugin=protoc-gen-ts_proto=./node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_out=./gen/typescript \
  --ts_proto_opt=esModuleInterop=true \
  ./proto/*.proto
```

### Python

```bash
protoc --python_out=./gen/python ./proto/*.proto
```

## Basic Usage

Here's how to use the generated code in different languages:

### Go

```go
package main

import (
	"fmt"
	"log"
	
	pb "github.com/pavliha/aircast-protocol/gen/go"
	"google.golang.org/protobuf/proto"
)

func main() {
	// Create a message
	message := &pb.Message{
		MessageId:        "msg-123",
		CorrelationId:    "corr-123",
		ProtocolVersion:  "1.0",
		Timestamp:        time.Now().UnixMilli(),
		Content: &pb.Message_ClientCameraListRequest{
			ClientCameraListRequest: &pb.ClientCameraListRequest{},
		},
	}
	
	// Serialize the message
	data, err := proto.Marshal(message)
	if err != nil {
		log.Fatalf("Failed to encode message: %v", err)
	}
	
	// Send data over websocket...
	
	// When receiving data:
	receivedMessage := &pb.Message{}
	if err := proto.Unmarshal(receivedData, receivedMessage); err != nil {
		log.Fatalf("Failed to parse message: %v", err)
	}
	
	// Handle the message based on its content
	switch m := receivedMessage.Content.(type) {
	case *pb.Message_DeviceCameraListResponse:
		fmt.Printf("Received camera list with %d cameras\n", len(m.DeviceCameraListResponse.Cameras))
	case *pb.Message_Error:
		fmt.Printf("Received error: %s\n", m.Error.Message)
	// Handle other message types...
	}
}
```

### TypeScript

```typescript
import { Message } from './gen/typescript/aircast';
import { Camera } from './gen/typescript/common';

// Create a message
const message: Message = {
  messageId: "msg-123",
  correlationId: "corr-123",
  protocolVersion: "1.0",
  timestamp: Date.now(),
  content: {
    oneofKind: "clientCameraListRequest",
    clientCameraListRequest: {}
  }
};

// Serialize the message
const binary = Message.encode(message).finish();

// Send binary data over websocket...

// When receiving data:
const receivedMessage = Message.decode(new Uint8Array(receivedBinary));

// Handle the message based on its content
switch (receivedMessage.content?.oneofKind) {
  case "deviceCameraListResponse":
    console.log(`Received camera list with ${receivedMessage.content.deviceCameraListResponse.cameras.length} cameras`);
    break;
  case "error":
    console.log(`Received error: ${receivedMessage.content.error.message}`);
    break;
  // Handle other message types...
}
```

### Python

```python
from gen.python import aircast_pb2

# Create a message
message = aircast_pb2.Message()
message.message_id = "msg-123"
message.correlation_id = "corr-123"
message.protocol_version = "1.0"
message.timestamp = int(time.time() * 1000)

# Set specific message type
camera_request = aircast_pb2.ClientCameraListRequest()
message.client_camera_list_request.CopyFrom(camera_request)

# Serialize the message
binary_data = message.SerializeToString()

# Send binary data over websocket...

# When receiving data:
received_message = aircast_pb2.Message()
received_message.ParseFromString(received_binary_data)

# Handle the message based on its content
if received_message.HasField("device_camera_list_response"):
    print(f"Received camera list with {len(received_message.device_camera_list_response.cameras)} cameras")
elif received_message.HasField("error"):
    print(f"Received error: {received_message.error.message}")
# Handle other message types...
```

## WebSocket Integration

The Aircast Protocol is designed to work over WebSockets. Here's a simple example of integrating with WebSockets in JavaScript:

```javascript
import { Message } from './gen/typescript/aircast';

// Create a WebSocket connection
const ws = new WebSocket('wss://your-aircast-server.com/ws');

// Set binary type to arraybuffer for protobuf
ws.binaryType = 'arraybuffer';

ws.onopen = () => {
  // Create a message
  const message = Message.create({
    messageId: crypto.randomUUID(),
    correlationId: "",
    protocolVersion: "1.0",
    timestamp: Date.now(),
    content: {
      oneofKind: "clientCameraListRequest",
      clientCameraListRequest: {}
    }
  });

  // Send the message
  ws.send(Message.encode(message).finish());
};

ws.onmessage = (event) => {
  try {
    // Parse the received binary message
    const message = Message.decode(new Uint8Array(event.data));
    
    // Handle the message
    console.log('Received message:', message);
    
    // Process based on message type
    if (message.content?.oneofKind === "deviceCameraListResponse") {
      const cameras = message.content.deviceCameraListResponse.cameras;
      // Do something with the cameras...
    }
  } catch (error) {
    console.error('Error parsing message:', error);
  }
};
```

## Next Steps

- Explore the [Message Reference](message-reference.md) for details on each message type
- Check out the [examples](../examples/) directory for more complete implementations
- Read the [Versioning Policy](versioning.md) to understand how the protocol evolves
