import { SlackApp } from "slack-edge";
import * as features from "./features/index";
const version = require('./package.json').version

console.log("----------------------------------\nABOT Server\n----------------------------------\n")
console.log("🏗️  Starting ABOT...");
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

console.log(`⚒️  Loading ${Object.entries(features).length} features...`);
for (const [feature, handler] of Object.entries(features)) {
    console.log(`📦 ${feature} loaded`);
    if (typeof handler === "function") {
        handler(app);
    }
}

export default {
    port: 3000,
    async fetch(request: Request) {
        return await app.run(request);
    },
};

console.log("🚀 Server Started in", Bun.nanoseconds() / 1000000, "milliseconds on version:", version + "!", "\n\n----------------------------------\n")
