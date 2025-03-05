# Aircast Protocol Message Reference

This document provides a comprehensive reference for all message types in the Aircast Protocol.

## Message Structure

All Aircast Protocol messages share a common envelope structure:

```protobuf
message Message {
  string message_id = 1;        // Unique identifier for this message
  string correlation_id = 2;    // For response correlation with request
  string protocol_version = 3;  // Version of the protocol (e.g., "1.0")
  int64 timestamp = 4;          // Unix timestamp in milliseconds

  oneof content {
    // One of many possible message types
  }
}
```

## Message Naming Convention

All messages follow the `[entity].[component].[action]` naming pattern:

- **Entity**: The system component sending or receiving the message (e.g., `device`, `client`, `api`)
- **Component**: The functional area (e.g., `camera`, `webrtc`, `modem`)
- **Action**: The specific operation or event (e.g., `connected`, `error`, `list_request`)

## Message Categories

### Client Requests

These messages are sent from clients to devices:

| Message Type | Description | Fields | Response Types |
|--------------|-------------|--------|----------------|
| `client.camera.list_request` | Request list of available cameras | *(empty)* | `device.camera.list_response` or `device.camera.list_error` |
| `client.camera.add` | Add a new camera | `name`, `rtsp_url`, `network_interface` | `device.camera.add_success` or `device.camera.add_error` |
| `client.camera.update` | Update camera settings | `camera` (Camera object) | `device.camera.update_success` or `device.camera.update_error` |
| `client.camera.remove` | Remove a camera | `camera_id` | `device.camera.remove_success` or `device.camera.remove_error` |
| `client.camera.switch` | Switch to a different camera | `camera_id` | `device.camera.switch_success` or `device.camera.switch_error` |
| `client.camera.selected_request` | Get the currently selected camera | *(empty)* | `device.camera.selected_response` or `device.camera.selected_error` |
| `client.network_interfaces_request` | Get available network interfaces | *(empty)* | `device.network_interfaces_response` |
| `client.rtsp_dial` | Connect to an RTSP stream | `url` | Various RTSP messages (success/error) |
| `client.status_request` | Get device status | *(empty)* | `device.status_response` |
| `client.webrtc.session_start` | Start a WebRTC session | *(empty)* | `device.webrtc.session_started` |
| `client.webrtc.offer` | WebRTC offer | `sdp` | `device.webrtc.offer_ack` or `device.webrtc.offer_error` |
| `client.webrtc.answer` | WebRTC answer | `sdp` | `device.webrtc.answer_ack` |
| `client.webrtc.ice_candidate` | WebRTC ICE candidate | `candidate`, `sdp_mid`, `sdp_m_line_index`, `username_fragment` | `device.webrtc.ice_candidate_ack` |
| `client.device.reboot` | Reboot the device | *(empty)* | *(no direct response, connection will close)* |
| `client.modem_info_request` | Get modem information | *(empty)* | `device.modem.info_response` |

### Device Messages

These messages are sent from devices to clients (as responses or events):

#### Camera Messages

| Message Type | Description | Fields |
|--------------|-------------|--------|
| `device.camera.list_response` | List of available cameras | `cameras` (array of Camera objects) |
| `device.camera.list_error` | Error getting camera list | `error` |
| `device.camera.add_success` | Camera added successfully | `camera` (Camera object) |
| `device.camera.add_error` | Error adding camera | `error` |
| `device.camera.update_success` | Camera updated successfully | `camera` (Camera object) |
| `device.camera.update_error` | Error updating camera | `error` |
| `device.camera.remove_success` | Camera removed successfully | `camera_id` |
| `device.camera.remove_error` | Error removing camera | `error` |
| `device.camera.switch_success` | Camera switched successfully | `camera_id` |
| `device.camera.switch_error` | Error switching camera | `error` |
| `device.camera.selected_response` | Currently selected camera | `camera` (Camera object) |
| `device.camera.selected_error` | Error getting selected camera | `error` |

#### RTSP Messages

| Message Type | Description | Fields |
|--------------|-------------|--------|
| `device.rtsp.connected` | RTSP connection established | `status` |
| `device.rtsp.stream_ready` | RTSP stream is ready | `status` |
| `device.rtsp.error` | General RTSP error | `error` |
| `device.rtsp.dial_error` | Error connecting to RTSP | `error` |
| `device.rtsp.describe_error` | Error describing RTSP stream | `error` |
| `device.rtsp.publish_error` | Error publishing RTSP stream | `error` |
| `device.rtsp.packet_lost` | RTSP packet loss warning | `details` |
| `device.rtsp.decode_error` | Error decoding RTSP stream | `error` |
| `device.rtsp.listen_error` | Error listening for RTSP | `error` |
| `device.rtsp.client_error` | RTSP client error | `error` |
| `device.rtsp.disconnected` | RTSP disconnection warning | `reason` |
| `device.rtsp.connect_failed` | RTSP connection failed | `error` |
| `device.rtsp.redial_error` | Error redialing RTSP | `error` |

#### WebRTC Messages

| Message Type | Description | Fields |
|--------------|-------------|--------|
| `device.webrtc.session_started` | WebRTC session started | *(empty)* |
| `device.webrtc.offer` | WebRTC offer | `sdp` |
| `device.webrtc.answer` | WebRTC answer | `sdp` |
| `device.webrtc.ice_candidate` | WebRTC ICE candidate | `candidate`, `sdp_mid`, `sdp_m_line_index`, `username_fragment` |
| `device.webrtc.peer_connected` | WebRTC peer connection established | *(empty)* |
| `device.webrtc.peer_disconnected` | WebRTC peer disconnected | `reason` |
| `device.webrtc.ice_connected` | WebRTC ICE connection established | *(empty)* |
| `device.webrtc.ice_disconnected` | WebRTC ICE connection lost | `reason` |
| `device.webrtc.offer_ack` | WebRTC offer acknowledged | *(empty)* |
| `device.webrtc.answer_ack` | WebRTC answer acknowledged | *(empty)* |
| `device.webrtc.ice_candidate_ack` | WebRTC ICE candidate acknowledged | *(empty)* |
| `device.webrtc.error` | General WebRTC error | `error` |
| `device.webrtc.offer_error` | Error processing WebRTC offer | `error` |
| `device.webrtc.session_stop_warning` | WebRTC session stopping | `reason` |
| `device.webrtc.peer_connecting` | WebRTC peer connecting | `status` |
| `device.webrtc.data_channel_open` | WebRTC data channel opened | `channel_id` |

#### Modem Messages

| Message Type | Description | Fields |
|--------------|-------------|--------|
| `device.modem.connected` | Modem connected | `status` |
| `device.modem.info` | Modem information | `event`, `signal_quality` |
| `device.modem.signal_quality` | Modem signal quality update | `event`, `signal_quality` |
| `device.modem.connection_error` | Modem connection error | `error` |
| `device.modem.info_response` | Response to modem info request | `status`, `model`, `manufacturer`, `imei`, `signal_quality` |

#### Mavlink Messages

| Message Type | Description | Fields |
|--------------|-------------|--------|
| `device.mavlink.connected` | Mavlink connection established | `status` |
| `device.mavlink.dial_error` | Error connecting to Mavlink | `error` |

#### Other Device Messages

| Message Type | Description | Fields |
|--------------|-------------|--------|
| `device.network_interfaces_response` | List of network interfaces | `interfaces` (array of InterfaceInfo objects) |
| `device.status_response` | Device service status | `status` (ServiceStatus object) |

### API Messages

These messages are sent from the API server:

| Message Type | Description | Fields |
|--------------|-------------|--------|
| `api.device.connected` | Device connected to the API | `device_id` |
| `api.device.disconnected` | Device disconnected from the API | `device_id`, `reason` |

### Error Message

A generic error message for protocol-level errors:

| Message Type | Description | Fields |
|--------------|-------------|--------|
| `error` | Generic error | `code`, `message`, `details` (map) |

## Common Data Structures

### Camera

```protobuf
message Camera {
  string id = 1;
  string name = 2;
  string rtsp_url = 3;
  string network_interface = 4;
}
```

### InterfaceInfo

```protobuf
message InterfaceInfo {
  string name = 1;
  int32 mtu = 2;
  string hardware_addr = 3;
  string flags = 4;
  repeated string addresses = 5;
}
```

### ServiceStatus

```protobuf
message ServiceStatus {
  Event mavlink = 1;
  Event rtsp = 2;
  Event modem = 3;
  Event webrtc = 4;
}
```

### Event

```protobuf
message Event {
  string name = 1;
  string type = 2;
  bytes payload = 3;  // Can be any serialized data
}
```

### SignalQuality

```protobuf
message SignalQuality {
  int32 value = 1;    // Signal quality as a percentage or dBm value
}
```

## Error Codes

| Code Range | Description |
|------------|-------------|
| 400-499 | Client errors (invalid requests, bad format, etc.) |
| 500-599 | Server errors (internal failures, service unavailable) |

Specific common error codes:

| Code | Description |
|------|-------------|
| 400 | Bad request (general client error) |
| 401 | Unauthorized (authentication required) |
| 403 | Forbidden (authorization failed) |
| 404 | Not found |
| 408 | Request timeout |
| 409 | Conflict |
| 429 | Too many requests (rate limiting) |
| 500 | Internal server error |
| 503 | Service unavailable |
