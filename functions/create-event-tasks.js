const fetch = require("node-fetch");
const {
    isMonday,
    nextMonday,
    isThursday,
    nextThursday,
    format,
    add,
    sub,
} = require("date-fns");
const tasks = require("./helpers/event-tasks");

const { TRELLO_KEY, TRELLO_TOKEN, UBER_BOARD_ID } = process.env;

function getEventDate(eventName) {
    const today = new Date();
    let nextMonth;

    if (today.getMonth() === 11) {
        // december
        nextMonth = new Date(today.getFullYear() + 1, 0, 1);
    } else {
        nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    }

    switch (eventName) {
        case "wit": {
            if (isThursday(nextMonth)) {
                // first of the month is a Thursday
                return nextMonth;
            } else {
                return nextThursday(nextMonth);
            }
        }
        case "tn": {
            if (isMonday(nextMonth)) {
                // first of the month is a Monday
                return nextMonday(nextMonth);
            } else {
                return nextMonday(nextMonday(nextMonth));
            }
        }
        default: {
            throw new Error("Invalid event name");
        }
    }
}

function getEventTitle(eventName, eventDate) {
    const fullName = eventName === "wit" ? "Women in Tech" : "Tech Nottingham";
    return `${fullName} ${format(eventDate, "MMMM yyyy")}`;
}

async function createEventTasks(event) {
    const nextEventDate = getEventDate(event);
    const nextEventTitle = getEventTitle(event, nextEventDate);

    // create list on uber board
    const newListResponse = await fetch(`https://api.trello.com/1/lists`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            key: TRELLO_KEY,
            token: TRELLO_TOKEN,
            name: nextEventTitle,
            idBoard: UBER_BOARD_ID,
        }),
    });
    const listDetails = await newListResponse.json();

    console.log(listDetails);

    // create cards for each task and add to the new list
    const cardPromises = tasks.map(async (task) => {
        await fetch(`https://api.trello.com/1/cards`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                key: TRELLO_KEY,
                token: TRELLO_TOKEN,
                name: task.name,
                due:
                    task.dueDateOffset.when === "before"
                        ? sub(nextEventDate, task.dueDateOffset)
                        : add(nextEventDate, task.dueDateOffset),
                idList: listDetails.id,
            }),
        });
    });

    await Promise.all(cardPromises);
}

exports.handler = async (event, context) => {
    try {
        const eventName = event.queryStringParameters.eventName;
        await createEventTasks(eventName);

        return {
            statusCode: 200,
            body: "All done!",
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: "Whoops, something broke -> ",
            err,
        };
    }
};
