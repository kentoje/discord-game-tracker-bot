const { GAMETIME_ACTIONS } = require('../store/GameTimeStore/constants')
const { utcDate } = require('../lib/date')
const { v4 } = require('uuid')
const { MESSAGES, GAMES_ALLOWED } = require('./constants')
const { getTimeSpent, getTimeSpentByIds } = require('../database/game')
const { formatMinutes } = require('../lib/date')
const { commandWithArgRegExp, pick } = require('../lib/string')
const { MessageEmbed } = require('discord.js')

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

const idsFromUsernames = (names, client) => names.map((name) => (
  client.users.cache.find((user) => user.username === name)?.id || ''
))

const onMessage = async (msg, gts, client) => {
  if (msg.content === MESSAGES.yo) {
    msg.reply('Yo le sang de la veine !')
    return
  }

  if (msg.content === MESSAGES.state) {
    msg.reply(`State ${JSON.stringify(gts.getState, null, 2)}`)
    return
  }

  if (msg.content.match(commandWithArgRegExp(MESSAGES.timespent))) {
    const ids = msg.content.match(/[0-9]+/gi)

    if (!ids || !ids.length) return

    const res = await getTimeSpentByIds(ids)

    const users = [...new Set(
      await usernamesFromIds(res.map(({ userID }) => userID), client)
    )]

    msg.reply(`Such chads!\n${formatTimeSpent(res, users)}`)
    return
  }

  if (msg.content === MESSAGES.timespent) {
    const res = await getTimeSpent()
    const users = await usernamesFromIds([...new Set(res.map(({ userID }) => userID))], client)
    const gameNames = [...new Set(
      res.map(({ gameName }) => gameName)
    )]

    const groupByGame = res.reduce((accu, { gameName, minutesSpent }) => ({
      ...accu,
      [gameName]: {
        totalMinutes: minutesSpent,
        leaderboard: [...new Set(
          res
            .sort((a, b) => b.minutesSpent - a.minutesSpent)
            .map(({ userID }) => pick('username')(users.find((user) => user.userID === userID)))
        )]
      },
    }), gameNames.reduce((accu, name) => ({ ...accu, [name]: {} }), {}))

    const formattedData = Object
      .entries(groupByGame)
      .map(([name, { totalMinutes }]) => {
        const time = formatMinutes(totalMinutes)
        const value = `${time.hours} hour(s) and ${time.minutes} minute(s) spent on ${name}!`

        return {
          name,
          value,
          inline: true,
        }
      })

    const timespentMessage = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Timespent')
      .setDescription('Some description here')
      .addFields(
        ...formattedData,
      )
      .setTimestamp()

    msg.reply(timespentMessage)
    return
  }

  if (msg.content === MESSAGES.help) {
    const helpMessage = Object
      .values(MESSAGES)
      .reduce((accu, m) => `${accu + m}\n`, 'Only these commands are supported:\n')

    msg.reply(helpMessage)
    return
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
    const gamesToAdd = playingActivities.filter((game) => (
      userStore.every((g) => game.name !== g.gameName)
      && GAMES_ALLOWED.includes(game.name)
    ))

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
