import _m0 from "protobufjs/minimal";
export declare const protobufPackage = "aircast.protocol.common";
/** Event represents a generic event with a name, type, and arbitrary payload */
export interface Event {
    name: string;
    type: string;
    /** Can be any serialized data */
    payload: Uint8Array;
}
/** SignalQuality represents cellular signal quality */
export interface SignalQuality {
    /** Signal quality as a percentage or dBm value */
    value: number;
}
/** Camera represents a camera configuration */
export interface Camera {
    id: string;
    name: string;
    rtspUrl: string;
    networkInterface: string;
}
/** InterfaceInfo represents network interface information */
export interface InterfaceInfo {
    name: string;
    mtu: number;
    hardwareAddr: string;
    flags: string;
    addresses: string[];
}
/** ServiceStatus represents the status of various services */
export interface ServiceStatus {
    mavlink: Event | undefined;
    rtsp: Event | undefined;
    modem: Event | undefined;
    webrtc: Event | undefined;
}
export declare const Event: {
    encode(message: Event, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Event;
    fromJSON(object: any): Event;
    toJSON(message: Event): unknown;
    create<I extends Exact<DeepPartial<Event>, I>>(base?: I): Event;
    fromPartial<I extends Exact<DeepPartial<Event>, I>>(object: I): Event;
};
export declare const SignalQuality: {
    encode(message: SignalQuality, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): SignalQuality;
    fromJSON(object: any): SignalQuality;
    toJSON(message: SignalQuality): unknown;
    create<I extends Exact<DeepPartial<SignalQuality>, I>>(base?: I): SignalQuality;
    fromPartial<I extends Exact<DeepPartial<SignalQuality>, I>>(object: I): SignalQuality;
};
export declare const Camera: {
    encode(message: Camera, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Camera;
    fromJSON(object: any): Camera;
    toJSON(message: Camera): unknown;
    create<I extends Exact<DeepPartial<Camera>, I>>(base?: I): Camera;
    fromPartial<I extends Exact<DeepPartial<Camera>, I>>(object: I): Camera;
};
export declare const InterfaceInfo: {
    encode(message: InterfaceInfo, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): InterfaceInfo;
    fromJSON(object: any): InterfaceInfo;
    toJSON(message: InterfaceInfo): unknown;
    create<I extends Exact<DeepPartial<InterfaceInfo>, I>>(base?: I): InterfaceInfo;
    fromPartial<I extends Exact<DeepPartial<InterfaceInfo>, I>>(object: I): InterfaceInfo;
};
export declare const ServiceStatus: {
    encode(message: ServiceStatus, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ServiceStatus;
    fromJSON(object: any): ServiceStatus;
    toJSON(message: ServiceStatus): unknown;
    create<I extends Exact<DeepPartial<ServiceStatus>, I>>(base?: I): ServiceStatus;
    fromPartial<I extends Exact<DeepPartial<ServiceStatus>, I>>(object: I): ServiceStatus;
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
