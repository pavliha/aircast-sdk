"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../sdk/typescript/client");
/**
 * Example demonstrating how to use the Aircast client SDK
 */
async function main() {
    // Configure the client
    const options = {
        protocolVersion: '1.0',
        autoReconnect: true,
        reconnectDelay: 3000,
        requestTimeout: 10000,
        logLevel: 3 // INFO level
    };
    // Create a new client instance
    const client = new client_1.AircastClient(`ws://api.aircast.one/devices/:deviceId/ws`, options);
    // Set up event listeners
    setupEventListeners(client);
    try {
        // Connect to the server
        await client.connect();
        console.log('Connected to Aircast server');
        // Get the device status
        const status = await client.getStatus();
        console.log('Device status:', status);
        // Example: List available cameras
        const cameras = await client.getCameraList();
        console.log('Available cameras:', cameras);
        if (cameras.length > 0) {
            // Example: Select the first camera
            const firstCamera = cameras[0];
            console.log(`Switching to camera: ${firstCamera.name} (${firstCamera.id})`);
            await client.switchCamera(firstCamera.id);
            // Example: Start a WebRTC stream for the selected camera
            console.log('Starting WebRTC session...');
            await client.startWebRtcSession();
        }
        else {
            // Example: Add a new camera if none are available
            console.log('No cameras available, adding a new one');
            // First, get the network interfaces to choose an appropriate one
            const interfaces = await client.getNetworkInterfaces();
            console.log('Available network interfaces:', interfaces);
            // Use the first interface for this example
            const networkInterface = interfaces.length > 0 ? interfaces[0].name : 'eth0';
            const newCamera = await client.addCamera('Sample Camera', 'rtsp://192.168.1.100:554/stream', networkInterface);
            console.log('New camera added:', newCamera);
        }
        // Example of handling a WebRTC connection
        simulateWebRtcConnection(client);
    }
    catch (error) {
        console.error('Error:', error);
    }
}
/**
 * Sets up event listeners for the client
 */
function setupEventListeners(client) {
    // Connection events
    client.on(client_1.AircastEventType.CONNECTED, () => {
        console.log('Connection established');
    });
    client.on(client_1.AircastEventType.DISCONNECTED, (data) => {
        console.log(`Connection closed: ${data.code} - ${data.reason}`);
    });
    // Error handling
    client.on(client_1.AircastEventType.ERROR, (error) => {
        console.error('Error received:', error);
    });
    // Modem events
    client.on(client_1.AircastEventType.MODEM_CONNECTED, (data) => {
        console.log('Modem connected:', data.status);
    });
    client.on(client_1.AircastEventType.MODEM_SIGNAL_QUALITY, (data) => {
        console.log('Modem signal quality:', data.signalQuality.value);
    });
    // RTSP events
    client.on(client_1.AircastEventType.RTSP_CONNECTED, (data) => {
        console.log('RTSP connected:', data.status);
    });
    client.on(client_1.AircastEventType.RTSP_STREAM_READY, () => {
        console.log('RTSP stream is ready');
    });
    client.on(client_1.AircastEventType.RTSP_ERROR, (error) => {
        console.error('RTSP error:', error);
    });
    // WebRTC events
    client.on(client_1.AircastEventType.WEBRTC_PEER_CONNECTED, () => {
        console.log('WebRTC peer connected');
    });
    client.on(client_1.AircastEventType.WEBRTC_ICE_CONNECTED, () => {
        console.log('WebRTC ICE connection established');
    });
    client.on(client_1.AircastEventType.WEBRTC_DATA_CHANNEL_OPEN, (data) => {
        console.log('WebRTC data channel opened:', data.channelId);
    });
    // Camera events
    client.on(client_1.AircastEventType.CAMERA_ADDED, (data) => {
        console.log('Camera added:', data.camera);
    });
    client.on(client_1.AircastEventType.CAMERA_UPDATED, (data) => {
        console.log('Camera updated:', data.camera);
    });
    client.on(client_1.AircastEventType.CAMERA_SWITCHED, (data) => {
        console.log('Switched to camera with ID:', data.cameraId);
    });
}
/**
 * Simulates a WebRTC connection process with the device
 */
async function simulateWebRtcConnection(client) {
    // This is a simplified example of WebRTC negotiation
    // In a real application, you would use the WebRTC API
    console.log('Starting WebRTC negotiation process...');
    // Example SDP (in a real app this would come from createOffer())
    const fakeSdpOffer = 'v=0\r\no=- 1234567890 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\nm=video 9 UDP/TLS/RTP/SAVPF 96\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\n';
    try {
        // Send our offer to the server
        await client.sendWebRtcOffer(fakeSdpOffer);
        console.log('WebRTC offer sent');
        // In a real application, you would listen for the answer event
        // and then add ice candidates, etc.
        // Simulate sending an ICE candidate
        setTimeout(async () => {
            try {
                await client.sendWebRtcIceCandidate('candidate:1 1 UDP 2122260223 192.168.1.100 49152 typ host', '0', 0, 'ufrag1');
                console.log('ICE candidate sent');
            }
            catch (error) {
                console.error('Error sending ICE candidate:', error);
            }
        }, 1000);
    }
    catch (error) {
        console.error('WebRTC negotiation failed:', error);
    }
}
/**
 * Example of how to create a clean shutdown/disconnect
 */
function cleanShutdown(client) {
    console.log('Shutting down...');
    client.disconnect();
    console.log('Disconnected from Aircast server');
}
// Run the example
try {
    main().catch(error => {
        console.error('Unhandled error in main:', error);
    });
    // Handle process termination
    process.on('SIGINT', () => {
        console.log('Received SIGINT signal');
        // Get the client instance that was created in main()
        // In a real app, you would store the client in a more accessible way
        cleanShutdown(null); // Just for example
        process.exit(0);
    });
}
catch (error) {
    console.error('Fatal error:', error);
}
