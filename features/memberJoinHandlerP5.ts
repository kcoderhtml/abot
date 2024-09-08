import { SlackApp } from 'slack-edge'

const newMemberJoinHandlerP5 = async (
    app: SlackApp<{
        SLACK_SIGNING_SECRET: string
        SLACK_BOT_TOKEN: string
        SLACK_APP_TOKEN: string
        SLACK_LOGGING_LEVEL: any
    }>
) => {
    // listen for new members joining the channel
    app.action('announce-your-presence', async ({ payload, context }) => {
        console.log(
            `📣 abot is announcing the presence of ${payload.user.name}.`
        )

        // Send the initial response
        const response = await context.respond!({
            text: `Abot announces <@${payload.user.id}>'s presence.`,
            response_type: 'in_channel',
            delete_original: true,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `Abot stepped into the room and addressed the host. _"Our esteemed guest <@${payload.user.id}> has arrived,"_ he announced with a respectful nod.`,
                    },
                },
            ],
        })

        // Send subsequent messages as thread replies
        const thread_ts = await app.client.conversations
            .history({
                channel: process.env.CHANNEL!,
                limit: 1,
            })
            .then((res) => res.messages?.[0].ts)

        await Bun.sleep(Math.random() * 1000)

        await app.client.chat.postMessage({
            channel: process.env.CHANNEL!,
            text: `\n\n<@${payload.user.id}> approaches the host, extending their hand in greeting. _"Hello, it's a pleasure to meet you,"_ they say, their voice reflecting their sincerity.`,
            thread_ts,
        })

        await Bun.sleep(Math.random() * 2000)

        await app.client.chat.postMessage({
            channel: process.env.CHANNEL!,
            text: `\n\nThe host shook your hand firmly, their smile widening. _"Welcome to our home. I am <@${process.env.CREATOR}>. I hope your journey was pleasant,"_ he said, his voice warm and inviting.`,
            thread_ts,
        })

        await Bun.sleep(Math.random() * 2500)

        await app.client.chat.postMessage({
            channel: process.env.CHANNEL!,
            text: `\n\n_"Thank you, Mr <@${process.env.CREATOR}>. It's a beautiful home,"_ <@${payload.user.id}> responds, as with each passing moment they feel more comfortable.`,
            thread_ts,
        })

        await Bun.sleep(Math.random() * 2500)

        await app.client.chat.postMessage({
            channel: process.env.CHANNEL!,
            text: `\n\nAbot, observing the interaction with a subtle smile, stepped forward. _"Shall I bring some refreshments?"_ he offered, his tone polite and attentive.`,
            thread_ts,
        })

        await Bun.sleep(Math.random() * 3000)

        await app.client.chat.postMessage({
            channel: process.env.CHANNEL!,
            text: `\n\n<@${payload.user.id}> and <@${process.env.CREATOR}> nod in agreement, and Abot excuses himself to prepare the requested refreshments. The host guides you to a comfortable seat, ready to engage in more conversation, making you feel like an honored guest in their magnificent home.`,
            thread_ts,
        })
    })
}

export default newMemberJoinHandlerP5
