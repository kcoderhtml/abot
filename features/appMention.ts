import { SlackApp } from "slack-edge";

const appMention = async (
    app: SlackApp<{
        SLACK_SIGNING_SECRET: string;
        SLACK_BOT_TOKEN: string;
        SLACK_APP_TOKEN: string;
        SLACK_LOGGING_LEVEL: any;
    }>
) => {
    // listen for new members joining the channel
    app.event('app_mention', async ({ context, payload }) => {
        console.log(`👏 ${payload.user} mentioned me`);

        let message: { message: string, ephemeral?: boolean, ping?: boolean } = { message: `<@${payload.user}> if you want some help try asking my creator <@${process.env.CREATOR}>`, ephemeral: true };

        if (payload.text) {
            const command = payload.text.split(' ').slice(1).join(' ')
            switch (command) {
                case 'ping':
                    message = { message: `<@${payload.user}> pong!`, ephemeral: true };
                    break;
                case 'ping @here':
                    message = { message: `<!here> pong!`, ping: true };
                    break;
            }
        }

        if (message.ephemeral) {
            await context.client.chat.postEphemeral({
                channel: payload.channel,
                user: payload.user!,
                text: message.message,
            });
        } else {
            await context.client.chat.postMessage({
                channel: payload.channel,
                text: message.message,
                thread_ts: message.ping ? payload.event_ts : undefined,
                reply_broadcast: message.ping,
            });
        }
    });
};

export default appMention;