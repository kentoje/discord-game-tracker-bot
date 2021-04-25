const { GAMETIME_ACTIONS } = require('./constants')

const startGameTime = (state, payload) => {
  const exists = state.find((session) => payload.userId === session.userId && payload.applicationId === session.applicationId)

  return !exists
    ? [
      ...state,
      {
        userId: payload.userId,
        applicationId: payload.applicationId,
        gameName: payload.gameName,
        startDate: utcDate(payload.startDate),
        endDate: null,
      },
    ] : state
}

const endGameTime = (state, payload) => (
  state.map((session) => session.userId === payload.userId
    ? { ...session, endDate: utcDate(new Date()) }
    : session
  )
)

const saveGameTime = (state, payload) => {
  const gameTime = state.find((session) => session.userId === payload.userId)
  // save gameTime to DB
  console.log(secondsDiff(gameTime.endDate, gameTime.startDate))

  return state.filter((session) => session.userId !== payload.userId && session)
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
