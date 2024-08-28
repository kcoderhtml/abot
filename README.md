# Abot - The maybe mafia affliated butler

![](.github/images/abot.jpeg)

This is a simple slack bot that sends a welcome message to new users when they join a channel.

Oh wait actualy scrap that, this is what happens when you spend way too long on slack and engineer a way to complicated welcome bot for your personal channel :)

## Installation

1. Clone the repository
2. Create a slack app with the following app manifest

```yaml
display_information:
  name: Albert Thompson
  description: Your friendly maybe mafia affliated butler
  background_color: "#2d354d"
features:
  bot_user:
    display_name: Abot
    always_online: false
  shortcuts:
    - name: Cleanup Message
      type: message
      callback_id: delete_message
      description: Tells Abot to clean up this message
  slash_commands:
    - command: /abot-trigger
      url: https://yoururl.com/
      description: trigger abot for yourself
      should_escape: true
oauth_config:
  scopes:
    bot:
      - app_mentions:read
      - canvases:read
      - canvases:write
      - channels:history
      - channels:read
      - chat:write
      - chat:write.customize
      - commands
      - groups:read
      - mpim:history
      - mpim:read
      - mpim:write
      - users.profile:read
      - users:read
      - users:write
      - usergroups:read
      - usergroups:write
settings:
  event_subscriptions:
    request_url: https://yoururl.com
    bot_events:
      - app_mention
      - member_joined_channel
  interactivity:
    is_enabled: true
    request_url: https://yoururl.com
  org_deploy_enabled: false
  socket_mode_enabled: false
  token_rotation_enabled: false
```

3. Pick your path, prod or dev

### Prod
Use the included docker compose file and customize the environment variables in the docker-compose.yml file

### Dev
1. Install the requirements
```bash
bun install
```

2. Create a .env file with the following variables
```bash
SLACK_SIGNING_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SLACK_BOT_TOKEN=xoxb-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SLACK_APP_TOKEN=xapp-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CHANNEL=C0123456789 # copy your channel id
CREATOR=U0123456789 # copy your user id
CANVAS_ID=F123456789 # create a canvas that isn't a channel canvas and copu its id
SLACK_BOT_ID=B0123456789 # copy the bot id from the app
PING_GROUP_ID=S0123456789 # create a usergroup and add its id here
```
3. Run the app
```bash
bun run dev
```

## License
This project is licensed under the GNU AGPLv3. See the [LICENSE.md](LICENSE.md) file for details. 
