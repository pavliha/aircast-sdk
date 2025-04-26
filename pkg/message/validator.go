package message

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/go-playground/validator/v10"
	"reflect"
	"strings"
)

// Global validator instance
var validate = validator.New()

func init() {
	// Use JSON tag names for fields
	validate.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return fld.Name
		}
		return name
	})

	// Register custom validators
	registerCustomValidators()
}

// registerCustomValidators registers any custom validators
func registerCustomValidators() {
	// Example: RTSP URL validator
	err := validate.RegisterValidation("rtsp_url", validateRTSPURL)
	if err != nil {
		return
	}
}

// validateRTSPURL validates an RTSP URL
func validateRTSPURL(fl validator.FieldLevel) bool {
	url := fl.Field().String()
	if url == "" {
		return true
	}
	return strings.HasPrefix(url, "rtsp://") || strings.HasPrefix(url, "rtsps://")
}

// Processor handles request payload processing
type Processor struct{}

// NewProcessor creates a new request processor
func NewProcessor() *Processor {
	return &Processor{}
}

// Process unmarshals and validates a request payload into a struct
func (p *Processor) Process(payload map[string]interface{}, target interface{}) error {
	// Convert payload to JSON bytes for standard unmarshaling
	data, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	// Unmarshal JSON to target struct
	if err := json.Unmarshal(data, target); err != nil {
		return fmt.Errorf("failed to unmarshal payload: %w", err)
	}

	// Validate the struct
	if err := validate.Struct(target); err != nil {
		var validationErrors validator.ValidationErrors
		if errors.As(err, &validationErrors) {
			// Convert to more user-friendly error message
			return formatValidationErrors(validationErrors)
		}
		return err
	}

	return nil
}

// formatValidationErrors converts validation errors to a human-readable format
func formatValidationErrors(errors validator.ValidationErrors) error {
	var errorMessages []string

	for _, err := range errors {
		field := err.Field()
		switch err.Tag() {
		case "required":
			errorMessages = append(errorMessages, fmt.Sprintf("%s is required", field))
		case "email":
			errorMessages = append(errorMessages, fmt.Sprintf("%s must be a valid email", field))
		case "rtsp_url":
			errorMessages = append(errorMessages, fmt.Sprintf("%s must be a valid RTSP URL", field))
		default:
			errorMessages = append(errorMessages, fmt.Sprintf("%s failed validation: %s", field, err.Tag()))
		}
	}

	return fmt.Errorf("validation failed: %s", strings.Join(errorMessages, "; "))
}
