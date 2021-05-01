const { GAMETIME_ACTIONS } = require('./constants')
const { minutesDiff } = require('../../lib/date')
const { save } = require('../../database/game')

const startGameTime = (state, payload) => {
  const exists = state.find((session) => (
    payload.userID === session.userID
    && payload.gameName === session.gameName
  ))

  return !exists
    ? [
      ...state,
      {
        id: payload.id,
        userID: payload.userID,
        gameName: payload.gameName,
        startDate: payload.startDate,
        endDate: payload.endDate,
      },
    ] : state
}

const endGameTime = (state, payload) => (
  state.map((session) => session.userID === payload.userID
    ? { ...session, endDate: payload.endDate }
    : session
  )
)

const saveGameTime = async (state, payload) => {
  const session = state.find((s) => (
    s.userID === payload.userID && s.gameName === payload.gameName
  ))

  const timeSpent = minutesDiff(session.endDate, session.startDate)
  console.log(`User: ${session.userID} played for ${timeSpent} minute(s) on ${session.gameName}`)

  if (!timeSpent) {
    return state.filter((s) => s.id !== session.id)
  }

  // Side effect over here!
  await save(payload, timeSpent)

  return state.filter((s) => s.id !== session.id)
}

const reducer = (state, action) => {
  switch (action.type) {
    case GAMETIME_ACTIONS.start:
      return startGameTime(state, action.payload)
    case GAMETIME_ACTIONS.end:
      return endGameTime(state, action.payload)
    case GAMETIME_ACTIONS.save:
      return saveGameTime(state, action.payload)
    default:
      return state
  }
}

module.exports = {
  reducer,
}
