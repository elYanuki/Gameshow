const socket = io();

socket.on("connect", () => {
    console.log(socket);
    console.log(socket.id);
})

socket.on('loadPlayers', (data) => {
    console.log("loading players");

    let playerHtml = ""
    for (let i = 0; i < data.length; i++) {
        playerHtml += `
                <div class="player" player-id="${i}">
                    <p class="name">${data[i].Name}</p>
                    <div class="points-parent"><p class="points">${data[i].Score}</p></div>
                    <div>
                        <div style="background-color:${data[i].Specials[0] ? 'var(--color-accent-1)' : 'var(--gray-5)'};" onclick="sendSpecialUsed(${i}, 0)"><i class="fa-solid fa-hand-point-right"></i></div>
                        <div style="background-color:${data[i].Specials[1] ? 'var(--color-accent-1)' : 'var(--gray-5)'};" onclick="sendSpecialUsed(${i}, 1)"><i class="fa-solid fa-file-pen"></i></div>
                        <div style="background-color:${data[i].Specials[2] ? 'var(--color-accent-1)' : 'var(--gray-5)'};" onclick="sendSpecialUsed(${i}, 2)"><i class="fa-solid fa-shield-halved"></i></div>
                    </div>
                    <i class="fa-solid fa-pen-to-square" onclick="changeScorePopup(${i}, event)"></i>
                </div>`
    }

    playerHtml += ``

    playerParent.innerHTML = playerHtml
})

socket.on('loadQuestions', (data) => {
    console.log("loading questions");

    let questionHtml = ""
            for (let i = 0; i < data.length; i++) {
                questionHtml += `
                <div class="catergory" cat-id="${i}">
                    <h1>${data[i].Name}</h1>
                    <div onclick="sendSelectQuestion(${i},0)" style="opacity: ${(data[i].Used[0] == false) ? 1 : 0.3}"><p>100</p></div>
                    <div onclick="sendSelectQuestion(${i},1)" style="opacity: ${(data[i].Used[1] == false) ? 1 : 0.3}"><p>200</p></div>
                    <div onclick="sendSelectQuestion(${i},2)" style="opacity: ${(data[i].Used[2] == false) ? 1 : 0.3}"><p>300</p></div>
                    <div onclick="sendSelectQuestion(${i},3)" style="opacity: ${(data[i].Used[3] == false) ? 1 : 0.3}"><p>400</p></div>
                    <div onclick="sendSelectQuestion(${i},4)" style="opacity: ${(data[i].Used[4] == false) ? 1 : 0.3}"><p>500</p></div>
                </div>`
            }
    
            questionParent.innerHTML = questionHtml

            questionData = data
})

socket.on('selectQuestion', (data) => {
    selectQuestion(questionData[data[0]].Text[data[1]], questionData[data[0]].Solution[data[1]])
})

socket.on('closeQuestion', () => {
    closeQuestion()
    killTimer()
})

socket.on('startTimer', (data) => {
    setTimer(timerlenght)
})

socket.on('loadFFA', (data) => {
    console.log(data);
    selectQuestion(data.Question, data.Solution)
})

socket.on('awnsers', (data) => {
    console.log("awnsers recieved", data);

    document.getElementById('awnsers').style.display = "block"

    let html = ""

    for (let i = 0; i < data.length; i++) {
       html += `<p>${data[i]}</p>`
    }

    html += `<p onclick="closeAwnsers()">close</p>`

    document.getElementById('awnsers').innerHTML = html
})

function closeAwnsers(){
    document.getElementById('awnsers').style.display = "none"
}

let isUrl = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

function selectQuestion(txt, sol){
    console.log("selecting question");
    console.log(questionData);

    if(isUrl.test(txt)){
        console.log("is url");
        selected.querySelector("#hidden").src = txt
        selected.querySelector("#shown").src = sol

        selected.querySelector("#shown").style.opacity = 0

    }
    else{
        selected.querySelector(".text").innerText = txt
        selected.querySelector(".sol").innerText = sol

        selected.querySelector("#hidden").style.opacity = 0
        selected.querySelector("#shown").style.opacity = 0
    }

    selected.style.display = "flex"
    selected.style.border = "3rem solid var(--color-accent-1)"

    textP.style.opacity = "1"
    textP.style.marginBottom = "0"
}

function sendSelectQuestion(set, id){
    socket.emit("sendSelectQuestion", set, id)
    selectQuestion(questionData[set].Text[id], questionData[set].Solution[id])
}

function sendCloseQuestion(){
    socket.emit("sendCloseQuestion")
    closeQuestion()
    killTimer()
}

function startTimer(){
    socket.emit("sendTimer")
    setTimer(timerlenght)
}

function sendFFA(){
    socket.emit("sendFFA")
}

function sendSpecialUsed(player, pos){
    socket.emit("sendSpecialUsed", player, pos)
}

function getPlayers(){
    socket.emit("getPlayers")
}

function getQuestions(){
    socket.emit("getQuestions")
}

function sendChangeScore(plusMinus){
    socket.emit("changeScore", plusMinus, scoreInput.value, selectedPlayer)
    changeScorePopup(0)
    scoreInput.value = ""
}

function postPlayer(name){
    socket.emit("postPlayer", name)
}

function createQuestion(){
    let nameInput = document.getElementById('set-name').value
    let questionInput = document.querySelectorAll("#question-inputs input")

    if(nameInput != "")
    socket.emit("postQuestion", nameInput, questionInput[0].value, questionInput[1].value, questionInput[2].value, questionInput[3].value, questionInput[4].value, questionInput[5].value, questionInput[6].value, questionInput[7].value, questionInput[8].value, questionInput[9].value)

    editmodePopup.style.transform = "translate(-50%, -50%) scale(0)"
}

//popups

function playSound(){}

function numberSel(elem){
    scoreInput.value = elem.innerText
}

function editmode(){
    editmodePopup.style.transform = "translate(-50%, -50%) scale(1)"
}

function ffaPop(){
    ffaPopup.style.transform = "translate(-50%, -50%) scale(1)"
    console.log("ffa");
}

function triggerFFA(){
    if(confirm("u wanna trigger FFA?") == true){
        sendFFA()
    }
}

function deletePlayer(){
    if(confirm("sure u want to delete selected Player") == true){
        socket.emit("deletePlayerID", selectedPlayer)
    }
}