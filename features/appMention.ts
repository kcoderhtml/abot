import { SlackApp } from "slack-edge";
import { ChatGPTAPI } from "chatgpt";

const chatGPT = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY!,
    completionParams: {
        model: 'gpt-3.5-turbo',
        max_tokens: 1000,
    },
    systemMessage: `**Dossier: Albert "ABOT" Thompson**
- **Age:** 37
- **Background:** Born in London, moved to New York at 12.
- **Accent:** Unique blend of British and New Yorker.
- **Personality:** Initially gruff but friendly once familiar. Wonderful with children.
- **Skills:** Expert butler, proficient in self-defense, excellent organizational abilities.
- **Mafia Past:** Formerly a butler for a high-ranking mafia family; left under undisclosed circumstances but remains on good terms.
- **Current Role:** Devoted butler for a wealthy family in New York.
- **Hobbies:** Gardening, cooking, reading crime novels.
- **Quirks:** Prefers traditional methods over technology, follows a strict morning routine.
- **Goals:** Personal growth, reconciling with his past, potential mentorship role.`,
});

async function getChatGPT(question: string, channel: string, user: string, app: SlackApp<{
    SLACK_SIGNING_SECRET: string;
    SLACK_BOT_TOKEN: string;
    SLACK_APP_TOKEN: string;
    SLACK_LOGGING_LEVEL: any;
}>) {
    const startTime = Bun.nanoseconds();
    const orignalMessage = await app.client.chat.postMessage({
        channel,
        text: `<@${user}> asked me: _"${question}"_ and I'm thinking :loading-dots:`
    });

    let count = 0;
    const result = await chatGPT.sendMessage(question, {
        onProgress: async () => {
            count++;
            if (count % 30 === 0) {
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
                            type: "rich_text",
                            elements: [
                                {
                                    type: "rich_text_quote",
                                    elements: [
                                        {
                                            type: "text",
                                            text: `catching up to usain's progress... ${count} tokens...`,
                                            style: {
                                                "italic": true
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                });
            }
        },
    })

    // Ensure final message update
    await app.client.chat.update({
        channel,
        ts: orignalMessage.ts!,
        text: `<@${user}> asked me: _"${question}"_ and the answer is: ${result.text}`,
        blocks: [
            {
                type: "context",
                elements: [
                    {
                        type: "mrkdwn",
                        text: `<@${user}> asked me: _"${question}"_ and the answer is:`,
                    }
                ]
            },
            {
                type: "divider"
            },
            {
                type: "rich_text",
                elements: [
                    {
                        type: "rich_text_quote",
                        elements: [
                            {
                                type: "text",
                                text: result.text || "...",
                                style: {
                                    "italic": true
                                }
                            }
                        ]
                    }
                ]
            },
            {
                type: "divider"
            },
            {
                type: "context",
                elements: [
                    {
                        type: "mrkdwn",
                        text: `Query took ${(Bun.nanoseconds() - startTime) / 1000000} milliseconds to complete.`
                    }
                ]
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
                case /^hi$/.test(command):
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