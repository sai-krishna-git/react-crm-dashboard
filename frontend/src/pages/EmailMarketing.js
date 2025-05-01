import { useState } from "react";
import "./EmailMarketing.css"; // Import CSS file

const EmailMarketing = () => {
  const [emails, setEmails] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(false);

  // Validate email format
  const validateEmails = (emailList) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailList.every(email => emailRegex.test(email));
  };

  // Function to analyze sentiment
  const analyzeSentiment = async () => {
    if (!message.trim()) {
      alert("❌ Please enter a message before analyzing sentiment.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5001/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message }),
      });

      const result = await response.json();
      setSentiment(result);
    } catch (error) {
      console.error("❌ Sentiment Analysis Failed:", error);
      alert("❌ Failed to analyze sentiment.");
    }
  };

  // Function to send the email
  const sendEmail = async () => {
    const emailList = emails
      .split(",")
      .map(email => email.trim())
      .filter(email => email !== "");

    if (emailList.length === 0 || !subject.trim() || !message.trim()) {
      alert("❌ All fields are required!");
      return;
    }

    if (!validateEmails(emailList)) {
      alert("❌ Invalid email format. Please check the recipient emails.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/email/send-marketing-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients: emailList, subject, message }),
      });

      const result = await response.json();
      if (response.ok) {
        alert(`✅ ${result.message}`);
        setEmails("");
        setSubject("");
        setMessage("");
        setSentiment(null); // Reset sentiment analysis result
      } else {
        alert(`❌ ${result.error || "Failed to send email"}`);
      }
    } catch (error) {
      console.error("❌ Error sending email:", error);
      alert("❌ Network error or server is down.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-container">
      <h2>Email Marketing</h2>
      <input 
        type="text" 
        placeholder="Recipient Emails (comma-separated)" 
        value={emails}
        onChange={(e) => setEmails(e.target.value)} 
        className="email-input"
      />
      <input 
        type="text" 
        placeholder="Subject" 
        value={subject}
        onChange={(e) => setSubject(e.target.value)} 
        className="email-input"
      />
      <textarea 
        placeholder="Message" 
        value={message}
        onChange={(e) => setMessage(e.target.value)} 
        className="email-textarea"
      />
      
      <button onClick={analyzeSentiment} className="analyze-button">
        Analyze Sentiment
      </button>

      {sentiment && (
        <div className="sentiment-result">
          <h3>Sentiment Analysis Result:</h3>
          <p>Positive: {sentiment.pos.toFixed(2)}</p>
          <p>Neutral: {sentiment.neu.toFixed(2)}</p>
          <p>Negative: {sentiment.neg.toFixed(2)}</p>
          <p>Overall Score: {sentiment.compound.toFixed(2)}</p>
        </div>
      )}

      <button onClick={sendEmail} disabled={loading} className="send-button">
        {loading ? "Sending..." : "Send Email"}
      </button>
    </div>
  );
};

export default EmailMarketing;
