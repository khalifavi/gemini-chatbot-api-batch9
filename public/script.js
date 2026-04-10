const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// This array will hold the entire conversation history
const conversation = [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Add user message to UI and conversation history
  appendMessage('user', userMessage);
  conversation.push({ role: 'user', text: userMessage });
  input.value = '';

  // Add a temporary "Thinking..." message
  const thinkingMessage = appendMessage('model', 'Thinking...');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from server.');
    }

    const data = await response.json();

    if (data && data.result) {
      // Update the "Thinking..." message with the actual response
      thinkingMessage.textContent = data.result;
      // Add the model's response to the conversation history
      conversation.push({ role: 'model', text: data.result });
    } else {
      thinkingMessage.textContent = 'Sorry, no response received.';
    }
  } catch (error) {
    console.error('Error:', error);
    thinkingMessage.textContent = 'Failed to get response from server.';
  }
});

/**
 * Appends a message to the chat box.
 * @param {string} role - The role of the sender ('user' or 'model').
 * @param {string} text - The message text.
 * @returns {HTMLElement} The created message element.
 */
function appendMessage(role, text) {
  const msg = document.createElement('div');
  // In the HTML, the bot's role is 'model' for the API, but we can use 'bot' for styling
  const senderClass = role === 'model' ? 'bot' : 'user';
  msg.classList.add('message', senderClass);
  msg.textContent = text;
  chatBox.appendChild(msg);
  // Scroll to the bottom of the chat box
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}
