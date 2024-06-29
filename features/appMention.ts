import { SlackApp } from "slack-edge";
import { ChatGPTAPI } from "chatgpt";

const chatGPT = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY!,
    completionParams: {
        model: 'gpt-3.5-turbo',
        max_tokens: 1000,
    },
});

async function getChatGPT(question: string, channel: string, user: string, app: SlackApp<{
    SLACK_SIGNING_SECRET: string;
    SLACK_BOT_TOKEN: string;
    SLACK_APP_TOKEN: string;
    SLACK_LOGGING_LEVEL: any;
}>) {
    const orignalMessage = await app.client.chat.postMessage({
        channel,
        text: `<@${user}> asked me: ${question}; I'm thinking...`
    });

    const result = await chatGPT.sendMessage(question, {
        onProgress: async (partialResponse) => {
            await app.client.chat.update({
                channel,
                ts: orignalMessage.ts!,
                text: `<@${user}> asked me: ${question}; I'm thinking :loading-dots:`,
                blocks: [
                    {
                        type: "context",
                        elements: [
                            {
                                type: "mrkdwn",
                                text: `<@${user}> asked me: ${question}; I'm thinking :loading-dots:`,
                            }
                        ]
                    },
                    {
                        type: "divider"
                    },
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: partialResponse.text || "...",
                        }
                    }
                ],
            });
        },
    })

    // Ensure final message update
    await app.client.chat.update({
        channel,
        ts: orignalMessage.ts!,
        text: `<@${user}> asked me: ${question}; and the answer is: ${result.text}`,
        blocks: [
            {
                type: "context",
                elements: [
                    {
                        type: "mrkdwn",
                        text: `<@${user}> asked me: "${question}" and the answer is:`,
                    }
                ]
            },
            {
                type: "divider"
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: result.text || "...",
                }
            }
        ],
    });
}

const appMention = async (
    app: SlackApp<{
        SLACK_SIGNING_SECRET: string;
        SLACK_BOT_TOKEN: string;
        SLACK_APP_TOKEN: string;
        SLACK_LOGGING_LEVEL: any;
    }>
) => {
    // listen for new members joining the channel
    app.event('app_mention', async ({ context, payload }) => {
        const command = payload.text.split(' ').slice(1).join(' ')
        console.log(`👏 ${payload.user} mentioned: ${command}`);

        let message: { message: string, ephemeral?: boolean, check?: boolean, thread?: boolean } = { message: `<@${payload.user}> if you want some help try asking my creator <@${process.env.CREATOR}>`, ephemeral: true };
        if (payload.text && payload.text.length > 0) {
            switch (true) {
                case /^ping$/.test(command):
                    message = { message: `<@${payload.user}> pong!`, ephemeral: true, check: true };
                    break;
                case /^ping @here/.test(command):
                    message = {
                        message: `<!subteam^${process.env.PING_GROUP_ID}>: *${command.replace(/^ping @here /, '')}*`,
                        check: true
                    };
                    break;
                case /^ping @channel/.test(command):
                    message = {
                        message: `<!subteam^${process.env.PING_GROUP_ID}>: *${command.replace(/^ping @channel /, '')}*`,
                        check: true
                    };
                    break;
                case /^announce/.test(command):
                    message = {
                        message: `<!subteam^${process.env.PING_GROUP_ID}>: *${command.replace(/^announce /, '')}*`,
                        check: true
                    };
                    break;
                case /^hi/.test(command):
                    message = {
                        message: `hi <@${payload.user}>! what's up?`,
                    };
                    break;
                // catch all
                default:
                    await getChatGPT(command, payload.channel, payload.user!, app);
                    return
            }
        }

        if (message.check) {
            if (payload.user !== process.env.CREATOR) {
                await context.client.chat.postEphemeral({
                    user: payload.user!,
                    channel: payload.channel,
                    text: `*<@${payload.user}> don't be naughty only <@${process.env.CREATOR}> can do that*`,
                    thread_ts: payload.ts,
                });
                return;
            }
        }

        if (message.ephemeral) {
            await context.client.chat.postEphemeral({
                channel: payload.channel,
                user: payload.user!,
                text: message.message,
            });
        } else {
            await context.client.chat.postMessage({
                channel: payload.channel,
                text: message.message,
            });
        }
    });
};

export default appMention;