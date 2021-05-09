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

| Trigger | Description | Example |
|---|---|---|
| !yo | Says hi! | !yo |
| !timespent | Print time spent on every game. | !timespent |
| !timespent {user} | Print time spent of a given user. | !timespent @Someone |
| !populate --game {game} --user {userID} --minutes {minutes} | Populate DB with given data. | !populate --game Battlerite --user 123 --minutes 60 |
| !help | Prints available commands. | !help |
