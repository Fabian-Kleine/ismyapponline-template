//find out more on how use script.js: https://ismyapponline.vercel.app/docs/api/scriptjs
//find out more on how to write your custom script: https://ismyapponline.vercel.app/docs/api/custom-script

async function main() {
    try {
        setTimeStamp();
        let jsonData = {};
        //reads the data from data.json
        //you can also hard code this like this:
        // const jsonData = {
        //     apihost: "host",
        //     apps: [
        //         {
        //             id: "4b10868a-bc5c-4b66-8d49-52171fb44870",
        //             url: "https://example.com",
        //             response: "nothing"
        //         },
        //         //add more apps
        //     ],
        //     refreshTimer: true
        // }
        await fetch('./data.json')
            .then((res) => res.json())
            .then((json) => jsonData = json);
        if (Object.keys(jsonData).length === 0) throw new Error("Failed to load data.json")
        await loadApps(jsonData);
        countdown(60, jsonData.refreshTimer);
    } catch (error) {
        console.error(error)
    }
}

main()

//fetches the status from the IsMyAppOnline API and applies it to an HTML element
async function loadApps(jsonData) {
    jsonData.apps.forEach(async (app) => {
        const htmlElement = document.getElementById(app.id);
        const response = await fetch(jsonData.apihost + `/api/appstatus?url=${encodeURIComponent(app.url)}&response=${app.response}`, {
            method: 'POST'
        });
        const { status } = await response.json();

        //when status is typeof object it contains a custom status which contains a color and a statusText
        //more about the custom status: https://ismyapponline.vercel.app/docs/api/custom-status
        if (typeof status == "object") {
            htmlElement.innerText = status.statusText;
            htmlElement.classList = "";
            const colorClass = status.color == "green" ? "text-success" : status.color == "red" ? "text-danger" : "text-warning";
            htmlElement.classList.add(colorClass);
            return;
        }
        htmlElement.innerText = status;
        htmlElement.classList = "";
        htmlElement.classList.add(status == "online" ? "text-success" : "text-danger");
    });
    return;
}

//the countdown reloads the page after 1 minute when refreshTimer is set to true in data.json
//the countdown is placed inside and HTML element
function countdown(duration, refreshTimer) {
    const timerElement = document.getElementById("timerDisplay");
    if (!refreshTimer) {
        timerElement.parentElement.remove();
        return;
    }
    var timer = duration, minutes, seconds;
    setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        timerElement.innerText = minutes + ":" + seconds;
        if (--timer < 0) {
            timerElement.innerText = "00:00";
            window.location.href = '/';
        }
    }, 1000)
}


//Gets the current time and date and places it in a HTML element
function setTimeStamp() {
    const timeContainer = document.getElementById('time');
    const date = new Date(Date.now());
    let options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true
    };
    const time = date.toLocaleString('en-US', options);
    timeContainer.innerHTML = timeContainer.innerHTML.replace('TIME', time);
}