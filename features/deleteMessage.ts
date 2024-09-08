import { SlackApp } from 'slack-edge'

const deleteMessage = async (
    app: SlackApp<{
        SLACK_SIGNING_SECRET: string
        SLACK_BOT_TOKEN: string
        SLACK_APP_TOKEN: string
        SLACK_LOGGING_LEVEL: any
    }>
) => {
    app.shortcut(
        'delete_message',
        async () => {},
        async ({ context, payload }) => {
            // check if the thread is authored by this bot
            // @ts-expect-error - this is a bug in the library
            if (payload.message.bot_id === process.env.SLACK_BOT_ID) {
                // delete any messages that are in the thread
                const thread = await context.client.conversations.replies({
                    // @ts-expect-error - this is a bug in the library
                    channel: payload.channel.id,
                    // @ts-expect-error - this is a bug in the library
                    ts: payload.message.ts,
                })

                // @ts-expect-error - this is a bug in the library
                console.log(
                    `🗑️  Deleting message ${payload.message.ts}${thread.messages!.length > 0 ? ` and ${thread.messages!.length - 1} other messages` : ''} in ${payload.channel.id}`
                )

                for (const message of thread.messages!) {
                    // check if the message is from the bot
                    if (message.bot_id === process.env.SLACK_BOT_ID) {
                        await context.client.chat.delete({
                            // @ts-expect-error - this is a bug in the library
                            channel: payload.channel.id,
                            // @ts-expect-error - this is a bug in the library
                            ts: message.ts,
                        })
                    }
                }
            }
        }
    )
}

export default deleteMessage
