package message

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"sync"

	log "github.com/sirupsen/logrus"
)

// Pool for reusing bytes.Buffer for JSON encoding
var bufferPool = sync.Pool{
	New: func() interface{} {
		return bytes.NewBuffer(make([]byte, 0, 512)) // Pre-allocate 512 bytes
	},
}

// Client represents a message client connected to a device or web client
type Client interface {
	// Listen starts listening for incoming messages
	Listen(ctx context.Context) error

	// SendMessageToChannel sends direct message
	SendMessageToChannel(id ChannelID, msg any) error

	// SendBroadcastMessage sends a broadcast message
	SendBroadcastMessage(msg any) error

	// Send sends a message
	Send(msg any, sessionId *ChannelID) error

	// Close closes the client connection
	Close() error

	// IsClosed returns whether the client is closed
	IsClosed() bool

	// ReadMessage returns a channel of incoming parsed messages
	ReadMessage() <-chan any

	SendResponse(req *RequestMessage, payload any) error

	SendErrorToChannel(req *RequestMessage, payload ErrorResponse) error

	SendEventToChannel(action MessageAction, payload any, sessionID ChannelID) error
}

// Connection represents a WebSocket connection
type Connection interface {
	SendMessage(message []byte) error
	ReadMessage() <-chan []byte
	Close() error
	IsClosed() bool
}

type ClientConfig struct {
	Source      MessageSource
	PrintConfig *PrintConfig
}

// client implements the Client interface
type client struct {
	conn        Connection
	msgCh       chan GenericMessage
	logger      *log.Entry
	closed      bool
	closeMutex  sync.Mutex
	closeOnce   sync.Once
	source      MessageSource
	printConfig *PrintConfig
}

// NewClient creates a new message client
func NewClient(logger *log.Entry, conn Connection, config ClientConfig) Client {
	return &client{
		conn:        conn,
		msgCh:       make(chan GenericMessage, 10000), // Much larger buffer for high throughput
		logger:      logger.WithField("component", "message_client"),
		closed:      false,
		closeMutex:  sync.Mutex{},
		closeOnce:   sync.Once{},
		source:      config.Source,
		printConfig: config.PrintConfig,
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
				if c.logger.Logger.IsLevelEnabled(log.TraceLevel) {
					c.logger.Trace("WebSocket message channel closed")
				}
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
					// Only log trace if enabled to reduce overhead
					if c.logger.Logger.IsLevelEnabled(log.TraceLevel) {
						c.logger.Trace("Message received and forwarded")
					}
					if c.printConfig != nil {
						Print(msg, c.printConfig)
					}
				default:
					c.logger.Warn("GenericMessage channel full, dropping message")
				}
			}

		case <-ctx.Done():
			if c.logger.Logger.IsLevelEnabled(log.TraceLevel) {
				c.logger.Trace("Context canceled in message loop")
			}
			_ = c.Close()
			return nil
		}
	}
}

// ReadMessage returns a channel of incoming messages.
func (c *client) ReadMessage() <-chan GenericMessage {
	return c.msgCh
}

// Send is a helper function that handles the common logic for sending messages
func (c *client) Send(msg any, channelId *ChannelID) error {
	if c.IsClosed() {
		return fmt.Errorf("client connection is closed")
	}

	// First add channelId to the message if provided
	if channelId != nil {
		switch m := msg.(type) {
		case RequestMessage:
			m.ChannelID = string(*channelId)
			msg = m
		case ResponseMessage:
			m.ChannelID = *channelId
			msg = m
		case ErrorMessage:
			m.ChannelID = *channelId
			msg = m
		case EventMessage:
			m.ChannelID = *channelId
			msg = m
		}
	}

	// Log the message we're about to send
	Print(msg, c.printConfig)

	// Prepare envelope based on the message type
	var envelope any
	switch m := msg.(type) {
	case RequestMessage:
		envelope = struct {
			Type string `json:"type"`
			RequestMessage
		}{
			Type:           TypeRequest,
			RequestMessage: m,
		}
	case ResponseMessage:
		envelope = struct {
			Type string `json:"type"`
			ResponseMessage
		}{
			Type:            TypeResponse,
			ResponseMessage: m,
		}
	case ErrorMessage:
		envelope = struct {
			Type string `json:"type"`
			ErrorMessage
		}{
			Type:         TypeError,
			ErrorMessage: m,
		}
	case EventMessage:
		envelope = struct {
			Type string `json:"type"`
			EventMessage
		}{
			Type:         TypeEvent,
			EventMessage: m,
		}
	default:
		return fmt.Errorf("message type not supported: %T", msg)
	}

	// Use pooled buffer for better performance
	buf := bufferPool.Get().(*bytes.Buffer)
	defer func() {
		buf.Reset()
		bufferPool.Put(buf)
	}()

	encoder := json.NewEncoder(buf)
	if err := encoder.Encode(envelope); err != nil {
		c.logger.WithError(err).Error("Failed to marshal message")
		return fmt.Errorf("failed to marshal message: %w", err)
	}

	// Remove the trailing newline that Encoder adds
	data := buf.Bytes()
	if len(data) > 0 && data[len(data)-1] == '\n' {
		data = data[:len(data)-1]
	}

	return c.conn.SendMessage(data)
}

// SendMessageToChannel sends a message to a specific session
func (c *client) SendMessageToChannel(channelID ChannelID, msg any) error {
	return c.Send(msg, &channelID)
}

func (c *client) SendBroadcastMessage(msg any) error {
	return c.Send(msg, nil)
}

func (c *client) SendResponse(req *RequestMessage, payload any) error {
	return c.Send(ResponseMessage{
		Action:    req.Action,
		Payload:   payload,
		Source:    c.source,
		ChannelID: req.ChannelID,
		ReplyTo:   req.RequestID,
	}, &req.ChannelID)
}

func (c *client) SendEventToChannel(action MessageAction, payload any, channelID ChannelID) error {
	return c.Send(EventMessage{
		Action:    action,
		Payload:   payload,
		Source:    c.source,
		ChannelID: channelID,
	}, &channelID)
}

func (c *client) SendErrorToChannel(req *RequestMessage, errResponse ErrorResponse) error {
	return c.Send(ErrorMessage{
		Action:    req.Action,
		Source:    c.source,
		ChannelID: req.ChannelID,
		Error:     errResponse,
		ReplyTo:   req.RequestID,
	}, &req.ChannelID)
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
