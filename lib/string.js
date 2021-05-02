const commandWithArgRegExp = (command) => new RegExp(`^${command} <@!\\w+>`)

module.exports = {
  commandWithArgRegExp,
}
