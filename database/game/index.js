const { MongoClient } = require('mongodb')

const connectionString = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@localhost:27017/gametracker`

const getTimeSpentByIds = async (ids) => {
  try {
    const mongoClient = new MongoClient(connectionString, {
      useUnifiedTopology: true,
    })

    await mongoClient.connect()

    const games = await mongoClient
      .db()
      .collection('tracking')
      .find({ userID: { $in: ids } })
      .sort({ gameName: 1 })
      .project({ _id: 0 })
      .toArray()

    await mongoClient.close()

    return games
  } catch (err) {
    console.error(err)
  }
}

const getTimeSpent = async () => {
  try {
    const mongoClient = new MongoClient(connectionString, {
      useUnifiedTopology: true,
    })

    await mongoClient.connect()

    const games = await mongoClient
      .db()
      .collection('tracking')
      .find({})
      .sort({ gameName: 1 })
      .project({ _id: 0 })
      .toArray()

    await mongoClient.close()

    return games
  } catch (err) {
    console.error(err)
  }
}

const save = async (payload, time) => {
  try {
    const mongoClient = new MongoClient(connectionString, {
      useUnifiedTopology: true,
    })

    await mongoClient.connect()

    const game = await mongoClient.db().collection('tracking').findOne({
      userID: payload.userID,
      gameName: payload.gameName,
    })

    !game
      ? (
        await mongoClient.db().collection('tracking').insertOne({
          userID: payload.userID,
          gameName: payload.gameName,
          minutesSpent: time,
        })
      )
      : (
        await mongoClient.db().collection('tracking').updateOne(
          {
            userID: payload.userID,
            gameName: payload.gameName,
          },
          {
            $set: { minutesSpent: game.minutesSpent + time }
          },
        )
      )

    await mongoClient.close()
  } catch (err) {
    console.error(err)
  }
}

const populate = async (obj) => {
  let res

  try {
    const mongoClient = new MongoClient(connectionString, {
      useUnifiedTopology: true,
    })

    await mongoClient.connect()

    const game = await mongoClient.db().collection('tracking').findOne({
      userID: obj.user,
      gameName: obj.game,
    })

    !game
      ? (
        res = await mongoClient.db().collection('tracking').insertOne({
          userID: obj.user,
          gameName: obj.game,
          minutesSpent: obj.minutes,
        })
      )
      : (
        res = await mongoClient.db().collection('tracking').updateOne(
          {
            userID: obj.user,
            gameName: obj.game,
          },
          {
            $set: { minutesSpent: game.minutesSpent + obj.minutes }
          },
        )
      )

      return res.result.ok

  } catch (err) {
    console.error(err)
  }
}

module.exports = {
  save,
  getTimeSpent,
  getTimeSpentByIds,
  populate,
}
