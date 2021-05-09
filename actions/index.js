const { GAMETIME_ACTIONS } = require('../store/GameTimeStore/constants')
const { utcDate } = require('../lib/date')
const { v4 } = require('uuid')
const { MESSAGES, GAMES_ALLOWED } = require('./constants')
const { getTimeSpent, getTimeSpentByIds, populate } = require('../database/game')
const { formatMinutes } = require('../lib/date')
const { commandWithArgRegExp, populateRegex, pick } = require('../lib/string')
const embedMessage = require('../embedMessages')
const { TEMPLATE } = require('../embedMessages/constants')

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

const timespentData = async (client) => {
  const res = await getTimeSpent()
  const users = await usernamesFromIds([...new Set(res.map(({ userID }) => userID))], client)
  const gameNames = [...new Set(
    res.map(({ gameName }) => gameName)
  )]
  const totalTime = formatMinutes(
    res
      .map(({ minutesSpent }) => minutesSpent)
      .reduce((accu, n) => accu + n, 0)
  )

  const groupByGame = res.reduce((accu, { gameName, minutesSpent }) => ({
    ...accu,
    [gameName]: {
      totalMinutes: accu[gameName].totalMinutes + minutesSpent,
      leaderboard: [...new Set(
        res
          .filter((game) => game.gameName === gameName)
          .sort((a, b) => b.minutesSpent - a.minutesSpent)
          .map(({ userID }) => pick('username')(users.find((user) => user.userID === userID)))
      )]
    },
  }), gameNames.reduce((accu, name) => ({ ...accu, [name]: { totalMinutes: 0 } }), {}))

  return {
    totalTime,
    groupByGame,
  }
}

const onMessage = async (msg, client) => {
  if (msg.content === MESSAGES.yo.name) {
    msg.reply('Yo le sang de la veine !')
    return
  }

  if (msg.content.match(populateRegex)) {
    const exec = populateRegex.exec(msg.content)
    const obj = exec
      .groups
      .args
      .split('--')
      .filter(Boolean)
      .map((str) => str.trim().split(' '))
      .reduce((accu, [key, value]) => (
        { ...accu, [key]: key === 'minutes' ? Number(value) : value.replace('_', ' ') }
      ), {})

    if (!GAMES_ALLOWED.includes(obj.game)) {
      msg.reply(`The given game "${obj.game}" is not allowed... Allowed games are: ${GAMES_ALLOWED.reduce((accu, s) => accu + `${s}\n`, '\n')}`)
      return
    }

    const isValide = Object
      .values(obj)
      .every(Boolean)

    if (!isValide) return

    const populateMessage = await populate(obj)
      ? `Added ${JSON.stringify(obj, null, 2)}`
      : `Could not add the object to the database. An error occurred...`

    msg.reply(populateMessage)
    return
  }

  if (msg.content.match(commandWithArgRegExp(MESSAGES.timespent.name))) {
    const ids = msg.content.match(/[0-9]+/gi)

    if (!ids || !ids.length) return

    const res = await getTimeSpentByIds(ids)

    if (!res || !res.length) return

    const users = [...new Set(
      await usernamesFromIds(res.map(({ userID }) => userID), client)
    )]

    const [user] = users.slice(0, 1)
    const userGames = res.filter((game) => game.userID === user.userID)

    const formatData = {
      name: user.username,
      totalTime: formatMinutes(userGames.reduce((accu, { minutesSpent }) => accu + minutesSpent, 0)),
      timeOnGames: userGames.reduce((accu, { gameName, minutesSpent }) => (
        {
          ...accu,
          [gameName]: formatMinutes(minutesSpent),
        }
      ), userGames.reduce((accu, { gameName }) => ({ ...accu, [gameName]: {} }), {}))
    }

    const formattedData = Object
      .entries(formatData.timeOnGames)
      .map(([name, time]) => {
        const value = `${time.hours} hour(s) and ${time.minutes} minute(s).`

        return {
          name,
          value,
          inline: true,
        }
      })

    msg.reply(embedMessage(TEMPLATE.timespentSingle)(formatData, formattedData))
    return
  }

  if (msg.content === MESSAGES.timespent.name) {
    const { groupByGame, totalTime } = await timespentData(client)

    const formattedTime = Object
      .entries(groupByGame)
      .map(([name, { totalMinutes }]) => {
        const time = formatMinutes(totalMinutes)
        const value = `${time.hours} hour(s) and ${time.minutes} minute(s).`

        return {
          name,
          value,
          inline: true,
        }
      })

    const formattedLeaderboard = Object
      .entries(groupByGame)
      .map(([name, { leaderboard }]) => {
        const limitLeaderboard = leaderboard > 3
          ? leaderboard.slice(0, 3)
          : leaderboard
        const value = limitLeaderboard.reduce((accu, name, index) => (
          accu + `${index + 1}. ${name}\n`
        ), '')

        return {
          name,
          value,
          inline: true,
        }
      })

    const formattedData = [
      { name: 'Global time spent!', value: `${totalTime.hours} hour(s) and ${totalTime.minutes} minute(s).` },
      ...formattedTime,
      ...formattedLeaderboard,
    ]

    msg.reply(embedMessage(TEMPLATE.timespent)(formattedData))
    return
  }

  if (msg.content === MESSAGES.help.name) {
    const helpMessage = Object
      .values(MESSAGES)
      .reduce((accu, m) => m.show ? `${accu + m.name}: ${m.description}\n` : accu,
      'Only these commands are supported:\n')

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
  timespentData,
}
