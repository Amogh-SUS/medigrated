// server/controllers/chatbot/chatbot-controller.js
const Message = require('../../models/Message');

// Minimal rule-based reply for now
const getMockReply = (msg) => {
  const lower = (msg || '').toLowerCase();
  if (!msg || !msg.trim()) return "Please type something.";
  if (lower.includes('fever') || lower.includes('temperature')) {
    return "Fever can be caused by infections or inflammation. Monitor temperature, rest, and consult if >38.5°C or prolonged.";
  }
  if (lower.includes('pain')) {
    return "For pain, please describe location and severity. If severe or sudden, seek immediate care.";
  }
  if (lower.includes('blood') || lower.includes('cbc') || lower.includes('report')) {
    return "Upload your report on the Reports page if you want me to analyze values.";
  }
  return "Thanks — I noted that. I can help summarize reports, suggest next steps, or point you to nearby facilities.";
};

// POST /api/chatbot/message
const postMessage = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.id) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ success: false, message: 'Message is required' });

    // Save user message
    const userMsg = await Message.create({
      userId: user.id,
      sender: 'user',
      text: message,
    });

    // Generate bot reply (swap with LLM later)
    const replyText = getMockReply(message);

    // Save bot message
    const botMsg = await Message.create({
      userId: user.id,
      sender: 'bot',
      text: replyText,
    });

    return res.json({
      success: true,
      reply: replyText,
      userMessage: userMsg,
      botMessage: botMsg
    });
  } catch (err) {
    console.error('chatbot postMessage error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/chatbot/history
const getHistory = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.id) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // fetch messages ordered by createdAt ascending
    const messages = await Message.find({ userId: user.id }).sort({ createdAt: 1 }).lean();
    return res.json({ success: true, messages });
  } catch (err) {
    console.error('chatbot getHistory error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/chatbot/history
const clearHistory = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.id) return res.status(401).json({ success: false, message: 'Unauthorized' });

    await Message.deleteMany({ userId: user.id });
    return res.json({ success: true, message: 'History cleared' });
  } catch (err) {
    console.error('chatbot clearHistory error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  postMessage,
  getHistory,
  clearHistory
};
