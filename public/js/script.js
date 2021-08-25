const ttc_bus_refresh_interval = 20000;
const dueNow = 15
    // Credit: nolittleplans https://imgur.com/gallery/qn0mbNQ
const pictures = ["darkblueskydock.jpeg", "cityroad.jpg", "purplemountains.jpg", "earthoceancloud.jpg", "sanddune.jpg", "sparklefiber.jpg", "nightmountains.jpg", "redtreelake.jpg", "taffyswirl.jpg", "desertfence.jpg", "skateboard.jpg", "intersection.jpg", "rainystreet.jpg", "blueredmoon.jpg", "bluespaceice.jpg", "blackyellowstairs.jpg", "blobswirlpurplewhite.jpg", "redplanet.jpg", "campervannight.jpg", "darthvader.png", "deathstar.jpg", "tentstarrynight.jpg", "stonenightlake.jpg", "lightdarkocean.jpg", "smallboatlake.jpg", "firevinylpaint.jpg", "nightroadheadlight.jpg", "dusknewyork.jpg", "darkoceanisland.jpg", "citynightheadlight.jpg", "fognightcity.jpg", "castleonmountain.jpg", "metallspikeball.jpg", "nightalleyway.jpg", "catknight.jpg", "sharpoceanrock.jpg", "bluemountain.jpg", "mountainlookout.jpg", "purpleredplanet.jpg", "nightfields.jpg", "wetroadnight.jpg", "", "", "", "", ""]
    // "japanwavedrawing.jpg"

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
    return div
}

function changeBusTimeText(bus_time_table, index, seconds) {

    const minute = (Math.floor(seconds / 60) > 0 ? `${Math.floor(seconds/60)} m ` : "")
    const time_text = (seconds > dueNow ? `${minute}${seconds - Math.floor(seconds/60)*60} s ` : "Due Now")
    if (bus_time_table.childNodes.length > index) {
        var div = bus_time_table.childNodes[index]
        div.textContent = time_text
    } else {
        var div = createDiv(time_text)
        bus_time_table.appendChild(div)
    }
    div.setAttribute("seconds", seconds)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getTTCBus() {
    const pred_data = {
        command: "predictions",
        a: "ttc",
        stopId: "15536"
    }
    const route_ttc_url = `https://retro.umoiq.com/service/publicXMLFeed?${new URLSearchParams(pred_data).toString()}`

    const ttc_url = `https://retro.umoiq.com/service/publicXMLFeed?${new URLSearchParams(pred_data).toString()}`
    console.log(ttc_url)
    const response = await fetch(ttc_url);
    console.log(`XML Response: ${response.status} ${response.statusText}`);
    const bus_xml = new window.DOMParser().parseFromString(await response.text(), "text/xml");
    if (bus_xml.getElementsByTagName('Error').length != 0) {
        console.log(`Error: ${bus_xml.getElementsByTagName('Error')[0].textContent}`)
        return
    }

    document.getElementById('stop-name').textContent = bus_xml.getElementsByTagName("predictions")[0].getAttribute("stopTitle")
    document.getElementById('route-name').textContent = bus_xml.getElementsByTagName("direction")[0].getAttribute("title").replace("North - ", "").replace("South - ", "").replace("East - ", "").replace("West - ", "")

    const bus_time_table = document.getElementById('bus-times');
    bus_time_table.innerHTML = ''
    const predictions = bus_xml.getElementsByTagName("prediction")
    for (let index = 0; index < predictions.length; index++) {
        const prediction = predictions[index]
        changeBusTimeText(bus_time_table, index, parseInt(prediction.getAttribute("seconds")))
    }

    for (let j = 1; j <= ttc_bus_refresh_interval / 1000; j++) {
        for (var index = 0; index < parseInt(bus_time_table.childNodes.length); index++) {
            const time_div = bus_time_table.childNodes[index]
            changeBusTimeText(bus_time_table, index, parseInt(time_div.getAttribute("seconds") - 1))
        }
        await sleep(995);
    }
}

async function getTTCSubway() {
    const response = await fetch('cropped_stop_times.csv');
    const data = await response.text()
}

async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function startImageTransition() {

    var top = -5;
    let curr_image = document.getElementById('background-img-top');
    let old_image = document.getElementById('background-img-back');
    curr_image.childNodes[0].style.opacity = 1;
    old_image.childNodes[0].style.opacity = 1;

    setInterval(changeBackgroundImage, 10000);

    async function changeBackgroundImage() {

        curr_image.style.zIndex = top + 1;
        await sleep(300);
        old_image.style.zIndex = top;
        await sleep(300);

        old_image.childNodes[0].src = `backgrounds/${pictures[Math.floor(Math.random() * pictures.length)]}`;

        console.log(old_image.childNodes[0].src)

        await transition(curr_image);
        await sleep(300);
        curr_image.style.zIndex = top - 2;
        await sleep(300);
        curr_image.childNodes[0].style.opacity = 1;
        // switch curr and old image
        [curr_image, old_image] = [old_image, curr_image];
    }

    function transition(image) {
        return new Promise(function(resolve, reject) {

            var del = 0.01;
            var id = setInterval(changeOpacity, 10);

            function changeOpacity() {
                image.childNodes[0].style.opacity -= del;
                if (image.childNodes[0].style.opacity <= 0) {
                    clearInterval(id);
                    resolve();
                }
            }


        })
    }


}

window.onload = function() {
    setCurrentTime();
    updateTimeAtMinTop();
    getTTCBus();
    setInterval(getTTCBus, ttc_bus_refresh_interval);
    startImageTransition()
    setCurrentDate();
    updateTimeAtMidnight();
};