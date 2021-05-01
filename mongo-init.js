db.createUser({
  user: 'gametracker-user',
  pwd: 'strongpasswordlol',
  roles: [
    {
      role: 'readWrite',
      db: 'gametracker'
    }
  ]
})

// Trick to create the database gametracker when the containers starts, might not be the appropriate way.
db.tracking.insertOne({
  name: 'init'
})

db.tracking.deleteOne({
  name: 'init'
})
