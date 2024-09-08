import { SlackApp } from "slack-edge";

export async function getHackerNews(channel: string, user: string, app: SlackApp<{
    SLACK_SIGNING_SECRET: string;
    SLACK_BOT_TOKEN: string;
    SLACK_APP_TOKEN: string;
    SLACK_LOGGING_LEVEL: any;
}>) {
    const startTime = Bun.nanoseconds();
    const orignalMessage = await app.client.chat.postMessage({
        channel,
        text: `<@${user}> asked for the latest hn stories and I'm grabbing them, be patient :loading-dots:`
    });

    // get the top 10 stories
    const topStories = await fetch(`https://hacker-news.firebaseio.com/v0/topstories.json`)
        .then(res => res.json())
        .then(res => res.slice(0, 10));

    // get the top stories
    const topStoriesText = await Promise.all(topStories.map(async (storyId: string) => {
        const story = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`)
            .then(res => res.json());

        return `\n\n> _<${story.title}|${story.url}> - <https://news.ycombinator.com/item?id=${storyId}|comments>_`;
    })) as string[];

    // Ensure final message update
    await app.client.chat.update({
        channel,
        ts: orignalMessage.ts!,
        text: `Top 10 stories from Hacker News: ${topStoriesText.join("\n")}`,
        blocks: [
            {
                type: "context",
                elements: [
                    {
                        type: "mrkdwn",
                        text: `Top 10 stories from :hacker-cat: :newspaper::`,
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
                    text: topStoriesText.join("\n"),
                },
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
    });
}

export default "hackerNews";