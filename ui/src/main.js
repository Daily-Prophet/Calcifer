const loadingSpanString = `<span id="loading-animation" class="loading loading-dots loading-sm translate-y-2"></span>`;
const messagesCache = [];
const sendButton = document.querySelector("#chat-form button[type='submit']");
const apiEndpoint = "https://calciferwebapp.azurewebsites.net/ask";
// const apiEndpoint = "http://localhost:8000/ask";

function getCurrentDateTime() {
  const now = new Date();
  const timeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: timeZone,
  };
  let dateTimeFormat = new Intl.DateTimeFormat("en-US", options);
  return dateTimeFormat.format(now);
}
document.getElementById("init-agent-datetime").innerHTML = getCurrentDateTime();

function chatBubbleTextContentFormatter(chatBubbleTextContent) {
  return chatBubbleTextContent
    .replace(/\n/g, "<br>")
    .replace(/Summary:/g, "<br><br>Summary:<br>")
    .replace(/Answer:/g, "<br><br>Answer:<br>")
    .replace(/Transferable team:/g, "<br><br>Transferable team:<br>")
    .replace(/Possible Reason:/g, "<br><br>Reason:<br>")
    .replace(/Reason:/g, "<br><br>Reason:<br>")
    .replace(/Next:/g, "<br><br>Next:<br>")
    .replace(/\d+\.\s/g, (match) => `<br><br>${match}`);
}

function clearMessageLoadingStatus(messagId) {
  const chatBubble = document.getElementById(messagId);
  if (chatBubble) {
    chatBubble.innerHTML = chatBubbleTextContentFormatter(
      chatBubble.textContent
    );
  }
  sendButton.disabled = false;
  return chatBubble.innerHTML;
}

function updateStreamingResponse(messagId, chunk) {
  const chatBubble = document.getElementById(messagId);
  const chatContainer = document.getElementById("chat-container");
  if (chatBubble) {
    const formattedContext = chatBubbleTextContentFormatter(
      chatBubble.textContent
    );
    chatBubble.innerHTML = `${formattedContext}${chunk}${loadingSpanString}`;
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}

async function fetchStreamingResponse(query, messageId) {
  messagesCache.push({ role: "user", content: query });
  const response = await fetch(apiEndpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: messagesCache,
    }),
  });
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const responseChunk = decoder.decode(value);
    updateStreamingResponse(messageId, responseChunk);
  }
  const currentAssistantMessage = clearMessageLoadingStatus(messageId);
  messagesCache.push({ role: "assistant", content: currentAssistantMessage });
}

document.addEventListener("DOMContentLoaded", function () {
  const chatForm = document.getElementById("chat-form");
  const inputText = document.getElementById("input-text");
  const chatContainer = document.getElementById("chat-container");

  chatForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (inputText.value.trim()) {
      sendButton.disabled = true;
      addMessage("user", inputText.value);
      const responseMessageId = showWaitingAnimation();
      fetchStreamingResponse(inputText.value, responseMessageId);
      inputText.value = "";
    }
  });

  function addMessage(sender, message) {
    const chatStartOrEnd = sender === "user" ? "chat-end" : "chat-start";
    const bubbleClass = sender === "user" ? "chat-bubble-primary" : "";
    const messageHTML = `
      <div class="chat ${chatStartOrEnd}">
          <div class="chat-header">
            <time class="text-xs opacity-50">${getCurrentDateTime()}</time>
          </div>
          <div class="chat-bubble ${bubbleClass}">${message}</div>
      </div>`;
    chatContainer.insertAdjacentHTML("beforeend", messageHTML);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function showWaitingAnimation() {
    const messageId = Date.now().toString(36);
    const waitingAnimationHTML = `
      <div class="chat chat-start">
          <div class="chat-header">
            <time class="text-xs opacity-50">${getCurrentDateTime()}</time>
          </div>
          <div id="${messageId}" class="chat-bubble">
            ${loadingSpanString}
          </div>
      </div>`;
    chatContainer.insertAdjacentHTML("beforeend", waitingAnimationHTML);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    return messageId;
  }
});
