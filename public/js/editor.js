const preview = document.getElementById('preview')
const question = document.getElementById('questions')
const game = document.getElementById('game')

let gamedata

const socket = io();

socket.on("connect", () => {
    console.log(socket);
    console.log(socket.id);
})

socket.emit("getAllGames")

socket.on('loadAllGames', (games, questions) => {
    console.log(games);

    let html = ""

    for (let i = 0; i < games.length; i++) {
        html += `
        <div class="preview-item" onclick="editGame(${i})">
            <p class="preview-catname">GAME ${i+1}</p>
            <div>
                <p class="preview-cat">${games[i][0][0].Name}</p>
                <p class="preview-cat">${games[i][0][1].Name}</p>
                <p class="preview-cat">${games[i][0][2].Name}</p>
                <p class="preview-cat">${games[i][0][3].Name}</p>
            </div>
        </div>`
    }

    preview.innerHTML = html

    gamedata = data
})

function editGame(id){
    preview.style.display = "none"

    let html = ""

    for (let i = 0; i < 4; i++) {
       html += `
       <div class="game-category">
            <p class="game-catname">${gamedata[id][0][i].Name}</p>
            <div class="game-questions"></div>
        </div>`
    }

    game.innerHTML = html
    game.style.display = "block"

    html = ""

    for (let i = 0; i < ; i++) {
       
    }
}

function postCategory(){ //adds new question
    let nameInput = document.getElementById('set-name').value
    let questionInput = document.querySelectorAll("#question-inputs input")

    if(nameInput != "")
    socket.emit("postCategory", nameInput, questionInput[0].value, questionInput[1].value, questionInput[2].value, questionInput[3].value, questionInput[4].value, questionInput[5].value, questionInput[6].value, questionInput[7].value, questionInput[8].value, questionInput[9].value)

    addQuestionPopup.style.transform = "translate(-50%, -50%) scale(0)" //closes the input popup
}
