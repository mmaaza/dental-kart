# ChatWidget Component

A mobile-first chat widget component built with Radix UI that appears as a floating button at the bottom of the screen and expands into a full chat interface.

## Features

- **Mobile-first design**: Optimized for mobile devices with responsive layout
- **Floating button**: Small chat icon that floats at the bottom-right corner
- **Expandable interface**: Click to expand into a full chat window
- **Real-time typing indicators**: Shows when the other party is typing
- **File attachment support**: Button for attaching files (customizable)
- **File attachment support**: Button for attaching files (customizable)
- **Auto-scroll**: Automatically scrolls to the latest messages
- **Smooth animations**: Smooth transitions and hover effects
- **Accessibility**: Keyboard navigation and screen reader support

## Usage

### Basic Usage

```jsx
import { ChatWidget } from './components/ui';

function App() {
  return (
    <div>
      {/* Your app content */}
      
      <ChatWidget
        title="Customer Support"
        subtitle="We're here to help!"
        onSendMessage={(message) => {
          console.log('Message sent:', message);
          // Handle message sending
        }}
      />
    </div>
  );
}
```

### Advanced Usage with Custom Handlers

```jsx
<ChatWidget
  title="Live Chat"
  subtitle="Get instant help"
  initialMessages={[
    {
      id: 1,
      text: "Hello! How can I help you?",
      isOwn: false,
      timestamp: "10:30 AM"
    }
  ]}
  onSendMessage={(message) => {
    // Send message to your chat service
    sendToChatService(message);
  }}
  onAttachFile={() => {
    // Handle file attachment
    handleFileUpload();
  }}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | "Chat Support" | Title displayed in the chat header |
| `subtitle` | string | "We're here to help!" | Subtitle displayed in the chat header |
| `initialMessages` | array | [] | Array of initial messages to display |
| `onSendMessage` | function | - | Callback when a message is sent |
| `onAttachFile` | function | - | Callback when attach file is clicked |
| `className` | string | - | Additional CSS classes for the button |

## Message Format

Each message in the `initialMessages` array should have this structure:

```jsx
{
  id: number,           // Unique identifier
  text: string,         // Message content
  isOwn: boolean,       // true for user messages, false for others
  timestamp: string     // Time display (e.g., "10:30 AM")
}
```

## Styling

The component uses Tailwind CSS and follows the design system patterns established in the project. The chat widget is fully customizable through:

- **Button styling**: Customize the floating button appearance
- **Chat window**: Modify the chat interface layout and colors
- **Messages**: Customize message bubbles and typography
- **Input area**: Style the message input and action buttons

## Integration

### With Chat Services

To integrate with real chat services (like Intercom, Zendesk, etc.):

```jsx
<ChatWidget
  onSendMessage={(message) => {
    // Send to your chat service
    chatService.sendMessage(message);
  }}
  onAttachFile={() => {
    // Handle file upload to your service
    chatService.uploadFile();
  }}
/>
```

### With Backend API

```jsx
<ChatWidget
  onSendMessage={async (message) => {
    try {
      await api.post('/chat/messages', { message });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }}
/>
```

## Demo

Visit `/chat-demo` to see the chat widget in action with sample messages and interactions.

## Accessibility

- **Keyboard navigation**: Tab through all interactive elements
- **Screen readers**: Proper ARIA labels and roles
- **Focus management**: Automatic focus handling
- **High contrast**: Works with high contrast themes

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- React 18+
- Radix UI Dialog
- Tailwind CSS
- React Icons
- Class Variance Authority

## Customization Examples

### Custom Colors

```jsx
<ChatWidget
  className="bg-green-500 hover:bg-green-600"
  // The chat window will inherit the color scheme
/>
```

### Custom Size

```jsx
<ChatWidget
  className="h-16 w-16" // Larger button
/>
```

### Custom Position

```jsx
<ChatWidget
  className="bottom-8 left-4" // Position on bottom-left
/>
``` 