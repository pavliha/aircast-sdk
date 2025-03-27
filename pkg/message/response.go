package message

// ResponseSender interface for sending responses
type ResponseSender interface {
	SendResponse(req *Request, payload interface{})
	SendError(req *Request, code ErrorCode, msg string)
}

// Response represents a response to be sent back to the client
type Response struct {
	sender  ResponseSender
	request *Request
}

// NewResponse creates a new response for the given request and sender
func NewResponse(req *Request, sender ResponseSender) *Response {
	return &Response{
		sender:  sender,
		request: req,
	}
}

// SendSuccess sends a success response with the given payload
func (r *Response) SendSuccess(payload interface{}) {
	r.sender.SendResponse(r.request, payload)
}

// SendError sends an error response with the given details
func (r *Response) SendError(code ErrorCode, msg string) {
	r.sender.SendError(r.request, code, msg)
}
