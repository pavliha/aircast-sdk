package message

import (
	"fmt"
)

type RequestPayload = map[string]any

type Request struct {
	Action    MessageAction
	SessionID SessionID
	RequestID RequestID
	Payload   RequestPayload
}

func NewRequest(
	action MessageAction,
	sessionID SessionID,
	requestID RequestID,
	payload RequestPayload,
) *Request {
	return &Request{
		Action:    action,
		SessionID: sessionID,
		RequestID: requestID,
		Payload:   payload,
	}
}

// ProcessPayload unmarshals and validates the request payload into the provided struct
func (r *Request) ProcessPayload(target interface{}) error {
	processor := NewProcessor()
	return processor.Process(r.Payload, target)
}

func CreateFromRequestMessage(reqMsg RequestMessage) (*Request, error) {
	var payload RequestPayload

	if reqMsg.Payload != nil {
		var ok bool
		payload, ok = reqMsg.Payload.(RequestPayload)
		if !ok {
			return nil, fmt.Errorf("invalid payload format")
		}
	}

	return &Request{
		Action:    reqMsg.Action,
		SessionID: reqMsg.SessionID,
		RequestID: reqMsg.RequestID,
		Payload:   payload,
	}, nil
}
