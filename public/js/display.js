
/**************************************************************************************************************

    USE: contains all functions and socket calls exclusivly needed (in this form) to display/sync all changes to the gameshow
    LINKED FROM: display.html
    AUTHOR: Yanik Kendler
    DEPENDS ON: socket, script.js

***************************************************************************************************************/

const socket = io();

socket.on("connect", () => {
    console.log(socket);
    console.log(socket.id);
})

socket.on('loadPlayers', (data) => { //loads the player overview
    console.log("loading players");

    let playerHtml = ""
    for (let i = 0; i < data.length; i++) {
        playerHtml += `
        <div class="player" player-id="${i}">
            <p class="name">${data[i].Name}</p>
            <div class="points-parent"><p class="points">${data[i].Score}</p></div>
            <div>
                <div style="background-color:${data[i].Specials[0] ? 'var(--color-accent-1)' : 'var(--gray-5)'};"><i class="fa-solid fa-hand-point-right"></i></div>
                <div style="background-color:${data[i].Specials[1] ? 'var(--color-accent-1)' : 'var(--gray-5)'};"><i class="fa-solid fa-file-pen"></i></div>
                <div style="background-color:${data[i].Specials[2] ? 'var(--color-accent-1)' : 'var(--gray-5)'};"><i class="fa-solid fa-shield-halved"></i></div>
            </div>
        </div>`
    }

    playerHtml += ``

    playerParent.innerHTML = playerHtml
})


socket.on('loadQuestions', (data) => { //loads the question overview
    console.log("loading questions");
    console.log(data);
    let questionHtml = ""
    for (let i = 0; i < data.length; i++) {
        questionHtml += `
                <div class="catergory" cat-id="${i}">
                    <h1>${data[i].Name}</h1>
                    <div style="opacity: ${(data[i].Used[0] == false) ? 1 : 0}"><p>100</p></div>
                    <div style="opacity: ${(data[i].Used[1] == false) ? 1 : 0}"><p>200</p></div>
                    <div style="opacity: ${(data[i].Used[2] == false) ? 1 : 0}"><p>300</p></div>
                    <div style="opacity: ${(data[i].Used[3] == false) ? 1 : 0}"><p>400</p></div>
                    <div style="opacity: ${(data[i].Used[4] == false) ? 1 : 0}"><p>500</p></div>
                </div>`
    }

    questionParent.innerHTML = questionHtml

    questionData = data
})

socket.on('startTimer', () => {
    setTimer()
})

socket.on('stopTimer', () => {
    killTimer()
})

socket.on('selectQuestion', (set, id) => { //uses the questiondata array set by the loadQuestion fetch
    if(set != null && id != null){
        console.log("selection question:", set, id);
        selectQuestion(questionData[set].Text[id])
    }
})

socket.on('closeQuestion', () => {
    console.log("closing question");
    closeQuestion()
    killTimer()
})

socket.on('loadFFA', (data) => { //loads Free For All question
    console.log(data);
    selectQuestion(data.Question)
})

socket.on('openRules', () => {
    rules.style.display = "flex"
})

socket.on('openCategories', () => {
    cat.style.display = "block"
})

socket.on('closeInfo', () => { //closes the rules and categorie overviews above
    rules.style.display = "none"
    cat.style.display = "none"
})

//will be used to check if a image url is provided as a question
let isUrl = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

function selectQuestion(txt){
    console.log("loading selected question");
    console.log(txt);

    selected.querySelector(".text").innerText = txt
    selected.style.bottom = "0%"

    selected.style.border = "3rem solid var(--color-accent-1)"
    
    textP = selected.querySelector("p")

    textP.style.opacity = "1"
    textP.style.marginBottom = "0"
}

function playSound(name){ //used to play sounds that acompany the gameplay
    switch (name) {
        case `timeUp`:
            sound.src = "./sound/bell.wav"
            break;
    }
}