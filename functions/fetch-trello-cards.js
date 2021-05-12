const fetch = require("node-fetch");

const { TRELLO_KEY, TRELLO_TOKEN, SLACK_WEBHOOK } = process.env;

async function getListDataFromTrello(listId) {
    const rawListResponse = await fetch(
        `https://api.trello.com/1/lists/${listId}?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`
    );

    const listJson = await rawListResponse.json();
    const name = listJson.name;

    const rawCardResponse = await fetch(
        `https://api.trello.com/1/lists/${listId}/cards?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`
    );

    const cards = await rawCardResponse.json();

    return { name, cards };
}

function formatMessage({ name, cards }) {
    let message = `📝 ${name}\n`;
    cards.forEach(({ name }) => {
        message += `* ${name}\n`;
    });
    return message;
}

async function postMessageToSlack(message) {
    return await fetch(SLACK_WEBHOOK, {
        method: "POST",
        body: JSON.stringify({
            text: message,
            username: "Trello Babe",
            icon_url:
                "https://a.trellocdn.com/prgb/dist/images/TinyTacoTalking.9128b5432594de9b24d4.png",
        }),
    });
}

exports.handler = async (event, context) => {
    try {
        const listId = event.queryStringParameters.listId;
        const list = await getListDataFromTrello(listId);
        const message = formatMessage(list);

        await postMessageToSlack(message);

        return {
            statusCode: 200,
            body: "All done!",
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: "Whoops, something broke -> ", err,
        };
    }
};
