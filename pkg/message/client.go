package message

import (
	"context"
	"encoding/json"
	"fmt"
	log "github.com/sirupsen/logrus"
	"sync"
)

// Client represents a message client connected to a device or web client
type Client interface {
	// Listen starts listening for incoming messages
	Listen(ctx context.Context) error

	// Send sends a message
	Send(msg any) error

	// Close closes the client connection
	Close() error

	// IsClosed returns whether the client is closed
	IsClosed() bool

	// ReadMessage returns a channel of incoming parsed messages
	ReadMessage() <-chan any

	SendResponse(req *Request, payload any) error

	SendError(req *Request, payload ErrorResponse) error

	SendEvent(action MessageAction, payload any, sessionID SessionID) error
}

// Connection represents a WebSocket connection
type Connection interface {
	SendTextMessage(message []byte) error
	ReadMessage() <-chan []byte
	Close() error
	IsClosed() bool
}

// client implements the Client interface
type client struct {
	conn       Connection
	msgCh      chan GenericMessage
	logger     *log.Entry
	closed     bool
	closeMutex sync.Mutex
	closeOnce  sync.Once
	source     MessageSource
}

// Error constants
var (
	ErrCloseMessage = fmt.Errorf("close message received")
	ErrClosed       = fmt.Errorf("connection closed")
)

// NewClient creates a new message client
func NewClient(logger *log.Entry, conn Connection, source MessageSource) Client {
	return &client{
		conn:   conn,
		msgCh:  make(chan GenericMessage, 100),
		logger: logger.WithField("component", "MessageClient"),
		closed: false,
		source: source,
	}
}

// Listen starts listening for incoming websocket messages and parses them
func (c *client) Listen(ctx context.Context) error {
	// Set up a done channel for a synchronized exit.
	done := make(chan struct{})
	defer close(done)

	// Context cancellation handler.
	go func() {
		select {
		case <-ctx.Done():
			c.logger.Trace("Context canceled, stopping client")
			_ = c.Close()
		case <-done:
			// Listen function is done.
		}
	}()

	// Get the message channel once instead of calling ReadMessage() in the loop
	msgChan := c.conn.ReadMessage()

	// Process incoming messages until the connection is closed.
	for {
		select {

		case msgBytes, ok := <-msgChan:
			if !ok {
				c.logger.Trace("WebSocket message channel closed")
				_ = c.Close()
				return nil
			}

			// Parse the raw message.
			msg, err := UnmarshalMessage(msgBytes)
			if err != nil {
				c.logger.WithError(err).Error("Failed to parse message")
				// Continue listening, even if a parse error occurs.
				continue
			}

			// Forward the message if not closed.
			if !c.IsClosed() {
				select {
				case c.msgCh <- msg:
					c.logger.Debug("Message received and forwarded")
					Print(msg)
				default:
					c.logger.Warn("GenericMessage channel full, dropping message")
				}
			}

		case <-ctx.Done():
			c.logger.Trace("Context canceled in message loop")
			_ = c.Close()
			return nil
		}
	}
}

// Send sends a message through the websocket connection.
func (c *client) Send(msg any) error {
	if c.IsClosed() {
		return fmt.Errorf("client connection is closed")
	}

	var data []byte
	var err error

	switch m := msg.(type) {
	case RequestMessage:
		// Wrap RequestMessage in an anonymous struct that includes the "type" field
		envelope := struct {
			Type string `json:"type"`
			RequestMessage
		}{
			Type:           TypeRequest,
			RequestMessage: m,
		}
		data, err = json.Marshal(envelope)

	case ResponseMessage:
		envelope := struct {
			Type string `json:"type"`
			ResponseMessage
		}{
			Type:            TypeResponse,
			ResponseMessage: m,
		}
		data, err = json.Marshal(envelope)

	case ErrorMessage:
		envelope := struct {
			Type string `json:"type"`
			ErrorMessage
		}{
			Type:         TypeError,
			ErrorMessage: m,
		}
		data, err = json.Marshal(envelope)

	case EventMessage:
		envelope := struct {
			Type string `json:"type"`
			EventMessage
		}{
			Type:         TypeEvent,
			EventMessage: m,
		}
		data, err = json.Marshal(envelope)

	default:
		return fmt.Errorf("message type not supported: %T", msg)
	}

	if err != nil {
		c.logger.WithError(err).Error("Failed to marshal message")
		return fmt.Errorf("failed to marshal message: %w", err)
	}

	return c.conn.SendTextMessage(data)
}

// Close safely closes the client connection.
func (c *client) Close() error {
	c.closeMutex.Lock()
	defer c.closeMutex.Unlock()

	if c.closed {
		return nil
	}
	c.closed = true
	c.closeOnce.Do(func() {
		close(c.msgCh)
	})
	return c.conn.Close()
}

// IsClosed returns whether the client is closed.
func (c *client) IsClosed() bool {
	c.closeMutex.Lock()
	defer c.closeMutex.Unlock()
	return c.closed
}

// ReadMessage returns a channel of incoming messages.
func (c *client) ReadMessage() <-chan GenericMessage {
	return c.msgCh
}

func (c *client) SendResponse(req *Request, payload any) error {
	return c.Send(ResponseMessage{
		Action:    req.Action,
		Payload:   payload,
		Source:    c.source,
		SessionID: req.SessionID,
		ReplyTo:   req.RequestID,
	})
}

func (c *client) SendEvent(action MessageAction, payload any, sessionID SessionID) error {
	return c.Send(EventMessage{
		Action:    action,
		Payload:   payload,
		Source:    c.source,
		SessionID: sessionID,
	})
}

func (c *client) SendError(req *Request, errResponse ErrorResponse) error {
	return c.Send(ErrorMessage{
		Action:    req.Action,
		Source:    c.source,
		SessionID: req.SessionID,
		Error:     errResponse,
		ReplyTo:   req.RequestID,
	})
}
