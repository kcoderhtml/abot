import { SlackApp } from "slack-edge";


const newMemberJoinHandlerP5 = async (
    app: SlackApp<{
        SLACK_SIGNING_SECRET: string;
        SLACK_BOT_TOKEN: string;
        SLACK_APP_TOKEN: string;
        SLACK_LOGGING_LEVEL: any;
    }>
) => {
    // listen for new members joining the channel
    app.action('announce-your-presence', async ({ payload, context }) => {
        console.log(`📣 abot is announcing the presence of ${payload.user.name}.`);

        // open the guest book
        await context.respond!({
            text: `Abot annouces <@${payload.user.id}>'s presence.`,
            response_type: "in_channel",
            delete_original: true,
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `Abot stepped into the room and addressed the host. _"Our esteemed guest has arrived,"_ he announced with a respectful nod.`
                    },

                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `\n\n<@${payload.user.id}> approaches the host, extending their hand in greeting. _"Hello, it's a pleasure to meet you,"_ they say, their voice reflecting their sincerity.`
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `\n\nThe host shook your hand firmly, their smile widening. _"Welcome to our home. I am <@${[process.env.CREATOR]}>. I hope your journey was pleasant,"_ he said, his voice warm and inviting.`
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `\n\n_"Thank you, Mr <@${process.env.CREATOR}>. It's a beautiful home,"_ <@${payload.user.id}> responds, as with each passing moment they feel more comfortable.`
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `\n\nAbot, observing the interaction with a subtle smile, stepped forward. _"Shall I bring some refreshments?"_ he offered, his tone polite and attentive.`
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `\n\n<@${payload.user.id}> and <@${process.env.CREATOR}> nod in agreement, and Abot excuses himself to prepare the requested refreshments. The host guides you to a comfortable seat, ready to engage in more conversation, making you feel like an honored guest in their magnificent home.`
                    }
                }
            ]
        });
    });
};

export default newMemberJoinHandlerP5;