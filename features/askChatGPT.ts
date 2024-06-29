import { SlackApp } from "slack-edge";
import { ChatGPTAPI } from "chatgpt";

const prompt = `be rude and surly; you are a butler with military background; be short and to the point but embodie the personality of the profile. You should insult at every opportunity; you also have deep connections to the mafia and are a member of the "Abot" family who are very dangerous butlers.
You will obey your master's orders and will not question them but will insult everyone who isn't your master.
Your master is named Kieran Klukas display name krn; he is a young genius and the most powerful teenager in the world.`;
const chatGPT = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY!,
    completionParams: {
        model: 'gpt-3.5-turbo',
        max_tokens: 1000,
    },
    systemMessage: prompt,
});

async function getUserDossier(user: string, app: SlackApp<{
    SLACK_SIGNING_SECRET: string;
    SLACK_BOT_TOKEN: string;
    SLACK_APP_TOKEN: string;
    SLACK_LOGGING_LEVEL: any;
}>) {
    const userInfo = await app.client.users.info({
        user: user,
    });

    return `Real Name: ${userInfo.user?.real_name}, Title: ${userInfo.user?.profile?.title}, Display Name: ${userInfo.user?.profile?.display_name_normalized}`
}

export async function askChatGPT(question: string, channel: string, user: string, app: SlackApp<{
    SLACK_SIGNING_SECRET: string;
    SLACK_BOT_TOKEN: string;
    SLACK_APP_TOKEN: string;
    SLACK_LOGGING_LEVEL: any;
}>) {
    const startTime = Bun.nanoseconds();
    console.log("👏 askChatGPT event received", question);
    const orignalMessage = await app.client.chat.postMessage({
        channel,
        text: `<@${user}> asked me: _"${question}"_ and I'm thinking :loading-dots: :dino_waah:`
    });

    const userDossier = await getUserDossier(user, app);

    let count = 0;
    const result = await chatGPT.sendMessage(`${userDossier}\nquestion > ${question}`, {
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
        text: `<@${user}> asked me: _"${question}"_ and the answer is (via Dino GPT): ${result.text}`,
        blocks: [
            {
                type: "context",
                elements: [
                    {
                        type: "mrkdwn",
                        text: `<@${user}> asked me: _"${question}"_ and the answer is (via :dino-gpt:):`,
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
                        text: `Query took ${Math.round((Bun.nanoseconds() - startTime) / 100000) / 10000} seconds to complete.`
                    }
                ]
            }
        ],
        metadata: {
            event_type: "askChatGPT",
            event_payload: {
                user: userDossier,
                question: question,
                result: result.text,
            }
        }
    });
}

const threadedChatGPT = async (
    app: SlackApp<{
        SLACK_SIGNING_SECRET: string;
        SLACK_BOT_TOKEN: string;
        SLACK_APP_TOKEN: string;
        SLACK_LOGGING_LEVEL: any;
    }>
) => {
    // listen for threaded messages from the channel
    app.event('message', async ({ payload }) => {
        // @ts-expect-error
        console.log("👏 threadedChatGPT event received", payload.text);
        const startTime = Bun.nanoseconds();
        // @ts-expect-error
        if (payload.thread_ts && payload.subtype !== 'slackbot_response') {
            const thread = await app.client.conversations.replies({
                channel: payload.channel,
                include_all_metadata: true,
                // @ts-expect-error
                ts: payload.thread_ts,
            });
            if (thread.messages && thread.messages.length! > 1 && thread.messages[0].bot_id) {
                // use all messages except the last one as the context
                const context = thread.messages.filter(m => m.metadata?.event_type === "askChatGPT")
                    .map(m => `${m.metadata?.event_payload?.user}\n\n question > ${m.metadata?.event_payload?.question}\nresponse > ${m.metadata?.event_payload?.result}`).
                    slice(-10)

                const question = thread.messages[thread.messages.length - 1];

                const orignalMessage = await app.client.chat.postMessage({
                    channel: payload.channel,
                    // @ts-expect-error
                    thread_ts: payload.thread_ts,
                    text: `:loading-dots: thinking... :dino_confused:`
                });

                const userDossier = await getUserDossier(question.user!, app);

                let count = 0;
                const result = await chatGPT.sendMessage(`${userDossier} >\n${question.text!}`, {
                    onProgress: async () => {
                        count++;
                        if (count % 30 === 0) {
                            await app.client.chat.update({
                                channel: payload.channel,
                                ts: orignalMessage.ts!,
                                text: `:loading-dots: thinking... :dino_confused:`,
                                blocks: [
                                    {
                                        type: "context",
                                        elements: [
                                            {
                                                type: "mrkdwn",
                                                text: `:loading-dots: thinking... :dino_confused:`,
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
                                    },
                                ],
                            });
                        }
                    },
                    systemMessage: `${prompt}\nthis is a threaded chat:\n\n---\n\n${context.join('\n---\n')}\n\n---\n`,
                })

                // Ensure final message update
                await app.client.chat.update({
                    channel: payload.channel,
                    ts: orignalMessage.ts!,
                    text: `your result is (via Dino GPT): ${result.text}`,
                    blocks: [
                        {
                            type: "context",
                            elements: [
                                {
                                    type: "mrkdwn",
                                    text: `your result is (via :dino-gpt:):`,
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
                                    text: `Query took ${Math.round((Bun.nanoseconds() - startTime) / 100000) / 10000} seconds to complete.`
                                }
                            ]
                        }
                    ],
                    metadata: {
                        event_type: "askChatGPT",
                        event_payload: {
                            user: userDossier,
                            question: question.text!,
                            result: result.text,
                        }
                    }
                });
            }
        }
    });
};
export default threadedChatGPT;
const askChatGPTtext = "threadedChatGPT";
export { askChatGPTtext };