# slack-welcome-bot

This is a simple slack bot that sends a welcome message to new users when they join a channel.

Oh wait actualy scrap that, this is what happens when you spend way too long on slack and engineer a way to complicated welcome bot for your personal channel :)

## Installation

1. Clone the repository
2. Run `bun install`
3. Create a `.env` file in the root of the project and add the following:

```bash
SLACK_SIGNING_SECRET=6af1126898c005bf5af676e7asdasdasd
SLACK_BOT_TOKEN=xoxb-asdasdadsadsadsad
SLACK_APP_TOKEN=xapp-0-adsadsadsadsadsad
CHANNEL=your-channel-id
```

4. Run `bun dev` to start the server