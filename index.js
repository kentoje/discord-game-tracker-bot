require('dotenv').config()
const Discord = require('discord.js')
const { GameTimeStore } = require('./store/GameTimeStore')
const { reducer } = require('./store/GameTimeStore/reducer')
const { GAMETIME_ACTIONS } = require('./store/GameTimeStore/constants')
const { utcDate } = require('./lib/date')
const { v4 } = require('uuid')

const gts = new GameTimeStore([], reducer)
const client = new Discord.Client({ ws: { intents: [
  'GUILDS',
  'GUILD_PRESENCES',
  'GUILD_MESSAGES',
] } })

client.login(process.env.BOT_TOKEN)

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', (msg) => {
  // add a command to fetch data about players
  if (msg.content === '!yo') {
    msg.reply('Yo le sang !')
  }

  if (msg.content === '!state') {
    msg.reply(`State ${JSON.stringify(gts.getState, null, 2)}`)
  }
})

client.on('presenceUpdate', (_, newMember) => {
  // newMember just started a game
  if (newMember.activities.length) {
    const userStore = gts.getState.filter((session) => session.userID === newMember.userID)
    const playingActivities = newMember.activities.filter((activity) => activity.type === 'PLAYING')
    const gamesToAdd = playingActivities.filter((game) => userStore.every((g) => game.name !== g.gameName))

    gamesToAdd.forEach((game) => {
      gts.dispatch({
        type: GAMETIME_ACTIONS.start,
        payload: {
          id: v4(),
          userID: newMember.userID,
          gameName: game.name,
          startDate: utcDate(new Date()),
          endDate: null,
        },
      })
    })

    const reduceOrphans = userStore.reduce((accu, game) => {
      const exists = newMember.activities.some((g) => game.gameName === g.name)

      return exists
        ? {
          ...accu,
          notOrphans: Object.keys(accu).some((k) => k === 'notOrphans')
            ? [...accu.notOrphans, game.id]
            : [game.id]
        }
        : {
          ...accu,
          orphans: Object.keys(accu).some((k) => k === 'orphans')
            ? [...accu.orphans, game.id]
            : [game.id]
        }
    }, { orphans: [], notOrphans: [] })

    reduceOrphans.orphans
      .map((id) => userStore.find((game) => id === game.id))
      .forEach((g) => {
        gts.dispatch({
          type: GAMETIME_ACTIONS.end,
          payload: {
            userID: g.userID,
            endDate: utcDate(new Date())
          }
        })

        gts.dispatch({
          type: GAMETIME_ACTIONS.save,
          payload: {
            userID: g.userID,
            gameName: g.gameName,
          },
        })
      })
  }

  // user does not play at all
  if (newMember.activities.every((activity) => activity.type !== 'PLAYING')) {
    const userStore = gts.getState.filter((game) => game.userID === newMember.userID)

    if (!userStore.length) return

    userStore.forEach((g) => {
      gts.dispatch({
        type: GAMETIME_ACTIONS.end,
        payload: {
          userID: g.userID,
          endDate: utcDate(new Date())
        }
      })

      gts.dispatch({
        type: GAMETIME_ACTIONS.save,
        payload: {
          userID: g.userID,
          gameName: g.gameName,
        },
      })
    })
  }
})
