import SignalingMessage from "./types/SignalingMessage";

// The signaling bot URL - a lightweight service that relays messages through Discord.
// Discord server: 836284645087379466, channel: "turkey"
// For the prototype, this can be a Cloudflare Worker or similar.
// Set this to the deployed bot endpoint.
const SIGNALING_BOT_URL = ''; // TODO: Set after deploying signaling bot

let _pollInterval: ReturnType<typeof setInterval> | null = null;
let _lastMessageId: string | null = null;

type MessageHandler = (message: SignalingMessage) => void;

// Send a signaling message through the bot relay.
// The bot will post it to the Discord channel with metadata for routing.
export async function sendSignalingMessage(message: SignalingMessage): Promise<void> {
  if (SIGNALING_BOT_URL) {
    // Production: send through bot relay
    const response = await fetch(`${SIGNALING_BOT_URL}/signal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    if (!response.ok) throw Error(`Signaling send failed: ${response.status}`);
  } else {
    // Dev fallback: use localStorage for same-machine testing
    const messages = JSON.parse(localStorage.getItem('signaling_messages') ?? '[]');
    messages.push(message);
    localStorage.setItem('signaling_messages', JSON.stringify(messages));
  }
}

// Start polling for signaling messages addressed to this player.
export function startPolling(myDiscordId: string, onMessage: MessageHandler): void {
  if (_pollInterval) return;

  _pollInterval = setInterval(() => {
    if (SIGNALING_BOT_URL) {
      _pollFromBot(myDiscordId, onMessage);
    } else {
      _pollFromLocalStorage(myDiscordId, onMessage);
    }
  }, 1000);
}

export function stopPolling(): void {
  if (_pollInterval) {
    clearInterval(_pollInterval);
    _pollInterval = null;
  }
}

async function _pollFromBot(myDiscordId: string, onMessage: MessageHandler): Promise<void> {
  try {
    const url = `${SIGNALING_BOT_URL}/poll?userId=${myDiscordId}${_lastMessageId ? `&after=${_lastMessageId}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) return;

    const messages: SignalingMessage[] = await response.json();
    for (const msg of messages) {
      if (msg.toId === myDiscordId) {
        onMessage(msg);
      }
    }
  } catch (e) {
    console.warn('Signaling poll error:', e);
  }
}

function _pollFromLocalStorage(myDiscordId: string, onMessage: MessageHandler): void {
  const raw = localStorage.getItem('signaling_messages');
  if (!raw) return;

  const messages: SignalingMessage[] = JSON.parse(raw);
  const myMessages = messages.filter(m => m.toId === myDiscordId);

  // Remove consumed messages
  const remaining = messages.filter(m => m.toId !== myDiscordId);
  localStorage.setItem('signaling_messages', JSON.stringify(remaining));

  for (const msg of myMessages) {
    onMessage(msg);
  }
}
