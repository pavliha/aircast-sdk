package message

import (
	"context"
	"fmt"
	"reflect"

	"github.com/sirupsen/logrus"
)

// ActionHandler processes an action with the given context, request, and response.
type ActionHandler func(ctx context.Context, req *Request, res *Response) error

// Middleware wraps an ActionHandler for pre- and post-processing.
type Middleware func(ActionHandler) ActionHandler

// Handler stores registered action handlers and global middleware.
type Handler struct {
	routes      map[string]ActionHandler // action name → handler
	middlewares []Middleware             // global middleware stack
	logger      *logrus.Entry
}

// NewHandler creates a new Handler with the given logger.
func NewHandler(logger *logrus.Entry) *Handler {
	return &Handler{
		routes:      make(map[string]ActionHandler),
		middlewares: []Middleware{},
		logger:      logger,
	}
}

// Use adds global middleware to the stack. Middlewares are executed in the order added.
func (h *Handler) Use(mw Middleware) {
	h.middlewares = append(h.middlewares, mw)
}

// Handle registers an action with optional inline middleware and a final ActionHandler.
// The last argument must be an ActionHandler or a convertible function; any preceding
// arguments must be Middleware.
// Global middlewares wrap all registered handlers.
func (h *Handler) Handle(action string, components ...interface{}) {
	if len(components) == 0 {
		panic(fmt.Sprintf("no handler provided for action %s", action))
	}

	// Adapt the final component into an ActionHandler
	var handler ActionHandler
	last := components[len(components)-1]
	switch fn := last.(type) {
	case ActionHandler:
		handler = fn
	default:
		if adapted := h.adaptHandler(fn); adapted != nil {
			handler = adapted
		} else {
			panic(fmt.Sprintf("last component for action %s is not an ActionHandler", action))
		}
	}

	// Apply inline middleware (from left to right)
	for _, comp := range components[:len(components)-1] {
		mw, ok := comp.(Middleware)
		if !ok {
			panic(fmt.Sprintf("component for action %s is not middleware", action))
		}
		handler = mw(handler)
	}

	// Wrap with global middlewares in registration order
	for _, mw := range h.middlewares {
		handler = mw(handler)
	}

	h.routes[action] = handler
}

// GetHandler retrieves the ActionHandler for the given action.
func (h *Handler) GetHandler(action string) (ActionHandler, bool) {
	handler, found := h.routes[action]
	return handler, found
}

// adaptHandler attempts to convert various function signatures into an ActionHandler.
func (h *Handler) adaptHandler(candidate interface{}) ActionHandler {
	// Already the right type?
	if ah, ok := candidate.(ActionHandler); ok {
		return ah
	}

	// Reflection-based adapter for funcs of type func(context.Context, *Request, *Response) error

	typ := reflect.TypeOf(candidate)
	if typ.Kind() == reflect.Func && typ.NumIn() == 3 && typ.NumOut() == 1 {
		if typ.In(0).String() == "context.Context" &&
			typ.In(1).AssignableTo(reflect.TypeOf(&Request{})) &&
			typ.In(2).AssignableTo(reflect.TypeOf(&Response{})) &&
			typ.Out(0).AssignableTo(reflect.TypeOf((*error)(nil)).Elem()) {
			return func(ctx context.Context, req *Request, res *Response) error {
				outs := reflect.ValueOf(candidate).Call([]reflect.Value{
					reflect.ValueOf(ctx),
					reflect.ValueOf(req),
					reflect.ValueOf(res),
				})

				if errVal := outs[0]; !errVal.IsNil() {
					return errVal.Interface().(error)
				}
				return nil
			}
		}

		// Adapter for func() interface{}
		if fn, ok := candidate.(func() interface{}); ok {
			return func(ctx context.Context, req *Request, res *Response) error {
				result := fn()
				return res.SendSuccess(result)
			}
		}

		// Adapter for func() (interface{}, error)
		if fn, ok := candidate.(func() (interface{}, error)); ok {
			return func(ctx context.Context, req *Request, res *Response) error {
				result, err := fn()
				if err != nil {
					return res.SendError(ErrCodeServiceUnavailable, err.Error())
				}
				return res.SendSuccess(result)
			}
		}

		// Adapter for func(any) interface{}
		if fn, ok := candidate.(func(any) interface{}); ok {
			return func(ctx context.Context, req *Request, res *Response) error {
				result := fn(req.Payload)
				return res.SendSuccess(result)
			}
		}

		// Adapter for func(any) (interface{}, error)
		if fn, ok := candidate.(func(any) (interface{}, error)); ok {
			return func(ctx context.Context, req *Request, res *Response) error {
				result, err := fn(req.Payload)
				if err != nil {
					return res.SendError(ErrCodeServiceUnavailable, err.Error())
				}
				return res.SendSuccess(result)
			}
		}

		// Could not adapt
		return nil
	}
	return nil
}
