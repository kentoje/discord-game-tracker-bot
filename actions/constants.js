const MESSAGE_YO = '!yo'
const MESSAGE_HELP = '!help'
const MESSAGE_TIMESPENT = '!timespent'
const MESSAGE_TIMESPENT_GLOBAL = '!timespent_global'
const MESSAGE_POPULATE = '!populate'

const MESSAGES = {
  yo: {
    name: MESSAGE_YO,
    description: 'greeting!',
    show: true,
  },
  help: {
    name: MESSAGE_HELP,
    description: 'displays every commands.',
    show: true,
  },
  timespent: {
    name: MESSAGE_TIMESPENT,
    description: `\n\t"!timespent", displays current user's statistics.\n\t"!timespent @Macron", displays Macron's statistics, if he exists on the current server.`,
    show: true,
  },
  timespentGlobal: {
    name: MESSAGE_TIMESPENT_GLOBAL,
    description: `displays global statistics.`,
    show: true,
  },
  populate: {
    name: MESSAGE_POPULATE,
    description: `"!populate --game Battlerite Royale --user 123 --minutes 60", adds 60 minutes of game time for the given user on the given game. You have to specify an allowed game.`,
    show: false,
  },
}

const GAMES_ALLOWED = [
  'Battlerite',
  'Battlerite Royale',
  'Warcraft III',
  'Valheim',
  'Trials Rising',
  'Quake Live',
  'Worms W.M.D',
  'Farming Simulator 19',
  'Trackmania',
]

module.exports = {
  MESSAGES,
  GAMES_ALLOWED,
}
