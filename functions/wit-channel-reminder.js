const fetch = require("node-fetch");

const { SLACK_WEBHOOK_WIT } = process.env;


async function postMessageToSlack(message) {
    return await fetch(SLACK_WEBHOOK_WIT, {
        method: "POST",
        body: JSON.stringify({
            text: message
        }),
    });
}

exports.handler = async (event, context) => {
    try {
        const message = ':mega:  PSA: We have a private WiT channel :wit-notts: \n\nIf you would like to join our safe space channel for women and non-binary folks, please see: https://nott.tech/2SQc3oR :orange_heart: ';

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
