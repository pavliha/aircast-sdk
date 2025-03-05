package main

import (
	"github.com/pavliha/aircast-protocol/gen/go/common"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"google.golang.org/protobuf/proto"

	aircast "github.com/pavliha/aircast-protocol/gen/go"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins in this example
	},
}

// AircastServer handles WebSocket connections and implements the Aircast protocol
type AircastServer struct {
	// Map of active connections
	clients map[*websocket.Conn]bool
	// Mutex for thread-safe access to the clients map
	clientsMutex sync.Mutex
	// Example camera list for demo purposes
	cameras []*common.Camera
}

// NewAircastServer creates a new server instance
func NewAircastServer() *AircastServer {
	// Initialize with some example cameras
	cameras := []*common.Camera{
		{
			Id:               "cam1",
			Name:             "Front Camera",
			RtspUrl:          "rtsp://example.com/front",
			NetworkInterface: "eth0",
		},
		{
			Id:               "cam2",
			Name:             "Rear Camera",
			RtspUrl:          "rtsp://example.com/rear",
			NetworkInterface: "eth0",
		},
	}

	return &AircastServer{
		clients: make(map[*websocket.Conn]bool),
		cameras: cameras,
	}
}

// HandleConnection manages a WebSocket connection
func (s *AircastServer) HandleConnection(w http.ResponseWriter, r *http.Request) {
	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Error upgrading connection: %v", err)
		return
	}
	defer conn.Close()

	// Register new client
	s.clientsMutex.Lock()
	s.clients[conn] = true
	s.clientsMutex.Unlock()

	// Clean up on disconnect
	defer func() {
		s.clientsMutex.Lock()
		delete(s.clients, conn)
		s.clientsMutex.Unlock()
	}()

	// Send connected event
	deviceId := r.URL.Query().Get("deviceId")
	if deviceId == "" {
		deviceId = "default-device"
	}

	connectedMsg := &aircast.Message{
		MessageId:       uuid.New().String(),
		CorrelationId:   "",
		ProtocolVersion: "1.0",
		Timestamp:       time.Now().UnixMilli(),
		Content: &aircast.Message_ApiDeviceConnected{
			ApiDeviceConnected: &aircast.ApiDeviceConnected{
				DeviceId: deviceId,
			},
		},
	}

	if err := s.sendMessage(conn, connectedMsg); err != nil {
		log.Printf("Error sending connected message: %v", err)
		return
	}

	// Message handling loop
	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		// Parse the message
		msg := &aircast.Message{}
		if err := proto.Unmarshal(message, msg); err != nil {
			log.Printf("Error unmarshaling message: %v", err)
			s.sendErrorMessage(conn, "Failed to parse message", 400, msg.CorrelationId)
			continue
		}

		// Handle the message
		if err := s.handleMessage(conn, msg); err != nil {
			log.Printf("Error handling message: %v", err)
			s.sendErrorMessage(conn, err.Error(), 500, msg.CorrelationId)
		}
	}
}

// handleMessage processes an incoming message
func (s *AircastServer) handleMessage(conn *websocket.Conn, msg *aircast.Message) error {
	log.Printf("Received message type: %T", msg.Content)

	switch content := msg.Content.(type) {
	case *aircast.Message_ClientCameraListRequest:
		return s.handleCameraListRequest(conn, msg.CorrelationId)

	case *aircast.Message_ClientCameraAdd:
		camera := &common.Camera{
			Id:               uuid.New().String(),
			Name:             content.ClientCameraAdd.Name,
			RtspUrl:          content.ClientCameraAdd.RtspUrl,
			NetworkInterface: content.ClientCameraAdd.NetworkInterface,
		}
		s.cameras = append(s.cameras, camera)

		response := &aircast.Message{
			MessageId:       uuid.New().String(),
			CorrelationId:   msg.CorrelationId,
			ProtocolVersion: "1.0",
			Timestamp:       time.Now().UnixMilli(),
			Content: &aircast.Message_DeviceCameraAddSuccess{
				DeviceCameraAddSuccess: &aircast.DeviceCameraAddSuccess{
					Camera: camera,
				},
			},
		}
		return s.sendMessage(conn, response)

	case *aircast.Message_ClientCameraRemove:
		cameraId := content.ClientCameraRemove.CameraId
		found := false

		// Find and remove the camera
		for i, camera := range s.cameras {
			if camera.Id == cameraId {
				// Remove camera from slice
				s.cameras = append(s.cameras[:i], s.cameras[i+1:]...)
				found = true
				break
			}
		}

		if !found {
			response := &aircast.Message{
				MessageId:       uuid.New().String(),
				CorrelationId:   msg.CorrelationId,
				ProtocolVersion: "1.0",
				Timestamp:       time.Now().UnixMilli(),
				Content: &aircast.Message_DeviceCameraRemoveError{
					DeviceCameraRemoveError: &aircast.DeviceCameraRemoveError{
						Error: "Camera not found",
					},
				},
			}
			return s.sendMessage(conn, response)
		}

		response := &aircast.Message{
			MessageId:       uuid.New().String(),
			CorrelationId:   msg.CorrelationId,
			ProtocolVersion: "1.0",
			Timestamp:       time.Now().UnixMilli(),
			Content: &aircast.Message_DeviceCameraRemoveSuccess{
				DeviceCameraRemoveSuccess: &aircast.DeviceCameraRemoveSuccess{
					CameraId: cameraId,
				},
			},
		}
		return s.sendMessage(conn, response)

	case *aircast.Message_ClientStatusRequest:
		// Create dummy service status
		status := &common.ServiceStatus{
			Mavlink: &common.Event{
				Name: "mavlink",
				Type: "service",
			},
			Rtsp: &common.Event{
				Name: "rtsp",
				Type: "service",
			},
			Modem: &common.Event{
				Name: "modem",
				Type: "service",
			},
			Webrtc: &common.Event{
				Name: "webrtc",
				Type: "service",
			},
		}

		response := &aircast.Message{
			MessageId:       uuid.New().String(),
			CorrelationId:   msg.CorrelationId,
			ProtocolVersion: "1.0",
			Timestamp:       time.Now().UnixMilli(),
			Content: &aircast.Message_DeviceStatusResponse{
				DeviceStatusResponse: &aircast.DeviceStatusResponse{
					Status: status,
				},
			},
		}
		return s.sendMessage(conn, response)

	case *aircast.Message_ClientWebrtcSessionStart:
		// Acknowledge WebRTC session start
		response := &aircast.Message{
			MessageId:       uuid.New().String(),
			CorrelationId:   msg.CorrelationId,
			ProtocolVersion: "1.0",
			Timestamp:       time.Now().UnixMilli(),
			Content: &aircast.Message_DeviceWebrtcSessionStarted{
				DeviceWebrtcSessionStarted: &aircast.DeviceWebrtcSessionStarted{},
			},
		}

		if err := s.sendMessage(conn, response); err != nil {
			return err
		}

		// Simulate offering a WebRTC connection
		// In a real implementation, this would involve creating a WebRTC connection
		time.AfterFunc(500*time.Millisecond, func() {
			offerMsg := &aircast.Message{
				MessageId:       uuid.New().String(),
				CorrelationId:   "",
				ProtocolVersion: "1.0",
				Timestamp:       time.Now().UnixMilli(),
				Content: &aircast.Message_DeviceWebrtcOffer{
					DeviceWebrtcOffer: &aircast.DeviceWebrtcOffer{
						Sdp: "v=0\r\no=- 12345 12345 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\n",
					},
				},
			}
			s.sendMessage(conn, offerMsg)
		})

		return nil

	default:
		log.Printf("Unhandled message type: %T", msg.Content)
	}

	return nil
}

// handleCameraListRequest responds with the list of cameras
func (s *AircastServer) handleCameraListRequest(conn *websocket.Conn, correlationId string) error {
	response := &aircast.Message{
		MessageId:       uuid.New().String(),
		CorrelationId:   correlationId,
		ProtocolVersion: "1.0",
		Timestamp:       time.Now().UnixMilli(),
		Content: &aircast.Message_DeviceCameraListResponse{
			DeviceCameraListResponse: &aircast.DeviceCameraListResponse{
				Cameras: s.cameras,
			},
		},
	}

	return s.sendMessage(conn, response)
}

// sendMessage sends a protocol message over the WebSocket connection
func (s *AircastServer) sendMessage(conn *websocket.Conn, msg *aircast.Message) error {
	data, err := proto.Marshal(msg)
	if err != nil {
		return err
	}

	return conn.WriteMessage(websocket.BinaryMessage, data)
}

// sendErrorMessage sends an error message
func (s *AircastServer) sendErrorMessage(conn *websocket.Conn, errorMsg string, code int32, correlationId string) error {
	msg := &aircast.Message{
		MessageId:       uuid.New().String(),
		CorrelationId:   correlationId,
		ProtocolVersion: "1.0",
		Timestamp:       time.Now().UnixMilli(),
		Content: &aircast.Message_Error{
			Error: &aircast.Error{
				Code:    code,
				Message: errorMsg,
			},
		},
	}

	return s.sendMessage(conn, msg)
}

func main() {
	server := NewAircastServer()

	http.HandleFunc("/ws", server.HandleConnection)

	log.Println("Starting Aircast server on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
