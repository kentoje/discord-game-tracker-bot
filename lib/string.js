const commandWithArgRegExp = (command) => new RegExp(`^${command} <@!\\w+>`)

const pick = (key) => (el) => el[key]

module.exports = {
  commandWithArgRegExp,
  pick,
}
