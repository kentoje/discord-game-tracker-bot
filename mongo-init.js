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

// Trick to create the gametracker database when the container starts. Might not be the appropriate way.
db.tracking.insertOne({
  name: 'init'
})

db.tracking.deleteOne({
  name: 'init'
})
