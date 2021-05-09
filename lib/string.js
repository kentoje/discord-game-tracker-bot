const commandWithArgRegExp = (command) => new RegExp(`^${command} <@!\\w+>`)

const populateRegex = /\!populate\s(?<args>(--\w+\s(.*|\d+)\s?)+)/gi

const pick = (key) => (el) => el[key]

module.exports = {
  commandWithArgRegExp,
  populateRegex,
  pick,
}
