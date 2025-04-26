package message

import (
	"errors"
)

type MessageType = string
type MessageAction = string
type MessageSource = string
type RequestID = string
type SessionID = string
type GenericMessage = any

// MessagePayload is the payload contained in a WebSocket message
type MessagePayload interface{}

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
	SystemClient MessageSource = "client"
)

// ErrorCode Standard error codes
type ErrorCode = string

const (
	ErrInvalidRequest     ErrorCode = "INVALID_REQUEST"
	ErrInternalError      ErrorCode = "INTERNAL_ERROR"
	ErrServiceUnavailable ErrorCode = "SERVICE_UNAVAILABLE"
	ErrTimeout            ErrorCode = "TIMEOUT"
	ErrUnauthorized       ErrorCode = "UNAUTHORIZED"
	ErrInvalidParameters  ErrorCode = "INVALID_PARAMETERS"
	ErrNotFound           ErrorCode = "NOT_FOUND"
)

// ErrorLevel Error level indicators
type ErrorLevel string

const (
	ErrorLevelInfo    ErrorLevel = "INFO"
	ErrorLevelWarning ErrorLevel = "WARNING"
	ErrorLevelError   ErrorLevel = "ERROR"
	ErrorLevelFatal   ErrorLevel = "FATAL"
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

// Custom errors for domain operations
var (
	ErrDeviceNotFound = errors.New("device not found")
)

// RequestMessage represents a client request
type RequestMessage struct {
	Action    MessageAction `json:"action"`
	Payload   interface{}   `json:"payload,omitempty"`
	Source    MessageSource `json:"source"`
	RequestID string        `json:"request_id"`
	SessionID string        `json:"session_id,omitempty"`
}

// ResponseMessage represents a server response
type ResponseMessage struct {
	Action    MessageAction `json:"action"`
	Payload   interface{}   `json:"payload,omitempty"`
	Source    MessageSource `json:"source"`
	SessionID SessionID     `json:"session_id,omitempty"`
	ReplyTo   RequestID     `json:"reply_to"`
}

// ErrorResponse represents the error details
type ErrorResponse struct {
	Code    ErrorCode     `json:"code"`
	Message string        `json:"message"`
	Source  MessageSource `json:"source"`
	Details interface{}   `json:"details,omitempty"`
}

// ErrorMessage represents a server error response
type ErrorMessage struct {
	Action    MessageAction `json:"action"`
	Source    MessageSource `json:"source"`
	SessionID SessionID     `json:"session_id,omitempty"`
	Error     ErrorResponse `json:"error"`
	ReplyTo   RequestID     `json:"reply_to"`
}

// EventMessage represents a server-initiated event
type EventMessage struct {
	Action    MessageAction `json:"action"`
	Payload   interface{}   `json:"payload,omitempty"`
	Source    MessageSource `json:"source"`
	SessionID SessionID     `json:"session_id,omitempty"`
}
