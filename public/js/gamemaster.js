 
/**************************************************************************************************************

USE: contains all functions and socket calls exclusivly needed (in this form) to run the gameshow send these changes to other files and open various popups needet to edit
LINKED FROM: gamemaster.html
AUTHOR: Yanik Kendler
DEPENDS ON: socket, script.js

***************************************************************************************************************/

socket.on("connect", () => {
    console.log(socket);
    console.log(socket.id);
})

socket.on('loadPlayers', (data) => { //displays all players
    console.log("loading players");

    let playerHtml = ""
    for (let i = 0; i < data.length; i++) {
        playerHtml += `
                <div class="player" player-id="${i}">
                    <p class="name">${data[i].Name}</p>
                    <div class="points-parent"><p class="points">${data[i].Score}</p></div>
                    <div>
                        <div style="background-color:${data[i].Special ? 'var(--color-accent-1)' : 'var(--gray-5)'};" onclick="sendSpecialUsed(${i})">multiplier</div>
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

//the following are needed in case there is multiple gamemasters syncing amongst each other

socket.on('selectQuestion', (set, id) => { //uses the questiondata array set by the loadQuestion fetch
    if(set != null && id != null){
        console.log("selection question:", set, id);
        selectQuestion(questionData[set].Text[id], questionData[set].Solution[id])
    }
})

socket.on('closeQuestion', () => {
    closeQuestion()
})

socket.on('startTimer', (data) => {
    setTimer()
})

socket.on('stopTimer', () => {
    killTimer()
})

socket.on('loadFFA', (data) => {
    console.log(data);
    selectQuestion(data.Question, data.Solution)
})

socket.on('awnsers', (data) => { //displays the awnsers that users gave for the gamemaster
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

// used to check if a image url is provided as a question

function selectQuestion(txt, sol){
    console.log("selecting question");
    console.log(txt, sol);

    if(Array.isArray(txt)){
        selected.innerHTML = `
        <div style="background-image: ${txt[1]};" class="image"></div>
        <p class="text">${txt[0]}</p>
        <p class="sol">${sol[0]}</p>
        <div class="buttons">
            <p onclick="sendCloseQuestion()">schließen</p>
            <p onclick="socket.emit('sendToggleImage', '${txt[1]}', '${sol[1]}')">toggle</p>
        </div>`
    }
    else{
        selected.innerHTML= `
        <p class="text">${txt}</p>
        <p class="sol">${sol}</p>
        <div class="buttons">
            <p onclick="sendCloseQuestion()">schließen</p>
        </div>`
    }
    
    //move in selected question panel
    selected.style.border = "3rem solid var(--color-accent-1)"

    selected.style.display = "flex"
    selected.style.border = "3rem solid var(--color-accent-1)"
}

function sendSelectQuestion(set, id){ //set: x coords (categorie) id: y coords (question)
    socket.emit("sendSelectQuestion", set, id)
    selectQuestion(questionData[set].Text[id], questionData[set].Solution[id])
}

function sendCloseQuestion(){
    socket.emit("sendCloseQuestion")
    closeQuestion()
}

function closeQuestion(){
    selected.style.border = "0rem solid var(--color-accent-1)"
    selected.style.display = "none"

    if(timerActive == true){
        killTimer()
    }
}


function startTimer(){
    socket.emit("sendTimer")
}

function sendFFA(){
    socket.emit("sendFFA")
}

function sendSpecialUsed(player, pos){ //toggles specials below names | player: index of player | pos: index of special to toggle
    socket.emit("sendSpecialUsed", player, pos)
}

function getPlayers(){ //rarely used - dictates server to resend players
    socket.emit("getPlayers")
}

function getQuestions(){ //rarely used - dictates server to resend questions
    socket.emit("getQuestions")
}

function sendChangeScore(plusMinus){
    socket.emit("changeScore", plusMinus, scoreInput.value, selectedPlayer)
    changeScorePopup(0)
    scoreInput.value = ""
}

function postPlayer(name){//adds new player
    socket.emit("postPlayer", name)
}

//popups

function playSound(){} //empty so that there is no sounds played by the clients

function numberSel(elem){ //called when u choose how many points you want to sub/add to a player - sets input field value to pressed button
    scoreInput.value = elem.innerText
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
        scoreSel.style.transform = "scale(0)"
        scoreSelHidden = true
        socket.emit("deletePlayerID", selectedPlayer)
    }
}

//UNUSED

function addQuestion(){ //opens the popup to add a new question
    addQuestionPopup.style.transform = "translate(-50%, -50%) scale(1)"
}

function postQuestion(){ //adds new question
    let nameInput = document.getElementById('set-name').value
    let questionInput = document.querySelectorAll("#question-inputs input")

    if(nameInput != "")
    socket.emit("postQuestion", nameInput, questionInput[0].value, questionInput[1].value, questionInput[2].value, questionInput[3].value, questionInput[4].value, questionInput[5].value, questionInput[6].value, questionInput[7].value, questionInput[8].value, questionInput[9].value)

    addQuestionPopup.style.transform = "translate(-50%, -50%) scale(0)" //closes the input popup
}