 
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

let touchstartX = 0
let touchendX = 0
    
function checkDirection() {
  if (touchendX - touchstartX < -100) swipe(0)//left
  if (touchendX - touchstartX > 100) swipe(1)//left
}

document.addEventListener('touchstart', e => {
  touchstartX = e.changedTouches[0].screenX
})

document.addEventListener('touchend', e => {
  touchendX = e.changedTouches[0].screenX
  checkDirection()
})

let mode = 1
const articles = document.querySelectorAll('article')
function swipe(to){
    if(mode == to)
        return

    if(mode == 0){
        mode = 1
        articles[0].dataset.position = "mid"
        articles[1].dataset.position = "right"
    }
    else{
        mode = 0
        articles[0].dataset.position = "left"
        articles[1].dataset.position = "mid"
    }

    document.querySelector('#swipe-marker-container .swipe-marker').classList.toggle("left")
    document.querySelector('#swipe-marker-container .swipe-marker').classList.toggle("right")
}

socket.on('loadPlayers', (data) => { //displays all players
    console.log("loading players");

    let playerHtml = ""
    if(data.length == 0)
        playerHtml = "<p class='no-players'>no players yet</p>"
    for (let i = 0; i < data.length; i++) {
        playerHtml += `
                <div class="player" player-id="${i}">
                    <p class="name">${data[i].name}</p>
                    <div class="points-parent"><p class="points">${data[i].score}</p></div>
                    <div>
                        <div class="special" style="background-color:${data[i].special ? 'var(--color-accent-1)' : 'var(--gray-5)'};" onclick="sendSpecialUsed(${i})">multiplier</div>
                    </div>
                    <i class="fa-solid fa-pen-to-square" onclick="changeScorePopup(${i}, event)"></i>
                </div>`
    }

    playerParent.innerHTML = playerHtml
})

socket.on('loadQuestions', (data) => {
    console.log("loading questions");

    let questionHtml = ""
            for (let i = 0; i < data.length; i++) {
                questionHtml += `
                <div class="catergory" cat-id="${i}">
                    <h1>${data[i].name}</h1>
                    <div onclick="sendSelectQuestion(${i},0)" style="opacity: ${(data[i].questions[0].used == false) ? 1 : 0.3}"><p>100</p></div>
                    <div onclick="sendSelectQuestion(${i},1)" style="opacity: ${(data[i].questions[1].used == false) ? 1 : 0.3}"><p>200</p></div>
                    <div onclick="sendSelectQuestion(${i},2)" style="opacity: ${(data[i].questions[2].used == false) ? 1 : 0.3}"><p>300</p></div>
                    <div onclick="sendSelectQuestion(${i},3)" style="opacity: ${(data[i].questions[3].used == false) ? 1 : 0.3}"><p>400</p></div>
                    <div onclick="sendSelectQuestion(${i},4)" style="opacity: ${(data[i].questions[4].used == false) ? 1 : 0.3}"><p>500</p></div>
                </div>`
            }
    
            questionParent.innerHTML = questionHtml

            questionData = data
})

//the following are needed in case there is multiple gamemasters syncing amongst each other

socket.on('selectQuestion', (set, id) => { //uses the questiondata array set by the loadQuestion fetch
    if(set != null && id != null){
        console.log("selection question:", set, id);
        
        selectQuestion(questionData[set].questions[id], questionData[set].name)
    }
})

socket.on('setTimer', (value) => {
    setTimer(value)
})

socket.on('stopTimer', () => {
    killTimer()
})

socket.on('loadFFA', (data) => {
    selectQuestion(data)
})

socket.on('answers', (data) => { //displays the awnsers that users gave for the gamemaster
    console.log("answers recieved", data);

    document.getElementById('answers').style.display = "flex"

    let html = "<table><tr><th>player</th><th>answer</th></tr>"

    for (let i = 0; i < data.length; i++) {
       html += `
        <tr>
            <td>${data[i].player}</td>
            <td>${data[i].answer}</td>
        </tr>`
    }

    html += `</table><p onclick="closeAwnsers()">close</p>`

    document.getElementById('answers').innerHTML = html
})

function closeAwnsers(){
    document.getElementById('answers').style.display = "none"
}

// used to check if a image url is provided as a question

function selectQuestion(data){
    console.log("selecting question", data);

    if(data == null){console.error("question-data is null"); return}

    swipe(0)

    switch (data.type) {
        case 0: //default
            selected.innerHTML= `
                <p class="text">${data.text}</p>
                <p class="sol">${data.solution}</p>
                <div class="buttons">
                    <p onclick="sendCloseQuestion()">schließen</p>
                </div>`
            break;
        case 1: //image
            selected.innerHTML = `
                <div style="background-image: ${data.img[0]};" class="image"></div>
                <p class="text">${data.text}</p>
                <p class="sol">${data.solution}</p>
                <div class="buttons">
                    <p onclick="sendCloseQuestion()">schließen</p>
                    <p onclick="socket.emit('sendToggleImage', '${data.img[0]}', '${data.img[1]}')">toggle</p>
                </div>`
                console.log("image");
            break;
        case 2: //multiple choice
            selected.innerHTML= `
                <p class="text">${data.text}</p>
                <div class="options">
                    <p>${data.options[0]}</p>
                    <p>${data.options[1]}</p>
                    <p>${data.options[2]}</p>
                    <p>${data.options[3]}</p>
                </div>
                <p class="sol">${data.solution}</p>
        
        
                <div class="buttons">
                    <p onclick="sendCloseQuestion()">schließen</p>
                </div>`
            break;
        case 10: //FFA
        case 11:
            selected.innerHTML= `
                <p class="text">${data.question}</p>
                <p class="sol">${data.solution}</p>
                <div class="buttons">
                    <p onclick="sendCloseQuestion()">schließen</p>
                </div>`
            break;
    }
    
    selected.style.display = "flex"
    selected.style.border = "3rem solid var(--color-accent-1)"
    
    selected.scrollIntoView(false)
}

function sendSelectQuestion(set, id){ //set: x coords (categorie) id: y coords (question)
    socket.emit("sendSelectQuestion", set, id)
    selectQuestion(questionData[set].questions[id])
}

function sendCloseQuestion(){
    socket.emit("sendCloseQuestion")
    closeQuestion()
}

function closeQuestion(){
    selected.style.border = "0rem solid var(--color-accent-1)"
    selected.innerHTML = ""
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