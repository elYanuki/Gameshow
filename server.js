 
/**************************************************************************************************************

USE: manages gameshow, saves data, syncs clients
AUTHOR: Yanik Kendler
DEPENDS ON: socket, express, filsystem, npm

***************************************************************************************************************/


const express = require("express")
const http = require("http")
const fs = require('fs');

const playerpath = "./src/player.json"
const questionpath = "./src/questions_1.json"
const ffAPath = "./src/freeForAll_1.json"

const app = express()
const server = http.createServer(app)
const io = require("socket.io")(server)
const port = 4000

app.use(express.static("public"))

let ffACount = 0 //used to automatically display a new ffa
let ffaRunning = false //used to only collect and send awnsers if question is ffa

let timerRunning = false //used to alternate between starting / restting the timer

let answers = [] //used to collect awnsers and send to the gamemaster

//used to safe selected question
let safedSet 
let safedId

//used to store wheter rules or categories are open rn
let categories = false
let rules = false

//defines var that will be used to check if timer has reached zero
let timerOver = setTimeout(()=>{})

//all calls are named from client perspective: "send" - client sends to server | "get" - clients request data
io.on("connection", (socket) => {
    console.log("client connected")

    //sends player and question data to all clients
    socket.emit("loadPlayers", manager.players)
    socket.emit("loadQuestions", manager.questions)
    socket.emit("selectQuestion", safedSet, safedId)

    if(ffaRunning == true)
        socket.emit("loadFFA", manager.freeForAll[ffACount-1])

    if(rules == true)
        socket.emit("openRules")
    if(categories == true)
        socket.emit("openCategories")

    
    socket.on("sendFFA", () => {
        console.log("ffa triggerd count:", ffACount);

        if(ffACount >= manager.freeForAll.length){
            io.emit("loadFFA", {"type": 11,"question": "Out of 'free for all' Questions","solution": ""})
            return
        }

        ffaRunning = true
        io.emit("loadFFA", manager.freeForAll[ffACount])
        ffACount++
    })

    socket.on("getPlayers", () => {
        io.emit("loadPlayers", manager.players)
    })

    socket.on("getQuestions", () => {
        io.emit("loadQuestions", manager.questions)
    })

    socket.on("sendTimer", () => {
        console.log("sendTimer recieved:", timerRunning);

        if (timerRunning == false) {
            console.log("starting timer");
            timerRunning = true

            setTimer(30)
        }
        else if(timerRunning == true){
            stopTimer()
        }
    })

    let timeRec = setTimeout(function(){},0)

    function setTimer(value){
        if(value <= 0 || timerRunning == false){
            setTimeout(() => {
                stopTimer()

                if (ffaRunning == true) { //if current question is a ffa send collected answers to gamemaster
                    console.log("answer sent to clients");
                    io.emit("answers", answers)
                    answers = []
                }
            }, 1000);
            }
        else{
            timerRec = setTimeout(function(){
                setTimer(value-1)
            },1000)
        }

        io.emit("setTimer", value)
    }

    let imageMode = 0

    socket.on("sendSelectQuestion", (set, id) => {
        console.log("selecting question", set, id);

        imageMode = 0
        safedId = id
        safedSet = set

        socket.broadcast.emit("selectQuestion", set, id)

        manager.questions[set].questions[id].used = true
    })

    socket.on("sendCloseQuestion", () => {
        console.log("closing question");

        ffaRunning = false
        socket.broadcast.emit("closeQuestion")
        io.emit("loadQuestions", manager.questions)

        if(timerRunning == true)
        stopTimer()

        safedId = null
        safedSet = null
    })

    socket.on("sendToggleImage", (hint, solution) => {
        console.log("toggle image");
        if(imageMode == 0){
            imageMode = 1
            io.emit("toggleImage", solution)
        }
        else{
            io.emit("toggleImage", hint)
            imageMode = 0
        }
        
    })

    socket.on("sendOpenRules", () => {
        socket.broadcast.emit("openRules")
        rules = true
    })

    socket.on("sendOpenCategories", () => {
        categories = true
        socket.broadcast.emit("openCategories")
    })

    socket.on("sendCloseInfo", () => {
        socket.broadcast.emit("closeInfo")
        categories = false
        rules = false

        console.log("closeinfo");
    })

    socket.on("deletePlayer", (name) => {
        manager.deletePlayer(name)
        io.emit("loadPlayers", manager.players)

        updatePlayerFile()
    })

    socket.on("deletePlayerID", (id) => {
        manager.deletePlayerID(id)
        io.emit("loadPlayers", manager.players)

        updatePlayerFile()
    })

    socket.on("sendScrollPlayers", (direction) => {
        io.emit("scrollPlayers", direction)
    })

    socket.on("sendAnswer", (player, answer) => { //collects answers for ffa
        let erg = {player: player, answer: answer}
        answers.push(erg)
        console.log("answer recieved:", answer);
    })

    socket.on("sendSpecialUsed", (player) => {
        if (manager.players[player].special == true) {
            manager.players[player].special = false
        }
        else {
            manager.players[player].special = true
        }

        updatePlayerFile()

        io.emit("loadPlayers", manager.players)
    })

    socket.on("changeScore", (plusMinus, value, player) => {
        if (value == "") {}
        else if (plusMinus == "plus") {
            manager.players[player].score = parseInt(manager.players[player].score) + parseInt(value)
            console.log("plus");
        }
        else if (plusMinus == "minus") {
            manager.players[player].score = parseInt(manager.players[player].score) - parseInt(value)
        }

        updatePlayerFile()

        io.emit("loadPlayers", manager.players)
    })

    socket.on("postQuestion", (name, text1, sol1, type1, text2, sol2, type2, text3, sol3, type3, text4, sol4, type4, text5, sol5, type5) => {

        manager.addQuestionSet(name, text1, sol1, type1, text2, sol2, type2, text3, sol3, type3, text4, sol4, type4, text5, sol5, type5)

        io.emit("loadQuestions", manager.questions)

        updateQuestionFile()
    })

    socket.on("postPlayer", (name) => {
        name = name.toLowerCase()
        
        manager.addPlayer(name)

        updatePlayerFile()
        
        io.emit("loadPlayers", manager.players)
    })

    socket.on("reset", () => { //resets all scores specials and questions
        for (let i = 0; i < manager.players.length; i++) {
            manager.players[i].score = 0
            manager.players[i].special = true
        }

        readQuestions().then(()=>{
            updatePlayerFile()
    
            io.emit("loadQuestions", manager.questions)
            io.emit("loadPlayers", manager.players)
        })

    })

    socket.on("deleteAll", () => {
        manager.players = []

        updatePlayerFile()

        io.emit("loadQuestions", manager.questions)
        io.emit("loadPlayers", manager.players)
    })
})


function stopTimer(){
    io.emit("stopTimer")
    timerRunning = false
    clearTimeout(timerRec)
}

//SAVE DATA TO JSON FILES

//initially reads players
if (fs.existsSync(playerpath)) {
    fs.readFile(playerpath, 'utf-8', (err, data_string) => {
        if (err) throw err;

        let data = JSON.parse(data_string);

        console.log(data);
        manager.setPlayers(data)
    })
}

//initially reads questions
readQuestions()
function readQuestions(){
    return new Promise((resolve, reject) => {
        if (fs.existsSync(questionpath)) {
            fs.readFile(questionpath, 'utf-8', (err, data_string) => {
                if (err) {reject("error when reading"); throw err};
    
                let data = JSON.parse(data_string);
    
                console.log(data);
                manager.setQuestions(data)

                resolve("file read")
            })
        }
    })
}

//initially reads ffa
if (fs.existsSync(ffAPath)) {
    fs.readFile(ffAPath, 'utf-8', (err, data_string) => {
        if (err) throw err;

        let data = JSON.parse(data_string);

        console.log(data);
        manager.setFFA(data)
    })
}

function updatePlayerFile(){
    fs.writeFile(playerpath, JSON.stringify(manager.players, 0, 2), 'utf8', (error => {
        if (error) throw error;
    }))
}

function updateQuestionFile(){
    fs.writeFile(questionpath, JSON.stringify(manager.questions), 'utf8', (error=>{
        if(error) throw error;
    }))
}

server.listen(port, () => {
    console.log(`listenin on port ${port}`)
})

class Manager {
    constructor() {
        this.players = new Array();
        this.questions = new Array();
        this.freeForAll = new Array();
    }

    addPlayer(name) {
        if (name != "" && name != null) {
            name = name.toLowerCase()
            let newPlayer = {
                name: name,
                score: 0,
                special: true,
            };

            this.players.push(newPlayer);
        }
    }

    addQuestionSet(name, text1, sol1, text2, sol2, text3, sol3, text4, sol4, text5, sol5) {
        if (this.questions.length < 4) {
            console.log(name.toLowerCase());
            name = name.toLowerCase()

            let newSet = {
                name: name,
                questions: [
                    {
                        "type": type1,
                        "text": text1,
                        "solution": sol1,
                        "used": false
                    },
                    {
                        "type": type2,
                        "text": text2,
                        "solution": sol2,
                        "used": false
                    },
                    {
                        "type": type3,
                        "text": text3,
                        "solution": sol3,
                        "used": false
                    },
                    {
                        "type": type4,
                        "text": text4,
                        "solution": sol4,
                        "used": false
                    },
                    {
                        "type": type5,
                        "text": text5,
                        "solution": sol5,
                        "used": false
                    },
                ]
            };

            this.questions.push(newSet);
        }
    }

    addFreeForAll(type, question, solution) {
        let newFFA = {
            type: type,
            question: question,
            solution: solution
        };

        this.freeForAll.push(newFFA);
    }

    deletePlayer(name){
        for (let i = 0; i < manager.players.length; i++) {
           if(manager.players[i].name == name){
                manager.players.splice(i,1)
           }
        }
    }

    deletePlayerID(id){
        manager.players.splice(id,1)
    }

    setQuestions(questions){
        manager.questions = questions
    }

    setPlayers(players){
        manager.players = players
    }

    setFFA(ffa){
        manager.freeForAll = ffa
    }
}

let manager = new Manager