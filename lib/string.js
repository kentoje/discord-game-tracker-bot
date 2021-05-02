const commandWithArgRegExp = (command) => new RegExp(`^${command} (\\w+){1}`)

module.exports = {
  commandWithArgRegExp,
}
