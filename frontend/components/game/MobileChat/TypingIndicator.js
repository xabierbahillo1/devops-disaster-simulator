import ContactAvatar from './ContactAvatar';

export default function TypingIndicator() {
  return (
    <div className="chat-typing">
      <ContactAvatar />
      <div className="chat-typing-bubble">
        <div className="chat-typing-dot" />
        <div className="chat-typing-dot" />
        <div className="chat-typing-dot" />
      </div>
    </div>
  );
}
