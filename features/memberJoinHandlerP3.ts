import { SlackApp } from "slack-edge";


const newMemberJoinHandlerP3 = async (
    app: SlackApp<{
        SLACK_SIGNING_SECRET: string;
        SLACK_BOT_TOKEN: string;
        SLACK_APP_TOKEN: string;
        SLACK_LOGGING_LEVEL: any;
    }>
) => {
    // listen for new members joining the channel
    app.action('guest-book-signed', async ({ payload, context }) => {
        console.log(`🛡️ locking the guest book back up for ${payload.user.name}.`);

        // open the guest book
        await context.respond!({
            text: "The guest book has been signed!",
            blocks: [
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: `As you sign your name, you take in your surroundings. The entrance hall is grand, with high ceilings and intricate moldings. Antique furniture pieces are strategically placed, exuding an air of timeless elegance. A large mirror on the wall reflects the warm light, adding to the room's welcoming atmosphere.`
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
                        text: `\n\n_"Thank you,"_ he said once you had finished. _"If you need anything during your visit, please don't hesitate to ask. I'm here to assist in any way I can."_`
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `\n\nYou handed the pen back, feeling a sense of formal yet welcoming hospitality. Abots's presence was formidable, but his words carried a warmth that made you feel unexpectedly at ease.`
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
                                text: "continue"
                            },
                            value: "greet-the-host",
                            action_id: "greet-the-host"
                        }
                    ]
                }
            ]
        });
    });
};

export default newMemberJoinHandlerP3;