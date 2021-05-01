class GameTimeStore {
  constructor(state, reducer) {
    this.state = state
    this.reducer = reducer
  }

  get getState() {
    return this.state
  }

  select(key) {
    return this.state[key]
  }

  async dispatch(action) {
    const newState = this.reducer(this.state, action)

    if (typeof newState.then === 'function') {
      this.state = await newState
      return
    }

    this.state = newState
  }
}

module.exports = {
  GameTimeStore,
}
