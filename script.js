let timerBar = document.getElementById('timer-bar')
let timerNumber = document.querySelector("#timer-number div p")
let playerParent = document.getElementById('players')
let questionParent = document.getElementById('questions')
let selected
let textP
let sound = document.getElementById('sound')
let scoreSel = document.getElementById('score-selector')
let scoreSelHidden = true;
let scoreInput = document.getElementById('score-input')
let selectedPlayer = 0
let editmodePopup = document.getElementById('editmode')

let timerActive = false

function setTimer(time){
    if(timerActive == false){
        timerActive = true
        timerBar.style.transition = `all 200ms linear`
        timerBar.style.width = "100%"
        timerNumber.innerText = time

        setTimeout(function(){
            timerBar.style.transition = `all ${time}s linear`
            
            timerBar.style.width = "0%"
            decreaseTime()
        },400)
    }
}

function decreaseTime(){
    let t = parseInt(timerNumber.innerText)
    

    if(t > 0 && timerActive == true){
        setTimeout(function(){
            if(timerActive == true)
            timerNumber.innerText = t-1
            if(t-1 == 0){
                timerNumber.innerHTML = '0'
                playSound("timeUp")

                setTimeout(function(){
                    timerNumber.style = "transition: none; opacity: 0;"
                },900)

                setTimeout(function(){
                    timerNumber.style.transition = "all .5s"
                    timerNumber.innerHTML = '<span class="material-icons">timer</span>'
                    timerNumber.style.opacity = "1"
                },1500)
                
                timerActive = false
            }
            decreaseTime()
        },1000)
    }
}

function killTimer(){
    timerBar.style.transition = `none`
    timerActive = false
    
    timerNumber.innerHTML = '<span class="material-icons">timer</span>'
}

let data = new Manager

data.addQuestionSet("synonyme", "Nenne ein Synonym für: \n Busch", "Strauch", "Nenne ein Synonym für \n Computerspiele spielen", "zocken, gamen")
data.addPlayer("yanik")

function selectQuestion(set, pos){
    let txt = data.questions[set].Text[pos]

    selected.querySelector(".text").innerText = txt
    selected.style.top = "0%"
    selected.style.bottom = "0%"

    selected.style.border = "3rem solid var(--color-accent-1)"
    
    textP = selected.querySelector("p")

    textP.style.opacity = "1"
    textP.style.marginBottom = "0"
}

function closeQuestion(){
    selected.style.top = "100%"
    selected.style.bottom = "-100%"
    selected.style.border = "0rem solid var(--color-accent-1)"
    textP.style.opacity = "0"
    textP.style.marginBottom = "5rem"
}

function playSound(name){
    switch (name) {
        case `timeUp`:
            sound.src = "./sound/bell.wav"
            break;
    }
}

function toggelSpecialUsed(elem, set, pos){
    if(data.players[set].Specials[pos] == true){
        data.players[set].Specials[pos] = false
        elem.style.backgroundColor = "var(--gray-5)"
    }
    else{
        data.players[set].Specials[pos] = true
        elem.style.backgroundColor = "var(--color-accent-1)"
    }
}

function changeScorePopup(id, event) {
    if (scoreSelHidden == true) {
        document.removeEventListener("click", closeScorePopup);
        scoreSel.style.transform = "scale(1)"
        scoreSelHidden = false

        setTimeout(function () {
            document.addEventListener("click", closeScorePopup)
        }, 500)

    }
    else {
        scoreSel.style.transform = "scale(0)"
        scoreSelHidden = true
        document.removeEventListener("click", closeScorePopup);
    }

    var top = event.clientY
    scoreSel.style.top = Math.min(top, window.innerHeight-scoreSel.clientHeight) + "px"
    scoreSel.style.left = "28vw"

    selectedPlayer = id
}

function closeScorePopup(ev) {
    // If user clicks inside the element, do nothing
    if (ev.target.closest('#score-selector')) return
    
    scoreSel.style.transform = "scale(0)"
    scoreSelHidden = true
  
    document.removeEventListener("click", closeScorePopup); 
}

function numberSel(elem){
    scoreInput.value = elem.innerText
}

function changeScore(plusMinus){
    if(scoreInput.value == ""){}
    else if(plusMinus == "+"){
        data.players[selectedPlayer].Score = parseInt(data.players[selectedPlayer].Score) + parseInt(scoreInput.value)
        data.loadView()
    }
    else if(plusMinus == "-"){
        data.players[selectedPlayer].Score = parseInt(data.players[selectedPlayer].Score) - parseInt(scoreInput.value)
        data.loadView()
    }
    scoreInput.value = ""
    changeScorePopup()
}

function editmode(){
    editmodePopup.style.transform = "translate(-50%, -50%) scale(1)"
}

function createQuestion(){
    let nameInput = document.getElementById('set-name').value
    let questionInput = document.querySelectorAll("#question-inputs input")

    if(nameInput != "")
    data.addQuestionSet(nameInput, questionInput[0].value, questionInput[1].value, questionInput[2].value, questionInput[3].value, questionInput[4].value, questionInput[5].value, questionInput[6].value, questionInput[7].value, questionInput[8].value, questionInput[9].value)

    editmodePopup.style.transform = "translate(-50%, -50%) scale(0)"
}