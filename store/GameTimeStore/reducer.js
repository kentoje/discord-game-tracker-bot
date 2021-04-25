const { GAMETIME_ACTIONS } = require('./constants')
const { secondsDiff } = require('../../lib/date')

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
        applicationID: payload.applicationID,
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

const saveGameTime = (state, payload) => {
  console.log('state', state, 'payload', payload)
  const session = state.find((s) => (
    s.userID === payload.userID && s.gameName === payload.gameName
  ))
  // save gameTime to DB here!
  console.log(`User: ${session.userID} played for ${secondsDiff(session.endDate, session.startDate)}s on ${session.gameName}`)
  console.log('state ->', state);

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
