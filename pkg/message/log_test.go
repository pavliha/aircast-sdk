package message

import (
	"bytes"
	"io"
	"os"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func captureOutput(f func()) string {
	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	f()

	_ = w.Close()
	os.Stdout = old

	var buf bytes.Buffer
	_, _ = io.Copy(&buf, r)
	return buf.String()
}

func TestPrint(t *testing.T) {
	t.Run("does nothing when config is nil", func(t *testing.T) {
		msg := EventMessage{
			Action:  "test_action",
			Source:  SystemDevice,
			Payload: map[string]string{"key": "value"},
		}

		output := captureOutput(func() {
			Print(msg, nil)
		})

		assert.Empty(t, output)
	})

	t.Run("prints EventMessage correctly", func(t *testing.T) {
		msg := EventMessage{
			Action:    "device_connected",
			Source:    SystemDevice,
			ChannelID: "channel-123",
			Payload:   map[string]string{"device": "test-device"},
		}

		config := &PrintConfig{
			ShowPayload: false,
		}

		output := captureOutput(func() {
			Print(msg, config)
		})

		assert.Contains(t, output, "EVENT")
		assert.Contains(t, output, "device_connected")
		assert.Contains(t, output, "Source:")
		assert.Contains(t, output, SystemDevice)
		assert.Contains(t, output, "SessionID:")
		assert.Contains(t, output, "channel-123")
		assert.NotContains(t, output, "Payload:") // ShowPayload is false
	})

	t.Run("prints RequestMessage correctly", func(t *testing.T) {
		msg := RequestMessage{
			Action:    "get_status",
			Source:    SystemAPI,
			RequestID: "req-123",
			ChannelID: "channel-456",
			Payload:   map[string]string{"status": "active"},
		}

		config := &PrintConfig{
			ShowPayload: true,
		}

		output := captureOutput(func() {
			Print(msg, config)
		})

		assert.Contains(t, output, "REQUEST")
		assert.Contains(t, output, "get_status")
		assert.Contains(t, output, "Source:")
		assert.Contains(t, output, SystemAPI)
		assert.Contains(t, output, "SessionID:")
		assert.Contains(t, output, "channel-456")
		assert.Contains(t, output, "Payload:")
		assert.Contains(t, output, "status")
	})

	t.Run("prints ResponseMessage correctly", func(t *testing.T) {
		msg := ResponseMessage{
			Action:  "get_status",
			Source:  SystemDevice,
			ReplyTo: "req-123",
			Payload: map[string]any{
				"status": "success",
				"data":   "test-data",
			},
		}

		config := &PrintConfig{
			ShowPayload: true,
		}

		output := captureOutput(func() {
			Print(msg, config)
		})

		assert.Contains(t, output, "RESPONSE")
		assert.Contains(t, output, "get_status")
		assert.Contains(t, output, "Source:")
		assert.Contains(t, output, SystemDevice)
		assert.Contains(t, output, "Payload:")
		assert.Contains(t, output, "status")
		assert.Contains(t, output, "data")
	})

	t.Run("prints ErrorMessage correctly", func(t *testing.T) {
		msg := ErrorMessage{
			Action:    "failed_action",
			Source:    SystemAPI,
			ChannelID: "channel-789",
			ReplyTo:   "req-456",
			Error: ErrorResponse{
				Code:    "TEST_ERROR",
				Message: "Something went wrong",
				Details: map[string]string{"field": "value"},
			},
		}

		config := &PrintConfig{
			ShowPayload: true,
		}

		output := captureOutput(func() {
			Print(msg, config)
		})

		assert.Contains(t, output, "ERROR")
		assert.Contains(t, output, "failed_action")
		assert.Contains(t, output, "Source:")
		assert.Contains(t, output, SystemAPI)
		assert.Contains(t, output, "SessionID:")
		assert.Contains(t, output, "channel-789")
		assert.Contains(t, output, "Payload:")
	})

	t.Run("handles unknown message type", func(t *testing.T) {
		msg := struct {
			UnknownField string
		}{
			UnknownField: "test",
		}

		config := &PrintConfig{
			ShowPayload: true,
		}

		output := captureOutput(func() {
			Print(msg, config)
		})

		assert.Contains(t, output, "UNKNOWN")
		assert.Contains(t, output, "UnknownField")
	})

	t.Run("does not print payload when ShowPayload is false", func(t *testing.T) {
		msg := EventMessage{
			Action:  "test_event",
			Source:  SystemDevice,
			Payload: map[string]string{"sensitive": "data"},
		}

		config := &PrintConfig{
			ShowPayload: false,
		}

		output := captureOutput(func() {
			Print(msg, config)
		})

		assert.NotContains(t, output, "Payload:")
		assert.NotContains(t, output, "sensitive")
	})

	t.Run("does not print empty source", func(t *testing.T) {
		msg := EventMessage{
			Action:  "test_event",
			Source:  "",
			Payload: nil,
		}

		config := &PrintConfig{
			ShowPayload: true,
		}

		output := captureOutput(func() {
			Print(msg, config)
		})

		assert.NotContains(t, output, "Source:")
	})

	t.Run("does not print empty channel ID", func(t *testing.T) {
		msg := EventMessage{
			Action:    "test_event",
			Source:    SystemDevice,
			ChannelID: "",
			Payload:   nil,
		}

		config := &PrintConfig{
			ShowPayload: true,
		}

		output := captureOutput(func() {
			Print(msg, config)
		})

		assert.NotContains(t, output, "SessionID:")
	})

	t.Run("prints separator line", func(t *testing.T) {
		msg := EventMessage{
			Action: "test_event",
			Source: SystemDevice,
		}

		config := &PrintConfig{
			ShowPayload: false,
		}

		output := captureOutput(func() {
			Print(msg, config)
		})

		assert.Contains(t, output, strings.Repeat("-", 50))
	})
}

func TestHasContent(t *testing.T) {
	tests := []struct {
		name     string
		payload  any
		expected bool
	}{
		{
			name:     "nil payload",
			payload:  nil,
			expected: false,
		},
		{
			name:     "empty map",
			payload:  map[string]any{},
			expected: false,
		},
		{
			name:     "non-empty map",
			payload:  map[string]any{"key": "value"},
			expected: true,
		},
		{
			name:     "empty string",
			payload:  "",
			expected: false,
		},
		{
			name:     "non-empty string",
			payload:  "content",
			expected: true,
		},
		{
			name:     "empty slice",
			payload:  []any{},
			expected: false,
		},
		{
			name:     "non-empty slice",
			payload:  []any{"item1", "item2"},
			expected: true,
		},
		{
			name:     "integer",
			payload:  42,
			expected: true,
		},
		{
			name:     "boolean",
			payload:  true,
			expected: true,
		},
		{
			name:     "struct",
			payload:  struct{ Field string }{Field: "value"},
			expected: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := hasContent(tt.payload)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestPrintPayload(t *testing.T) {
	t.Run("prints map payload", func(t *testing.T) {
		payload := map[string]any{
			"key1": "value1",
			"key2": 42,
			"key3": true,
		}

		output := captureOutput(func() {
			printPayload(payload)
		})

		assert.Contains(t, output, "key1")
		assert.Contains(t, output, "value1")
		assert.Contains(t, output, "key2")
		assert.Contains(t, output, "42")
		assert.Contains(t, output, "key3")
		assert.Contains(t, output, "true")
	})

	t.Run("prints non-map payload", func(t *testing.T) {
		payload := "simple string payload"

		output := captureOutput(func() {
			printPayload(payload)
		})

		assert.Contains(t, output, "simple string payload")
	})

	t.Run("handles nil payload", func(t *testing.T) {
		output := captureOutput(func() {
			printPayload(nil)
		})

		assert.Empty(t, output)
	})

	t.Run("prints complex nested structure", func(t *testing.T) {
		payload := map[string]any{
			"nested": map[string]any{
				"inner": "value",
			},
			"array": []string{"item1", "item2"},
		}

		output := captureOutput(func() {
			printPayload(payload)
		})

		assert.Contains(t, output, "nested")
		assert.Contains(t, output, "array")
	})
}

func TestPrintConfig(t *testing.T) {
	t.Run("ShowPayload true", func(t *testing.T) {
		config := &PrintConfig{
			ShowPayload: true,
		}

		msg := EventMessage{
			Action:  "test",
			Source:  SystemDevice,
			Payload: map[string]string{"data": "value"},
		}

		output := captureOutput(func() {
			Print(msg, config)
		})

		assert.Contains(t, output, "Payload:")
		assert.Contains(t, output, "data")
	})

	t.Run("ShowPayload false", func(t *testing.T) {
		config := &PrintConfig{
			ShowPayload: false,
		}

		msg := EventMessage{
			Action:  "test",
			Source:  SystemDevice,
			Payload: map[string]string{"data": "value"},
		}

		output := captureOutput(func() {
			Print(msg, config)
		})

		assert.NotContains(t, output, "Payload:")
		assert.NotContains(t, output, "data")
	})
}

func TestColorCodes(t *testing.T) {
	// Test that color codes are defined
	assert.NotEmpty(t, Reset)
	assert.NotEmpty(t, Bold)
	assert.NotEmpty(t, Red)
	assert.NotEmpty(t, Green)
	assert.NotEmpty(t, Yellow)
	assert.NotEmpty(t, Blue)
	assert.NotEmpty(t, Magenta)
	assert.NotEmpty(t, Cyan)
	assert.NotEmpty(t, White)
	assert.NotEmpty(t, BgMagenta)

	// Test that they contain ANSI escape sequences
	assert.Contains(t, Reset, "\033")
	assert.Contains(t, Bold, "\033")
	assert.Contains(t, Red, "\033")
}
