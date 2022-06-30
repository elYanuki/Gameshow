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

function setTimer(time){
        timerBar.style.transition = `all 200ms linear`
        timerBar.style.width = "100%"
        timerNumber.innerText = timerlenght

        setTimeout(function(){
            timerBar.style.transition = `all ${timerlenght}s linear`
            
            timerBar.style.width = "0%"
            
        },400)

        for (let i = 0; i < timerlenght; i++) {
            countDown[i] = setTimeout(function(){
                timerNumber.innerText = timerlenght - i
            },1000*i)
        }

        clear = setTimeout(function(){
            if(ffaRunning == true){
                sendAwnser()
            }

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
        },1000*time)
}

function killTimer(){
    console.log("killing timer");

    timerBar.style.transition = `none`
    timerActive = false

    for (let i = 0; i < timerlenght; i++) {
       clearTimeout(countDown[i])
    }

    clearTimeout(clear)
    
    setTimeout(function(){
        timerNumber.style = "transition: none; opacity: 0;"
    },900)

    setTimeout(function(){
        timerNumber.style.transition = "all .5s"
        timerNumber.innerHTML = '<span class="material-icons">timer</span>'
        timerNumber.style.opacity = "1"
    },1500)
}

function closeQuestion(){
/*     selected.style.top = "100%" */
    selected.style.display = "none"
    selected.style.border = "0rem solid var(--color-accent-1)"
    textP.style.opacity = "0"
    textP.style.marginBottom = "5rem"
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