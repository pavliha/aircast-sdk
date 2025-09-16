package message

import (
	"context"
	"encoding/json"
	"sync"
	"testing"
	"time"

	"github.com/sirupsen/logrus"
)

// BenchmarkConnection for performance testing
type BenchmarkConnection struct {
	msgCh      chan []byte
	closed     bool
	closeMutex sync.Mutex
}

func NewBenchmarkConnection() *BenchmarkConnection {
	return &BenchmarkConnection{
		msgCh: make(chan []byte, 1000),
	}
}

func (c *BenchmarkConnection) SendMessage([]byte) error {
	// Simulate network latency
	time.Sleep(time.Microsecond)
	return nil
}

func (c *BenchmarkConnection) ReadMessage() <-chan []byte {
	return c.msgCh
}

func (c *BenchmarkConnection) Close() error {
	c.closeMutex.Lock()
	defer c.closeMutex.Unlock()
	if !c.closed {
		c.closed = true
		close(c.msgCh)
	}
	return nil
}

func (c *BenchmarkConnection) IsClosed() bool {
	c.closeMutex.Lock()
	defer c.closeMutex.Unlock()
	return c.closed
}

// Benchmark sending different message types
func BenchmarkClientSend(b *testing.B) {
	logger := logrus.NewEntry(logrus.New())
	logger.Logger.SetLevel(logrus.ErrorLevel) // Reduce logging overhead

	conn := NewBenchmarkConnection()
	config := ClientConfig{
		Source: SystemDevice,
	}
	client := NewClient(logger, conn, config)

	requestMsg := RequestMessage{
		Action:    "benchmark_action",
		Source:    SystemDevice,
		RequestID: "req-bench",
		Payload:   map[string]string{"key": "value"},
	}

	responseMsg := ResponseMessage{
		Action:  "benchmark_action",
		Source:  SystemDevice,
		ReplyTo: "req-bench",
		Payload: map[string]string{"status": "success"},
	}

	errorMsg := ErrorMessage{
		Action:  "benchmark_action",
		Source:  SystemDevice,
		ReplyTo: "req-bench",
		Error: ErrorResponse{
			Code:    "BENCH_ERROR",
			Message: "Benchmark error",
		},
	}

	eventMsg := EventMessage{
		Action:  "benchmark_event",
		Source:  SystemDevice,
		Payload: map[string]string{"event": "data"},
	}

	b.Run("Request", func(b *testing.B) {
		b.ResetTimer()
		for i := 0; i < b.N; i++ {
			_ = client.Send(requestMsg, nil)
		}
	})

	b.Run("Response", func(b *testing.B) {
		b.ResetTimer()
		for i := 0; i < b.N; i++ {
			_ = client.Send(responseMsg, nil)
		}
	})

	b.Run("Error", func(b *testing.B) {
		b.ResetTimer()
		for i := 0; i < b.N; i++ {
			_ = client.Send(errorMsg, nil)
		}
	})

	b.Run("Event", func(b *testing.B) {
		b.ResetTimer()
		for i := 0; i < b.N; i++ {
			_ = client.Send(eventMsg, nil)
		}
	})
}

// Benchmark sending with channel IDs
func BenchmarkClientSendWithChannel(b *testing.B) {
	logger := logrus.NewEntry(logrus.New())
	logger.Logger.SetLevel(logrus.ErrorLevel)

	conn := NewBenchmarkConnection()
	config := ClientConfig{
		Source: SystemDevice,
	}
	client := NewClient(logger, conn, config)

	channelID := ChannelID("channel-bench")
	msg := RequestMessage{
		Action:    "benchmark_action",
		Source:    SystemDevice,
		RequestID: "req-bench",
		Payload:   map[string]string{"key": "value"},
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = client.SendMessageToChannel(channelID, msg)
	}
}

// Benchmark concurrent sending
func BenchmarkClientSendParallel(b *testing.B) {
	logger := logrus.NewEntry(logrus.New())
	logger.Logger.SetLevel(logrus.ErrorLevel)

	conn := NewBenchmarkConnection()
	config := ClientConfig{
		Source: SystemDevice,
	}
	client := NewClient(logger, conn, config)

	msg := EventMessage{
		Action:  "benchmark_event",
		Source:  SystemDevice,
		Payload: map[string]string{"event": "data"},
	}

	b.RunParallel(func(pb *testing.PB) {
		for pb.Next() {
			_ = client.Send(msg, nil)
		}
	})
}

// Benchmark message processing in Listen
func BenchmarkClientListen(b *testing.B) {
	logger := logrus.NewEntry(logrus.New())
	logger.Logger.SetLevel(logrus.ErrorLevel)

	conn := NewBenchmarkConnection()
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

	// Prepare test message
	msg := map[string]interface{}{
		"type":       TypeRequest,
		"action":     "benchmark_action",
		"source":     SystemDevice,
		"request_id": "req-bench",
		"payload":    map[string]string{"key": "value"},
	}
	data, _ := json.Marshal(msg)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		conn.msgCh <- data

		// Wait for message to be processed
		select {
		case <-client.ReadMessage():
			// Message processed
		case <-time.After(time.Millisecond):
			b.Fatal("timeout waiting for message")
		}
	}
}

// Benchmark throughput with multiple goroutines
func BenchmarkClientThroughput(b *testing.B) {
	logger := logrus.NewEntry(logrus.New())
	logger.Logger.SetLevel(logrus.ErrorLevel)

	conn := NewBenchmarkConnection()
	config := ClientConfig{
		Source: SystemDevice,
	}
	client := NewClient(logger, conn, config)

	numGoroutines := 10
	messagesPerGoroutine := b.N / numGoroutines

	msg := EventMessage{
		Action:  "throughput_test",
		Source:  SystemDevice,
		Payload: map[string]string{"test": "data"},
	}

	b.ResetTimer()

	var wg sync.WaitGroup
	wg.Add(numGoroutines)

	for i := 0; i < numGoroutines; i++ {
		go func() {
			defer wg.Done()
			for j := 0; j < messagesPerGoroutine; j++ {
				_ = client.Send(msg, nil)
			}
		}()
	}

	wg.Wait()
}

// Benchmark memory allocations for Send
func BenchmarkClientSendAllocs(b *testing.B) {
	logger := logrus.NewEntry(logrus.New())
	logger.Logger.SetLevel(logrus.ErrorLevel)

	conn := NewBenchmarkConnection()
	config := ClientConfig{
		Source: SystemDevice,
	}
	client := NewClient(logger, conn, config)

	msg := RequestMessage{
		Action:    "alloc_test",
		Source:    SystemDevice,
		RequestID: "req-alloc",
		Payload:   map[string]string{"key": "value"},
	}

	b.ReportAllocs()
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = client.Send(msg, nil)
	}
}

// Benchmark SendResponse helper method
func BenchmarkClientSendResponse(b *testing.B) {
	logger := logrus.NewEntry(logrus.New())
	logger.Logger.SetLevel(logrus.ErrorLevel)

	conn := NewBenchmarkConnection()
	config := ClientConfig{
		Source: SystemAPI,
	}
	client := NewClient(logger, conn, config).(*client)

	req := &RequestMessage{
		Action:    "benchmark_action",
		Source:    SystemDevice,
		RequestID: "req-bench",
		ChannelID: "channel-bench",
	}

	payload := map[string]string{"status": "success"}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = client.SendResponse(req, payload)
	}
}

// Benchmark SendError helper method
func BenchmarkClientSendError(b *testing.B) {
	logger := logrus.NewEntry(logrus.New())
	logger.Logger.SetLevel(logrus.ErrorLevel)

	conn := NewBenchmarkConnection()
	config := ClientConfig{
		Source: SystemAPI,
	}
	client := NewClient(logger, conn, config).(*client)

	req := &RequestMessage{
		Action:    "benchmark_action",
		Source:    SystemDevice,
		RequestID: "req-bench",
		ChannelID: "channel-bench",
	}

	errResponse := ErrorResponse{
		Code:    "BENCH_ERROR",
		Message: "Benchmark error",
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = client.SendErrorToChannel(req, errResponse)
	}
}

// Benchmark SendEvent helper method
func BenchmarkClientSendEvent(b *testing.B) {
	logger := logrus.NewEntry(logrus.New())
	logger.Logger.SetLevel(logrus.ErrorLevel)

	conn := NewBenchmarkConnection()
	config := ClientConfig{
		Source: SystemDevice,
	}
	client := NewClient(logger, conn, config).(*client)

	action := MessageAction("benchmark_event")
	payload := map[string]string{"event": "data"}
	channelID := ChannelID("channel-bench")

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = client.SendEventToChannel(action, payload, channelID)
	}
}
