 
/**************************************************************************************************************

USE: Functiones that are used in every client
LINKED FROM: player/gamemaster/display .html
AUTHOR: Yanik Kendler
DEPENDS ON: -

***************************************************************************************************************/


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
let rules = document.getElementById('rules')
let cat = document.getElementById('categories')
let bottom = document.getElementById('bottom')
let topScroll = document.getElementById('game')

let countDown = []
let clear
let timerlenght = 30

let ffaRunning = false
let timerActive = false

function setTimer(){
        timerBar.style.transition = `all 200ms linear` //to load up the bar in 200ms
        timerBar.style.width = "100%"
        timerNumber.innerText = timerlenght
        timerActive = true

        setTimeout(function(){
            timerBar.style.transition = `all 1s linear`
        },400)

        for (let i = 0; i < timerlenght; i++) {
            countDown[i] = setTimeout(function(){
                timerNumber.innerText = timerlenght - i //decrease the timer
                timerBar.style.width = (100/timerlenght)*(timerlenght-i-1) + "%"
            },1000*i)
        }

        clear = setTimeout(function(){
            if(ffaRunning == true){ //timer is up - players should send their awnser
                sendAwnser()
            }

            timerNumber.innerHTML = '0'
            playSound("timeUp")

            killTimer()
        },1000*timerlenght)
}

function killTimer(){
    console.log("killing timer");

    timerBar.style.transition = `all 1s linear`

    timerBar.style.transition = `none`
    timerActive = false

    for (let i = 0; i < timerlenght; i++) {
       clearTimeout(countDown[i])
    }

    clearTimeout(clear)
    
    setTimeout(function(){
        timerNumber.style = "transition: none; opacity: 0;"
        timerBar.style.width = 0
    },900)

    setTimeout(function(){
        timerNumber.style.transition = "all .5s"
        timerNumber.innerHTML = '<span class="material-icons">timer</span>'
        timerNumber.style.opacity = "1"
    },1500)
}

function closeQuestion(){
/*     selected.style.top = "100%" */
    selected.style.bottom = "-100%" 
    selected.style.border = "0rem solid var(--color-accent-1)"
    textP.style.opacity = "0"
    textP.style.marginBottom = "5rem"

    if(timerActive == true){
        killTimer()
    }
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

    //if click is outside - close popup
    scoreSel.style.transform = "scale(0)"
    scoreSelHidden = true
  
    document.removeEventListener("click", closeScorePopup); 
}