package message

import (
	"errors"
)

type MessageType = string
type MessageAction = string
type MessageSource = string
type RequestID = string
type ChannelID = string
type GenericMessage = any

// MessagePayload is the payload contained in a WebSocket message
type MessagePayload any

// Protocol message types
const (
	TypeRequest  MessageType = "request"
	TypeResponse MessageType = "response"
	TypeError    MessageType = "error"
	TypeEvent    MessageType = "event"
)

// System identifiers
const (
	SystemDevice MessageSource = "device"
	SystemAPI    MessageSource = "api"
)

// Protocol validation errors
var (
	ErrMissingType        = errors.New("missing required 'type' field")
	ErrMissingAction      = errors.New("missing required 'action' field")
	ErrMissingRequestID   = errors.New("missing required 'request_id' field")
	ErrMissingTimestamp   = errors.New("missing required 'timestamp' field")
	ErrInvalidMessageType = errors.New("invalid message type")
	ErrInvalidSystem      = errors.New("invalid system identifier")
)

// ErrDeviceNotFound Custom errors for domain operations
var (
	ErrDeviceNotFound = errors.New("device not found")
)

// RequestMessage represents a client request
type RequestMessage struct {
	Action    MessageAction `json:"action"`
	Payload   any           `json:"payload,omitempty"`
	Source    MessageSource `json:"source"`
	RequestID string        `json:"request_id"`
	ChannelID string        `json:"channel_id,omitempty"`
}

// ResponseMessage represents a server response
type ResponseMessage struct {
	Action    MessageAction `json:"action"`
	Payload   any           `json:"payload,omitempty"`
	Source    MessageSource `json:"source"`
	ChannelID ChannelID     `json:"channel_id,omitempty"`
	ReplyTo   RequestID     `json:"reply_to"`
}

// ErrorResponse represents the error details
type ErrorResponse struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details any    `json:"details,omitempty"`
}

// ErrorMessage represents a server error response
type ErrorMessage struct {
	Action    MessageAction `json:"action"`
	Source    MessageSource `json:"source"`
	ChannelID ChannelID     `json:"channel_id,omitempty"`
	Error     ErrorResponse `json:"error"`
	ReplyTo   RequestID     `json:"reply_to"`
}

// EventMessage represents a server-initiated event
type EventMessage struct {
	Action    MessageAction `json:"action"`
	Payload   any           `json:"payload,omitempty"`
	Source    MessageSource `json:"source"`
	ChannelID ChannelID     `json:"channel_id,omitempty"`
}

// Channel represents a communication channel
type Channel struct {
	ID ChannelID `json:"id"`
}
