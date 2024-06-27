# slack-welcome-bot

This is a simple slack bot that sends a welcome message to new users when they join a channel.

Oh wait actualy scrap that, this is what happens when you spend way too long on slack and engineer a way to complicated welcome bot for your personal channel :)

## Installation

1. Clone the repository
2. Run `bun install`
3. Create a `.env` file in the root of the project and add the following:

```bash
SLACK_SIGNING_SECRET=6af1126898c005bf5af676e7aebb5f29
SLACK_BOT_TOKEN=xoxb-2210535565-7330118127159-r4gF3hlmovNv0bxW1SKxWWOi
SLACK_APP_TOKEN=xapp-1-A079Q20Q147-7347161730932-5606dbe5da6d137b29fc9c79aaaa8f8b0e9634232fdb69923d9635d99593f96e
CHANNEL=C064DNF64LU
```

4. Run `bun dev` to start the server