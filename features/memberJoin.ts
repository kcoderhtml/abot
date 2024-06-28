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
                        "type": "mrkdwn",
                        "text": `'Ahem..' On behalf of <@${process.env.CREATOR}> I welcome you to <#${process.env.CHANNEL}>.`
                    }
                ]
            },
            {
                type: "divider"
            },
            {
                type: "input",
                dispatch_action: true,
                element: {
                    type: "plain_text_input",
                    action_id: "plain_text_input-action"
                },
                label: {
                    type: "plain_text",
                    text: `Please sign <@${process.env.CREATOR}>'s guest book!`,
                    emoji: true
                }
            },
            {
                type: "divider"
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `_Once your done push the book over to me and i'll notify <@${process.env.CREATOR}>!_`
                }
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