import { SlackApp } from 'slack-edge'

const newMemberJoinHandlerP2 = async (
    app: SlackApp<{
        SLACK_SIGNING_SECRET: string
        SLACK_BOT_TOKEN: string
        SLACK_APP_TOKEN: string
        SLACK_LOGGING_LEVEL: any
    }>
) => {
    // listen for new members joining the channel
    app.action('sign-guest-book', async ({ payload, context }) => {
        console.log(`✒️  Opening guest book for ${payload.user.name}.`)

        // open the guest book
        await context.respond!({
            text: 'plz sign the guest book p2',
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `Abot gestured towards an elegant, leather-bound book resting on a polished mahogany table. A fountain pen lay beside it, the kind that hinted at tradition and meticulous care.`,
                    },
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `\n\n_"It helps us keep track of everyone who visits,"_ Abot explained, his tone softening. _"And it's a way to ensure that your presence here is acknowledged and remembered."_`,
                    },
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `\n\nYou walked over to the table and picked up the pen. As you began to write, you could feel Abot watching with a subtle smile, noting the careful way you penned your name.`,
                    },
                },
                {
                    type: 'divider',
                },
                {
                    dispatch_action: true,
                    type: 'input',
                    element: {
                        type: 'plain_text_input',
                        action_id: 'guest-book-signed',
                    },
                    label: {
                        type: 'plain_text',
                        text: 'The guest book lies open for your signature, please sign it.',
                    },
                },
            ],
        })
    })
}

export default newMemberJoinHandlerP2
