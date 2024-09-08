import { SlackApp } from 'slack-edge'

const newMemberJoinHandlerP4 = async (
    app: SlackApp<{
        SLACK_SIGNING_SECRET: string
        SLACK_BOT_TOKEN: string
        SLACK_APP_TOKEN: string
        SLACK_LOGGING_LEVEL: any
    }>
) => {
    // listen for new members joining the channel
    app.action('greet-the-host', async ({ payload, context }) => {
        console.log(`🤝 ${payload.user.name} is greeting the host.`)

        // open the guest book
        await context.respond!({
            text: 'Greetings, host!',
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `Abot leads you through the elegantly decorated hallway towards a grand sitting room. As you entered, you saw the host standing by the fireplace, a warm smile on their face.`,
                    },
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `\n\nAbot paused at the entrance to the room and turned to you, his eyes conveying both professionalism and subtle anticipation.`,
                    },
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `\n\n_"Are you ready to be announced now?"_ he asked, his voice low and respectful.`,
                    },
                },
                {
                    type: 'divider',
                },
                {
                    type: 'actions',
                    elements: [
                        {
                            type: 'button',
                            text: {
                                type: 'plain_text',
                                text: 'You confirm with a nod',
                            },
                            value: 'announce-your-presence',
                            action_id: 'announce-your-presence',
                        },
                    ],
                },
            ],
        })
    })
}

export default newMemberJoinHandlerP4
