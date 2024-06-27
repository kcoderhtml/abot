import { SlackApp } from "slack-edge";

const app = new SlackApp({
    env: {
        SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN!,
        SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET!,
        SLACK_APP_TOKEN: process.env.SLACK_APP_TOKEN!,
        SLACK_LOGGING_LEVEL: "INFO",
    },
    startLazyListenerAfterAck: true
});

// listen for new members joining the channel
app.event('member_joined_channel', async ({ context, payload }) => {
    if (payload.channel === process.env.CHANNEL) {
        await context.client.chat.postMessage({
            channel: process.env.CHANNEL!,
            text: `A new member <@${payload.user}> has joined the <#${process.env.CHANNEL}> channel!`,
        });
    }
});

export default {
    port: 3000,
    async fetch(request: Request) {
        return await app.run(request);
    },
};

await app.client.chat.postMessage({
    channel: process.env.CHANNEL!,
    text: `Welcome to the <#${process.env.CHANNEL}> channel!`,
});