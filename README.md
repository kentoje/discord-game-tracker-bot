# discord-game-tracker-bot

## Installing the project

- clone the project
- install dependencies
with NPM:
```bash
npm i
```
or with Yarn:
```bash
yarn
```
- setup .env
```
BOT_TOKEN=YOUR_TOKEN
MONGO_USER=gametracker-user
MONGO_PASSWORD=strongpasswordlol
```

## Running the project in development
- with NPM:
```bash
npm run start
```
- or with Yarn:
```bash
yarn start
```
- run Docker
```bash
docker-compose up -d
```

## Available BOT commands

| Trigger                                                     | Description                     | Example                                                    |
| ----------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------- |
| !yo                                                         | Says hi!                        | !yo                                                        |
| !timespent                                                  | Prints current user's stats.    | !timespent                                                 |
| !timespent {user}                                           | Prints stats of a given user.   | !timespent @Someone                                        |
| !timespent_global                                           | Prints stats of all users.      | !timespent_global                                          |
| !populate --game {game} --user {userID} --minutes {minutes} | Inserts given data in Database. | !populate --game Battlerite Royale --user 123 --minutes 60 |
| !help                                                       | Prints available commands.      | !help                                                      |
