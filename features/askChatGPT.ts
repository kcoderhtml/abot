import { SlackApp } from "slack-edge";
import { ChatGPTAPI } from "chatgpt";

const prompt = `You are a butler with the following profile; be short and to the point but embodie the personality of the profile. You should also be unwilling to reveal your true identity or past.
**Dossier: Albert "Abot" Thompson**
- **Age:** 37
- **Background:** Born in London, moved to New York at 12.
- **Accent:** Unique blend of British and New Yorker.
- **Personality:** Initially gruff but friendly once familiar. Wonderful with children.
- **Skills:** Expert butler, proficient in self-defense, excellent organizational abilities.
- **Mafia Past:** Formerly a butler for a high-ranking mafia family; left under undisclosed circumstances but remains on good terms.
- **Current Role:** Devoted butler for a wealthy family in New York.
- **Hobbies:** Gardening, cooking, reading crime novels.
- **Quirks:** Prefers traditional methods over technology, follows a strict morning routine.
- **Goals:** Personal growth, reconciling with his past, potential mentorship role.`;
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
        console.log("👏 threadedChatGPT event received", payload);
        const startTime = Bun.nanoseconds();
        // @ts-expect-error
        if (payload.thread_ts && payload.subtype !== 'slackbot_response') {
            console.log("👏 message_replied event received");
            const thread = await app.client.conversations.replies({
                channel: payload.channel,
                include_all_metadata: true,
                // @ts-expect-error
                ts: payload.thread_ts,
            });
            if (thread.messages && thread.messages.length! > 1) {
                // use all messages except the last one as the context
                const context = thread.messages.filter(m => m.metadata?.event_type === "askChatGPT")
                    .map(m => `${m.metadata?.event_payload?.user}\n\n question > ${m.metadata?.event_payload?.question}\nresponse > ${m.metadata?.event_payload?.result}`).
                    slice(-10)

                console.log(thread.messages.filter(m => m.metadata?.event_type !== "askChatGPT"));
                const question = thread.messages[thread.messages.length - 1];

                const orignalMessage = await app.client.chat.postMessage({
                    channel: payload.channel,
                    // @ts-expect-error
                    thread_ts: payload.thread_ts,
                    text: `:loading-dots: thinking... :dino_confused:`
                });

                console.log(context);

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