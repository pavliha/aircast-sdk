# Aircast Protocol

Aircast Protocol is the communication specification for the Aircast system, providing a standardized way for devices, clients, and services to exchange messages in a type-safe manner.

## Overview

This repository contains the Protocol Buffer definitions that serve as the single source of truth for all Aircast communications. The protocol is designed to facilitate real-time communication between devices and clients over WebSockets, with a focus on streaming media, device control, and status monitoring.

## Key Features

- **Type Safety**: Strongly typed message definitions for all supported languages
- **Consistency**: Unified naming convention using the `[entity].[component].[action]` pattern
- **Extensibility**: Designed to evolve with backward compatibility in mind
- **Language Support**: Generate client code for Go, TypeScript, Python, and more

## Getting Started

### Prerequisites

- Protocol Buffers compiler (`protoc`) version 3.0 or higher
- Language-specific protobuf plugins

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/pavliha/aircast-protocol.git
   cd aircast-protocol
   ```

2. Install dependencies and generate code:
   ```bash
   npm install
   ```

   This will automatically generate the client code for all supported languages (TypeScript, Go, Python) during the installation process.

3. Alternatively, you can manually generate code for your preferred language:
   ```bash
   # Generate all language clients
   npm run generate
   
   # For Go only
   npm run generate:go
   
   # For TypeScript only
   npm run generate:ts
   
   # For Python only
   npm run generate:python
   ```

## Protocol Structure

The Aircast Protocol uses a consistent message structure with the following components:

```
Message {
  message_id: string       // Unique identifier for this message
  correlation_id: string   // Links responses to requests
  protocol_version: string // Protocol version (e.g., "1.0")
  timestamp: int64         // Unix timestamp in milliseconds
  
  oneof content {
    // One of many possible message types
  }
}
```

### Message Naming Convention

All messages follow the `[entity].[component].[action]` naming pattern:

- **Entity**: The system component sending or receiving the message (e.g., `device`, `client`, `api`)
- **Component**: The functional area (e.g., `camera`, `webrtc`, `modem`)
- **Action**: The specific operation or event (e.g., `connected`, `error`, `list_request`)

Example: `device.modem.connected` indicates that a device's modem has established a connection.

## Versioning

This protocol follows [Semantic Versioning](https://semver.org/):

- **Major version**: Incompatible changes that require client updates
- **Minor version**: New functionality added in a backward-compatible manner
- **Patch version**: Backward-compatible bug fixes

See [CHANGELOG.md](CHANGELOG.md) for version history.

## Documentation

- [Getting Started Guide](docs/getting-started.md)
- [Message Reference](docs/message-reference.md)
- [Versioning Policy](docs/versioning.md)

## Examples

The `examples` directory contains sample code for different languages showing how to use the protocol:

- [Go Examples](examples/go/)
- [TypeScript Examples](examples/typescript/)
- [Python Examples](examples/python/)

## Contributing

We welcome contributions to the Aircast Protocol. Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
