const nodeData = JSON.parse('{"nodes":[{"name":"n0","item":"miyu","amount":5,"multiplier":1,"xpos":"65.5%","ypos":"25%"},{"name":"n1","item":"credit","amount":3200000,"multiplier":1,"xpos":"54%","ypos":"25%"},{"name":"n2","item":"orb","amount":15,"multiplier":1440,"xpos":"42.5%","ypos":"25%"},{"name":"n3","item":"report","amount":22,"multiplier":2000,"xpos":"31%","ypos":"25%"},{"name":"n4","item":"eligma","amount":8,"multiplier":1,"xpos":"20.5%","ypos":"26%"},{"name":"n5","item":"miyu","amount":7,"multiplier":1,"xpos":"11.5%","ypos":"35%"},{"name":"n6","item":"eligma","amount":12,"multiplier":1,"xpos":"8%","ypos":"52%"},{"name":"n7","item":"credit","amount":2400000,"multiplier":1,"xpos":"10.5%","ypos":"69%"},{"name":"n8","item":"skip","amount":0,"multiplier":0,"xpos":"19%","ypos":"80%"},{"name":"n9","item":"credit","amount":1600000,"multiplier":1,"xpos":"30.2%","ypos":"82%"},{"name":"n10","item":"orb","amount":12,"multiplier":1440,"xpos":"42.2%","ypos":"82%"},{"name":"n11","item":"report","amount":10,"multiplier":2000,"xpos":"54.4%","ypos":"82%"},{"name":"n12","item":"eligma","amount":6,"multiplier":1,"xpos":"66.4%","ypos":"82%"},{"name":"n13","item":"miyu","amount":4,"multiplier":4,"xpos":"78%","ypos":"80%"},{"name":"n14","item":"ticket","amount":1,"multiplier":1,"xpos":"86.5%","ypos":"69.5%"},{"name":"n15","item":"orb","amount":10,"multiplier":1440,"xpos":"89%","ypos":"52%"},{"name":"n16","item":"credit","amount":2000000,"multiplier":1,"xpos":"85.5%","ypos":"35%"},{"name":"n17","item":"report","amount":17,"multiplier":2000,"xpos":"76.5%","ypos":"25%"}]}');
var arrayRolls = [];
var totalMovement = 0;
var keyDown = false;

function addRoll(rollValue) {
    if (rollValue > 0 && rollValue < 7) {
        var newRoll = {};
        newRoll.dice = rollValue;
        var offset = 0;
        if (arrayRolls.length == 0) {
            var offset = getPositionOffset();
        }
        newRoll.oldPos = getRollPosition() + offset;
        newRoll.newPos = (getRollPosition() + rollValue + offset) % 18;
        // Check for celebratory lap complete
        if (getRollPosition() + rollValue > 17) {
            confetti({
                particleCount: 75,
                spread: 90,
                angle: 45,
                origin: {
                    x: 0,
                    y: 1
                }
            });
            confetti({
                particleCount: 75,
                spread: 90,
                angle: 135,
                origin: {
                    x: 1,
                    y: 1
                }
            });
        }
        // Check for bonus movement
        if (newRoll.newPos == 8) {
            newRoll.newPos += 6;
        }
        arrayRolls.push(newRoll);
        localStorage.setItem("rolls", JSON.stringify(arrayRolls));
        calculateStats(newRoll);
        document.getElementById("board-pos-prev").hidden = false;
        document.getElementById("undoButton").disabled = false;
        updateInterface();
    }
}

function calculateStats(roll) {
    // Update the reward table
    var reward = nodeData.nodes[roll.newPos];
    var rewardElement = document.getElementById(reward.item + "Data");
    rewardElement.innerText = (parseInt(rewardElement.innerText.replace(/,/g, '')) + reward.amount).toLocaleString();
    // Update the dice count table
    var countElement = document.getElementById("count" + roll.dice);
    countElement.innerText = (parseInt(countElement.innerText.replace(/,/g, '')) + 1).toLocaleString();
    // Adjust the colors of the elements
    Array.from(document.querySelectorAll(".item-increased")).forEach((element) => element.classList.remove("item-increased"));
    Array.from(document.querySelectorAll(".item-decreased")).forEach((element) => element.classList.remove("item-decreased"));
    rewardElement.classList.add("item-increased");
    countElement.classList.add("item-increased");
    // Update the reward tooltips (if applicable)
    if (reward.item == "report" || reward.item == "orb") {
        var rewardTotal = document.getElementById(reward.item + "Calc");
        rewardTotal.setAttribute("data-bs-original-title", (parseInt(rewardTotal.getAttribute("data-bs-original-title").replace(/,/g, '').replace("[^0-9]+", "")) + (reward.amount * reward.multiplier)).toLocaleString() + " XP");
    }
    // Update the lap count
    if (totalMovement == 0) {
        // If the first roll has an offset, we need to account for that movement somehow
        totalMovement = getPositionOffset();
    }
    totalMovement += (roll.newPos > roll.oldPos) ? (roll.newPos - roll.oldPos) : ((roll.newPos + 18) - roll.oldPos);
    document.getElementById("lapCount").innerText = Math.floor(totalMovement / 18);
    if (Math.floor(totalMovement / 18)) {
        document.getElementById("lapAverage").innerText = (arrayRolls.length / (Math.floor(totalMovement / 18))).toFixed(2);
    }
}

function undoRoll() {
    var roll = arrayRolls.pop();
    // Update the reward table
    var reward = nodeData.nodes[roll.newPos];
    var rewardElement = document.getElementById(reward.item + "Data");
    rewardElement.innerText = (parseInt(rewardElement.innerText.replace(/,/g, '')) - reward.amount).toLocaleString();
    // Update the dice count table
    var countElement = document.getElementById("count" + roll.dice);
    countElement.innerText = (parseInt(countElement.innerText.replace(/,/g, '')) - 1).toLocaleString();
    // Update the colors of the elements
    Array.from(document.querySelectorAll(".item-increased")).forEach((element) => element.classList.remove("item-increased"));
    Array.from(document.querySelectorAll(".item-decreased")).forEach((element) => element.classList.remove("item-decreased"));
    rewardElement.classList.add("item-decreased");
    countElement.classList.add("item-decreased");
    // Update the reward tooltips (if applicable)
    if (reward.item == "report" || reward.item == "orb") {
        var rewardTotal = document.getElementById(reward.item + "Calc");
        rewardTotal.setAttribute("data-bs-original-title", (parseInt(rewardTotal.getAttribute("data-bs-original-title").replace(/,/g, '').replace("[^0-9]+", "")) + (reward.amount * reward.multiplier)).toLocaleString() + " XP");
    }
    // Update the lap count
    totalMovement -= (roll.newPos > roll.oldPos) ? (roll.newPos - roll.oldPos) : ((roll.newPos + 18) - roll.oldPos);
    document.getElementById("lapCount").innerText = Math.floor(totalMovement / 18);
    if (Math.floor(totalMovement / 18) > 0) {
        document.getElementById("lapAverage").innerText = (arrayRolls.length / (Math.floor(totalMovement / 18))).toFixed(2);
    }
    else {
        document.getElementById("lapAverage").innerText = (0).toFixed(2);
    }
    localStorage.setItem("rolls", JSON.stringify(arrayRolls));
    updateInterface();
    if (arrayRolls.length == 0) {
        document.getElementById("board-pos-prev").hidden = true;
        document.getElementById("undoButton").disabled = true;
    }
}

function clearRolls() {
    if (confirm("This will clear all of the data entered so far! Consider saving a copy of the current data on this screen before you perform this action.\n\nAre you sure you want to proceed?")) {
        localStorage.removeItem("rolls");
        totalMovement = 0;
        document.getElementById("lapCount").innerText = 0;
        document.getElementById("lapAverage").innerText = (0).toFixed(2);
        document.getElementById("creditData").innerText = 0;
        document.getElementById("eligmaData").innerText = 0;
        document.getElementById("miyuData").innerText = 0;
        document.getElementById("orbData").innerText = 0;
        document.getElementById("reportData").innerText = 0;
        document.getElementById("ticketData").innerText = 0;
        document.getElementById("count1").innerText = 0;
        document.getElementById("count2").innerText = 0;
        document.getElementById("count3").innerText = 0;
        document.getElementById("count4").innerText = 0;
        document.getElementById("count5").innerText = 0;
        document.getElementById("count6").innerText = 0;
        document.getElementById("board-pos-prev").hidden = true;
        document.getElementById("undoButton").disabled = true;
        initializeRolls();
    }
}

function initializeRolls() {
    var jsonRolls = localStorage.getItem("rolls");
    if (jsonRolls != null) {
        arrayRolls = JSON.parse(jsonRolls);
        if (arrayRolls.length > 0) {
            if (arrayRolls[0].oldPos > 0) {
                document.getElementById("positionRange").value = arrayRolls[0].oldPos;
                updateSlider();
                document.getElementById("positionFlag").classList.remove("bi-flag");
                document.getElementById("positionFlag").classList.add("bi-flag-fill");
            }
            arrayRolls.forEach((roll) => calculateStats(roll))
            document.getElementById("board-pos-prev").hidden = false;
            document.getElementById("undoButton").disabled = false;
        }
    }
    else {
        arrayRolls = [];
    }
    updateInterface();
    document.getElementById("board-pos").hidden = false;
}

function loadRolls() {
    var content = document.getElementById("roll-data").value;
    try {
        var loadedJson = JSON.parse(content);
        var loadedRolls = [];
        loadedJson.forEach((obj) => {
            var roll = {};
            if (obj.dice != null && obj.oldPos != null && obj.newPos != null) {
                if (obj.dice > 0 && obj.dice < 7
                    && obj.oldPos >= 0 && obj.oldPos < 18
                    && obj.newPos >= 0 && obj.newPos < 18) {
                    roll.dice = obj.dice;
                    roll.oldPos = obj.oldPos;
                    roll.newPos = obj.newPos;
                    loadedRolls.push(roll);
                }
            }
        });
        if (confirm("This will overwrite all of the data currently entered so far! If the following information seems incorrect, cancel now to avoid overwriting your data.\n\nFound a total of " + loadedRolls.length + " roll(s).")) {
            arrayRolls = loadedRolls;
            localStorage.setItem("rolls", JSON.stringify(arrayRolls));
            initializeRolls();
        }
    }
    catch (error) {
        alert("The data that was provided did not match the valid format. Please check that you correctly pasted all of your content into the box.");
    }
}

function getPositionOffset() {
    return parseInt(document.getElementById("positionRange").value);
}

function getRollPosition() {
    return arrayRolls.length == 0 ? 0 : arrayRolls[arrayRolls.length - 1].newPos;
}

function getRollPositionPrev() {
    return arrayRolls.length == 0 ? 0 : arrayRolls[arrayRolls.length - 1].oldPos;
}

function updateInterface() {
    document.getElementById("roll-data").value = JSON.stringify(arrayRolls);
    if (arrayRolls.length > 0) {
        document.getElementById("positionButton").disabled = true;
        document.getElementById("board-pos").style.left = nodeData.nodes[getRollPosition()].xpos;
        document.getElementById("board-pos").style.top = nodeData.nodes[getRollPosition()].ypos;
    }
    else {
        document.getElementById("positionButton").disabled = false;
        // If we have no rolls, use the slider's position
        var offset = getPositionOffset();
        document.getElementById("board-pos").style.left = nodeData.nodes[offset].xpos;
        document.getElementById("board-pos").style.top = nodeData.nodes[offset].ypos;
    }
    document.getElementById("board-pos-prev").style.left = nodeData.nodes[getRollPositionPrev()].xpos;
    document.getElementById("board-pos-prev").style.top = nodeData.nodes[getRollPositionPrev()].ypos;
}

function updateSlider() {
    var position = getPositionOffset();
    if (position == 8) {
        position = 14;
    }
    if (position == 0) {
        document.getElementById("positionFlag").classList.add("bi-flag");
        document.getElementById("positionFlag").classList.remove("bi-flag-fill");
        document.getElementById("positionValue").innerText = "Start at the beginning";
    }
    else {
        var image;
        switch (nodeData.nodes[position].item) {
            case "miyu":
                image = "./img/dice/reward_miyu.png";
                break;
            case "eligma":
                image = "./img/dice/reward_eligma.png";
                break;
            case "credit":
                image = "./img/dice/reward_credit.png";
                break;
            case "report":
                image = "./img/dice/reward_report.png";
                break;
            case "orb":
                image = "./img/dice/reward_orb.png";
                break;
            case "ticket":
                image = "./img/dice/reward_ticket.png";
                break;
        }
        document.getElementById("positionFlag").classList.remove("bi-flag");
        document.getElementById("positionFlag").classList.add("bi-flag-fill");
        document.getElementById("positionValue").innerHTML = "Start from <img class=\"reward-small\" src=\"" + image + "\" />x" + (nodeData.nodes[position].amount).toLocaleString(); + " (space " + position + ").";
    }
    document.getElementById("board-pos").style.left = nodeData.nodes[position].xpos;
    document.getElementById("board-pos").style.top = nodeData.nodes[position].ypos;
}

addEventListener("keydown", (event) => {
    console.log(event.code);
    if (!keyDown) {
        keyDown = true;
        switch (event.code) {
            // Number Row + Number Pad
            case "Digit1":
            case "Numpad1":
                addRoll(1);
                break;
            case "Digit2":
            case "Numpad2":
                addRoll(2);
                break;
            case "Digit3":
            case "Numpad3":
                addRoll(3);
                break;
            case "Digit4":
            case "Numpad4":
                addRoll(4);
                break;
            case "Digit5":
            case "Numpad5":
                addRoll(5);
                break;
            case "Digit6":
            case "Numpad6":
                addRoll(6);
                break;
            // Backspace
            case "Backspace":
            case "Delete":
                if (arrayRolls.length > 0) {
                    undoRoll();
                }
                break;
        }
    }
});

addEventListener("keyup", () => {
    keyDown = false;
});