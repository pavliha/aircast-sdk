"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AircastClient = exports.AircastEventType = void 0;
const aircast_1 = require("../../gen/typescript/proto/aircast");
/**
 * Event types emitted by the AircastClient
 */
var AircastEventType;
(function (AircastEventType) {
    AircastEventType["CONNECTED"] = "connected";
    AircastEventType["DISCONNECTED"] = "disconnected";
    AircastEventType["MODEM_CONNECTED"] = "modem-connected";
    AircastEventType["MODEM_SIGNAL_QUALITY"] = "modem-signal-quality";
    AircastEventType["RTSP_CONNECTED"] = "rtsp-connected";
    AircastEventType["RTSP_STREAM_READY"] = "rtsp-stream-ready";
    AircastEventType["RTSP_ERROR"] = "rtsp-error";
    AircastEventType["RTSP_DISCONNECTED"] = "rtsp-disconnected";
    AircastEventType["WEBRTC_PEER_CONNECTED"] = "webrtc-peer-connected";
    AircastEventType["WEBRTC_PEER_DISCONNECTED"] = "webrtc-peer-disconnected";
    AircastEventType["WEBRTC_ICE_CONNECTED"] = "webrtc-ice-connected";
    AircastEventType["WEBRTC_ICE_DISCONNECTED"] = "webrtc-ice-disconnected";
    AircastEventType["WEBRTC_DATA_CHANNEL_OPEN"] = "webrtc-data-channel-open";
    AircastEventType["WEBRTC_ERROR"] = "webrtc-error";
    AircastEventType["CAMERA_ADDED"] = "camera-added";
    AircastEventType["CAMERA_UPDATED"] = "camera-updated";
    AircastEventType["CAMERA_REMOVED"] = "camera-removed";
    AircastEventType["CAMERA_SWITCHED"] = "camera-switched";
    AircastEventType["ERROR"] = "error";
})(AircastEventType || (exports.AircastEventType = AircastEventType = {}));
/**
 * Default client options
 */
const DEFAULT_OPTIONS = {
    protocolVersion: '1.0',
    autoReconnect: true,
    reconnectDelay: 5000,
    maxReconnectAttempts: 10,
    requestTimeout: 10000,
    logLevel: 3
};
/**
 * A comprehensive TypeScript client for the Aircast Protocol
 */
class AircastClient {
    /**
     * Creates a new Aircast client
     * @param url The WebSocket URL of the Aircast server
     * @param options Client options
     */
    constructor(url, options = {}) {
        this.url = url;
        this.ws = null;
        this.messageHandlers = new Map();
        this.eventListeners = new Map();
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;
        this.isReconnecting = false;
        this.isConnecting = false;
        this.connectionPromise = null;
        this.resolveConnection = null;
        this.rejectConnection = null;
        this.messageIdCounter = 0;
        this.options = { ...DEFAULT_OPTIONS, ...options };
        // Initialize event listener map
        Object.values(AircastEventType).forEach(type => {
            this.eventListeners.set(type, new Set());
        });
    }
    /**
     * Logs a message based on the configured log level
     * @param level Log level
     * @param message Message to log
     * @param args Additional arguments
     */
    log(level, message, ...args) {
        if (level <= this.options.logLevel) {
            const prefix = ['', '[ERROR]', '[WARN]', '[INFO]', '[DEBUG]'][level] || '';
            console.log(`${prefix} AircastClient: ${message}`, ...args);
        }
    }
    /**
     * Generates a unique message ID
     * @returns A unique message ID
     */
    generateMessageId() {
        // Use crypto.randomUUID if available, otherwise fallback to a counter
        return typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `msg-${Date.now()}-${++this.messageIdCounter}`;
    }
    /**
     * Connects to the Aircast server
     * @returns A promise that resolves when connected
     */
    connect() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return Promise.resolve();
        }
        if (this.isConnecting && this.connectionPromise) {
            return this.connectionPromise;
        }
        this.isConnecting = true;
        this.connectionPromise = new Promise((resolve, reject) => {
            this.resolveConnection = resolve;
            this.rejectConnection = reject;
            this.log(3, `Connecting to ${this.url}`);
            this.ws = new WebSocket(this.url);
            this.ws.binaryType = 'arraybuffer';
            this.ws.onopen = () => {
                this.log(3, 'Connection established');
                this.isConnecting = false;
                this.reconnectAttempts = 0;
                if (this.resolveConnection) {
                    this.resolveConnection();
                    this.resolveConnection = null;
                    this.rejectConnection = null;
                }
                this.emitEvent(AircastEventType.CONNECTED, null);
            };
            this.ws.onclose = (event) => {
                this.log(3, `Connection closed: ${event.code} ${event.reason}`);
                this.isConnecting = false;
                this.connectionPromise = null;
                if (this.rejectConnection) {
                    this.rejectConnection(new Error(`WebSocket connection closed: ${event.code} ${event.reason}`));
                    this.resolveConnection = null;
                    this.rejectConnection = null;
                }
                this.emitEvent(AircastEventType.DISCONNECTED, { code: event.code, reason: event.reason });
                // Handle reconnection
                if (this.options.autoReconnect && !this.isReconnecting) {
                    this.scheduleReconnect();
                }
            };
            this.ws.onerror = (error) => {
                this.log(1, 'WebSocket error', error);
                if (this.rejectConnection) {
                    this.rejectConnection(new Error('WebSocket connection failed'));
                    this.resolveConnection = null;
                    this.rejectConnection = null;
                }
                this.emitEvent(AircastEventType.ERROR, { message: 'WebSocket error', error });
            };
            this.ws.onmessage = (event) => {
                try {
                    const message = aircast_1.Message.decode(new Uint8Array(event.data));
                    this.log(4, 'Received message', message);
                    this.handleMessage(message);
                }
                catch (error) {
                    this.log(1, 'Error parsing message:', error);
                    this.emitEvent(AircastEventType.ERROR, { message: 'Error parsing message', error });
                }
            };
        });
        return this.connectionPromise;
    }
    /**
     * Schedules a reconnection attempt
     */
    scheduleReconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
            this.log(2, `Maximum reconnect attempts (${this.options.maxReconnectAttempts}) reached`);
            return;
        }
        this.isReconnecting = true;
        this.reconnectAttempts++;
        const delay = this.options.reconnectDelay * Math.min(this.reconnectAttempts, 10);
        this.log(3, `Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
        this.reconnectTimer = setTimeout(() => {
            this.log(3, `Attempting to reconnect (${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`);
            this.isReconnecting = false;
            this.connect().catch(error => {
                this.log(1, 'Reconnect failed:', error);
            });
        }, delay);
    }
    /**
     * Disconnects from the Aircast server
     */
    disconnect() {
        // Clear any pending reconnect timer
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.isReconnecting = false;
        if (this.ws) {
            this.log(3, 'Disconnecting');
            this.ws.close();
            this.ws = null;
            this.connectionPromise = null;
        }
    }
    /**
     * Adds an event listener
     * @param type Event type
     * @param callback Callback function
     * @returns The client instance for chaining
     */
    on(type, callback) {
        const listeners = this.eventListeners.get(type);
        if (listeners) {
            listeners.add(callback);
        }
        return this;
    }
    /**
     * Removes an event listener
     * @param type Event type
     * @param callback Callback function to remove
     * @returns The client instance for chaining
     */
    off(type, callback) {
        const listeners = this.eventListeners.get(type);
        if (listeners) {
            listeners.delete(callback);
        }
        return this;
    }
    /**
     * Emits an event to all registered listeners
     * @param type Event type
     * @param data Event data
     */
    emitEvent(type, data) {
        const listeners = this.eventListeners.get(type);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(data);
                }
                catch (error) {
                    this.log(1, `Error in event listener for ${type}:`, error);
                }
            });
        }
    }
    /**
     * Sends a message to the server
     * @param message The message to send
     */
    sendMessage(message) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket is not connected');
        }
        this.log(4, 'Sending message', message);
        const binary = aircast_1.Message.encode(message).finish();
        this.ws.send(binary);
    }
    /**
     * Creates a new message object with standard fields populated
     * @param messageField The specific message field to set
     * @returns A new message object
     */
    createMessage(messageField) {
        return {
            messageId: this.generateMessageId(),
            correlationId: this.generateMessageId(),
            protocolVersion: this.options.protocolVersion,
            timestamp: Date.now(),
            ...messageField
        };
    }
    /**
     * Sends a message and waits for a response with the same correlation ID
     * @param message The message to send
     * @param timeoutMs Timeout in milliseconds
     * @returns A promise that resolves with the response message
     */
    async sendWithResponse(message, timeoutMs = this.options.requestTimeout) {
        await this.connect();
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.messageHandlers.delete(message.correlationId);
                reject(new Error(`Request timed out after ${timeoutMs}ms`));
            }, timeoutMs);
            this.messageHandlers.set(message.correlationId, (responseMessage) => {
                clearTimeout(timeout);
                this.messageHandlers.delete(message.correlationId);
                // Check if the response contains an error
                if (responseMessage.error) {
                    reject(new Error(`Error ${responseMessage.error.code}: ${responseMessage.error.message}`));
                }
                else {
                    resolve(responseMessage);
                }
            });
            this.sendMessage(message);
        });
    }
    /**
     * Handles an incoming message
     * @param message The received message
     */
    handleMessage(message) {
        // Check if this is a response to a pending request
        if (message.correlationId && this.messageHandlers.has(message.correlationId)) {
            const handler = this.messageHandlers.get(message.correlationId);
            if (handler) {
                handler(message);
                return;
            }
        }
        // Emit events based on message type
        this.processMessageEvents(message);
    }
    /**
     * Process message events and emit corresponding events
     * @param message The message to process
     */
    processMessageEvents(message) {
        // Modem events
        if (message.deviceModemConnected) {
            this.emitEvent(AircastEventType.MODEM_CONNECTED, message.deviceModemConnected);
        }
        else if (message.deviceModemSignalQuality) {
            this.emitEvent(AircastEventType.MODEM_SIGNAL_QUALITY, message.deviceModemSignalQuality);
        }
        // RTSP events
        else if (message.deviceRtspConnected) {
            this.emitEvent(AircastEventType.RTSP_CONNECTED, message.deviceRtspConnected);
        }
        else if (message.deviceRtspStreamReady) {
            this.emitEvent(AircastEventType.RTSP_STREAM_READY, message.deviceRtspStreamReady);
        }
        else if (message.deviceRtspError || message.deviceRtspDialError || message.deviceRtspDescribeError ||
            message.deviceRtspPublishError || message.deviceRtspDecodeError || message.deviceRtspListenError ||
            message.deviceRtspClientError || message.deviceRtspConnectFailed || message.deviceRtspRedialError) {
            // Consolidate all RTSP error events
            this.emitEvent(AircastEventType.RTSP_ERROR, message);
        }
        else if (message.deviceRtspDisconnected) {
            this.emitEvent(AircastEventType.RTSP_DISCONNECTED, message.deviceRtspDisconnected);
        }
        // WebRTC events
        else if (message.deviceWebrtcPeerConnected) {
            this.emitEvent(AircastEventType.WEBRTC_PEER_CONNECTED, message.deviceWebrtcPeerConnected);
        }
        else if (message.deviceWebrtcPeerDisconnected) {
            this.emitEvent(AircastEventType.WEBRTC_PEER_DISCONNECTED, message.deviceWebrtcPeerDisconnected);
        }
        else if (message.deviceWebrtcIceConnected) {
            this.emitEvent(AircastEventType.WEBRTC_ICE_CONNECTED, message.deviceWebrtcIceConnected);
        }
        else if (message.deviceWebrtcIceDisconnected) {
            this.emitEvent(AircastEventType.WEBRTC_ICE_DISCONNECTED, message.deviceWebrtcIceDisconnected);
        }
        else if (message.deviceWebrtcDataChannelOpen) {
            this.emitEvent(AircastEventType.WEBRTC_DATA_CHANNEL_OPEN, message.deviceWebrtcDataChannelOpen);
        }
        else if (message.deviceWebrtcError || message.deviceWebrtcOfferError) {
            this.emitEvent(AircastEventType.WEBRTC_ERROR, message);
        }
        // Camera events
        else if (message.deviceCameraAddSuccess) {
            this.emitEvent(AircastEventType.CAMERA_ADDED, message.deviceCameraAddSuccess);
        }
        else if (message.deviceCameraUpdateSuccess) {
            this.emitEvent(AircastEventType.CAMERA_UPDATED, message.deviceCameraUpdateSuccess);
        }
        else if (message.deviceCameraRemoveSuccess) {
            this.emitEvent(AircastEventType.CAMERA_REMOVED, message.deviceCameraRemoveSuccess);
        }
        else if (message.deviceCameraSwitchSuccess) {
            this.emitEvent(AircastEventType.CAMERA_SWITCHED, message.deviceCameraSwitchSuccess);
        }
        // General errors
        else if (message.error) {
            this.emitEvent(AircastEventType.ERROR, message.error);
        }
    }
    // API Methods
    /**
     * Requests the list of available cameras
     * @returns Promise with the camera list
     */
    async getCameraList() {
        const message = this.createMessage({ clientCameraListRequest: {} });
        const response = await this.sendWithResponse(message);
        if (response.deviceCameraListResponse) {
            return response.deviceCameraListResponse.cameras;
        }
        else if (response.deviceCameraListError) {
            throw new Error(response.deviceCameraListError.error);
        }
        else {
            throw new Error('Unexpected response type');
        }
    }
    /**
     * Gets the currently selected camera
     * @returns Promise with the selected camera
     */
    async getSelectedCamera() {
        const message = this.createMessage({ clientCameraSelectedRequest: {} });
        const response = await this.sendWithResponse(message);
        if (response.deviceCameraSelectedResponse && response.deviceCameraSelectedResponse.camera) {
            return response.deviceCameraSelectedResponse.camera;
        }
        else if (response.deviceCameraSelectedError) {
            throw new Error(response.deviceCameraSelectedError.error);
        }
        else {
            throw new Error('Unexpected response type');
        }
    }
    /**
     * Adds a new camera
     * @param name Camera name
     * @param rtspUrl RTSP URL
     * @param networkInterface Network interface
     * @returns Promise with the added camera
     */
    async addCamera(name, rtspUrl, networkInterface) {
        const message = this.createMessage({
            clientCameraAdd: {
                name,
                rtspUrl,
                networkInterface
            }
        });
        const response = await this.sendWithResponse(message);
        if (response.deviceCameraAddSuccess && response.deviceCameraAddSuccess.camera) {
            return response.deviceCameraAddSuccess.camera;
        }
        else if (response.deviceCameraAddError) {
            throw new Error(response.deviceCameraAddError.error);
        }
        else {
            throw new Error('Unexpected response type');
        }
    }
    /**
     * Updates a camera
     * @param camera The camera to update
     * @returns Promise with the updated camera
     */
    async updateCamera(camera) {
        const message = this.createMessage({
            clientCameraUpdate: {
                camera
            }
        });
        const response = await this.sendWithResponse(message);
        if (response.deviceCameraUpdateSuccess && response.deviceCameraUpdateSuccess.camera) {
            return response.deviceCameraUpdateSuccess.camera;
        }
        else if (response.deviceCameraUpdateError) {
            throw new Error(response.deviceCameraUpdateError.error);
        }
        else {
            throw new Error('Unexpected response type');
        }
    }
    /**
     * Removes a camera
     * @param cameraId ID of the camera to remove
     * @returns Promise that resolves when the camera is removed
     */
    async removeCamera(cameraId) {
        const message = this.createMessage({
            clientCameraRemove: {
                cameraId
            }
        });
        const response = await this.sendWithResponse(message);
        if (response.deviceCameraRemoveSuccess) {
            return;
        }
        else if (response.deviceCameraRemoveError) {
            throw new Error(response.deviceCameraRemoveError.error);
        }
        else {
            throw new Error('Unexpected response type');
        }
    }
    /**
     * Switches to a different camera
     * @param cameraId ID of the camera to switch to
     * @returns Promise that resolves when the camera is switched
     */
    async switchCamera(cameraId) {
        const message = this.createMessage({
            clientCameraSwitch: {
                cameraId
            }
        });
        const response = await this.sendWithResponse(message);
        if (response.deviceCameraSwitchSuccess) {
            return;
        }
        else if (response.deviceCameraSwitchError) {
            throw new Error(response.deviceCameraSwitchError.error);
        }
        else {
            throw new Error('Unexpected response type');
        }
    }
    /**
     * Starts a WebRTC session
     * @returns Promise that resolves when the session is started
     */
    async startWebRtcSession() {
        const message = this.createMessage({
            clientWebrtcSessionStart: {}
        });
        const response = await this.sendWithResponse(message);
        if (response.deviceWebrtcSessionStarted) {
            return;
        }
        else if (response.deviceWebrtcError) {
            throw new Error(response.deviceWebrtcError.error);
        }
        else {
            throw new Error('Unexpected response type');
        }
    }
    /**
     * Sends a WebRTC offer
     * @param sdp Session Description Protocol string
     * @returns Promise that resolves when the offer is acknowledged
     */
    async sendWebRtcOffer(sdp) {
        const message = this.createMessage({
            clientWebrtcOffer: {
                sdp
            }
        });
        const response = await this.sendWithResponse(message);
        if (response.deviceWebrtcOfferAck) {
            return;
        }
        else if (response.deviceWebrtcOfferError) {
            throw new Error(response.deviceWebrtcOfferError.error);
        }
        else if (response.deviceWebrtcError) {
            throw new Error(response.deviceWebrtcError.error);
        }
        else {
            throw new Error('Unexpected response type');
        }
    }
    /**
     * Sends a WebRTC answer
     * @param sdp Session Description Protocol string
     * @returns Promise that resolves when the answer is acknowledged
     */
    async sendWebRtcAnswer(sdp) {
        const message = this.createMessage({
            clientWebrtcAnswer: {
                sdp
            }
        });
        const response = await this.sendWithResponse(message);
        if (response.deviceWebrtcAnswerAck) {
            return;
        }
        else if (response.deviceWebrtcError) {
            throw new Error(response.deviceWebrtcError.error);
        }
        else {
            throw new Error('Unexpected response type');
        }
    }
    /**
     * Sends a WebRTC ICE candidate
     * @param candidate ICE candidate
     * @param sdpMid SDP mid
     * @param sdpMLineIndex SDP line index
     * @param usernameFragment Username fragment
     * @returns Promise that resolves when the candidate is acknowledged
     */
    async sendWebRtcIceCandidate(candidate, sdpMid, sdpMLineIndex, usernameFragment) {
        const message = this.createMessage({
            clientWebrtcIceCandidate: {
                candidate,
                sdpMid,
                sdpMLineIndex,
                usernameFragment
            }
        });
        const response = await this.sendWithResponse(message);
        if (response.deviceWebrtcIceCandidateAck) {
            return;
        }
        else if (response.deviceWebrtcError) {
            throw new Error(response.deviceWebrtcError.error);
        }
        else {
            throw new Error('Unexpected response type');
        }
    }
    /**
     * Gets the device status
     * @returns Promise with the device status
     */
    async getStatus() {
        const message = this.createMessage({
            clientStatusRequest: {}
        });
        const response = await this.sendWithResponse(message);
        if (response.deviceStatusResponse && response.deviceStatusResponse.status) {
            return response.deviceStatusResponse.status;
        }
        else {
            throw new Error('Failed to get device status');
        }
    }
    /**
     * Gets the modem information
     * @returns Promise with the modem information
     */
    async getModemInfo() {
        const message = this.createMessage({
            clientModemInfoRequest: {}
        });
        const response = await this.sendWithResponse(message);
        if (response.deviceModemInfoResponse) {
            return response.deviceModemInfoResponse;
        }
        else if (response.deviceModemConnectionError) {
            throw new Error(response.deviceModemConnectionError.error);
        }
        else {
            throw new Error('Failed to get modem information');
        }
    }
    /**
     * Gets the network interfaces
     * @returns Promise with the network interfaces
     */
    async getNetworkInterfaces() {
        const message = this.createMessage({
            clientNetworkInterfacesRequest: {}
        });
        const response = await this.sendWithResponse(message);
        if (response.deviceNetworkInterfacesResponse) {
            return response.deviceNetworkInterfacesResponse.interfaces;
        }
        else {
            throw new Error('Failed to get network interfaces');
        }
    }
    /**
     * Initiates RTSP dialing
     * @param url RTSP URL to dial
     * @returns Promise that resolves when the connection is established
     */
    async dialRtsp(url) {
        const message = this.createMessage({
            clientRtspDial: {
                url
            }
        });
        const response = await this.sendWithResponse(message);
        if (response.deviceRtspConnected) {
            return;
        }
        else if (response.deviceRtspDialError) {
            throw new Error(response.deviceRtspDialError.error);
        }
        else if (response.deviceRtspError) {
            throw new Error(response.deviceRtspError.error);
        }
        else {
            throw new Error('Unexpected response type');
        }
    }
    /**
     * Reboots the device
     * @returns Promise that resolves when the reboot command is acknowledged
     */
    async rebootDevice() {
        const message = this.createMessage({
            clientDeviceReboot: {}
        });
        // This likely won't resolve normally since the device is rebooting
        try {
            await this.sendWithResponse(message, 3000);
        }
        catch (error) {
            // Expected disconnect due to reboot, not an error
            this.log(3, 'Device is rebooting, connection lost as expected');
        }
    }
}
exports.AircastClient = AircastClient;
