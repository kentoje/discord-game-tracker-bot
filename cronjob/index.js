const embedMessage = require('../embedMessages')
const { TEMPLATE } = require('../embedMessages/constants')
const { timespentData } = require('../actions')
const { formatMinutes } = require('../lib/date')

const scheduledPrint = async (client) => {
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

  const [id] = [...client.channels.cache.entries()].find(([, channel]) => channel.type === 'text')

  const channel = await client.channels.fetch(id)
  channel.send(embedMessage(TEMPLATE.timespent)(formattedData))
}

module.exports = {
  scheduledPrint,
}
