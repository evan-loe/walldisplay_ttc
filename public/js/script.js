const ttc_bus_refresh_interval = 20000;
const dueNow = 15

function showAtMinTop() {
    setInterval(function() {
        setCurrentTime();
    }, 60000)
}

function updateTimeAtMinTop() {
    var now = new Date();
    console.log(new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, now.getSeconds(), 0))
    var msToMinTop = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 0, 0) - now;
    console.log("Waiting %d s to update time", msToMinTop / 1000)
    setTimeout(function() {
        setCurrentTime();
        showAtMinTop();
    }, msToMinTop);

}

function setCurrentTime() {
    var display = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: 'false' });
    document.getElementById('curr-time').innerHTML = display.replaceAll(".", "");
}

function showAt12() {
    setInterval(function() {
        setCurrentDate();
    }, 86400000)
}

function updateTimeAtMidnight() {
    var now = new Date();
    var msTo12 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 24, 0, 0, 0) - now;
    console.log("Waiting %d s to update date", msTo12 / 1000)
    setTimeout(function() {
        setCurrentDate();
        showAt12();
    }, msTo12);
}

function setCurrentDate() {
    var display = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', })
    document.getElementById('curr-date').innerHTML = display.replaceAll(",", "");
}


function createDiv(text) {
    let div = document.createElement("div");
    div.textContent = text;
    div.classList = 'timer';
    return div
}

function changeBusTimeText(timer, seconds) {
    const minute = (Math.floor(seconds / 60) > 0 ? `${Math.floor(seconds/60)} m ` : "");
    timer.innerHTML = (seconds > dueNow ? `${minute}${seconds - Math.floor(seconds/60)*60} s ` : "Due Now");
    timer.setAttribute("seconds", seconds)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getTTCBus(stopId, widget) {
    const pred_data = {
        command: "predictions",
        a: "ttc",
        stopId: stopId
    }

    const ttc_url = `https://retro.umoiq.com/service/publicXMLFeed?${new URLSearchParams(pred_data).toString()}`
    console.log(ttc_url)
    const response = await fetch(ttc_url);
    console.log(`XML Response: ${response.status} ${response.statusText}`);
    const bus_xml = new window.DOMParser().parseFromString(await response.text(), "text/xml");
    if (bus_xml.getElementsByTagName('Error').length != 0) {
        console.log(`Error: ${bus_xml.getElementsByTagName('Error')[0].textContent}`)
        return
    }
    widget.querySelector('.route-title').textContent = bus_xml.getElementsByTagName("predictions")[0].getAttribute("stopTitle")
    widget.querySelector('.route-subtitle').textContent = bus_xml.getElementsByTagName("direction")[0].getAttribute("title").replace("North - ", "").replace("South - ", "").replace("East - ", "").replace("West - ", "")
    let bus_time_table = widget.getElementsByClassName('bus-times')[0]
    bus_time_table.innerHTML = '';
    const predictions = bus_xml.getElementsByTagName("prediction")
    for (let prediction of predictions) {
        var div = createDiv("");
        div.setAttribute('seconds', parseInt(prediction.getAttribute('seconds')));
        bus_time_table.appendChild(div);
    }
    clearInterval(countdownFxn);
    countdownTTCTime();
    countdownFxn = setInterval(countdownTTCTime, 995);
}

async function countdownTTCTime() {

    for (let ttcWidget of document.getElementsByClassName('ttc')) {
        for (let timer of ttcWidget.getElementsByClassName('timer')) {
            changeBusTimeText(timer, parseInt(timer.getAttribute("seconds") - 1))
        }
    }

    // for (let j = 1; j <= ttc_bus_refresh_interval / 1000; j++) {
    //     for (var index = 0; index < parseInt(bus_time_table.childNodes.length); index++) {


    //     }

    // }
}

// async function getTTCSubway() {
//     const response = await fetch('cropped_stop_times.csv');
//     const data = await response.text()
// }

async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}


function widgetMargin() {
    const winHeight = window.innerHeight;
    const winWidth = window.innerWidth;
    console.log(`Win dim: ${winHeight},${winWidth}`)
    let widgets = document.getElementsByClassName('widget');
    widgetHeight = widgets[0].clientHeight
    let marginT = 0.001 * winHeight;
    let marginB = 0.025 * winHeight;

    if ((winHeight - widgetHeight * 4) / 4 > 15) {
        marginT = (winHeight - widgetHeight * 4) / 8;
        marginB = (winHeight - widgetHeight * 4) / 8;
    } else if ((winHeight - widgetHeight * 3) / 3 > 15) {
        marginT = (winHeight - widgetHeight * 3) / 6;
        marginB = (winHeight - widgetHeight * 3) / 6;
    } else if ((winHeight - widgetHeight * 2) / 2 > 15) {
        marginT = (winHeight - widgetHeight * 2) / 4;
        marginB = (winHeight - widgetHeight * 2) / 4;
    } else if ((winHeight - widgetHeight) > 15) {
        marginT = (winHeight - widgetHeight) / 2;
        marginB = (winHeight - widgetHeight) / 2;
    }
    for (widget of widgets) {
        // console.log(`Margin b4:${widget.style.margin}`)
        widget.style.marginTop = `${marginT}px`;
        widget.style.marginBottom = `${marginB}px`;
        // console.log(`Margin aft:${widget.style.margin}`)
    }

}


window.onload = function() {
    setCurrentTime();
    updateTimeAtMinTop();
    getTTCBus("15536", document.getElementsByClassName('bus')[0]);
    setInterval(getTTCBus, ttc_bus_refresh_interval, "15536", document.getElementsByClassName('bus')[0]);
    setCurrentDate();
    updateTimeAtMidnight();
    widgetMargin();
};

countdownTTCTime();
var countdownFxn = setInterval(countdownTTCTime, 995);


window.onresize = widgetMargin;