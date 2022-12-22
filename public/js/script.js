 
/**************************************************************************************************************

USE: Functiones that are used in every client
LINKED FROM: player/gamemaster/display .html
AUTHOR: Yanik Kendler
DEPENDS ON: -

***************************************************************************************************************/


let timerBar = document.getElementById('timer-bar')
let timerNumber = document.querySelector("#timer-number p")
let playerParent = document.getElementById('players')
let questionParent = document.getElementById('questions')
let selected = document.getElementById('selected')
let sound = document.getElementById('sound')
let scoreSel = document.getElementById('score-selector')
let scoreSelHidden = true;
let scoreInput = document.getElementById('score-input')
let selectedPlayer = 0
let ffaPopup = document.getElementById('create-ffa')
let questionData = null
let rules = document.getElementById('rules')
let cat = document.getElementById('categories')
let topScroll = document.getElementById('game')

let countDown = []
let clear

let ffaRunning = false
let timerActive = false
let firstTimerNum = true

const socket = io();

function setTimer(value){
    timerActive = true
    
    if(firstTimerNum == true){ 
        timerBar.style.transition = `all 200ms linear` //to load up the bar in 200ms
        
        setTimeout(function(){
            timerBar.style.transition = `all 1s linear`
        },400)

        firstTimerNum = false
    }
    
    timerNumber.innerText = value
    timerBar.style.width = 100/30*value + "%"
}

function killTimer(){
    console.log("killing timer");

    timerBar.style.transition = `none`
    timerActive = false
    firstTimerNum = false
    
    timerNumber.innerHTML = '0'
    
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

socket.on('closeQuestion', () => {
    console.log("closing question");
    closeQuestion()
})

function closeQuestion(){
    selected.style.bottom = "-100%"
    selected.style.border = "0rem solid var(--color-accent-1)"
}

socket.on('toggleImage', (path) => {
    console.log("changing image", path);
    selected.querySelector(".image").style.backgroundImage = path
})

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