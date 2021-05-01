const secondsDiff = (end, start) => Math.abs(Math.round((end.getTime() - start.getTime()) / 1000))

const minutesDiff = (end, start) => Math.abs(Math.round((end.getTime() - start.getTime()) / 1000 / 60))

const utcDate = (date) => new Date(date.toISOString())

const formatMinutes = (time) => {
  const hours = time / 60
  const minutes = (hours - Math.floor(hours)) * 60

  return {
    hours: Math.floor(hours),
    minutes: Math.round(minutes)
  }
}

module.exports = {
  secondsDiff,
  utcDate,
  formatMinutes,
  minutesDiff,
}
