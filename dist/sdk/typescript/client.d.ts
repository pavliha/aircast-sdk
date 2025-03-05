import { Camera, InterfaceInfo, ServiceStatus } from '../../gen/typescript/proto/common';
import { DeviceModemInfoResponse, Message } from '../../gen/typescript/proto/aircast';
/**
 * Event types emitted by the AircastClient
 */
export declare enum AircastEventType {
    CONNECTED = "connected",
    DISCONNECTED = "disconnected",
    MODEM_CONNECTED = "modem-connected",
    MODEM_SIGNAL_QUALITY = "modem-signal-quality",
    RTSP_CONNECTED = "rtsp-connected",
    RTSP_STREAM_READY = "rtsp-stream-ready",
    RTSP_ERROR = "rtsp-error",
    RTSP_DISCONNECTED = "rtsp-disconnected",
    WEBRTC_PEER_CONNECTED = "webrtc-peer-connected",
    WEBRTC_PEER_DISCONNECTED = "webrtc-peer-disconnected",
    WEBRTC_ICE_CONNECTED = "webrtc-ice-connected",
    WEBRTC_ICE_DISCONNECTED = "webrtc-ice-disconnected",
    WEBRTC_DATA_CHANNEL_OPEN = "webrtc-data-channel-open",
    WEBRTC_ERROR = "webrtc-error",
    CAMERA_ADDED = "camera-added",
    CAMERA_UPDATED = "camera-updated",
    CAMERA_REMOVED = "camera-removed",
    CAMERA_SWITCHED = "camera-switched",
    ERROR = "error"
}
/**
 * Event callback type
 */
export type AircastEventCallback = (data: any) => void;
/**
 * Options for creating an AircastClient
 */
export interface AircastClientOptions {
    /**
     * Protocol version to use
     */
    protocolVersion?: string;
    /**
     * Auto-reconnect when connection is lost
     */
    autoReconnect?: boolean;
    /**
     * Reconnect delay in milliseconds
     */
    reconnectDelay?: number;
    /**
     * Maximum number of reconnect attempts
     */
    maxReconnectAttempts?: number;
    /**
     * Default request timeout in milliseconds
     */
    requestTimeout?: number;
    /**
     * Log level (0 = none, 1 = errors, 2 = warnings, 3 = info, 4 = debug)
     */
    logLevel?: number;
}
/**
 * A comprehensive TypeScript client for the Aircast Protocol
 */
export declare class AircastClient {
    private url;
    private ws;
    private options;
    private messageHandlers;
    private eventListeners;
    private reconnectAttempts;
    private reconnectTimer;
    private isReconnecting;
    private isConnecting;
    private connectionPromise;
    private resolveConnection;
    private rejectConnection;
    private messageIdCounter;
    /**
     * Creates a new Aircast client
     * @param url The WebSocket URL of the Aircast server
     * @param options Client options
     */
    constructor(url: string, options?: AircastClientOptions);
    /**
     * Logs a message based on the configured log level
     * @param level Log level
     * @param message Message to log
     * @param args Additional arguments
     */
    private log;
    /**
     * Generates a unique message ID
     * @returns A unique message ID
     */
    private generateMessageId;
    /**
     * Connects to the Aircast server
     * @returns A promise that resolves when connected
     */
    connect(): Promise<void>;
    /**
     * Schedules a reconnection attempt
     */
    private scheduleReconnect;
    /**
     * Disconnects from the Aircast server
     */
    disconnect(): void;
    /**
     * Adds an event listener
     * @param type Event type
     * @param callback Callback function
     * @returns The client instance for chaining
     */
    on(type: AircastEventType, callback: AircastEventCallback): this;
    /**
     * Removes an event listener
     * @param type Event type
     * @param callback Callback function to remove
     * @returns The client instance for chaining
     */
    off(type: AircastEventType, callback: AircastEventCallback): this;
    /**
     * Emits an event to all registered listeners
     * @param type Event type
     * @param data Event data
     */
    private emitEvent;
    /**
     * Sends a message to the server
     * @param message The message to send
     */
    private sendMessage;
    /**
     * Creates a new message object with standard fields populated
     * @param messageField The specific message field to set
     * @returns A new message object
     */
    private createMessage;
    /**
     * Sends a message and waits for a response with the same correlation ID
     * @param message The message to send
     * @param timeoutMs Timeout in milliseconds
     * @returns A promise that resolves with the response message
     */
    sendWithResponse(message: Message, timeoutMs?: number): Promise<Message>;
    /**
     * Handles an incoming message
     * @param message The received message
     */
    private handleMessage;
    /**
     * Process message events and emit corresponding events
     * @param message The message to process
     */
    private processMessageEvents;
    /**
     * Requests the list of available cameras
     * @returns Promise with the camera list
     */
    getCameraList(): Promise<Camera[]>;
    /**
     * Gets the currently selected camera
     * @returns Promise with the selected camera
     */
    getSelectedCamera(): Promise<Camera>;
    /**
     * Adds a new camera
     * @param name Camera name
     * @param rtspUrl RTSP URL
     * @param networkInterface Network interface
     * @returns Promise with the added camera
     */
    addCamera(name: string, rtspUrl: string, networkInterface: string): Promise<Camera>;
    /**
     * Updates a camera
     * @param camera The camera to update
     * @returns Promise with the updated camera
     */
    updateCamera(camera: Camera): Promise<Camera>;
    /**
     * Removes a camera
     * @param cameraId ID of the camera to remove
     * @returns Promise that resolves when the camera is removed
     */
    removeCamera(cameraId: string): Promise<void>;
    /**
     * Switches to a different camera
     * @param cameraId ID of the camera to switch to
     * @returns Promise that resolves when the camera is switched
     */
    switchCamera(cameraId: string): Promise<void>;
    /**
     * Starts a WebRTC session
     * @returns Promise that resolves when the session is started
     */
    startWebRtcSession(): Promise<void>;
    /**
     * Sends a WebRTC offer
     * @param sdp Session Description Protocol string
     * @returns Promise that resolves when the offer is acknowledged
     */
    sendWebRtcOffer(sdp: string): Promise<void>;
    /**
     * Sends a WebRTC answer
     * @param sdp Session Description Protocol string
     * @returns Promise that resolves when the answer is acknowledged
     */
    sendWebRtcAnswer(sdp: string): Promise<void>;
    /**
     * Sends a WebRTC ICE candidate
     * @param candidate ICE candidate
     * @param sdpMid SDP mid
     * @param sdpMLineIndex SDP line index
     * @param usernameFragment Username fragment
     * @returns Promise that resolves when the candidate is acknowledged
     */
    sendWebRtcIceCandidate(candidate: string, sdpMid: string, sdpMLineIndex: number, usernameFragment: string): Promise<void>;
    /**
     * Gets the device status
     * @returns Promise with the device status
     */
    getStatus(): Promise<ServiceStatus>;
    /**
     * Gets the modem information
     * @returns Promise with the modem information
     */
    getModemInfo(): Promise<DeviceModemInfoResponse>;
    /**
     * Gets the network interfaces
     * @returns Promise with the network interfaces
     */
    getNetworkInterfaces(): Promise<InterfaceInfo[]>;
    /**
     * Initiates RTSP dialing
     * @param url RTSP URL to dial
     * @returns Promise that resolves when the connection is established
     */
    dialRtsp(url: string): Promise<void>;
    /**
     * Reboots the device
     * @returns Promise that resolves when the reboot command is acknowledged
     */
    rebootDevice(): Promise<void>;
}
