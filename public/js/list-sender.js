let dropd = false
let locked = false

// post new task with AJAX request
let av = "./img/av_1.png"
let nameNew = ""

function postPlayer(name) {

    let postData
    postData = `name=${name}`;

    fetch('./updatePlayers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: postData
    })
        .then((response) => {
            return response.json();
        })
        .then((erg) => {
            console.log(erg);
            let answer = erg;

            loadPlayers();
        })
        .catch((error) => {
            console.log('Error: ', error)
        })
}

function postQuestion(name, text1, sol1, text2, sol2, text3, sol3, text4, sol4, text5, sol5) {

    let postData
    postData = `name=${name}&text1=${text1}&sol1=${sol1}&text2=${text2}&sol2=${sol2}&text3=${text3}&sol3=${sol3}&text4=${text4}&sol4=${sol4}&text5=${text5}&sol5=${sol5}`;

    fetch('./updateQuestions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: postData
    })
        .then((response) => {
            return response.json();
        })
        .then((erg) => {
            console.log(erg);
            let answer = erg;

            loadQuestions();
        })
        .catch((error) => {
            console.log('Error: ', error)
        })
}

function specialUsed(set, pos) {

    let postData
    postData = `set=${set}&pos=${pos}`;

    fetch('./specialUsed', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: postData
    })
        .then((response) => {
            return response.json();
        })
        .then((erg) => {
            console.log(erg);
            let answer = erg;

            loadPlayers();
        })
        .catch((error) => { 
            console.log('Error: ', error)
        })
}

function changeScore(plusMinus) {
    console.log(selectedPlayer);

    let postData
    postData = `plusMinus=${plusMinus}&value=${scoreInput.value}&player=${selectedPlayer}`;


    scoreInput.value = ""

    fetch('./changeScore', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: postData
    })
        .then((response) => {
            return response.json();
        })
        .then((erg) => {
            console.log(erg);
            let answer = erg;

            loadPlayers();
        })
        .catch((error) => {
            console.log('Error: ', error)
        })

        changeScorePopup(0)
}


function startTimer() {
    let postData

    fetch('./timer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: postData
    })
        .then((response) => {
            return response.json();
        })
        .then((erg) => {
            console.log(erg);
            let answer = erg;
        })
        .catch((error) => {
            console.log('Error: ', error)
        })
}


function sendSelectQuestion(set, pos) {
    console.log("selecting question",set,pos);

    let postData
    postData = `set=${set}&pos=${pos}`;

    fetch('./sendSelectQuestion', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: postData
    })
        .then((response) => {
            return response.json();
        })
        .then((erg) => {
            console.log(erg.text);
            let answer = erg;

            loadQuestions()
        })
        .catch((error) => {
            console.log('Error: ', error)
        })
}


function sendCloseQuestion() {

    let postData

    fetch('./sendCloseQuestion', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: postData
    })
        .then((response) => {
            return response.json();
        })
        .then((erg) => {
            console.log(erg);
            let answer = erg;
        })
        .catch((error) => {
            console.log('Error: ', error)
        })
}

function toggelRules() {

    let postData

    fetch('./rules', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: postData
    })
        .then((response) => {
            return response.json();
        })
        .then((erg) => {
            console.log(erg.text);
            let answer = erg;

            loadQuestions()
        })
        .catch((error) => {
            console.log('Error: ', error)
        })
}


function postFFA(question, sol) {

    let postData
    postData = `question=${question}&solution=${sol}`;

    fetch('./freeForAll', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: postData
    })
        .then((response) => {
            return response.json();
        })
        .then((erg) => {
            console.log(erg.text);
            let answer = erg;
        })
        .catch((error) => {
            console.log('Error: ', error)
        })
        
        ffaPopup.style.transform = 'translate(-50%, -50%) scale(0)'

}

function sendFFA() {

    let postData

    fetch('./sendFFA', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: postData
    })
        .then((response) => {
            return response.json();
        })
        .then((erg) => {
            console.log(erg.text);
            let answer = erg;
        })
        .catch((error) => {
            console.log('Error: ', error)
        })
}

function toggleCat() {

    let postData

    fetch('./cat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: postData
    })
        .then((response) => {
            return response.json();
        })
        .then((erg) => {
            console.log(erg.text);
            let answer = erg;
        })
        .catch((error) => {
            console.log('Error: ', error)
        })
}

function resetPlayers() {
    if (confirm("do u wanna clear all scores?") == true) {

        let postData

        fetch('./reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: postData
        })
            .then((response) => {
                return response.json();
            })
            .then((erg) => {
                console.log(erg.text);
                let answer = erg;
            })
            .catch((error) => {
                console.log('Error: ', error)
            })
    }
}


function toggleSolution() {

    let postData

    fetch('./toggleSolution', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: postData  
    })
        .then((response) => {
            return response.json();
        })
        .then((erg) => {
            console.log(erg.text);
            let answer = erg;
        })
        .catch((error) => {
            console.log('Error: ', error)
        })
}

setTimeout(function(){
    closeQuestion()
},600)
