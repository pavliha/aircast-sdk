package message

import (
	"fmt"
	"strings"

	"github.com/davecgh/go-spew/spew"
)

type PrintConfig struct {
	ShowPayload bool
}

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
func Print(msg GenericMessage, config *PrintConfig) {
	// Get message info
	var msgType, action, source, channelID string
	var payload any

	if config == nil {
		return
	}

	switch m := msg.(type) {
	case EventMessage:
		msgType = "EVENT"
		action = m.Action
		source = m.Source
		channelID = m.ChannelID
		payload = m.Payload
	case RequestMessage:
		msgType = "REQUEST"
		action = m.Action
		source = m.Source
		channelID = m.ChannelID
		payload = m.Payload
	case ResponseMessage:
		msgType = "RESPONSE"
		action = m.Action
		source = m.Source
		channelID = m.ChannelID
		payload = m.Payload
	case ErrorMessage:
		msgType = "ERROR"
		action = m.Action
		source = m.Source
		channelID = m.ChannelID
		payload = m.Error
	default:
		msgType = "UNKNOWN"
		fmt.Printf("%s%sUNKNOWN MESSAGE TYPE - DUMPING FULL CONTENT:%s\n", Bold, Red, Reset)
		spew.Dump(msg)
	}

	// Print header line
	fmt.Printf("%s%s %s%s %s %s%s\n",
		White, Reset,
		BgMagenta+White, msgType, Reset,
		Bold, action)

	// Print source and session if available
	if source != "" {
		fmt.Printf("  %sSource:%s %s%s%s\n",
			Green, Reset,
			Blue, source, Reset)
	}

	if channelID != "" {
		fmt.Printf("  %sSessionID:%s %s%s%s\n",
			Cyan, Reset,
			Cyan, channelID, Reset)
	}

	// Print payload only if it exists and is not empty
	if config.ShowPayload && hasContent(payload) {
		fmt.Printf("  %sPayload:%s\n", Yellow, Reset)
		printPayload(payload)
	}

	// Add a separator
	fmt.Println(strings.Repeat("-", 50))
}

// hasContent checks if the payload has any content worth displaying
func hasContent(payload any) bool {
	if payload == nil {
		return false
	}

	switch p := payload.(type) {
	case map[string]any:
		return len(p) > 0
	case string:
		return p != ""
	case []any:
		return len(p) > 0
	default:
		// For other types, assume they have content
		return true
	}
}

// printPayload pretty prints a payload
func printPayload(payload any) {
	if payload == nil {
		return
	}

	switch p := payload.(type) {
	case map[string]any:
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
