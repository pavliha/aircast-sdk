# Changelog

All notable changes to the Aircast Protocol will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-03-05

### Added
- Initial release of the Aircast Protocol
- Message envelope with `message_id`, `correlation_id`, `protocol_version`, and `timestamp`
- Standardized naming convention using `[entity].[component].[action]` pattern
- Complete message set for device control and monitoring:
    - Camera management (list, add, update, remove, switch)
    - RTSP streaming control and status
    - WebRTC signaling and session management
    - Modem status and information
    - Mavlink connectivity
    - Network interface discovery
    - Device status reporting
- Generic error message type with code, message, and details fields
- Common data structures:
    - Camera configuration
    - Network interface information
    - Service status
    - Event structure
    - Signal quality
- Documentation:
    - Getting started guide
    - Message reference
    - Versioning policy
- Examples for TypeScript and Go implementations
