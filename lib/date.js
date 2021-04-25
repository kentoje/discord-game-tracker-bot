const secondsDiff = (end, start) => Math.abs(Math.round((end.getTime() - start.getTime()) / 1000))

const utcDate = (date) => new Date(date.toISOString())

module.exports = {
  secondsDiff,
  utcDate,
}
