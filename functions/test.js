const fetch = require("node-fetch");

const { TRELLO_KEY, TRELLO_TOKEN } = process.env;

exports.handler = async (event, context) => {
    try {
        console.log('before network req');
        const rawCardResponse = await fetch(
            `https://api.trello.com/1/lists/5d07e96a5065c12c1b364e25/cards?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`
        );
        console.log('after main req');
        const data = await rawCardResponse.json();
        console.log('after json call');

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: "Whoops, something broke :/ ",
        };
    }
};
