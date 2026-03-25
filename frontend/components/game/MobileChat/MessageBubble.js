import ContactAvatar from './ContactAvatar';

export default function MessageBubble({ msg }) {
  const isUser = msg.from === 'user';

  return (
    <div className={`chat-message-row chat-message-row--${isUser ? 'user' : 'ai'}`}>
      {!isUser && (
        <div className="chat-avatar-wrap">
          <ContactAvatar />
        </div>
      )}
      <div className={`chat-bubble chat-bubble--${isUser ? 'user' : 'ai'}`}>
        {msg.text}
        <div className="chat-bubble-time">{msg.time}</div>
      </div>
    </div>
  );
}
