require('dotenv').config()
const Discord = require('discord.js')
const { GameTimeStore } = require('./store/GameTimeStore')
const { reducer } = require('./store/GameTimeStore/reducer')

const gts = new GameTimeStore([], reducer)
const client = new Discord.Client({ ws: { intents: ['GUILDS', 'GUILD_PRESENCES'] } })

client.login(process.env.BOT_TOKEN)

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', (msg) => {
  // console.log('msg ->', JSON.stringify(msg, null, 2));

  if (msg.content === '!yo') {
    msg.reply('Yo le sang !')
  }
})

client.on('presenceUpdate', (oldMember, newMember) => {
  // newMember stars playing a game
  if (
    newMember.activities.length
    && newMember.activities.type === 'PLAYING'
  ) {
    console.log('yo');
  }
})
