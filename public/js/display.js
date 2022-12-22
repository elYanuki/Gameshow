
/**************************************************************************************************************

    USE: contains all functions and socket calls exclusivly needed (in this form) to display/sync all changes to the gameshow
    LINKED FROM: display.html
    AUTHOR: Yanik Kendler
    DEPENDS ON: socket, script.js

***************************************************************************************************************/

socket.on("connect", () => {
})

socket.on('loadPlayers', (data) => { //loads the player overview
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
                <div class="special" style="background-color:${data[i].special ? 'var(--color-accent-1)' : 'var(--gray-5)'};">multiplier</div>
            </div>
        </div>`
    }

    playerParent.innerHTML = playerHtml
})


socket.on('loadQuestions', (data) => { //loads the question overview
    console.log("loading questions");
    console.log(data);
    let questionHtml = ""
    for (let i = 0; i < data.length; i++) {
        questionHtml += `<div class="catergory" cat-id="${i}"><h1>${data[i].name}</h1>`

        for (let j = 0; j < 5; j++) {
            if(data[i].questions[j].used == false){ //qustion unused
                questionHtml += `<div style="opacity: 1;" ><p>${(j+1)*100}</p></div>` 
            }
            else{ //question used
                questionHtml += `<div style="opacity: 0.2; box-shadow: none;"><p style="opacity: 0.3; text-shadow: none;">${(j+1)*100}</p></div>` 
            }
        }

        questionHtml += `</div>`
    }

    questionParent.innerHTML = questionHtml

    questionData = data
})

socket.on('setTimer', (value) => {
    setTimer(value)

    switch (value) {
        case 10:
        case 5:
        case 4:
        case 3:
        case 2:
        case 1:
        case 0:
            playSound("click")
            break;
    }
})

socket.on('stopTimer', () => {
    if(timerActive == true)
        playSound("bell")

    killTimer()
})

socket.on('selectQuestion', (set, id) => { //uses the questiondata array set by the loadQuestion fetch
    if(set != null && id != null){
        console.log("selection question:", set, id);
        selectQuestion(questionData[set].questions[id], questionData[set].name)
    }
})

socket.on('loadFFA', (data) => { //loads Free For All question
    console.log(data);
    selectQuestion(data)
})

socket.on('openRules', () => {
    rules.style.display = "grid"
})

socket.on('openCategories', () => {
    cat.style.display = "grid"
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

socket.on('answers', (data) => { //displays the awnsers that users gave to the players
    console.log("answers recieved", data);

    let html = "<div class='head'>player</div><div class='head'>answer</div>"

    for (let i = 0; i < data.length; i++) {
       html += `
        <div>${data[i].player}</div>
        <div>${data[i].answer}</div>`
    }

    selected.querySelector('.results').innerHTML = html
})

function selectQuestion(data, catName){
    console.log("loading selected question", data);

    if(data == null){console.error("question-data is null"); return}
    
    switch (data.type) {
        case 0:
            selected.innerHTML= `<span class="header">${catName}</span><p class="text">${data.text}</p>`    
            break;
        case 1:
            selected.innerHTML= `<span class="header">${catName}</span><div style="background-image: ${data.img[0]};" class="image"></div><p class="text">${data.text}</p>`
            break
        case 2:
            selected.innerHTML= `<span class="header">${catName}</span>
                <p class="text">${data.text}</p>
                <div class="options">
                    <div data-option="A">${data.options[0]}</div>
                    <div data-option="B">${data.options[1]}</div>
                    <div data-option="C">${data.options[2]}</div>
                    <div data-option="D">${data.options[3]}</div>
                </div>`
                break
        case 10:
        case 11:
            selected.innerHTML= `<span class="header">${data.type == 10 ? "Schätzfrage" : "Ratefrage"}</span><p class="text">${data.question}</p><div class="results"></div>`
            break
    }

    //move in selected question panel
    selected.style.bottom = "0%"
    selected.style.border = "3rem solid var(--color-accent-1)"
}

let audio = new Audio()
audio.volume = 0.2;

function playSound(name){ //used to play sounds that acompany the gameplay
    console.log("sound", name);
    switch (name) {
        case `bell`:
            audio.src = "./sound/bell.wav"
            break;
        case `click`:
            audio.src = "./sound/click.wav"
            break;
    }

    audio.play()
}