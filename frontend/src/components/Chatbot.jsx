
import { useState } from "react";
import { API } from "../api";
import "../styles/Chatbot.css";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I'm CampusGuard AI Assistant. How can I help you today?",
    },
  ]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMessage },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Chat request failed");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.reply || "I couldn't find an answer.",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Chatbot connection is not ready yet. We'll connect it to the CampusGuard backend next.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div>
              <h3>CampusGuard AI</h3>
              <span>Campus Security Assistant</span>
            </div>
            <button onClick={() => setOpen(false)}>×</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${msg.role}`}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <div className="chat-message assistant">
                Thinking...
              </div>
            )}
          </div>

          <div className="chatbot-input">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Ask about campus security..."
            />
            <button onClick={sendMessage} disabled={loading}>
              Send
            </button>
          </div>
        </div>
      )}

      <button
        className="chatbot-toggle"
        onClick={() => setOpen(!open)}
      >
        {open ? "×" : "💬"}
      </button>
    </div>
  );

}

export default Chatbot;
