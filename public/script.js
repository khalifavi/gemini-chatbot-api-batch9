const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

// This array will hold the entire conversation history
const conversation = [];

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Add user message to UI and conversation history
  appendMessage("user", userMessage);
  conversation.push({ role: "user", text: userMessage });
  input.value = "";

  // Add a temporary "Thinking..." message
  const thinkingMessage = appendMessage(
    "model",
    "Sedang memikirkan menu sehat...",
  );

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ conversation }),
    });

    if (!response.ok) {
      throw new Error("Gagal mendapatkan respon dari server.");
    }

    const data = await response.json();

    if (data && data.result) {
      // Update the "Thinking..." message with the actual response
      // We use innerHTML and marked for better presentation of meal plans/recipes
      thinkingMessage.classList.remove("thinking");
      thinkingMessage.innerHTML = marked.parse(data.result);
      // Add the model's response to the conversation history
      conversation.push({ role: "model", text: data.result });
    } else {
      thinkingMessage.classList.remove("thinking");
      thinkingMessage.textContent = "Maaf, tidak ada respon yang diterima.";
    }
  } catch (error) {
    console.error("Error:", error);
    thinkingMessage.classList.remove("thinking");
    thinkingMessage.textContent =
      "Gagal terhubung ke server Konsul Masak Makan.";
  }
});

/**
 * Appends a message to the chat box.
 * @param {string} role - The role of the sender ('user' or 'model').
 * @param {string} text - The message text.
 * @returns {HTMLElement} The created message element.
 */
function appendMessage(role, text) {
  const msg = document.createElement("div");

  // We map the role to our KMM CSS classes
  const senderClass = role === "model" ? "bot-message" : "user-message";
  msg.classList.add("message", senderClass);

  if (role === "model" && text.includes("Sedang memikirkan")) {
    msg.classList.add("thinking");
    msg.textContent = text;
  } else if (role === "model") {
    msg.innerHTML = marked.parse(text);
  } else {
    msg.textContent = text;
  }

  chatBox.appendChild(msg);
  // Scroll to the bottom of the chat box
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}
