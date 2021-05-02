const { GAMETIME_ACTIONS } = require('../store/GameTimeStore/constants')
const { utcDate } = require('../lib/date')
const { v4 } = require('uuid')
const { MESSAGES } = require('./constants')
const { getTimeSpent } = require('../database/game')
const { formatMinutes } = require('../lib/date')

const formatTimeSpent = (res, users) => (
  res
    .map(({ userID, gameName, minutesSpent }) => {
      const { hours, minutes } = formatMinutes(minutesSpent)
      const { username } = users.find((user) => user.userID === userID) || ''

      return `${username || 'Unknown user'} played for ${hours} hour(s) and ${minutes} minute(s) on ${gameName}.`
    })
    .reduce((accu, str) => `${accu + str}\n`, '')
)

const usernamesFromIds = (ids, client) => Promise.all(
  ids.map((id) => (
    client.users.fetch(id)
      .then((res) => ({
        userID: id,
        username: res.username,
      }))
      .catch((err) => {
        console.error(err)
      })
  ))
)

const onMessage = async (msg, gts, client) => {
  switch (msg.content) {
    case MESSAGES.yo:
      msg.reply('Yo le sang de la veine !')
      break
    case MESSAGES.state:
      msg.reply(`State ${JSON.stringify(gts.getState, null, 2)}`)
      break
    case MESSAGES.timespent:
      const res = await getTimeSpent()
      const users = [...new Set(
        await usernamesFromIds(res.map(({ userID }) => userID), client)
      )]

      msg.reply(`Such chads!\n${formatTimeSpent(res, users)}`)
      break
    case MESSAGES.help:
      const helpMessage = Object
        .values(MESSAGES)
        .reduce((accu, m) => `${accu + m}\n`, 'Only these commands are supported:\n')

      msg.reply(helpMessage)
      break
    default:
  }
}

const onReady = () => {
  console.log(`Connected!`)
}

const onPresenceUpdate = (newMember, gts) => {
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
}

module.exports = {
  onMessage,
  onReady,
  onPresenceUpdate,
}
