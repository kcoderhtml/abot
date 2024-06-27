import { SlackApp } from "slack-edge";

const newMemberJoin = async (
    app: SlackApp<{
        SLACK_SIGNING_SECRET: string;
        SLACK_BOT_TOKEN: string;
        SLACK_APP_TOKEN: string;
        SLACK_LOGGING_LEVEL: any;
    }>
) => {
    // listen for new members joining the channel
    app.event('member_joined_channel', async ({ context, payload }) => {
        if (payload.channel === process.env.CHANNEL) {
            console.log(`🎩 Ushering ${payload.user} into the channel.`);
            await context.client.chat.postMessage({
                channel: process.env.CHANNEL!,
                text: `Welcome <@${payload.user}> to <#${process.env.CHANNEL}>!`,
            });
        }
    });
};

export default newMemberJoin;