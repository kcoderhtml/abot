import { SlackApp } from "slack-edge";
const version = require('./package.json').version

console.log("----------------------------------\nABOT Server\n----------------------------------\n")
console.log("🚀 Starting server")
console.log("📦 Loading Slack App...")
console.log("🔑 Loading environment variables...")

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
            text: `Welcome <@${payload.user}> to <#${process.env.CHANNEL}>!`,
        });
    }
});

export default {
    port: 3000,
    async fetch(request: Request) {
        return await app.run(request);
    },
};

console.log("🚀 Server Started in", Bun.nanoseconds() / 1000000, "milliseconds on version:", version + "!", "\n\n----------------------------------\n")
