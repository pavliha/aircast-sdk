package message

import (
	"context"
	"encoding/json"
	"errors"
	"sync"
	"testing"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

// MockConnection is a mock implementation of the Connection interface
type MockConnection struct {
	mock.Mock
	msgCh      chan []byte
	closed     bool
	closeMutex sync.Mutex
}

func NewMockConnection() *MockConnection {
	return &MockConnection{
		msgCh: make(chan []byte, 15000), // Increased to support high-volume tests
	}
}

func (m *MockConnection) SendMessage(message []byte) error {
	args := m.Called(message)
	return args.Error(0)
}

func (m *MockConnection) ReadMessage() <-chan []byte {
	m.Called()
	return m.msgCh
}

func (m *MockConnection) Close() error {
	m.closeMutex.Lock()
	defer m.closeMutex.Unlock()

	if !m.closed {
		m.closed = true
		close(m.msgCh)
	}
	args := m.Called()
	return args.Error(0)
}

func (m *MockConnection) IsClosed() bool {
	m.closeMutex.Lock()
	defer m.closeMutex.Unlock()

	args := m.Called()
	return args.Bool(0)
}

func TestNewClient(t *testing.T) {
	logger := logrus.NewEntry(logrus.New())
	conn := NewMockConnection()
	config := ClientConfig{
		Source: SystemDevice,
		PrintConfig: &PrintConfig{
			ShowPayload: true,
		},
	}

	client := NewClient(logger, conn, config)

	assert.NotNil(t, client)
	assert.False(t, client.IsClosed())
}

func TestClient_Listen(t *testing.T) {
	t.Run("processes valid messages", func(t *testing.T) {
		logger := logrus.NewEntry(logrus.New())
		conn := NewMockConnection()
		conn.On("ReadMessage").Return()
		conn.On("Close").Return(nil)

		config := ClientConfig{
			Source: SystemDevice,
		}
		client := NewClient(logger, conn, config)

		ctx, cancel := context.WithCancel(context.Background())
		defer cancel()

		// Start listening in a goroutine
		go func() {
			_ = client.Listen(ctx)
		}()

		// Create and send a valid request message
		reqMsg := map[string]interface{}{
			"type":       TypeRequest,
			"action":     "test_action",
			"source":     SystemDevice,
			"request_id": "req-123",
		}

		msgBytes, _ := json.Marshal(reqMsg)
		conn.msgCh <- msgBytes

		// Wait for message to be processed
		select {
		case msg := <-client.ReadMessage():
			req, ok := msg.(RequestMessage)
			require.True(t, ok)
			assert.Equal(t, "test_action", req.Action)
			assert.Equal(t, "req-123", req.RequestID)
		case <-time.After(time.Second):
			t.Fatal("timeout waiting for message")
		}

		cancel()
	})

	t.Run("handles invalid messages", func(t *testing.T) {
		logger := logrus.NewEntry(logrus.New())
		conn := NewMockConnection()
		conn.On("ReadMessage").Return()
		conn.On("Close").Return(nil)

		config := ClientConfig{
			Source: SystemDevice,
		}
		client := NewClient(logger, conn, config)

		ctx, cancel := context.WithCancel(context.Background())
		defer cancel()

		// Start listening
		go func() {
			_ = client.Listen(ctx)
		}()

		// Send invalid JSON
		conn.msgCh <- []byte("invalid json")

		// Send valid JSON but invalid message structure
		invalidMsg := map[string]interface{}{
			"invalid": "structure",
		}
		msgBytes, _ := json.Marshal(invalidMsg)
		conn.msgCh <- msgBytes

		// Should continue listening without crashing
		time.Sleep(100 * time.Millisecond)

		cancel()
	})

	t.Run("handles context cancellation", func(t *testing.T) {
		logger := logrus.NewEntry(logrus.New())
		conn := NewMockConnection()
		conn.On("ReadMessage").Return()
		conn.On("Close").Return(nil)

		config := ClientConfig{
			Source: SystemDevice,
		}
		client := NewClient(logger, conn, config)

		ctx, cancel := context.WithCancel(context.Background())

		done := make(chan error)
		go func() {
			done <- client.Listen(ctx)
		}()

		// Cancel context
		cancel()

		// Should return without error
		select {
		case err := <-done:
			assert.NoError(t, err)
		case <-time.After(time.Second):
			t.Fatal("timeout waiting for Listen to return")
		}
	})
}

func TestClient_Send(t *testing.T) {
	t.Run("sends request message", func(t *testing.T) {
		logger := logrus.NewEntry(logrus.New())
		conn := NewMockConnection()

		config := ClientConfig{
			Source: SystemDevice,
		}
		client := NewClient(logger, conn, config)

		req := RequestMessage{
			Action:    "test_action",
			Source:    SystemDevice,
			RequestID: "req-123",
			Payload:   map[string]string{"key": "value"},
		}

		conn.On("SendMessage", mock.MatchedBy(func(data []byte) bool {
			var envelope map[string]interface{}
			json.Unmarshal(data, &envelope)
			return envelope["type"] == TypeRequest && envelope["action"] == "test_action"
		})).Return(nil)

		err := client.Send(req, nil)
		assert.NoError(t, err)
		conn.AssertExpectations(t)
	})

	t.Run("sends response message", func(t *testing.T) {
		logger := logrus.NewEntry(logrus.New())
		conn := NewMockConnection()

		config := ClientConfig{
			Source: SystemAPI,
		}
		client := NewClient(logger, conn, config)

		resp := ResponseMessage{
			Action:  "test_action",
			Source:  SystemAPI,
			ReplyTo: "req-123",
			Payload: map[string]string{"status": "success"},
		}

		conn.On("SendMessage", mock.MatchedBy(func(data []byte) bool {
			var envelope map[string]interface{}
			json.Unmarshal(data, &envelope)
			return envelope["type"] == TypeResponse && envelope["reply_to"] == "req-123"
		})).Return(nil)

		err := client.Send(resp, nil)
		assert.NoError(t, err)
		conn.AssertExpectations(t)
	})

	t.Run("sends error message", func(t *testing.T) {
		logger := logrus.NewEntry(logrus.New())
		conn := NewMockConnection()

		config := ClientConfig{
			Source: SystemDevice,
		}
		client := NewClient(logger, conn, config)

		errMsg := ErrorMessage{
			Action:  "test_action",
			Source:  SystemDevice,
			ReplyTo: "req-123",
			Error: ErrorResponse{
				Code:    "TEST_ERROR",
				Message: "Test error message",
			},
		}

		conn.On("SendMessage", mock.MatchedBy(func(data []byte) bool {
			var envelope map[string]interface{}
			json.Unmarshal(data, &envelope)
			return envelope["type"] == TypeError
		})).Return(nil)

		err := client.Send(errMsg, nil)
		assert.NoError(t, err)
		conn.AssertExpectations(t)
	})

	t.Run("sends event message", func(t *testing.T) {
		logger := logrus.NewEntry(logrus.New())
		conn := NewMockConnection()

		config := ClientConfig{
			Source: SystemDevice,
		}
		client := NewClient(logger, conn, config)

		event := EventMessage{
			Action:  "test_event",
			Source:  SystemDevice,
			Payload: map[string]string{"event": "data"},
		}

		conn.On("SendMessage", mock.MatchedBy(func(data []byte) bool {
			var envelope map[string]interface{}
			json.Unmarshal(data, &envelope)
			return envelope["type"] == TypeEvent && envelope["action"] == "test_event"
		})).Return(nil)

		err := client.Send(event, nil)
		assert.NoError(t, err)
		conn.AssertExpectations(t)
	})

	t.Run("adds channel ID when provided", func(t *testing.T) {
		logger := logrus.NewEntry(logrus.New())
		conn := NewMockConnection()

		config := ClientConfig{
			Source: SystemDevice,
		}
		client := NewClient(logger, conn, config)

		channelID := ChannelID("channel-123")
		req := RequestMessage{
			Action:    "test_action",
			Source:    SystemDevice,
			RequestID: "req-123",
		}

		conn.On("SendMessage", mock.MatchedBy(func(data []byte) bool {
			var envelope map[string]interface{}
			json.Unmarshal(data, &envelope)
			return envelope["channel_id"] == "channel-123"
		})).Return(nil)

		err := client.Send(req, &channelID)
		assert.NoError(t, err)
		conn.AssertExpectations(t)
	})

	t.Run("returns error when client is closed", func(t *testing.T) {
		logger := logrus.NewEntry(logrus.New())
		conn := NewMockConnection()
		conn.On("Close").Return(nil)
		conn.On("IsClosed").Return(true)

		config := ClientConfig{
			Source: SystemDevice,
		}
		client := NewClient(logger, conn, config)
		client.Close()

		req := RequestMessage{
			Action:    "test_action",
			Source:    SystemDevice,
			RequestID: "req-123",
		}

		err := client.Send(req, nil)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "closed")
	})

	t.Run("returns error for unsupported message type", func(t *testing.T) {
		logger := logrus.NewEntry(logrus.New())
		conn := NewMockConnection()

		config := ClientConfig{
			Source: SystemDevice,
		}
		client := NewClient(logger, conn, config)

		unsupportedMsg := struct {
			Field string
		}{
			Field: "value",
		}

		err := client.Send(unsupportedMsg, nil)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "not supported")
	})
}

func TestClient_SendMessageToChannel(t *testing.T) {
	logger := logrus.NewEntry(logrus.New())
	conn := NewMockConnection()

	config := ClientConfig{
		Source: SystemDevice,
	}
	client := NewClient(logger, conn, config)

	channelID := ChannelID("channel-123")
	req := RequestMessage{
		Action:    "test_action",
		Source:    SystemDevice,
		RequestID: "req-123",
	}

	conn.On("SendMessage", mock.MatchedBy(func(data []byte) bool {
		var envelope map[string]any
		json.Unmarshal(data, &envelope)
		return envelope["channel_id"] == "channel-123"
	})).Return(nil)

	err := client.SendMessageToChannel(channelID, req)
	assert.NoError(t, err)
	conn.AssertExpectations(t)
}

func TestClient_SendBroadcastMessage(t *testing.T) {
	logger := logrus.NewEntry(logrus.New())
	conn := NewMockConnection()

	config := ClientConfig{
		Source: SystemDevice,
	}
	client := NewClient(logger, conn, config)

	event := EventMessage{
		Action:  "broadcast_event",
		Source:  SystemDevice,
		Payload: map[string]string{"broadcast": "data"},
	}

	conn.On("SendMessage", mock.MatchedBy(func(data []byte) bool {
		var envelope map[string]interface{}
		json.Unmarshal(data, &envelope)
		// Broadcast messages should not have channel_id
		_, hasChannelID := envelope["channel_id"]
		return !hasChannelID || envelope["channel_id"] == ""
	})).Return(nil)

	err := client.SendBroadcastMessage(event)
	assert.NoError(t, err)
	conn.AssertExpectations(t)
}

func TestClient_SendResponse(t *testing.T) {
	logger := logrus.NewEntry(logrus.New())
	conn := NewMockConnection()

	config := ClientConfig{
		Source: SystemAPI,
	}
	client := NewClient(logger, conn, config).(*client)

	req := &RequestMessage{
		Action:    "test_action",
		Source:    SystemDevice,
		RequestID: "req-123",
		ChannelID: "channel-123",
	}

	payload := map[string]string{"status": "success"}

	conn.On("SendMessage", mock.MatchedBy(func(data []byte) bool {
		var envelope map[string]interface{}
		json.Unmarshal(data, &envelope)
		return envelope["type"] == TypeResponse &&
			envelope["action"] == "test_action" &&
			envelope["reply_to"] == "req-123" &&
			envelope["source"] == SystemAPI &&
			envelope["channel_id"] == "channel-123"
	})).Return(nil)

	err := client.SendResponse(req, payload)
	assert.NoError(t, err)
	conn.AssertExpectations(t)
}

func TestClient_SendErrorToChannel(t *testing.T) {
	logger := logrus.NewEntry(logrus.New())
	conn := NewMockConnection()

	config := ClientConfig{
		Source: SystemAPI,
	}
	client := NewClient(logger, conn, config).(*client)

	req := &RequestMessage{
		Action:    "test_action",
		Source:    SystemDevice,
		RequestID: "req-123",
		ChannelID: "channel-123",
	}

	errResponse := ErrorResponse{
		Code:    "TEST_ERROR",
		Message: "Something went wrong",
		Details: map[string]string{"field": "value"},
	}

	conn.On("SendMessage", mock.MatchedBy(func(data []byte) bool {
		var envelope map[string]interface{}
		json.Unmarshal(data, &envelope)
		errorField := envelope["error"].(map[string]interface{})
		return envelope["type"] == TypeError &&
			envelope["action"] == "test_action" &&
			envelope["reply_to"] == "req-123" &&
			envelope["source"] == SystemAPI &&
			errorField["code"] == "TEST_ERROR"
	})).Return(nil)

	err := client.SendErrorToChannel(req, errResponse)
	assert.NoError(t, err)
	conn.AssertExpectations(t)
}

func TestClient_SendEventToChannel(t *testing.T) {
	logger := logrus.NewEntry(logrus.New())
	conn := NewMockConnection()

	config := ClientConfig{
		Source: SystemDevice,
	}
	client := NewClient(logger, conn, config).(*client)

	action := MessageAction("device_connected")
	payload := map[string]string{"device_id": "device-123"}
	sessionID := ChannelID("session-123")

	conn.On("SendMessage", mock.MatchedBy(func(data []byte) bool {
		var envelope map[string]interface{}
		json.Unmarshal(data, &envelope)
		return envelope["type"] == TypeEvent &&
			envelope["action"] == "device_connected" &&
			envelope["source"] == SystemDevice &&
			envelope["channel_id"] == "session-123"
	})).Return(nil)

	err := client.SendEventToChannel(action, payload, sessionID)
	assert.NoError(t, err)
	conn.AssertExpectations(t)
}

func TestClient_Close(t *testing.T) {
	t.Run("closes connection and channels", func(t *testing.T) {
		logger := logrus.NewEntry(logrus.New())
		conn := NewMockConnection()
		conn.On("Close").Return(nil)

		config := ClientConfig{
			Source: SystemDevice,
		}
		client := NewClient(logger, conn, config)

		err := client.Close()
		assert.NoError(t, err)
		assert.True(t, client.IsClosed())
		conn.AssertExpectations(t)
	})

	t.Run("handles multiple close calls", func(t *testing.T) {
		logger := logrus.NewEntry(logrus.New())
		conn := NewMockConnection()
		conn.On("Close").Return(nil).Once()

		config := ClientConfig{
			Source: SystemDevice,
		}
		client := NewClient(logger, conn, config)

		// First close
		err := client.Close()
		assert.NoError(t, err)

		// Second close should not call conn.Close again
		err = client.Close()
		assert.NoError(t, err)

		conn.AssertExpectations(t)
	})

	t.Run("handles close error", func(t *testing.T) {
		logger := logrus.NewEntry(logrus.New())
		conn := NewMockConnection()
		expectedErr := errors.New("close error")
		conn.On("Close").Return(expectedErr)

		config := ClientConfig{
			Source: SystemDevice,
		}
		client := NewClient(logger, conn, config)

		err := client.Close()
		assert.Error(t, err)
		assert.Equal(t, expectedErr, err)
	})
}

func TestClient_IsClosed(t *testing.T) {
	logger := logrus.NewEntry(logrus.New())
	conn := NewMockConnection()

	config := ClientConfig{
		Source: SystemDevice,
	}
	client := NewClient(logger, conn, config)

	// Initially not closed
	assert.False(t, client.IsClosed())

	// Close the client
	conn.On("Close").Return(nil)
	client.Close()

	// Now should be closed
	assert.True(t, client.IsClosed())
}

func TestClient_ReadMessage(t *testing.T) {
	logger := logrus.NewEntry(logrus.New())
	conn := NewMockConnection()

	config := ClientConfig{
		Source: SystemDevice,
	}
	client := NewClient(logger, conn, config)

	msgCh := client.ReadMessage()
	assert.NotNil(t, msgCh)

	// Channel should be readable
	select {
	case <-msgCh:
		// Should not receive anything yet
		t.Fatal("unexpected message received")
	default:
		// Expected
	}
}
