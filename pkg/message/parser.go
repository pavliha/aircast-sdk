package message

import (
	"encoding/json"
	"errors"
	"fmt"
)

func UnmarshalMessage(data []byte) (any, error) {
	// Unmarshal into a generic map to extract the "type" field.
	var genericMsg map[string]any
	if err := json.Unmarshal(data, &genericMsg); err != nil {
		return nil, fmt.Errorf("failed to parse generic message: %w", err)
	}

	// Validate the message against protocol requirements.
	if err := validateMessage(genericMsg); err != nil {
		return nil, fmt.Errorf("message validation failed: %w", err)
	}

	// Retrieve the message type.
	messageType, ok := genericMsg["type"].(string)
	if !ok {
		return nil, errors.New("invalid message type field")
	}

	// Based on the type field, unmarshal into the appropriate struct.
	switch messageType {
	case TypeRequest:
		var req RequestMessage
		if err := json.Unmarshal(data, &req); err != nil {
			return nil, fmt.Errorf("failed to unmarshal to RequestMessage: %w", err)
		}
		return req, nil
	case TypeResponse:
		var res ResponseMessage
		if err := json.Unmarshal(data, &res); err != nil {
			return nil, fmt.Errorf("failed to unmarshal to ResponseMessage: %w", err)
		}
		return res, nil
	case TypeError:
		var errMsg ErrorMessage
		if err := json.Unmarshal(data, &errMsg); err != nil {
			return nil, fmt.Errorf("failed to unmarshal to ErrorMessage: %w", err)
		}
		return errMsg, nil
	case TypeEvent:
		var event EventMessage
		if err := json.Unmarshal(data, &event); err != nil {
			return nil, fmt.Errorf("failed to unmarshal to EventMessage: %w", err)
		}
		return event, nil
	default:
		return nil, fmt.Errorf("unknown message type: %s", messageType)
	}
}

// validateMessage validates a message against the protocol requirements
func validateMessage(msg map[string]any) error {
	// Check required fields
	if msg["type"] == nil {
		return ErrMissingType
	}

	msgType, ok := msg["type"].(string)
	if !ok {
		return fmt.Errorf("%w: type must be a string", ErrInvalidMessageType)
	}

	// Validate type is one of the allowed values from the protocol
	switch msgType {
	case TypeRequest, TypeResponse, TypeError, TypeEvent:
		// Valid type according to protocol.md
	default:
		return fmt.Errorf("%w: '%s' is not a valid message type according to protocol", ErrInvalidMessageType, msgType)
	}

	// Action is required for all message types
	if msg["action"] == nil {
		return ErrMissingAction
	}

	// Additional validations for specific message types
	switch msgType {
	case TypeRequest:
		// Request ID is required only for Request messages
		if msg["request_id"] == nil {
			return ErrMissingRequestID
		}
	case TypeResponse:
		if msg["reply_to"] == nil {
			return errors.New("response must include 'reply_to' field")
		}
	case TypeError:
		if msg["reply_to"] == nil {
			return errors.New("error must include 'reply_to' field")
		}
		if msg["error"] == nil {
			return errors.New("error must include 'error' field")
		}
	}

	return nil
}
