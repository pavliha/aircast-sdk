import { Message } from '../../gen/typescript/proto/aircast';
import { Camera } from '../../gen/typescript/proto/common';

/**
 * A simple TypeScript client for the Aircast Protocol
 */
export class AircastClient {
    private ws: WebSocket | null = null;
    private messageHandlers: Map<string, (message: Message) => void> = new Map();
    private connectionPromise: Promise<void> | null = null;
    private resolveConnection: (() => void) | null = null;
    private rejectConnection: ((error: Error) => void) | null = null;

    /**
     * Creates a new Aircast client
     * @param url The WebSocket URL of the Aircast server
     */
    constructor(private url: string) {}

    /**
     * Connects to the Aircast server
     * @returns A promise that resolves when connected
     */
    connect(): Promise<void> {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return Promise.resolve();
        }

        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = new Promise<void>((resolve, reject) => {
            this.resolveConnection = resolve;
            this.rejectConnection = reject;

            this.ws = new WebSocket(this.url);
            this.ws.binaryType = 'arraybuffer';

            this.ws.onopen = () => {
                if (this.resolveConnection) {
                    this.resolveConnection();
                }
            };

            this.ws.onclose = () => {
                this.connectionPromise = null;
                this.ws = null;
            };

            this.ws.onerror = (error) => {
                if (this.rejectConnection) {
                    this.rejectConnection(new Error('WebSocket connection failed'));
                }
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = Message.decode(new Uint8Array(event.data as ArrayBuffer));
                    this.handleMessage(message);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            };
        });

        return this.connectionPromise;
    }

    /**
     * Disconnects from the Aircast server
     */
    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.connectionPromise = null;
        }
    }

    /**
     * Sends a message to the server
     * @param message The message to send
     */
    private sendMessage(message: Message): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket is not connected');
        }

        const binary = Message.encode(message).finish();
        this.ws.send(binary);
    }

    /**
     * Sends a message and waits for a response with the same correlation ID
     * @param message The message to send
     * @param timeoutMs Timeout in milliseconds
     * @returns A promise that resolves with the response message
     */
    async sendWithResponse(message: Message, timeoutMs = 5000): Promise<Message> {
        await this.connect();

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.messageHandlers.delete(message.correlationId);
                reject(new Error(`Request timed out after ${timeoutMs}ms`));
            }, timeoutMs);

            this.messageHandlers.set(message.correlationId, (responseMessage) => {
                clearTimeout(timeout);
                this.messageHandlers.delete(message.correlationId);
                resolve(responseMessage);
            });

            this.sendMessage(message);
        });
    }

    /**
     * Handles an incoming message
     * @param message The received message
     */
    private handleMessage(message: Message): void {
        // Check if this is a response to a pending request
        if (message.correlationId && this.messageHandlers.has(message.correlationId)) {
            const handler = this.messageHandlers.get(message.correlationId);
            if (handler) {
                handler(message);
                return;
            }
        }

        // Otherwise, handle based on the message type
        if (message.deviceModemConnected) {
            console.log('Modem connected:', message.deviceModemConnected.status);
        } else if (message.deviceRtspConnected) {
            console.log('RTSP connected:', message.deviceRtspConnected.status);
        } else if (message.deviceWebrtcPeerConnected) {
            console.log('WebRTC peer connected');
        } else if (message.deviceCameraListResponse) {
            console.log('Received camera list with',
                message.deviceCameraListResponse.cameras.length, 'cameras');
        } else if (message.deviceWebrtcError) {
            console.error('WebRTC error:', message.deviceWebrtcError.error);
        } else if (message.error) {
            console.error('Protocol error:', message.error.message);
        } else {
            // Determine the type of message
            const messageType = this.determineMessageType(message);
            console.log('Received message of type:', messageType);
        }
    }

    /**
     * Determine the message type based on which field is set
     * @param message The message to check
     * @returns The type of the message
     */
    private determineMessageType(message: Message): string {
        // Check all possible message fields
        for (const key of Object.keys(message)) {
            // Skip standard fields
            if (['messageId', 'correlationId', 'protocolVersion', 'timestamp'].includes(key)) {
                continue;
            }

            // If the field exists and is not undefined, it's likely the message type
            if (message[key as keyof Message] !== undefined) {
                return key;
            }
        }
        return 'unknown';
    }

    // API Methods

    /**
     * Requests the list of available cameras
     * @returns Promise with the camera list
     */
    async getCameraList(): Promise<Camera[]> {
        const message: Message = {
            messageId: crypto.randomUUID(),
            correlationId: crypto.randomUUID(),
            protocolVersion: "1.0",
            timestamp: Date.now(),
            clientCameraListRequest: {}
        };

        const response = await this.sendWithResponse(message);

        if (response.deviceCameraListResponse) {
            return response.deviceCameraListResponse.cameras;
        } else if (response.error) {
            throw new Error(response.error.message);
        } else if (response.deviceCameraListError) {
            throw new Error(response.deviceCameraListError.error);
        } else {
            throw new Error(`Unexpected response type`);
        }
    }

    /**
     * Adds a new camera
     * @param name Camera name
     * @param rtspUrl RTSP URL
     * @param networkInterface Network interface
     * @returns Promise with the added camera
     */
    async addCamera(name: string, rtspUrl: string, networkInterface: string): Promise<Camera> {
        const message: Message = {
            messageId: crypto.randomUUID(),
            correlationId: crypto.randomUUID(),
            protocolVersion: "1.0",
            timestamp: Date.now(),
            clientCameraAdd: {
                name,
                rtspUrl,
                networkInterface
            }
        };

        const response = await this.sendWithResponse(message);

        if (response.deviceCameraAddSuccess && response.deviceCameraAddSuccess.camera) {
            return response.deviceCameraAddSuccess.camera;
        } else if (response.error) {
            throw new Error(response.error.message);
        } else if (response.deviceCameraAddError) {
            throw new Error(response.deviceCameraAddError.error);
        } else {
            throw new Error(`Unexpected response type`);
        }
    }

    /**
     * Switches to a different camera
     * @param cameraId ID of the camera to switch to
     * @returns Promise that resolves when the camera is switched
     */
    async switchCamera(cameraId: string): Promise<void> {
        const message: Message = {
            messageId: crypto.randomUUID(),
            correlationId: crypto.randomUUID(),
            protocolVersion: "1.0",
            timestamp: Date.now(),
            clientCameraSwitch: {
                cameraId
            }
        };

        const response = await this.sendWithResponse(message);

        if (response.deviceCameraSwitchSuccess) {
            return;
        } else if (response.error) {
            throw new Error(response.error.message);
        } else if (response.deviceCameraSwitchError) {
            throw new Error(response.deviceCameraSwitchError.error);
        } else {
            throw new Error(`Unexpected response type`);
        }
    }

    /**
     * Starts a WebRTC session
     * @returns Promise that resolves when the session is started
     */
    async startWebRtcSession(): Promise<void> {
        const message: Message = {
            messageId: crypto.randomUUID(),
            correlationId: crypto.randomUUID(),
            protocolVersion: "1.0",
            timestamp: Date.now(),
            clientWebrtcSessionStart: {}
        };

        const response = await this.sendWithResponse(message);

        if (response.deviceWebrtcSessionStarted) {
            return;
        } else if (response.error) {
            throw new Error(response.error.message);
        } else {
            throw new Error(`Unexpected response type`);
        }
    }

    /**
     * Gets the device status
     * @returns Promise with the device status
     */
    async getStatus(): Promise<any> {
        const message: Message = {
            messageId: crypto.randomUUID(),
            correlationId: crypto.randomUUID(),
            protocolVersion: "1.0",
            timestamp: Date.now(),
            clientStatusRequest: {}
        };

        const response = await this.sendWithResponse(message);

        if (response.deviceStatusResponse) {
            return response.deviceStatusResponse.status;
        } else if (response.error) {
            throw new Error(response.error.message);
        } else {
            throw new Error(`Unexpected response type`);
        }
    }
}
