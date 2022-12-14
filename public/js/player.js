socket.on("connect", () => {
    console.log(socket);
    console.log(socket.id);
})

let myName = ""

let players

let login = document.getElementById('login')
let main = document.getElementById('main')
let waiting = document.getElementById('waiting')
let playerPopup = document.getElementById('popup')

socket.on('loadPlayers', (data) => {
    console.log("loading players");

    let playerHtml = ""
    for (let i = 0; i < data.length; i++) {
        if(data[i].name == myName){
            playerHtml += `
            <div class="player" player-id="${i}">
                <p class="name">${data[i].name}</p>
                <div class="points-parent"><p class="points">${data[i].score}</p></div>
                <div>
                    <div style="background-color:${data[i].special ? 'var(--color-accent-1)' : 'var(--gray-5)'};">Multiplier</div>
                </div>
            </div>`
        }
    }

    playerHtml += ``

    playerParent.innerHTML = playerHtml

    players = data
})

socket.on('startTimer', () => {
    setTimer()
})

socket.on('stopTimer', () => {
    if(timerActive == true)
        killTimer()
    if(ffaRunning == true)
        sendAnswer() //takes answer from input and sends it to server
})

socket.on('loadQuestions', (data) => { //saves the data for later use (only the chosen name needs to be displayed)
    console.log("loading questions");
    console.log(data);
    questionData = data
})

function submitName(){
    console.log("sub name");

    let name = document.getElementById('nameInput').value.toLowerCase()

    console.log(name);

    if(name != null && name != ""){ //if name has been entered
        myName = name

        main.style.display = "flex"
        login.style.display = "none"
        
        for (let i = 0; i < players.length; i++) {
           if(players[i].name == myName){ //only displays the player with your name
                socket.emit("getPlayers")
                popup("loged in as: " + myName)
                return
           }
        }

        socket.emit("postPlayer", myName)
        popup("created player: " + myName)
    }
}

socket.on('selectQuestion', (set, id) => {
    if(set != null && id != null){
        selectQuestion(questionData[set].questions[id], questionData[set].name)
        waiting.style.opacity = 0
    }
})

function closeQuestion(){
    selected.style.display = "none"
    selected.style.border = "0rem solid var(--color-accent-1)"
    
    ffaRunning = false
    setTimeout(function(){
        waiting.style.opacity = 1
    },500)
}

function selectQuestion(data, catName){
    console.log("loading selected question", data);

    if(data == null){console.error("question-data is null"); return}

    
    if(data.type == 0){//normal
        selected.innerHTML= `<span class="header">${catName}</span><p class="text">${data.text}</p>`    
    }
    else if(data.type == 1){//image
        selected.innerHTML= `<span class="header">${catName}</span><div style="background-image: ${data.img[0]};" class="image"></div><p class="text">${data.text}</p>`
    }
    else if(data.type == 10){ //FFA with input
        selected.innerHTML= `<span class="header">${catName}</span><p class="text">${data.question}</p><input type="text" id="answerInput" autocomplete="off">`
    }
    else if(data.type == 11){ //FFA without input
        selected.innerHTML= `<span class="header">${catName}</span><p class="text">${data.question}</p>`
    }
    
    //move in selected question panel
    selected.style.display = "flex"
    selected.style.border = "3rem solid var(--color-accent-1)"
}

function deleteMe(){ //deletes selected player
    if(confirm("sure u want to delete player: " + myName) == true){
        socket.emit("deletePlayer", myName)
        main.style.display = "none"
        login.style.display = "grid"
    }
}

socket.on('loadFFA', (data) => {
    console.log(data);

    ffaRunning = true
    waiting.style.opacity = 0
    selectQuestion(data, "free for all")
})

function sendAnswer(){
    console.log("sending answer");
    socket.emit("sendAnswer", myName, document.getElementById('answerInput').value)
}

function popup(content){ //creates info popup used to display the selected player
    playerPopup.innerHTML = content
    playerPopup.style = "top: 40vh; opacity: 1;"

    setTimeout(function(){ //hides the popup after 2.5 sec
        playerPopup.style = "top: 35vh; opacity: 0;"
    },2500)
}