let timerBar = document.getElementById('timer-bar')
let timerNumber = document.querySelector("#timer-number div p")
let playerParent = document.getElementById('players')
let questionParent = document.getElementById('questions')
let selected = document.getElementById('selected')
let textP = selected.querySelector("p")
let sound = document.getElementById('sound')
let scoreSel = document.getElementById('score-selector')
let scoreSelHidden = true;
let scoreInput = document.getElementById('score-input')
let selectedPlayer = 0
let editmodePopup = document.getElementById('editmode')
let ffaPopup = document.getElementById('create-ffa')
let questionData = null
let timerActive = false
let rules = document.getElementById('rules')
let cat = document.getElementById('categories')
let bottom = document.getElementById('bottom')
let topScroll = document.getElementById('game')


let timerlenght = 30


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

function closeQuestion(){
/*     selected.style.top = "100%" */
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

function toggelSpecialUsed(set, pos){
    specialUsed(set, pos)
}

function changeScorePopup(id, event) {
    if (scoreSelHidden == true) {
        document.removeEventListener("click", closeScorePopup);
        scoreSel.style.transform = "scale(1)"
        scoreSelHidden = false

        let topC = event.clientY
        scoreSel.style.top = Math.min(topC, window.innerHeight-scoreSel.clientHeight) + "px"
        scoreSel.style.left = "28vw"

        setTimeout(function () {
            document.addEventListener("click", closeScorePopup)
        }, 500)

    }
    else {
        scoreSel.style.transform = "scale(0)"
        scoreSelHidden = true
        document.removeEventListener("click", closeScorePopup);
    }
    
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

function editmode(){
    editmodePopup.style.transform = "translate(-50%, -50%) scale(1)"
}

function ffaPop(){
    ffaPopup.style.transform = "translate(-50%, -50%) scale(1)"
    console.log("ffa");
}

function createQuestion(){
    let nameInput = document.getElementById('set-name').value
    let questionInput = document.querySelectorAll("#question-inputs input")

    if(nameInput != "")
    postQuestion(nameInput, questionInput[0].value, questionInput[1].value, questionInput[2].value, questionInput[3].value, questionInput[4].value, questionInput[5].value, questionInput[6].value, questionInput[7].value, questionInput[8].value, questionInput[9].value)

    editmodePopup.style.transform = "translate(-50%, -50%) scale(0)"
}

function triggerFFA(){
    if(confirm("u wanna trigger FFA?") == true){
        sendFFA()
    }
}