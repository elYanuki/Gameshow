
// load todo list with AJAX request
function loadPlayers() {
    fetch("./updatePlayers")
        .then( (response) =>{
            /* console.log(response); */
            return response.json();
        })
        .then( (data) => {
            let playerHtml = ""
            for (let i = 0; i < data.length; i++) {
                playerHtml += `
                <div class="player" player-id="${i}">
                    <p class="name">${data[i].Name}</p>
                    <div class="points-parent"><p class="points">${data[i].Score}</p></div>
                    <div>
                        <div style="background-color:${data[i].Specials[0] ? 'var(--color-accent-1)' : 'var(--gray-5)'};" onclick="toggelSpecialUsed(${i}, 0)"><i class="fa-solid fa-hand-point-right"></i></div>
                        <div style="background-color:${data[i].Specials[1] ? 'var(--color-accent-1)' : 'var(--gray-5)'};" onclick="toggelSpecialUsed(${i}, 1)"><i class="fa-solid fa-file-pen"></i></div>
                        <div style="background-color:${data[i].Specials[2] ? 'var(--color-accent-1)' : 'var(--gray-5)'};" onclick="toggelSpecialUsed(${i}, 2)"><i class="fa-solid fa-shield-halved"></i></div>
                    </div>
                </div>`
            }
    
            playerHtml += ``
    
            playerParent.innerHTML = playerHtml
        })
        .catch( (error) =>{
            console.log('U messed up! Error: ' + error)
        });
}

function loadQuestions() {
    fetch("./updateQuestions")
        .then( (response) =>{
            /* console.log(response); */
            return response.json();
        })
        .then( (data) => {
            let questionHtml = ""
            for (let i = 0; i < data.length; i++) {
                questionHtml += `
                <div class="catergory" cat-id="${i}">
                    <h1>${data[i].Name}</h1>
                    <div onclick="sendSelectQuestion(${i},0)" style="opacity: ${(data[i].Used[0] == false) ? 1 : 0}"><p>100</p></div>
                    <div onclick="sendSelectQuestion(${i},1)" style="opacity: ${(data[i].Used[1] == false) ? 1 : 0}"><p>200</p></div>
                    <div onclick="sendSelectQuestion(${i},2)" style="opacity: ${(data[i].Used[2] == false) ? 1 : 0}"><p>300</p></div>
                    <div onclick="sendSelectQuestion(${i},3)" style="opacity: ${(data[i].Used[3] == false) ? 1 : 0}"><p>400</p></div>
                    <div onclick="sendSelectQuestion(${i},4)" style="opacity: ${(data[i].Used[4] == false) ? 1 : 0}"><p>500</p></div>
                </div>`
            }
    
            questionParent.innerHTML = questionHtml

            questionData = data
        })
        .catch( (error) =>{
            console.log('U messed up! Error: ' + error)
        });
}

function checktimer() {
    fetch("./timer")
        .then( (response) =>{
            /* console.log(response); */
            return response.json();
        })
        .then( (data) => {
            if(data > 0){
                setTimer(timerlenght)
            }
        })
        .catch( (error) =>{
            console.log('U messed up! Error: ' + error)
        });
}

let lastSelect = [-1,-1]
function checkQuestionSelect() {
    fetch("./sendSelectQuestion")
        .then( (response) =>{
            /* console.log(response); */
            return response.json();
        })
        .then( (data) => {
            if(data[0] != lastSelect[0] || data[1] != lastSelect[1]){
                selectQuestion(questionData[data[0]].Text[data[1]])
                lastSelect = data
            }
        })
        .catch( (error) =>{
            console.log('U messed up! Error: ' + error)
        });
}

function checkQuestionClose() {
    fetch("./sendCloseQuestion")
        .then( (response) =>{
            /* console.log(response); */
            return response.json();
        })
        .then( (data) => {
            if(data > 0){
                closeQuestion()
                killTimer()
            }
        })
        .catch( (error) =>{
            console.log('U messed up! Error: ' + error)
        });
}

function checkFFA() {
    fetch("./sendFFA")
        .then( (response) =>{
            /* console.log(response); */
            return response.json();
        })
        .then( (data) => {
            if(data > 0){
                ffa()
            }
        })
        .catch( (error) =>{
            console.log('U messed up! Error: ' + error)
        });
}

function checkRules() {
    fetch("./rules")
        .then( (response) =>{
            /* console.log(response); */
            return response.json();
        })
        .then( (data) => {
            if(data == 1){
                rules.style.display = "flex"
            }
            else{
                rules.style.display = "none"
            }
        })
        .catch( (error) =>{
            console.log('U messed up! Error: ' + error)
        });
}

function checkCat() {
    fetch("./cat")
        .then( (response) =>{
            /* console.log(response); */
            return response.json();
        })
        .then( (data) => {
            if(data == 1){
                cat.style.display = "block"
                console.log("display block");
            }
            else{
                cat.style.display = "none"
            }
        })
        .catch( (error) =>{
            console.log('U messed up! Error: ' + error)
        });
}

function checkSolution() {
    fetch("./toggleSolution")   
        .then( (response) =>{
            /* console.log(response); */
            return response.json();
        })
        .then( (data) => {
            if(data == 1){
                document.getElementById('shown').style.opacity = 1
            }
            else{
                document.getElementById('shown').style.opacity = 0
            }
        })
        .catch( (error) =>{
            console.log('U messed up! Error: ' + error)
        });
}

function ffa(){
    console.log("ffa");
    fetch("./freeForAll")
        .then( (response) =>{
            /* console.log(response); */
            return response.json();
        })
        .then( (data) => {
            console.log(data);
            selectQuestion(data.Question)
        })
        .catch( (error) =>{
            console.log('U messed up! Error: ' + error)
        });
}

setInterval( function(){
    loadPlayers()
    loadQuestions()
    checktimer()
    checkQuestionSelect()
    checkQuestionClose()
    checkFFA()
    checkRules()
    checkCat()
    checkSolution()
},500)

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