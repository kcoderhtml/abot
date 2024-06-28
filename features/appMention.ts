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

        let message: { message: string, ephemeral?: boolean, check?: boolean, thread?: boolean } = { message: `<@${payload.user}> if you want some help try asking my creator <@${process.env.CREATOR}>`, ephemeral: true };
        if (payload.text && payload.text.length > 0) {
            const command = payload.text.split(' ').slice(1).join(' ')
            switch (true) {
                case /^ping$/.test(command):
                    message = { message: `<@${payload.user}> pong!`, ephemeral: true, check: true };
                    break;
                case /^ping @here/.test(command):
                    message = {
                        message: `<!subteam^${process.env.PING_GROUP_ID}>: *${command.replace(/^ping @here /, '')}*`,
                        check: true
                    };
                    break;
                case /^ping @channel/.test(command):
                    message = {
                        message: `<!subteam^${process.env.PING_GROUP_ID}>: *${command.replace(/^ping @channel /, '')}*`,
                        check: true
                    };
                    break;
                case /^announce/.test(command):
                    message = {
                        message: `<!subteam^${process.env.PING_GROUP_ID}>: *${command.replace(/^announce /, '')}*`,
                        check: true
                    };
                    break;
            }
        }

        if (message.check) {
            if (payload.user !== process.env.CREATOR) {
                await context.client.chat.postEphemeral({
                    user: payload.user!,
                    channel: payload.channel,
                    text: `*<@${payload.user}> don't be naughty only <@${process.env.CREATOR}> can do that*`,
                    thread_ts: payload.ts,
                });
                return;
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
            });
        }
    });
};

export default appMention;