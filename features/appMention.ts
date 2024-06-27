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
        await context.client.chat.postMessage({
            channel: payload.channel,
            thread_ts: payload.event_ts,
            text: `<@${payload.user}> if you want some help try asking my creator <@${process.env.CREATOR}>`,
        });
    });
};

export default appMention;