require('dotenv').config()
const Discord = require('discord.js')
const { GameTimeStore } = require('./store/GameTimeStore')
const { reducer } = require('./store/GameTimeStore/reducer')
const { onMessage, onReady, onPresenceUpdate } = require('./actions')

const gts = new GameTimeStore([], reducer)
const client = new Discord.Client({
  ws: {
    intents:[
      'GUILDS',
      'GUILD_PRESENCES',
      'GUILD_MESSAGES',
    ]
  }
})

const run = () => {
  client.login(process.env.BOT_TOKEN)

  client.on('ready', onReady)

  client.on('message', (msg) => {
    onMessage(msg, gts)
  })

  client.on('presenceUpdate', (_, newMember) => {
    onPresenceUpdate(newMember, gts)
  })
}

run()
