require('dotenv').config()
const Discord = require('discord.js')
const { GameTimeStore } = require('./store/GameTimeStore')
const { reducer } = require('./store/GameTimeStore/reducer')
const { onMessage, onReady, onPresenceUpdate } = require('./actions')
const { scheduledPrint } = require('./cronjob')
const cron = require('node-cron')

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
    onMessage(msg, client)
  })

  client.on('presenceUpdate', (_, newMember) => {
    onPresenceUpdate(newMember, gts)
  })

  cron.schedule('0 9 * * *', () => {
    scheduledPrint(client)
  }, {
    scheduled: true,
    timezone: 'Europe/Paris',
  })
}

run()
