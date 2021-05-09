const fetch = require("node-fetch");

const { TRELLO_KEY, TRELLO_TOKEN, SLACK_WEBHOOK } = process.env;
console.log(process.env);

const LIST_IDS = ["5d07e96a5065c12c1b364e25", "5d51249911a86f2b70b98a60"];

async function getListDataFromTrello(listId) {
    const rawListResponse = await fetch(
        `https://api.trello.com/1/lists/${listId}?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`
    );
    console.log('1st trello response', rawListResponse);
    const listJson = await rawListResponse.json();
    const name = listJson.name;

    const rawCardResponse = await fetch(
        `https://api.trello.com/1/lists/${listId}/cards?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`
    );
    console.log('2nd trello response', rawCardResponse);
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
            icon_url: "https://a.trellocdn.com/prgb/dist/images/TinyTacoTalking.9128b5432594de9b24d4.png"
        })
    });
}

exports.handler = async (event, context) => {
    try {
        console.log('before foreach');
        await LIST_IDS.forEach(async (listId) => {
            const list = await getListDataFromTrello(listId);
            console.log(list);
            const message = formatMessage(list);
            console.log(message);
            const response = await postMessageToSlack(message);
            console.log(response);
        });
        
        return {
            statusCode: 200,
            body: "All done!",
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: "Whoops, something broke :/ "
        };
    }

};
