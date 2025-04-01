package message

import (
	"context"
	"fmt"
	"github.com/sirupsen/logrus"
	"reflect"
)

// ActionHandler is a function that processes an action with the given context, request and response
type ActionHandler func(ctx context.Context, req *Request, res *Response)

// Middleware is a function that wraps an ActionHandler and can perform pre- / post-processing
type Middleware func(ActionHandler) ActionHandler

// Handler stores registered action handlers
type Handler struct {
	handlers map[string]ActionHandler
	logger   *logrus.Entry
}

// NewHandler creates a new action registry
func NewHandler(logger *logrus.Entry) *Handler {
	return &Handler{
		handlers: make(map[string]ActionHandler),
		logger:   logger,
	}
}

// Handle registers an action with handlers and optional middleware
func (r *Handler) Handle(action string, handlers ...interface{}) {
	// The last handler must be the actual ActionHandler
	if len(handlers) == 0 {
		panic(fmt.Sprintf("No handlers provided for action %s", action))
	}

	// Handle the simple case: Handle(ActionNetworkStatusGet, handler)
	if len(handlers) == 1 {
		handler, ok := handlers[0].(ActionHandler)
		if !ok {
			// Try to adapt the function if it's not exactly an ActionHandler
			if adaptedHandler := r.adaptHandler(handlers[0]); adaptedHandler != nil {
				r.handlers[action] = adaptedHandler
				return
			}
			panic(fmt.Sprintf("Handler for action %s is not an ActionHandler", action))
		}
		r.handlers[action] = handler
		return
	}

	// Handle the middleware case
	finalHandler, ok := handlers[len(handlers)-1].(ActionHandler)
	if !ok {
		// Try to adapt the handler
		if adaptedHandler := r.adaptHandler(handlers[len(handlers)-1]); adaptedHandler != nil {
			finalHandler = adaptedHandler
		} else {
			panic(fmt.Sprintf("Last handler for action %s is not an ActionHandler", action))
		}
	}

	// Apply middleware in reverse order (so the first middleware is the outermost)
	// All items except the last one should be middleware
	for i := len(handlers) - 2; i >= 0; i-- {
		middleware, ok := handlers[i].(Middleware)
		if !ok {
			panic(fmt.Sprintf("Handler at position %d for action %s is not a Middleware", i, action))
		}
		finalHandler = middleware(finalHandler)
	}

	// Handle the handler with the action
	r.handlers[action] = finalHandler
}

// GetHandler returns the handler for the given action
func (r *Handler) GetHandler(action string) (ActionHandler, bool) {
	handler, exists := r.handlers[action]
	return handler, exists
}

// adaptHandler tries to convert different handler types to ActionHandler
func (r *Handler) adaptHandler(handler interface{}) ActionHandler {
	// If it's already an ActionHandler, return it
	if ah, ok := handler.(ActionHandler); ok {
		return ah
	}

	// Use reflection to check if it's a method with the right signature
	handlerType := reflect.TypeOf(handler)
	if handlerType.Kind() == reflect.Func && handlerType.NumIn() == 3 {
		// Check if the parameter types match what we expect
		if handlerType.In(0).String() == "context.Context" &&
			handlerType.In(1).AssignableTo(reflect.TypeOf(&Request{})) &&
			handlerType.In(2).AssignableTo(reflect.TypeOf(&Response{})) {

			// Create a function that calls the method with the right signature
			return func(ctx context.Context, req *Request, res *Response) {
				reflect.ValueOf(handler).Call([]reflect.Value{
					reflect.ValueOf(ctx),
					reflect.ValueOf(req),
					reflect.ValueOf(res),
				})
			}
		}
	}

	// Handle simple function with no parameters that returns an interface{}
	if fn, ok := handler.(func() interface{}); ok {
		return func(ctx context.Context, req *Request, res *Response) {
			result := fn()
			res.SendSuccess(result)
		}
	}

	// Handle function that returns (interface{}, error)
	if fn, ok := handler.(func() (interface{}, error)); ok {
		return func(ctx context.Context, req *Request, res *Response) {
			result, err := fn()
			if err != nil {
				res.SendError(ErrServiceUnavailable, err.Error())
				return
			}
			res.SendSuccess(result)
		}
	}

	// Handle function that takes a payload and returns an interface{}
	if fn, ok := handler.(func(any) interface{}); ok {
		return func(ctx context.Context, req *Request, res *Response) {
			// Get payload from context, might be nil
			payload := req.Payload
			result := fn(payload)
			res.SendSuccess(result)
		}
	}

	// Handle function that takes a payload and returns (interface{}, error)
	if fn, ok := handler.(func(any) (interface{}, error)); ok {
		return func(ctx context.Context, req *Request, res *Response) {
			// Get payload from context, might be nil
			payload := req.Payload
			result, err := fn(payload)
			if err != nil {
				res.SendError(ErrServiceUnavailable, err.Error())
				return
			}
			res.SendSuccess(result)
		}
	}

	// Could not adapt the handler
	return nil
}
