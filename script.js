async function main() {
    try {
        setTimeStamp();
        let jsonData = {};
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

async function loadApps(jsonData) {
    jsonData.apps.forEach(async (app) => {
        const htmlElement = document.getElementById(app.id);
        const response = await fetchWithTimeout(jsonData.apihost + `/api/appstatus?url=${encodeURIComponent(app.url)}&response=${app.response}`, {
            method: 'POST'
        });
        const { status } = await response.json();
        htmlElement.innerText = status;
        htmlElement.classList = "";
        htmlElement.classList.add(status == "online" ? "text-success" : "text-danger");
    });
    return;
}

async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 20000 } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
        ...options,
        signal: controller.signal
    });
    clearTimeout(id);
    return response;
}

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