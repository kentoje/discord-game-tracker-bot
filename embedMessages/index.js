const { MessageEmbed } = require('discord.js')
const { TEMPLATE } = require('./constants')

module.exports = (key) => ({
  [TEMPLATE.timespent]: (formattedData) => (
    new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Timespent and TOP 3 players on each game!')
      .addFields(
        ...formattedData,
      )
      .setTimestamp()
  ),
  [TEMPLATE.timespentSingle]: (formatData, formattedData) => (
    new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`${formatData.name}'s personal stats!`)
      .addFields(
        {
          name: 'Player',
          value: formatData.name,
        },
        ...formattedData,
        {
          name: 'Total time',
          value: `${formatData.totalTime.hours} hour(s) and ${formatData.totalTime.minutes} minute(s).`,
        },
      )
      .setTimestamp()
  ),
}[key])