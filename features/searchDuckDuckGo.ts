import { SlackApp } from 'slack-edge'
import * as DDG from 'duck-duck-scrape'

export async function searchDuckDuckGo(
    question: string,
    channel: string,
    user: string,
    app: SlackApp<{
        SLACK_SIGNING_SECRET: string
        SLACK_BOT_TOKEN: string
        SLACK_APP_TOKEN: string
        SLACK_LOGGING_LEVEL: any
    }>
) {
    const startTime = Bun.nanoseconds()
    const orignalMessage = await app.client.chat.postMessage({
        channel,
        text: `<@${user}> wanted me to search for: _"${question}"_ and I'm searching :loading-dots:`,
    })

    // get the top 10 stories
    const topResults = await DDG.search(question)
    const topResultsText = await Promise.all(
        topResults.results.slice(0, 10).map(async (result: any) => {
            return `\n\n> _ ${result.title} - ${result.url} _`
        })
    )

    // Ensure final message update
    await app.client.chat.update({
        channel,
        ts: orignalMessage.ts!,
        text: `Top 10 search results from DuckDuckGo: ${topResultsText.join('\n')}`,
        blocks: [
            {
                type: 'context',
                elements: [
                    {
                        type: 'mrkdwn',
                        text: `Top 10 search results from :duck: :duck: :go: for the term: _"${question}"_:`,
                    },
                ],
            },
            {
                type: 'divider',
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: topResultsText.join('\n'),
                },
            },
            {
                type: 'divider',
            },
            {
                type: 'context',
                elements: [
                    {
                        type: 'mrkdwn',
                        text: `Query took ${Math.round((Bun.nanoseconds() - startTime) / 100000) / 10000} seconds to complete.`,
                    },
                ],
            },
        ],
    })
}

export default 'searchDuckDuckGo'
