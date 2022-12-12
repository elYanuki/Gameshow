
/**************************************************************************************************************

    USE: contains all functions and socket calls exclusivly needed (in this form) to display/sync all changes to the gameshow
    LINKED FROM: display.html
    AUTHOR: Yanik Kendler
    DEPENDS ON: socket, script.js

***************************************************************************************************************/

sound.volume = 0.2;

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
                <div style="background-color:${data[i].Special ? 'var(--color-accent-1)' : 'var(--gray-5)'};">multiplier</div>
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
    if(timerActive == true)
        playSound("timeUp")

    killTimer()
})

socket.on('selectQuestion', (set, id) => { //uses the questiondata array set by the loadQuestion fetch
    if(set != null && id != null){
        console.log("selection question:", set, id);
        selectQuestion(questionData[set].Text[id], questionData[set].Name)
    }
})

socket.on('loadFFA', (data) => { //loads Free For All question
    console.log(data);
    selectQuestion(data.Question, "free for all")
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

socket.on('scrollPlayers', (direction) => {
    if(direction == 0){ //up
        players.scroll({
            top: 0,
            behavior: "smooth"
          })
    }
    else{
        players.scroll({
            top: 3000,
            behavior: "smooth"
          })
    }
})

//will be used to check if a image url is provided as a question
let isUrl;

function selectQuestion(txt, catName){
    console.log("loading selected question");
    console.log(txt);
    
    if(Array.isArray(txt)){//image question
        selected.innerHTML= `<span class="header">${catName}</span><div style="background-image: ${txt[1]};" class="image"></div><p class="text">${txt[0]}</p>`
    }
    else{
        selected.innerHTML= `<span class="header">${catName}</span><p class="text">${txt}</p>`    
    }
    
    //move in selected question panel
    selected.style.bottom = "0%"
    selected.style.border = "3rem solid var(--color-accent-1)"
}

function playSound(name){ //used to play sounds that acompany the gameplay
    console.log("sound", name);
    switch (name) {
        case `timeUp`:
            sound.src = "./sound/bell.wav"
            break;
    }
}