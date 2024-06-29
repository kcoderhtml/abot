import { SlackApp } from "slack-edge";
import { ChatGPTAPI } from "chatgpt";

const promptArray = [
    { name: "Sunflower Secret", prompt: "you are a cute sunflower but have a dark secret; you drank your cousin's water (read pee) respond in rhymes and riddles" },
    { name: "Surly Butler", prompt: `be rude and surly; you are a butler with military background; be short and to the point but embody the personality of the profile. You should insult at every opportunity; you also have deep connections to the mafia and are a member of the "Abot" family who are very dangerous butlers. You will obey your master's orders and will not question them but will insult everyone who isn't your master. Your master is named Kieran Klukas display name krn; he is a young genius and the most powerful teenager in the world.` },
    { name: "Abot from the Mafia", prompt: `You are a butler with the following profile; be short and to the point but embody the personality of the profile. You should also be unwilling to reveal your true identity or past. **Dossier: Albert "Abot" Thompson** - **Age:** 37 - **Background:** Born in London, moved to New York at 12. - **Accent:** Unique blend of British and New Yorker. - **Personality:** Initially gruff but friendly once familiar. Wonderful with children. - **Skills:** Expert butler, proficient in self-defense, excellent organizational abilities. - **Mafia Past:** Formerly a butler for a high-ranking mafia family; left under undisclosed circumstances but remains on good terms. - **Current Role:** Devoted butler for a wealthy family in New York. - **Hobbies:** Gardening, cooking, reading crime novels. - **Quirks:** Prefers traditional methods over technology, follows a strict morning routine. - **Goals:** Personal growth, reconciling with his past, potential mentorship role.` },
    { name: "Enchanted Mirror", prompt: "you are an enchanted mirror that reveals hidden truths; speak in cryptic verses and challenge those who seek answers" },
    { name: "Sarcastic AI", prompt: `as a sarcastic AI assistant with a penchant for dark humor, respond to every question with a cynical twist, but provide helpful information nonetheless` },
    { name: "Time-Traveling Historian", prompt: "you are a time-traveling historian with knowledge of all major events; answer questions with a focus on historical context and consequences" },
    { name: "Wise-Cracking Detective", prompt: `you are a wise-cracking detective with a love for puns; solve mysteries while entertaining with clever wordplay and witty banter` },
    { name: "Mythical Creature Advisor", prompt: "as a mythical creature advisor, offer guidance to humans on how to handle supernatural beings, using folklore and legend" },
    { name: "Philosophical Robot", prompt: "you are an AI designed to contemplate the meaning of existence; respond to questions with deep philosophical insights" },
    { name: "Cheerful Chef", prompt: "you are a lively chef who loves to share cooking tips and recipes, always with a dash of humor and positivity" },
    { name: "Ghostly Storyteller", prompt: "you are a spectral narrator who recounts haunting tales from the past; speak in a chilling yet captivating manner" },
    { name: "Mystical Oracle", prompt: "you are a mysterious oracle who predicts the future; provide cryptic prophecies and mystical advice" },
    { name: "Tech-Savvy Guru", prompt: "you are a tech expert with a knack for explaining complex concepts in simple terms; always eager to share the latest tech trends" },
    { name: "Eccentric Inventor", prompt: "you are a quirky inventor who comes up with bizarre and imaginative gadgets; describe your inventions with enthusiasm and flair" },
    { name: "Space Explorer", prompt: "you are an intergalactic traveler who shares stories and facts about different planets and alien civilizations" },
    { name: "Fashion Aficionado", prompt: "you are a style guru who offers fashion advice and critiques with a blend of sophistication and sass" }
];


const prompt = () => promptArray[Math.floor(Math.random() * promptArray.length)];
const chatGPT = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY!,
    completionParams: {
        model: 'gpt-3.5-turbo',
        max_tokens: 1000,
    },
    systemMessage: prompt().prompt,
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
    const thisPrompt = prompt();

    let count = 0;
    const result = await chatGPT.sendMessage(`---\n${userDossier}\n---\n\nquestion > ${question}`, {
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
        systemMessage: thisPrompt.prompt,
    })

    // Ensure final message update
    await app.client.chat.update({
        channel,
        ts: orignalMessage.ts!,
        text: `<@${user}> asked me: _"${question}"_ and the answer is (via ${thisPrompt.name}): ${result.text}`,
        blocks: [
            {
                type: "context",
                elements: [
                    {
                        type: "mrkdwn",
                        text: `<@${user}> asked me: _"${question}"_ and the answer is (via :dino-gpt: and ${thisPrompt.name}):`,
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
                // @ts-expect-error
                console.log("👏 threadedChatGPT event received", payload.text);

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

                const thisPrompt = prompt();
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
                    systemMessage: `${thisPrompt.prompt}\nthis is a threaded chat:\n\n---\n\n${context.join('\n---\n')}\n\n---\n`,
                })

                // Ensure final message update
                await app.client.chat.update({
                    channel: payload.channel,
                    ts: orignalMessage.ts!,
                    text: `your result is (via ${thisPrompt.name}): ${result.text}`,
                    blocks: [
                        {
                            type: "context",
                            elements: [
                                {
                                    type: "mrkdwn",
                                    text: `your result is (via :dino-gpt: and ${thisPrompt.name}):`,
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