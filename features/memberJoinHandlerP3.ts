import { SlackApp } from "slack-edge";


const newMemberJoinHandlerP3 = async (
    app: SlackApp<{
        SLACK_SIGNING_SECRET: string;
        SLACK_BOT_TOKEN: string;
        SLACK_APP_TOKEN: string;
        SLACK_LOGGING_LEVEL: any;
    }>
) => {
    // listen for new members joining the channel
    app.action('guest-book-signed', async ({ payload, context }) => {
        console.log(`🗝️  locking the guest book back up for ${payload.user.name}.`);

        // get user's name
        const name = (await app.client.users.profile.get({ user: payload.user.id })).profile?.display_name;

        const date = new Date();
        // edit a canvas
        await context.client.canvases.edit({
            canvas_id: process.env.CANVAS_ID!,
            changes: [
                // @ts-ignore - this is a bug in the library
                {
                    operation: "insert_at_end",
                    document_content: {
                        type: "markdown",
                        // @ts-ignore - this is a bug in the library
                        markdown: `:lower_left_fountain_pen: On ${date.getDate()}/${date.getMonth()}/${date.getFullYear()} at ${date.getHours()}:${date.getMinutes()} with ${date.getSeconds()} seconds completed in the minute ${name} wrote: _${payload.actions[0].value}_` //  markdown: 
                    },
                }
            ]
        });

        // get orignal members of ping group
        const members = await app.client.usergroups.users.list({
            usergroup: process.env.PING_GROUP_ID!,
        });

        if (members.users!.find(user => user !== payload.user.id)) {
            console.log(`📢 Adding ${payload.user.name} to the ping group.`);
            // add user to the ping group
            await app.client.usergroups.users.update({
                usergroup: process.env.PING_GROUP_ID!,
                // add user to the group unless they are already in the group
                users: members.users?.concat(payload.user.id)!,
            });
        } else {
            console.log(`📢 ${payload.user.name} is already in the ping group.`);
        }

        // open the guest book
        await context.respond!({
            text: "The guest book has been signed!",
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `As you sign your name, you take in your surroundings. The entrance hall is grand, with high ceilings and intricate moldings. Antique furniture pieces are strategically placed, exuding an air of timeless elegance. A large mirror on the wall reflects the warm light, adding to the room's welcoming atmosphere.`
                    },
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `\n\n_"Thank you,"_ he said once you had finished. _"If you need anything during your visit, please don't hesitate to ask. I'm here to assist in any way I can."_`
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `\n\nYou handed the pen back, feeling a sense of formal yet welcoming hospitality. Abots's presence was formidable, but his words carried a warmth that made you feel unexpectedly at ease.`
                    }
                },
                {
                    type: "divider"
                },
                {
                    type: "actions",
                    elements: [
                        {
                            type: "button",
                            text: {
                                type: "plain_text",
                                text: "continue"
                            },
                            value: "greet-the-host",
                            action_id: "greet-the-host"
                        }
                    ]
                }
            ]
        });
    });
};

export default newMemberJoinHandlerP3;