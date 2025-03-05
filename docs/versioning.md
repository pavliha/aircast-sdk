# Aircast Protocol Versioning Policy

This document outlines how the Aircast Protocol is versioned and how compatibility is maintained across versions.

## Versioning Scheme

The Aircast Protocol follows [Semantic Versioning](https://semver.org/) (SemVer) with the format `MAJOR.MINOR.PATCH`:

- **MAJOR**: Incremented for incompatible changes that break backward compatibility
- **MINOR**: Incremented for new functionality added in a backward-compatible manner
- **PATCH**: Incremented for backward-compatible bug fixes

## Protocol Version Field

Every message in the Aircast Protocol includes a `protocol_version` field, which contains the version of the protocol being used by the sender. This allows recipients to handle messages according to the appropriate version rules.

## Compatibility Policy

### Backward Compatibility

- **MINOR and PATCH releases** must maintain backward compatibility
- Newer clients can communicate with older servers
- Newer servers can understand messages from older clients

### Forward Compatibility

- Protocol is designed with forward compatibility in mind
- Older clients should be able to work with newer servers in a degraded mode
- Unknown fields should be ignored by recipients

## Compatibility Mechanisms

### Protocol Buffers Features

Protocol Buffers naturally support many compatibility scenarios:

- **Adding new fields**: Fields added in newer versions are ignored by older implementations
- **Deprecated fields**: Fields can be marked as deprecated but must still be supported
- **Default values**: Sensible defaults allow older clients to work with newer protocols
- **OneOf fields**: Allow flexible expansion of message types

### Negotiation

At connection time, clients and servers can negotiate the highest mutually supported version:

1. Client sends its maximum supported version in the initial connection
2. Server responds with the version it will use (either the client's version or a lower supported version)
3. All subsequent messages use the negotiated version

## Breaking Changes

Breaking changes require a MAJOR version increment and may include:

1. **Removing fields**: Removing required fields breaks backward compatibility
2. **Changing field types**: Changing a field's data type may cause parsing errors
3. **Renaming fields**: Field name changes without using aliases
4. **Changing message semantics**: Changing the meaning of a field without changing its name/type

## Versioning Example

| Version | Change Type | Example Change |
|---------|-------------|----------------|
| 1.0.0   | Initial     | Initial release of the protocol |
| 1.1.0   | Minor       | Added new optional field to `DeviceWebrtcOffer` |
| 1.1.1   | Patch       | Fixed error code documentation |
| 2.0.0   | Major       | Removed deprecated `device.rtsp.connected` message |

## Migration Strategies

### For Server Implementations

1. Support at least the current and previous MAJOR versions
2. Implement version detection and appropriate message handling
3. Document deprecated features and their removal timeline
4. Provide migration guides for major version upgrades

### For Client Implementations

1. Check server's supported versions before relying on new features
2. Implement fallback behavior when newer features aren't available
3. Test with multiple server versions

## Long-term Support

- Each MAJOR version will be supported for at least 12 months after the next MAJOR version is released
- Security fixes may be backported to older versions
- End-of-life dates for each MAJOR version will be announced at least 6 months in advance

## Version Header

In addition to the `protocol_version` field within each message, implementations should also use the WebSocket protocol to negotiate version compatibility:

1. Client can include `Sec-WebSocket-Protocol: aircast-1.0` in the WebSocket handshake
2. Server responds with the supported version or rejects the connection if incompatible

This allows early rejection of incompatible clients without parsing messages.
