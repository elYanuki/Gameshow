const socket = io();

socket.on("connect", () => {
    console.log(socket);
    console.log(socket.id);
})

let myName = ""

let players

let login = document.getElementById('login')
let main = document.getElementById('main')
let waiting = document.getElementById('waiting')
let awnserInput = document.getElementById('awnserInput')
let playerPopup = document.getElementById('popup')

socket.on('loadPlayers', (data) => {
    console.log("loading players");

    let playerHtml = ""
    for (let i = 0; i < data.length; i++) {
        if(data[i].Name == myName){
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
    }

    playerHtml += ``

    playerParent.innerHTML = playerHtml

    players = data
})

socket.on('startTimer', () => {
    setTimer()
})

socket.on('stopTimer', () => {
    killTimer()
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
           if(players[i].Name == myName){ //only displays the player with your name
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
        console.log("selection question:", set, id);
        selectQuestion(questionData[set].Text[id])
        waiting.style.opacity = 0
    }
    
})

socket.on('closeQuestion', () => {
    console.log("closing question");
    closeQuestion()
    killTimer()

    ffaRunning = false
    awnserInput.style.display = "none"
    setTimeout(function(){
        waiting.style.opacity = 1
    },500)
})

function selectQuestion(txt){
    console.log("selecting question");
    console.log(txt);

    selected.querySelector(".text").innerText = txt
    selected.style.bottom = "0%"

    selected.style.border = "3rem solid var(--color-accent-1)"
    
    textP = selected.querySelector("p")

    textP.style.opacity = "1"
    textP.style.marginBottom = "0"
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
    selectQuestion(data.Question)
    awnserInput.style.display = "block" //displayes input field to enter guess
})

function sendAwnser(){
    socket.emit("sendAwnser", myName, awnserInput.value)
}

function popup(content){ //creates info popup used to display the selected player
    playerPopup.innerHTML = content
    playerPopup.style = "top: 40vh; opacity: 1;"

    setTimeout(function(){ //hides the popup after 2.5 sec
        playerPopup.style = "top: 35vh; opacity: 0;"
    },2500)
}

function playSound(){} //empty so that there is no sounds played by the clients