const { MessageEmbed } = require('discord.js')
const { TEMPLATE } = require('./constants')

module.exports = (key) => ({
  [TEMPLATE.timespent]: (formattedData) => (
    new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Global stats!')
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
        { name: '\u200B', value: '\u200B' },
        ...formattedData,
        { name: '\u200B', value: '\u200B' },
        {
          name: 'Total time',
          value: `${formatData.totalTime.hours} hour(s) and ${formatData.totalTime.minutes} minute(s) spent!`,
        },
      )
      .setTimestamp()
  ),
}[key])
