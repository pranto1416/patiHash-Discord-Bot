// One-time script to register slash commands with Discord
// Run with:
//   $env:DISCORD_APP_ID="your_app_id"
//   $env:DISCORD_BOT_TOKEN="your_bot_token"
//   node scripts/register.mjs

const APP_ID = process.env.DISCORD_APP_ID
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN

if (!APP_ID || !BOT_TOKEN) {
  console.error('❌ Missing env vars. Run with:')
  console.error('  $env:DISCORD_APP_ID="your_app_id"')
  console.error('  $env:DISCORD_BOT_TOKEN="your_bot_token"')
  console.error('  node scripts/register.mjs')
  process.exit(1)
}

const commands = [
  {
    name: 'ping',
    description: 'Check if patiHash is online',
  },
  {
    name: 'bhai',
    description: 'Get some bhai-level wisdom 🧠',
  },
]

const url = `https://discord.com/api/v10/applications/${APP_ID}/commands`

const res = await fetch(url, {
  method: 'PUT',
  headers: {
    Authorization: `Bot ${BOT_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(commands),
})

if (!res.ok) {
  const err = await res.text()
  console.error('❌ Failed:', res.status, err)
  process.exit(1)
}

const data = await res.json()
console.log('✅ Commands registered:')
data.forEach((cmd) => console.log(` /${cmd.name} — ${cmd.description}`))
