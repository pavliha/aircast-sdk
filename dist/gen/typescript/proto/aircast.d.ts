import _m0 from "protobufjs/minimal";
import { Camera, Event, InterfaceInfo, ServiceStatus, SignalQuality } from "./common";
export declare const protobufPackage = "aircast.protocol";
/** Main message wrapper that encapsulates all possible messages */
export interface Message {
    /** Standard message envelope */
    messageId: string;
    /** For response correlation with request */
    correlationId: string;
    /** Version of the protocol (e.g., "1.0") */
    protocolVersion: string;
    /** Unix timestamp in milliseconds */
    timestamp: number;
    /** Device events and responses */
    deviceModemConnected?: DeviceModemConnected | undefined;
    deviceModemInfo?: DeviceModemInfo | undefined;
    deviceModemSignalQuality?: DeviceModemSignalQuality | undefined;
    deviceModemConnectionError?: DeviceModemConnectionError | undefined;
    deviceModemInfoResponse?: DeviceModemInfoResponse | undefined;
    deviceRtspConnected?: DeviceRtspConnected | undefined;
    deviceRtspStreamReady?: DeviceRtspStreamReady | undefined;
    deviceRtspError?: DeviceRtspError | undefined;
    deviceRtspDialError?: DeviceRtspDialError | undefined;
    deviceRtspDescribeError?: DeviceRtspDescribeError | undefined;
    deviceRtspPublishError?: DeviceRtspPublishError | undefined;
    deviceRtspPacketLost?: DeviceRtspPacketLost | undefined;
    deviceRtspDecodeError?: DeviceRtspDecodeError | undefined;
    deviceRtspListenError?: DeviceRtspListenError | undefined;
    deviceRtspClientError?: DeviceRtspClientError | undefined;
    deviceRtspDisconnected?: DeviceRtspDisconnected | undefined;
    deviceRtspConnectFailed?: DeviceRtspConnectFailed | undefined;
    deviceRtspRedialError?: DeviceRtspRedialError | undefined;
    deviceMavlinkConnected?: DeviceMavlinkConnected | undefined;
    deviceMavlinkDialError?: DeviceMavlinkDialError | undefined;
    deviceWebrtcSessionStarted?: DeviceWebrtcSessionStarted | undefined;
    deviceWebrtcOffer?: DeviceWebrtcOffer | undefined;
    deviceWebrtcAnswer?: DeviceWebrtcAnswer | undefined;
    deviceWebrtcIceCandidate?: DeviceWebrtcIceCandidate | undefined;
    deviceWebrtcPeerConnected?: DeviceWebrtcPeerConnected | undefined;
    deviceWebrtcPeerDisconnected?: DeviceWebrtcPeerDisconnected | undefined;
    deviceWebrtcIceConnected?: DeviceWebrtcIceConnected | undefined;
    deviceWebrtcIceDisconnected?: DeviceWebrtcIceDisconnected | undefined;
    deviceWebrtcOfferAck?: DeviceWebrtcOfferAck | undefined;
    deviceWebrtcAnswerAck?: DeviceWebrtcAnswerAck | undefined;
    deviceWebrtcIceCandidateAck?: DeviceWebrtcIceCandidateAck | undefined;
    deviceWebrtcError?: DeviceWebrtcError | undefined;
    deviceWebrtcOfferError?: DeviceWebrtcOfferError | undefined;
    deviceWebrtcSessionStopWarning?: DeviceWebrtcSessionStopWarning | undefined;
    deviceWebrtcPeerConnecting?: DeviceWebrtcPeerConnecting | undefined;
    deviceWebrtcDataChannelOpen?: DeviceWebrtcDataChannelOpen | undefined;
    deviceCameraListResponse?: DeviceCameraListResponse | undefined;
    deviceCameraListError?: DeviceCameraListError | undefined;
    deviceCameraAddSuccess?: DeviceCameraAddSuccess | undefined;
    deviceCameraAddError?: DeviceCameraAddError | undefined;
    deviceCameraUpdateSuccess?: DeviceCameraUpdateSuccess | undefined;
    deviceCameraUpdateError?: DeviceCameraUpdateError | undefined;
    deviceCameraRemoveSuccess?: DeviceCameraRemoveSuccess | undefined;
    deviceCameraRemoveError?: DeviceCameraRemoveError | undefined;
    deviceCameraSwitchSuccess?: DeviceCameraSwitchSuccess | undefined;
    deviceCameraSwitchError?: DeviceCameraSwitchError | undefined;
    deviceCameraSelectedResponse?: DeviceCameraSelectedResponse | undefined;
    deviceCameraSelectedError?: DeviceCameraSelectedError | undefined;
    deviceNetworkInterfacesResponse?: DeviceNetworkInterfacesResponse | undefined;
    deviceStatusResponse?: DeviceStatusResponse | undefined;
    /** API events */
    apiDeviceConnected?: ApiDeviceConnected | undefined;
    apiDeviceDisconnected?: ApiDeviceDisconnected | undefined;
    /** Client requests */
    clientRtspDial?: ClientRtspDial | undefined;
    clientNetworkInterfacesRequest?: ClientNetworkInterfacesRequest | undefined;
    clientCameraListRequest?: ClientCameraListRequest | undefined;
    clientCameraAdd?: ClientCameraAdd | undefined;
    clientCameraUpdate?: ClientCameraUpdate | undefined;
    clientCameraRemove?: ClientCameraRemove | undefined;
    clientCameraSwitch?: ClientCameraSwitch | undefined;
    clientCameraSelectedRequest?: ClientCameraSelectedRequest | undefined;
    clientWebrtcSessionStart?: ClientWebrtcSessionStart | undefined;
    clientWebrtcOffer?: ClientWebrtcOffer | undefined;
    clientWebrtcAnswer?: ClientWebrtcAnswer | undefined;
    clientWebrtcIceCandidate?: ClientWebrtcIceCandidate | undefined;
    clientDeviceReboot?: ClientDeviceReboot | undefined;
    clientStatusRequest?: ClientStatusRequest | undefined;
    clientModemInfoRequest?: ClientModemInfoRequest | undefined;
    /** Generic error message */
    error?: Error | undefined;
}
/** Device modem messages */
export interface DeviceModemConnected {
    status: string;
}
export interface DeviceModemInfo {
    event: Event | undefined;
    signalQuality: SignalQuality | undefined;
}
export interface DeviceModemSignalQuality {
    event: Event | undefined;
    signalQuality: SignalQuality | undefined;
}
export interface DeviceModemConnectionError {
    error: string;
}
export interface DeviceModemInfoResponse {
    status: string;
    model: string;
    manufacturer: string;
    imei: string;
    signalQuality: SignalQuality | undefined;
}
/** Device RTSP messages */
export interface DeviceRtspConnected {
    status: string;
}
export interface DeviceRtspStreamReady {
    status: string;
}
export interface DeviceRtspError {
    error: string;
}
export interface DeviceRtspDialError {
    error: string;
}
export interface DeviceRtspDescribeError {
    error: string;
}
export interface DeviceRtspPublishError {
    error: string;
}
export interface DeviceRtspPacketLost {
    details: string;
}
export interface DeviceRtspDecodeError {
    error: string;
}
export interface DeviceRtspListenError {
    error: string;
}
export interface DeviceRtspClientError {
    error: string;
}
export interface DeviceRtspDisconnected {
    reason: string;
}
export interface DeviceRtspConnectFailed {
    error: string;
}
export interface DeviceRtspRedialError {
    error: string;
}
/** Device Mavlink messages */
export interface DeviceMavlinkConnected {
    status: string;
}
export interface DeviceMavlinkDialError {
    error: string;
}
/** Device WebRTC messages */
export interface DeviceWebrtcSessionStarted {
}
export interface DeviceWebrtcOffer {
    sdp: string;
}
export interface DeviceWebrtcAnswer {
    sdp: string;
}
export interface DeviceWebrtcIceCandidate {
    candidate: string;
    sdpMid: string;
    sdpMLineIndex: number;
    usernameFragment: string;
}
/** Empty message, just an acknowledgment */
export interface DeviceWebrtcPeerConnected {
}
export interface DeviceWebrtcPeerDisconnected {
    reason: string;
}
/** Empty message, just an acknowledgment */
export interface DeviceWebrtcIceConnected {
}
export interface DeviceWebrtcIceDisconnected {
    reason: string;
}
/** Empty message, just an acknowledgment */
export interface DeviceWebrtcOfferAck {
}
/** Empty message, just an acknowledgment */
export interface DeviceWebrtcAnswerAck {
}
/** Empty message, just an acknowledgment */
export interface DeviceWebrtcIceCandidateAck {
}
export interface DeviceWebrtcError {
    error: string;
}
export interface DeviceWebrtcOfferError {
    error: string;
}
export interface DeviceWebrtcSessionStopWarning {
    reason: string;
}
export interface DeviceWebrtcPeerConnecting {
    status: string;
}
export interface DeviceWebrtcDataChannelOpen {
    channelId: string;
}
/** Device Camera messages */
export interface DeviceCameraListResponse {
    cameras: Camera[];
}
export interface DeviceCameraListError {
    error: string;
}
export interface DeviceCameraAddSuccess {
    camera: Camera | undefined;
}
export interface DeviceCameraAddError {
    error: string;
}
export interface DeviceCameraUpdateSuccess {
    camera: Camera | undefined;
}
export interface DeviceCameraUpdateError {
    error: string;
}
export interface DeviceCameraRemoveSuccess {
    cameraId: string;
}
export interface DeviceCameraRemoveError {
    error: string;
}
export interface DeviceCameraSwitchSuccess {
    cameraId: string;
}
export interface DeviceCameraSwitchError {
    error: string;
}
export interface DeviceCameraSelectedResponse {
    camera: Camera | undefined;
}
export interface DeviceCameraSelectedError {
    error: string;
}
/** Device other responses */
export interface DeviceNetworkInterfacesResponse {
    interfaces: InterfaceInfo[];
}
export interface DeviceStatusResponse {
    status: ServiceStatus | undefined;
}
/** API messages */
export interface ApiDeviceConnected {
    deviceId: string;
}
export interface ApiDeviceDisconnected {
    deviceId: string;
    reason: string;
}
/** Client requests */
export interface ClientRtspDial {
    url: string;
}
/** Empty message, just a request */
export interface ClientNetworkInterfacesRequest {
}
/** Empty message, just a request */
export interface ClientCameraListRequest {
}
export interface ClientCameraAdd {
    name: string;
    rtspUrl: string;
    networkInterface: string;
}
export interface ClientCameraUpdate {
    camera: Camera | undefined;
}
export interface ClientCameraRemove {
    cameraId: string;
}
export interface ClientCameraSwitch {
    cameraId: string;
}
/** Empty message, just a request */
export interface ClientCameraSelectedRequest {
}
/** Empty message, just a request */
export interface ClientWebrtcSessionStart {
}
export interface ClientWebrtcOffer {
    sdp: string;
}
export interface ClientWebrtcAnswer {
    sdp: string;
}
export interface ClientWebrtcIceCandidate {
    candidate: string;
    sdpMid: string;
    sdpMLineIndex: number;
    usernameFragment: string;
}
/** Empty message, just a request */
export interface ClientDeviceReboot {
}
/** Empty message, just a request */
export interface ClientStatusRequest {
}
/** Empty message, just a request */
export interface ClientModemInfoRequest {
}
/** Generic error */
export interface Error {
    code: number;
    message: string;
    details: {
        [key: string]: string;
    };
}
export interface Error_DetailsEntry {
    key: string;
    value: string;
}
export declare const Message: {
    encode(message: Message, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Message;
    fromJSON(object: any): Message;
    toJSON(message: Message): unknown;
    create<I extends Exact<DeepPartial<Message>, I>>(base?: I): Message;
    fromPartial<I extends Exact<DeepPartial<Message>, I>>(object: I): Message;
};
export declare const DeviceModemConnected: {
    encode(message: DeviceModemConnected, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceModemConnected;
    fromJSON(object: any): DeviceModemConnected;
    toJSON(message: DeviceModemConnected): unknown;
    create<I extends Exact<DeepPartial<DeviceModemConnected>, I>>(base?: I): DeviceModemConnected;
    fromPartial<I extends Exact<DeepPartial<DeviceModemConnected>, I>>(object: I): DeviceModemConnected;
};
export declare const DeviceModemInfo: {
    encode(message: DeviceModemInfo, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceModemInfo;
    fromJSON(object: any): DeviceModemInfo;
    toJSON(message: DeviceModemInfo): unknown;
    create<I extends Exact<DeepPartial<DeviceModemInfo>, I>>(base?: I): DeviceModemInfo;
    fromPartial<I extends Exact<DeepPartial<DeviceModemInfo>, I>>(object: I): DeviceModemInfo;
};
export declare const DeviceModemSignalQuality: {
    encode(message: DeviceModemSignalQuality, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceModemSignalQuality;
    fromJSON(object: any): DeviceModemSignalQuality;
    toJSON(message: DeviceModemSignalQuality): unknown;
    create<I extends Exact<DeepPartial<DeviceModemSignalQuality>, I>>(base?: I): DeviceModemSignalQuality;
    fromPartial<I extends Exact<DeepPartial<DeviceModemSignalQuality>, I>>(object: I): DeviceModemSignalQuality;
};
export declare const DeviceModemConnectionError: {
    encode(message: DeviceModemConnectionError, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceModemConnectionError;
    fromJSON(object: any): DeviceModemConnectionError;
    toJSON(message: DeviceModemConnectionError): unknown;
    create<I extends Exact<DeepPartial<DeviceModemConnectionError>, I>>(base?: I): DeviceModemConnectionError;
    fromPartial<I extends Exact<DeepPartial<DeviceModemConnectionError>, I>>(object: I): DeviceModemConnectionError;
};
export declare const DeviceModemInfoResponse: {
    encode(message: DeviceModemInfoResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceModemInfoResponse;
    fromJSON(object: any): DeviceModemInfoResponse;
    toJSON(message: DeviceModemInfoResponse): unknown;
    create<I extends Exact<DeepPartial<DeviceModemInfoResponse>, I>>(base?: I): DeviceModemInfoResponse;
    fromPartial<I extends Exact<DeepPartial<DeviceModemInfoResponse>, I>>(object: I): DeviceModemInfoResponse;
};
export declare const DeviceRtspConnected: {
    encode(message: DeviceRtspConnected, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceRtspConnected;
    fromJSON(object: any): DeviceRtspConnected;
    toJSON(message: DeviceRtspConnected): unknown;
    create<I extends Exact<DeepPartial<DeviceRtspConnected>, I>>(base?: I): DeviceRtspConnected;
    fromPartial<I extends Exact<DeepPartial<DeviceRtspConnected>, I>>(object: I): DeviceRtspConnected;
};
export declare const DeviceRtspStreamReady: {
    encode(message: DeviceRtspStreamReady, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceRtspStreamReady;
    fromJSON(object: any): DeviceRtspStreamReady;
    toJSON(message: DeviceRtspStreamReady): unknown;
    create<I extends Exact<DeepPartial<DeviceRtspStreamReady>, I>>(base?: I): DeviceRtspStreamReady;
    fromPartial<I extends Exact<DeepPartial<DeviceRtspStreamReady>, I>>(object: I): DeviceRtspStreamReady;
};
export declare const DeviceRtspError: {
    encode(message: DeviceRtspError, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceRtspError;
    fromJSON(object: any): DeviceRtspError;
    toJSON(message: DeviceRtspError): unknown;
    create<I extends Exact<DeepPartial<DeviceRtspError>, I>>(base?: I): DeviceRtspError;
    fromPartial<I extends Exact<DeepPartial<DeviceRtspError>, I>>(object: I): DeviceRtspError;
};
export declare const DeviceRtspDialError: {
    encode(message: DeviceRtspDialError, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceRtspDialError;
    fromJSON(object: any): DeviceRtspDialError;
    toJSON(message: DeviceRtspDialError): unknown;
    create<I extends Exact<DeepPartial<DeviceRtspDialError>, I>>(base?: I): DeviceRtspDialError;
    fromPartial<I extends Exact<DeepPartial<DeviceRtspDialError>, I>>(object: I): DeviceRtspDialError;
};
export declare const DeviceRtspDescribeError: {
    encode(message: DeviceRtspDescribeError, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceRtspDescribeError;
    fromJSON(object: any): DeviceRtspDescribeError;
    toJSON(message: DeviceRtspDescribeError): unknown;
    create<I extends Exact<DeepPartial<DeviceRtspDescribeError>, I>>(base?: I): DeviceRtspDescribeError;
    fromPartial<I extends Exact<DeepPartial<DeviceRtspDescribeError>, I>>(object: I): DeviceRtspDescribeError;
};
export declare const DeviceRtspPublishError: {
    encode(message: DeviceRtspPublishError, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceRtspPublishError;
    fromJSON(object: any): DeviceRtspPublishError;
    toJSON(message: DeviceRtspPublishError): unknown;
    create<I extends Exact<DeepPartial<DeviceRtspPublishError>, I>>(base?: I): DeviceRtspPublishError;
    fromPartial<I extends Exact<DeepPartial<DeviceRtspPublishError>, I>>(object: I): DeviceRtspPublishError;
};
export declare const DeviceRtspPacketLost: {
    encode(message: DeviceRtspPacketLost, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceRtspPacketLost;
    fromJSON(object: any): DeviceRtspPacketLost;
    toJSON(message: DeviceRtspPacketLost): unknown;
    create<I extends Exact<DeepPartial<DeviceRtspPacketLost>, I>>(base?: I): DeviceRtspPacketLost;
    fromPartial<I extends Exact<DeepPartial<DeviceRtspPacketLost>, I>>(object: I): DeviceRtspPacketLost;
};
export declare const DeviceRtspDecodeError: {
    encode(message: DeviceRtspDecodeError, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceRtspDecodeError;
    fromJSON(object: any): DeviceRtspDecodeError;
    toJSON(message: DeviceRtspDecodeError): unknown;
    create<I extends Exact<DeepPartial<DeviceRtspDecodeError>, I>>(base?: I): DeviceRtspDecodeError;
    fromPartial<I extends Exact<DeepPartial<DeviceRtspDecodeError>, I>>(object: I): DeviceRtspDecodeError;
};
export declare const DeviceRtspListenError: {
    encode(message: DeviceRtspListenError, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceRtspListenError;
    fromJSON(object: any): DeviceRtspListenError;
    toJSON(message: DeviceRtspListenError): unknown;
    create<I extends Exact<DeepPartial<DeviceRtspListenError>, I>>(base?: I): DeviceRtspListenError;
    fromPartial<I extends Exact<DeepPartial<DeviceRtspListenError>, I>>(object: I): DeviceRtspListenError;
};
export declare const DeviceRtspClientError: {
    encode(message: DeviceRtspClientError, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceRtspClientError;
    fromJSON(object: any): DeviceRtspClientError;
    toJSON(message: DeviceRtspClientError): unknown;
    create<I extends Exact<DeepPartial<DeviceRtspClientError>, I>>(base?: I): DeviceRtspClientError;
    fromPartial<I extends Exact<DeepPartial<DeviceRtspClientError>, I>>(object: I): DeviceRtspClientError;
};
export declare const DeviceRtspDisconnected: {
    encode(message: DeviceRtspDisconnected, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceRtspDisconnected;
    fromJSON(object: any): DeviceRtspDisconnected;
    toJSON(message: DeviceRtspDisconnected): unknown;
    create<I extends Exact<DeepPartial<DeviceRtspDisconnected>, I>>(base?: I): DeviceRtspDisconnected;
    fromPartial<I extends Exact<DeepPartial<DeviceRtspDisconnected>, I>>(object: I): DeviceRtspDisconnected;
};
export declare const DeviceRtspConnectFailed: {
    encode(message: DeviceRtspConnectFailed, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceRtspConnectFailed;
    fromJSON(object: any): DeviceRtspConnectFailed;
    toJSON(message: DeviceRtspConnectFailed): unknown;
    create<I extends Exact<DeepPartial<DeviceRtspConnectFailed>, I>>(base?: I): DeviceRtspConnectFailed;
    fromPartial<I extends Exact<DeepPartial<DeviceRtspConnectFailed>, I>>(object: I): DeviceRtspConnectFailed;
};
export declare const DeviceRtspRedialError: {
    encode(message: DeviceRtspRedialError, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceRtspRedialError;
    fromJSON(object: any): DeviceRtspRedialError;
    toJSON(message: DeviceRtspRedialError): unknown;
    create<I extends Exact<DeepPartial<DeviceRtspRedialError>, I>>(base?: I): DeviceRtspRedialError;
    fromPartial<I extends Exact<DeepPartial<DeviceRtspRedialError>, I>>(object: I): DeviceRtspRedialError;
};
export declare const DeviceMavlinkConnected: {
    encode(message: DeviceMavlinkConnected, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceMavlinkConnected;
    fromJSON(object: any): DeviceMavlinkConnected;
    toJSON(message: DeviceMavlinkConnected): unknown;
    create<I extends Exact<DeepPartial<DeviceMavlinkConnected>, I>>(base?: I): DeviceMavlinkConnected;
    fromPartial<I extends Exact<DeepPartial<DeviceMavlinkConnected>, I>>(object: I): DeviceMavlinkConnected;
};
export declare const DeviceMavlinkDialError: {
    encode(message: DeviceMavlinkDialError, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceMavlinkDialError;
    fromJSON(object: any): DeviceMavlinkDialError;
    toJSON(message: DeviceMavlinkDialError): unknown;
    create<I extends Exact<DeepPartial<DeviceMavlinkDialError>, I>>(base?: I): DeviceMavlinkDialError;
    fromPartial<I extends Exact<DeepPartial<DeviceMavlinkDialError>, I>>(object: I): DeviceMavlinkDialError;
};
export declare const DeviceWebrtcSessionStarted: {
    encode(_: DeviceWebrtcSessionStarted, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceWebrtcSessionStarted;
    fromJSON(_: any): DeviceWebrtcSessionStarted;
    toJSON(_: DeviceWebrtcSessionStarted): unknown;
    create<I extends Exact<DeepPartial<DeviceWebrtcSessionStarted>, I>>(base?: I): DeviceWebrtcSessionStarted;
    fromPartial<I extends Exact<DeepPartial<DeviceWebrtcSessionStarted>, I>>(_: I): DeviceWebrtcSessionStarted;
};
export declare const DeviceWebrtcOffer: {
    encode(message: DeviceWebrtcOffer, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceWebrtcOffer;
    fromJSON(object: any): DeviceWebrtcOffer;
    toJSON(message: DeviceWebrtcOffer): unknown;
    create<I extends Exact<DeepPartial<DeviceWebrtcOffer>, I>>(base?: I): DeviceWebrtcOffer;
    fromPartial<I extends Exact<DeepPartial<DeviceWebrtcOffer>, I>>(object: I): DeviceWebrtcOffer;
};
export declare const DeviceWebrtcAnswer: {
    encode(message: DeviceWebrtcAnswer, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceWebrtcAnswer;
    fromJSON(object: any): DeviceWebrtcAnswer;
    toJSON(message: DeviceWebrtcAnswer): unknown;
    create<I extends Exact<DeepPartial<DeviceWebrtcAnswer>, I>>(base?: I): DeviceWebrtcAnswer;
    fromPartial<I extends Exact<DeepPartial<DeviceWebrtcAnswer>, I>>(object: I): DeviceWebrtcAnswer;
};
export declare const DeviceWebrtcIceCandidate: {
    encode(message: DeviceWebrtcIceCandidate, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceWebrtcIceCandidate;
    fromJSON(object: any): DeviceWebrtcIceCandidate;
    toJSON(message: DeviceWebrtcIceCandidate): unknown;
    create<I extends Exact<DeepPartial<DeviceWebrtcIceCandidate>, I>>(base?: I): DeviceWebrtcIceCandidate;
    fromPartial<I extends Exact<DeepPartial<DeviceWebrtcIceCandidate>, I>>(object: I): DeviceWebrtcIceCandidate;
};
export declare const DeviceWebrtcPeerConnected: {
    encode(_: DeviceWebrtcPeerConnected, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceWebrtcPeerConnected;
    fromJSON(_: any): DeviceWebrtcPeerConnected;
    toJSON(_: DeviceWebrtcPeerConnected): unknown;
    create<I extends Exact<DeepPartial<DeviceWebrtcPeerConnected>, I>>(base?: I): DeviceWebrtcPeerConnected;
    fromPartial<I extends Exact<DeepPartial<DeviceWebrtcPeerConnected>, I>>(_: I): DeviceWebrtcPeerConnected;
};
export declare const DeviceWebrtcPeerDisconnected: {
    encode(message: DeviceWebrtcPeerDisconnected, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceWebrtcPeerDisconnected;
    fromJSON(object: any): DeviceWebrtcPeerDisconnected;
    toJSON(message: DeviceWebrtcPeerDisconnected): unknown;
    create<I extends Exact<DeepPartial<DeviceWebrtcPeerDisconnected>, I>>(base?: I): DeviceWebrtcPeerDisconnected;
    fromPartial<I extends Exact<DeepPartial<DeviceWebrtcPeerDisconnected>, I>>(object: I): DeviceWebrtcPeerDisconnected;
};
export declare const DeviceWebrtcIceConnected: {
    encode(_: DeviceWebrtcIceConnected, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceWebrtcIceConnected;
    fromJSON(_: any): DeviceWebrtcIceConnected;
    toJSON(_: DeviceWebrtcIceConnected): unknown;
    create<I extends Exact<DeepPartial<DeviceWebrtcIceConnected>, I>>(base?: I): DeviceWebrtcIceConnected;
    fromPartial<I extends Exact<DeepPartial<DeviceWebrtcIceConnected>, I>>(_: I): DeviceWebrtcIceConnected;
};
export declare const DeviceWebrtcIceDisconnected: {
    encode(message: DeviceWebrtcIceDisconnected, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceWebrtcIceDisconnected;
    fromJSON(object: any): DeviceWebrtcIceDisconnected;
    toJSON(message: DeviceWebrtcIceDisconnected): unknown;
    create<I extends Exact<DeepPartial<DeviceWebrtcIceDisconnected>, I>>(base?: I): DeviceWebrtcIceDisconnected;
    fromPartial<I extends Exact<DeepPartial<DeviceWebrtcIceDisconnected>, I>>(object: I): DeviceWebrtcIceDisconnected;
};
export declare const DeviceWebrtcOfferAck: {
    encode(_: DeviceWebrtcOfferAck, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceWebrtcOfferAck;
    fromJSON(_: any): DeviceWebrtcOfferAck;
    toJSON(_: DeviceWebrtcOfferAck): unknown;
    create<I extends Exact<DeepPartial<DeviceWebrtcOfferAck>, I>>(base?: I): DeviceWebrtcOfferAck;
    fromPartial<I extends Exact<DeepPartial<DeviceWebrtcOfferAck>, I>>(_: I): DeviceWebrtcOfferAck;
};
export declare const DeviceWebrtcAnswerAck: {
    encode(_: DeviceWebrtcAnswerAck, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceWebrtcAnswerAck;
    fromJSON(_: any): DeviceWebrtcAnswerAck;
    toJSON(_: DeviceWebrtcAnswerAck): unknown;
    create<I extends Exact<DeepPartial<DeviceWebrtcAnswerAck>, I>>(base?: I): DeviceWebrtcAnswerAck;
    fromPartial<I extends Exact<DeepPartial<DeviceWebrtcAnswerAck>, I>>(_: I): DeviceWebrtcAnswerAck;
};
export declare const DeviceWebrtcIceCandidateAck: {
    encode(_: DeviceWebrtcIceCandidateAck, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceWebrtcIceCandidateAck;
    fromJSON(_: any): DeviceWebrtcIceCandidateAck;
    toJSON(_: DeviceWebrtcIceCandidateAck): unknown;
    create<I extends Exact<DeepPartial<DeviceWebrtcIceCandidateAck>, I>>(base?: I): DeviceWebrtcIceCandidateAck;
    fromPartial<I extends Exact<DeepPartial<DeviceWebrtcIceCandidateAck>, I>>(_: I): DeviceWebrtcIceCandidateAck;
};
export declare const DeviceWebrtcError: {
    encode(message: DeviceWebrtcError, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceWebrtcError;
    fromJSON(object: any): DeviceWebrtcError;
    toJSON(message: DeviceWebrtcError): unknown;
    create<I extends Exact<DeepPartial<DeviceWebrtcError>, I>>(base?: I): DeviceWebrtcError;
    fromPartial<I extends Exact<DeepPartial<DeviceWebrtcError>, I>>(object: I): DeviceWebrtcError;
};
export declare const DeviceWebrtcOfferError: {
    encode(message: DeviceWebrtcOfferError, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceWebrtcOfferError;
    fromJSON(object: any): DeviceWebrtcOfferError;
    toJSON(message: DeviceWebrtcOfferError): unknown;
    create<I extends Exact<DeepPartial<DeviceWebrtcOfferError>, I>>(base?: I): DeviceWebrtcOfferError;
    fromPartial<I extends Exact<DeepPartial<DeviceWebrtcOfferError>, I>>(object: I): DeviceWebrtcOfferError;
};
export declare const DeviceWebrtcSessionStopWarning: {
    encode(message: DeviceWebrtcSessionStopWarning, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceWebrtcSessionStopWarning;
    fromJSON(object: any): DeviceWebrtcSessionStopWarning;
    toJSON(message: DeviceWebrtcSessionStopWarning): unknown;
    create<I extends Exact<DeepPartial<DeviceWebrtcSessionStopWarning>, I>>(base?: I): DeviceWebrtcSessionStopWarning;
    fromPartial<I extends Exact<DeepPartial<DeviceWebrtcSessionStopWarning>, I>>(object: I): DeviceWebrtcSessionStopWarning;
};
export declare const DeviceWebrtcPeerConnecting: {
    encode(message: DeviceWebrtcPeerConnecting, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceWebrtcPeerConnecting;
    fromJSON(object: any): DeviceWebrtcPeerConnecting;
    toJSON(message: DeviceWebrtcPeerConnecting): unknown;
    create<I extends Exact<DeepPartial<DeviceWebrtcPeerConnecting>, I>>(base?: I): DeviceWebrtcPeerConnecting;
    fromPartial<I extends Exact<DeepPartial<DeviceWebrtcPeerConnecting>, I>>(object: I): DeviceWebrtcPeerConnecting;
};
export declare const DeviceWebrtcDataChannelOpen: {
    encode(message: DeviceWebrtcDataChannelOpen, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceWebrtcDataChannelOpen;
    fromJSON(object: any): DeviceWebrtcDataChannelOpen;
    toJSON(message: DeviceWebrtcDataChannelOpen): unknown;
    create<I extends Exact<DeepPartial<DeviceWebrtcDataChannelOpen>, I>>(base?: I): DeviceWebrtcDataChannelOpen;
    fromPartial<I extends Exact<DeepPartial<DeviceWebrtcDataChannelOpen>, I>>(object: I): DeviceWebrtcDataChannelOpen;
};
export declare const DeviceCameraListResponse: {
    encode(message: DeviceCameraListResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceCameraListResponse;
    fromJSON(object: any): DeviceCameraListResponse;
    toJSON(message: DeviceCameraListResponse): unknown;
    create<I extends Exact<DeepPartial<DeviceCameraListResponse>, I>>(base?: I): DeviceCameraListResponse;
    fromPartial<I extends Exact<DeepPartial<DeviceCameraListResponse>, I>>(object: I): DeviceCameraListResponse;
};
export declare const DeviceCameraListError: {
    encode(message: DeviceCameraListError, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceCameraListError;
    fromJSON(object: any): DeviceCameraListError;
    toJSON(message: DeviceCameraListError): unknown;
    create<I extends Exact<DeepPartial<DeviceCameraListError>, I>>(base?: I): DeviceCameraListError;
    fromPartial<I extends Exact<DeepPartial<DeviceCameraListError>, I>>(object: I): DeviceCameraListError;
};
export declare const DeviceCameraAddSuccess: {
    encode(message: DeviceCameraAddSuccess, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceCameraAddSuccess;
    fromJSON(object: any): DeviceCameraAddSuccess;
    toJSON(message: DeviceCameraAddSuccess): unknown;
    create<I extends Exact<DeepPartial<DeviceCameraAddSuccess>, I>>(base?: I): DeviceCameraAddSuccess;
    fromPartial<I extends Exact<DeepPartial<DeviceCameraAddSuccess>, I>>(object: I): DeviceCameraAddSuccess;
};
export declare const DeviceCameraAddError: {
    encode(message: DeviceCameraAddError, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceCameraAddError;
    fromJSON(object: any): DeviceCameraAddError;
    toJSON(message: DeviceCameraAddError): unknown;
    create<I extends Exact<DeepPartial<DeviceCameraAddError>, I>>(base?: I): DeviceCameraAddError;
    fromPartial<I extends Exact<DeepPartial<DeviceCameraAddError>, I>>(object: I): DeviceCameraAddError;
};
export declare const DeviceCameraUpdateSuccess: {
    encode(message: DeviceCameraUpdateSuccess, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceCameraUpdateSuccess;
    fromJSON(object: any): DeviceCameraUpdateSuccess;
    toJSON(message: DeviceCameraUpdateSuccess): unknown;
    create<I extends Exact<DeepPartial<DeviceCameraUpdateSuccess>, I>>(base?: I): DeviceCameraUpdateSuccess;
    fromPartial<I extends Exact<DeepPartial<DeviceCameraUpdateSuccess>, I>>(object: I): DeviceCameraUpdateSuccess;
};
export declare const DeviceCameraUpdateError: {
    encode(message: DeviceCameraUpdateError, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceCameraUpdateError;
    fromJSON(object: any): DeviceCameraUpdateError;
    toJSON(message: DeviceCameraUpdateError): unknown;
    create<I extends Exact<DeepPartial<DeviceCameraUpdateError>, I>>(base?: I): DeviceCameraUpdateError;
    fromPartial<I extends Exact<DeepPartial<DeviceCameraUpdateError>, I>>(object: I): DeviceCameraUpdateError;
};
export declare const DeviceCameraRemoveSuccess: {
    encode(message: DeviceCameraRemoveSuccess, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceCameraRemoveSuccess;
    fromJSON(object: any): DeviceCameraRemoveSuccess;
    toJSON(message: DeviceCameraRemoveSuccess): unknown;
    create<I extends Exact<DeepPartial<DeviceCameraRemoveSuccess>, I>>(base?: I): DeviceCameraRemoveSuccess;
    fromPartial<I extends Exact<DeepPartial<DeviceCameraRemoveSuccess>, I>>(object: I): DeviceCameraRemoveSuccess;
};
export declare const DeviceCameraRemoveError: {
    encode(message: DeviceCameraRemoveError, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceCameraRemoveError;
    fromJSON(object: any): DeviceCameraRemoveError;
    toJSON(message: DeviceCameraRemoveError): unknown;
    create<I extends Exact<DeepPartial<DeviceCameraRemoveError>, I>>(base?: I): DeviceCameraRemoveError;
    fromPartial<I extends Exact<DeepPartial<DeviceCameraRemoveError>, I>>(object: I): DeviceCameraRemoveError;
};
export declare const DeviceCameraSwitchSuccess: {
    encode(message: DeviceCameraSwitchSuccess, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceCameraSwitchSuccess;
    fromJSON(object: any): DeviceCameraSwitchSuccess;
    toJSON(message: DeviceCameraSwitchSuccess): unknown;
    create<I extends Exact<DeepPartial<DeviceCameraSwitchSuccess>, I>>(base?: I): DeviceCameraSwitchSuccess;
    fromPartial<I extends Exact<DeepPartial<DeviceCameraSwitchSuccess>, I>>(object: I): DeviceCameraSwitchSuccess;
};
export declare const DeviceCameraSwitchError: {
    encode(message: DeviceCameraSwitchError, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceCameraSwitchError;
    fromJSON(object: any): DeviceCameraSwitchError;
    toJSON(message: DeviceCameraSwitchError): unknown;
    create<I extends Exact<DeepPartial<DeviceCameraSwitchError>, I>>(base?: I): DeviceCameraSwitchError;
    fromPartial<I extends Exact<DeepPartial<DeviceCameraSwitchError>, I>>(object: I): DeviceCameraSwitchError;
};
export declare const DeviceCameraSelectedResponse: {
    encode(message: DeviceCameraSelectedResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceCameraSelectedResponse;
    fromJSON(object: any): DeviceCameraSelectedResponse;
    toJSON(message: DeviceCameraSelectedResponse): unknown;
    create<I extends Exact<DeepPartial<DeviceCameraSelectedResponse>, I>>(base?: I): DeviceCameraSelectedResponse;
    fromPartial<I extends Exact<DeepPartial<DeviceCameraSelectedResponse>, I>>(object: I): DeviceCameraSelectedResponse;
};
export declare const DeviceCameraSelectedError: {
    encode(message: DeviceCameraSelectedError, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceCameraSelectedError;
    fromJSON(object: any): DeviceCameraSelectedError;
    toJSON(message: DeviceCameraSelectedError): unknown;
    create<I extends Exact<DeepPartial<DeviceCameraSelectedError>, I>>(base?: I): DeviceCameraSelectedError;
    fromPartial<I extends Exact<DeepPartial<DeviceCameraSelectedError>, I>>(object: I): DeviceCameraSelectedError;
};
export declare const DeviceNetworkInterfacesResponse: {
    encode(message: DeviceNetworkInterfacesResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceNetworkInterfacesResponse;
    fromJSON(object: any): DeviceNetworkInterfacesResponse;
    toJSON(message: DeviceNetworkInterfacesResponse): unknown;
    create<I extends Exact<DeepPartial<DeviceNetworkInterfacesResponse>, I>>(base?: I): DeviceNetworkInterfacesResponse;
    fromPartial<I extends Exact<DeepPartial<DeviceNetworkInterfacesResponse>, I>>(object: I): DeviceNetworkInterfacesResponse;
};
export declare const DeviceStatusResponse: {
    encode(message: DeviceStatusResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceStatusResponse;
    fromJSON(object: any): DeviceStatusResponse;
    toJSON(message: DeviceStatusResponse): unknown;
    create<I extends Exact<DeepPartial<DeviceStatusResponse>, I>>(base?: I): DeviceStatusResponse;
    fromPartial<I extends Exact<DeepPartial<DeviceStatusResponse>, I>>(object: I): DeviceStatusResponse;
};
export declare const ApiDeviceConnected: {
    encode(message: ApiDeviceConnected, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ApiDeviceConnected;
    fromJSON(object: any): ApiDeviceConnected;
    toJSON(message: ApiDeviceConnected): unknown;
    create<I extends Exact<DeepPartial<ApiDeviceConnected>, I>>(base?: I): ApiDeviceConnected;
    fromPartial<I extends Exact<DeepPartial<ApiDeviceConnected>, I>>(object: I): ApiDeviceConnected;
};
export declare const ApiDeviceDisconnected: {
    encode(message: ApiDeviceDisconnected, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ApiDeviceDisconnected;
    fromJSON(object: any): ApiDeviceDisconnected;
    toJSON(message: ApiDeviceDisconnected): unknown;
    create<I extends Exact<DeepPartial<ApiDeviceDisconnected>, I>>(base?: I): ApiDeviceDisconnected;
    fromPartial<I extends Exact<DeepPartial<ApiDeviceDisconnected>, I>>(object: I): ApiDeviceDisconnected;
};
export declare const ClientRtspDial: {
    encode(message: ClientRtspDial, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClientRtspDial;
    fromJSON(object: any): ClientRtspDial;
    toJSON(message: ClientRtspDial): unknown;
    create<I extends Exact<DeepPartial<ClientRtspDial>, I>>(base?: I): ClientRtspDial;
    fromPartial<I extends Exact<DeepPartial<ClientRtspDial>, I>>(object: I): ClientRtspDial;
};
export declare const ClientNetworkInterfacesRequest: {
    encode(_: ClientNetworkInterfacesRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClientNetworkInterfacesRequest;
    fromJSON(_: any): ClientNetworkInterfacesRequest;
    toJSON(_: ClientNetworkInterfacesRequest): unknown;
    create<I extends Exact<DeepPartial<ClientNetworkInterfacesRequest>, I>>(base?: I): ClientNetworkInterfacesRequest;
    fromPartial<I extends Exact<DeepPartial<ClientNetworkInterfacesRequest>, I>>(_: I): ClientNetworkInterfacesRequest;
};
export declare const ClientCameraListRequest: {
    encode(_: ClientCameraListRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClientCameraListRequest;
    fromJSON(_: any): ClientCameraListRequest;
    toJSON(_: ClientCameraListRequest): unknown;
    create<I extends Exact<DeepPartial<ClientCameraListRequest>, I>>(base?: I): ClientCameraListRequest;
    fromPartial<I extends Exact<DeepPartial<ClientCameraListRequest>, I>>(_: I): ClientCameraListRequest;
};
export declare const ClientCameraAdd: {
    encode(message: ClientCameraAdd, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClientCameraAdd;
    fromJSON(object: any): ClientCameraAdd;
    toJSON(message: ClientCameraAdd): unknown;
    create<I extends Exact<DeepPartial<ClientCameraAdd>, I>>(base?: I): ClientCameraAdd;
    fromPartial<I extends Exact<DeepPartial<ClientCameraAdd>, I>>(object: I): ClientCameraAdd;
};
export declare const ClientCameraUpdate: {
    encode(message: ClientCameraUpdate, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClientCameraUpdate;
    fromJSON(object: any): ClientCameraUpdate;
    toJSON(message: ClientCameraUpdate): unknown;
    create<I extends Exact<DeepPartial<ClientCameraUpdate>, I>>(base?: I): ClientCameraUpdate;
    fromPartial<I extends Exact<DeepPartial<ClientCameraUpdate>, I>>(object: I): ClientCameraUpdate;
};
export declare const ClientCameraRemove: {
    encode(message: ClientCameraRemove, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClientCameraRemove;
    fromJSON(object: any): ClientCameraRemove;
    toJSON(message: ClientCameraRemove): unknown;
    create<I extends Exact<DeepPartial<ClientCameraRemove>, I>>(base?: I): ClientCameraRemove;
    fromPartial<I extends Exact<DeepPartial<ClientCameraRemove>, I>>(object: I): ClientCameraRemove;
};
export declare const ClientCameraSwitch: {
    encode(message: ClientCameraSwitch, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClientCameraSwitch;
    fromJSON(object: any): ClientCameraSwitch;
    toJSON(message: ClientCameraSwitch): unknown;
    create<I extends Exact<DeepPartial<ClientCameraSwitch>, I>>(base?: I): ClientCameraSwitch;
    fromPartial<I extends Exact<DeepPartial<ClientCameraSwitch>, I>>(object: I): ClientCameraSwitch;
};
export declare const ClientCameraSelectedRequest: {
    encode(_: ClientCameraSelectedRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClientCameraSelectedRequest;
    fromJSON(_: any): ClientCameraSelectedRequest;
    toJSON(_: ClientCameraSelectedRequest): unknown;
    create<I extends Exact<DeepPartial<ClientCameraSelectedRequest>, I>>(base?: I): ClientCameraSelectedRequest;
    fromPartial<I extends Exact<DeepPartial<ClientCameraSelectedRequest>, I>>(_: I): ClientCameraSelectedRequest;
};
export declare const ClientWebrtcSessionStart: {
    encode(_: ClientWebrtcSessionStart, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClientWebrtcSessionStart;
    fromJSON(_: any): ClientWebrtcSessionStart;
    toJSON(_: ClientWebrtcSessionStart): unknown;
    create<I extends Exact<DeepPartial<ClientWebrtcSessionStart>, I>>(base?: I): ClientWebrtcSessionStart;
    fromPartial<I extends Exact<DeepPartial<ClientWebrtcSessionStart>, I>>(_: I): ClientWebrtcSessionStart;
};
export declare const ClientWebrtcOffer: {
    encode(message: ClientWebrtcOffer, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClientWebrtcOffer;
    fromJSON(object: any): ClientWebrtcOffer;
    toJSON(message: ClientWebrtcOffer): unknown;
    create<I extends Exact<DeepPartial<ClientWebrtcOffer>, I>>(base?: I): ClientWebrtcOffer;
    fromPartial<I extends Exact<DeepPartial<ClientWebrtcOffer>, I>>(object: I): ClientWebrtcOffer;
};
export declare const ClientWebrtcAnswer: {
    encode(message: ClientWebrtcAnswer, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClientWebrtcAnswer;
    fromJSON(object: any): ClientWebrtcAnswer;
    toJSON(message: ClientWebrtcAnswer): unknown;
    create<I extends Exact<DeepPartial<ClientWebrtcAnswer>, I>>(base?: I): ClientWebrtcAnswer;
    fromPartial<I extends Exact<DeepPartial<ClientWebrtcAnswer>, I>>(object: I): ClientWebrtcAnswer;
};
export declare const ClientWebrtcIceCandidate: {
    encode(message: ClientWebrtcIceCandidate, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClientWebrtcIceCandidate;
    fromJSON(object: any): ClientWebrtcIceCandidate;
    toJSON(message: ClientWebrtcIceCandidate): unknown;
    create<I extends Exact<DeepPartial<ClientWebrtcIceCandidate>, I>>(base?: I): ClientWebrtcIceCandidate;
    fromPartial<I extends Exact<DeepPartial<ClientWebrtcIceCandidate>, I>>(object: I): ClientWebrtcIceCandidate;
};
export declare const ClientDeviceReboot: {
    encode(_: ClientDeviceReboot, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClientDeviceReboot;
    fromJSON(_: any): ClientDeviceReboot;
    toJSON(_: ClientDeviceReboot): unknown;
    create<I extends Exact<DeepPartial<ClientDeviceReboot>, I>>(base?: I): ClientDeviceReboot;
    fromPartial<I extends Exact<DeepPartial<ClientDeviceReboot>, I>>(_: I): ClientDeviceReboot;
};
export declare const ClientStatusRequest: {
    encode(_: ClientStatusRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClientStatusRequest;
    fromJSON(_: any): ClientStatusRequest;
    toJSON(_: ClientStatusRequest): unknown;
    create<I extends Exact<DeepPartial<ClientStatusRequest>, I>>(base?: I): ClientStatusRequest;
    fromPartial<I extends Exact<DeepPartial<ClientStatusRequest>, I>>(_: I): ClientStatusRequest;
};
export declare const ClientModemInfoRequest: {
    encode(_: ClientModemInfoRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClientModemInfoRequest;
    fromJSON(_: any): ClientModemInfoRequest;
    toJSON(_: ClientModemInfoRequest): unknown;
    create<I extends Exact<DeepPartial<ClientModemInfoRequest>, I>>(base?: I): ClientModemInfoRequest;
    fromPartial<I extends Exact<DeepPartial<ClientModemInfoRequest>, I>>(_: I): ClientModemInfoRequest;
};
export declare const Error: {
    encode(message: Error, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Error;
    fromJSON(object: any): Error;
    toJSON(message: Error): unknown;
    create<I extends Exact<DeepPartial<Error>, I>>(base?: I): Error;
    fromPartial<I extends Exact<DeepPartial<Error>, I>>(object: I): Error;
};
export declare const Error_DetailsEntry: {
    encode(message: Error_DetailsEntry, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Error_DetailsEntry;
    fromJSON(object: any): Error_DetailsEntry;
    toJSON(message: Error_DetailsEntry): unknown;
    create<I extends Exact<DeepPartial<Error_DetailsEntry>, I>>(base?: I): Error_DetailsEntry;
    fromPartial<I extends Exact<DeepPartial<Error_DetailsEntry>, I>>(object: I): Error_DetailsEntry;
};
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin ? T : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P : P & {
    [K in keyof P]: Exact<P[K], I[K]>;
} & {
    [K in Exclude<keyof I, KeysOfUnion<P>>]: never;
};
export {};
