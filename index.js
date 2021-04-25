require('dotenv').config()
const Discord = require('discord.js')
const { GameTimeStore } = require('./store/GameTimeStore')
const { reducer } = require('./store/GameTimeStore/reducer')
const { GAMETIME_ACTIONS } = require('./store/GameTimeStore/constants')
const { utcDate } = require('./lib/date')
const { v4 } = require('uuid')

const gts = new GameTimeStore([], reducer)
const client = new Discord.Client({ ws: { intents: ['GUILDS', 'GUILD_PRESENCES'] } })

client.login(process.env.BOT_TOKEN)

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', (msg) => {
  // add a command to fetch data about players
  if (msg.content === '!yo') {
    msg.reply('Yo le sang !')
  }
})

client.on('presenceUpdate', (_, newMember) => {
  // newMember just started a game
  if (
    newMember.activities.length
    && newMember.activities.some((activity) => activity.type === 'PLAYING')
  ) {
    const game = newMember.activities.find((activity) => activity.type === 'PLAYING')
    console.log(`User ${newMember.userID} started ${game.name}`)

    gts.dispatch({
      type: GAMETIME_ACTIONS.start,
      payload: {
        id: v4(),
        userID: newMember.userID,
        applicationID: game.applicationID,
        gameName: game.name,
        startDate: utcDate(new Date()),
        endDate: null,
      },
    })

    return
  }

  // newMember stopped playing
  if (newMember.activities.every((activity) => activity.type !== 'PLAYING')) {
    gts.dispatch({
      type: GAMETIME_ACTIONS.end,
      payload: {
        userID: newMember.userID,
        endDate: utcDate(new Date())
      }
    })

    gts.getState.forEach((session) => {
      gts.dispatch({
        type: GAMETIME_ACTIONS.save,
        payload: {
          userID: session.userID,
          gameName: session.gameName,
        },
      })
    })
  }
})
