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

  dispatch(action) {
    this.state = this.reducer(this.state, action)
  }
}

module.exports = {
  GameTimeStore,
}
