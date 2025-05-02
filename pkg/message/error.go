package message

import "fmt"

// MessageError represents an error that can be sent to the client
type MessageError struct {
	Code ErrorCode
	Err  error
}

// NewError creates a new MessageError
func NewError(code ErrorCode, err error) MessageError {
	return MessageError{
		Code: code,
		Err:  err,
	}
}

// Error implements the error interface
func (e MessageError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %s", e.Code, e.Err.Error())
	}
	return e.Code
}
