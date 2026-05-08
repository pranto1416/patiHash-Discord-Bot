import { Hono } from 'hono'
import { InteractionType, InteractionResponseType } from 'discord-interactions'

type Bindings = {
  DISCORD_PUBLIC_KEY: string
}

// ─── Web Crypto Ed25519 verifier (Workers-compatible) ───────────────────────
function hexToUint8Array(hex: string): Uint8Array {
  const pairs = hex.match(/[\dA-Fa-f]{2}/g) ?? []
  return new Uint8Array(pairs.map((b) => parseInt(b, 16)))
}

async function verifyDiscordSignature(
  publicKey: string,
  signature: string,
  timestamp: string,
  body: string
): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      hexToUint8Array(publicKey),
      { name: 'Ed25519' },
      false,
      ['verify']
    )
    const message = new TextEncoder().encode(timestamp + body)
    return await crypto.subtle.verify(
      'Ed25519',
      key,
      hexToUint8Array(signature),
      message
    )
  } catch {
    return false
  }
}
// ─────────────────────────────────────────────────────────────────────────────

const app = new Hono<{ Bindings: Bindings }>()

app.post('/', async (c) => {
  const signature = c.req.header('x-signature-ed25519')
  const timestamp = c.req.header('x-signature-timestamp')

  if (!signature || !timestamp) {
    return c.text('Missing signature', 401)
  }

  const body = await c.req.text()

  const isValid = await verifyDiscordSignature(
    c.env.DISCORD_PUBLIC_KEY,
    signature,
    timestamp,
    body
  )

  if (!isValid) {
    return c.text('Invalid request signature', 401)
  }

  const interaction = JSON.parse(body)

  // Discord PING handshake
  if (interaction.type === InteractionType.PING) {
    return c.json({ type: InteractionResponseType.PONG })
  }

  // Slash commands
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const commandName = interaction.data.name

    if (commandName === 'ping') {
      return c.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: '🏓 patiHash online.' },
      })
    }

    if (commandName === 'bhai') {
      const lines = [
        'Deploy kore dua poren.',
        'Deadline mane suggestion.',
        'Trust the process bhai.',
        'Production e test korben na 💀',
      ]
      return c.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: lines[Math.floor(Math.random() * lines.length)],
        },
      })
    }
  }

  return c.text('Unknown command')
})

export default app
