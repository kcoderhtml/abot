import { SlackApp } from "slack-edge";

async function welcomeNewMember(app: SlackApp<{
    SLACK_SIGNING_SECRET: string;
    SLACK_BOT_TOKEN: string;
    SLACK_APP_TOKEN: string;
    SLACK_LOGGING_LEVEL: any;
}>, user: string) {
    await app.client.chat.postEphemeral({
        user: user,
        channel: process.env.CHANNEL!,
        text: "plz sign the guest book",
        blocks: [
            {
                type: "context",
                elements: [
                    {
                        type: "mrkdwn",
                        text: `Abot stood at the entrance hall, his imposing figure slightly softened by the warm light filtering through the high windows. His eyes, a mixture of sternness and subtle kindness, met your gaze as you stepped inside.`
                    },
                ]
            },
            {
                type: "divider"
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `\n\n_"Welcome,"_ he said, his voice carrying that distinctive blend of British and New Yorker accents. _"I'm Albert Thompson, but you can call me Abot. I look after the household."_`
                }
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `\n\nYou nodded, feeling a mix of awe and reassurance at his presence.`
                }
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `\n\n_"If you don't mind,"_ Abot continued, _"I would appreciate it if you could sign the guest book. It's for my and the master's records."_`
                }
            },
            {
                type: "divider"
            },
            {
                type: "actions",
                elements: [
                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: "Step up to the guest :book:",
                            emoji: true
                        },
                        value: "sign-guest-book",
                        action_id: "sign-guest-book"
                    }
                ]
            }
        ]

    });
}


const newMemberJoin = async (
    app: SlackApp<{
        SLACK_SIGNING_SECRET: string;
        SLACK_BOT_TOKEN: string;
        SLACK_APP_TOKEN: string;
        SLACK_LOGGING_LEVEL: any;
    }>
) => {
    // listen for new members joining the channel
    app.event('member_joined_channel', async ({ payload }) => {
        if (payload.channel === process.env.CHANNEL) {
            console.log(`🎩 Ushering ${payload.user} into the channel.`);
            await welcomeNewMember(app, payload.user)
        }
    });

    app.command("/abot-trigger", async ({ payload }) => {
        console.log(`🎩 Ushering ${payload.user_id} into the channel via command.`);
        await welcomeNewMember(app, payload.user_id)
    });
};

export default newMemberJoin;