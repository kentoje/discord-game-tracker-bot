const commandWithArgRegExp = (command) => new RegExp(`^${command} <@!\\w+>`)

const populateRegex = /\!populate\s+(--\w+\s+(\w|\s?|\.)+)+/gi

const pick = (key) => (el) => el[key]

module.exports = {
  commandWithArgRegExp,
  populateRegex,
  pick,
}
