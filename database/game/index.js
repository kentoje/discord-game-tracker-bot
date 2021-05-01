const { MongoClient } = require('mongodb')

const connectionString = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@localhost:27017`

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

module.exports = {
  save,
}
