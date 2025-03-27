package message

import (
	"fmt"
	"strings"
)

// ANSI color codes
const (
	Reset     = "\033[0m"
	Bold      = "\033[1m"
	Red       = "\033[31m"
	Green     = "\033[32m"
	Yellow    = "\033[33m"
	Blue      = "\033[34m"
	Magenta   = "\033[35m"
	Cyan      = "\033[36m"
	White     = "\033[37m"
	BgMagenta = "\033[45m"
)

// Print prints a formatted colored message to stdout
func Print(label string, msg GenericMessage) {
	// Get message info
	var msgType, action, source, sessionID string

	switch m := msg.(type) {
	case EventMessage:
		msgType = "EVENT"
		action = string(m.Action)
		source = string(m.Source)
		sessionID = string(m.SessionID)
	case RequestMessage:
		msgType = "REQUEST"
		action = string(m.Action)
		source = string(m.Source)
		sessionID = string(m.SessionID)
	case ResponseMessage:
		msgType = "RESPONSE"
		action = string(m.Action)
		source = string(m.Source)
		sessionID = string(m.SessionID)
	case ErrorMessage:
		msgType = "ERROR"
		action = string(m.Action)
		source = string(m.Source)
		sessionID = string(m.SessionID)
	default:
		msgType = "UNKNOWN"
	}

	// Print header line
	fmt.Printf("%s[%s]%s %s%s %s %s%s\n",
		White, label, Reset,
		BgMagenta+White, msgType, Reset,
		Bold, action)

	// Print source and session if available
	if source != "" {
		fmt.Printf("  %sSource:%s %s%s%s\n",
			Green, Reset,
			Blue, source, Reset)
	}

	if sessionID != "" {
		fmt.Printf("  %sSessionID:%s %s%s%s\n",
			Cyan, Reset,
			Cyan, sessionID, Reset)
	}

	// Print payload if it exists
	switch m := msg.(type) {
	case EventMessage:
		fmt.Printf("  %sPayload:%s\n", Yellow, Reset)
		printPayload(m.Payload)
	case RequestMessage:
		fmt.Printf("  %sPayload:%s\n", Yellow, Reset)
		printPayload(m.Payload)
	case ResponseMessage:
		fmt.Printf("  %sPayload:%s\n", Yellow, Reset)
		printPayload(m.Payload)
	}

	// Add a separator
	fmt.Println(strings.Repeat("-", 50))
}

// printPayload pretty prints a payload
func printPayload(payload interface{}) {
	if payload == nil {
		return
	}

	switch p := payload.(type) {
	case map[string]interface{}:
		for k, v := range p {
			// Print key-value pairs
			fmt.Printf("    %s%s:%s %v\n",
				Bold+Blue, k, Reset,
				v)
		}
	default:
		// Just print the value
		fmt.Printf("    %v\n", payload)
	}
}
