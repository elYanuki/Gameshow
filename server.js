 
/**************************************************************************************************************

USE: manages gameshow, saves data, syncs clients
AUTHOR: Yanik Kendler
DEPENDS ON: socket, express, filsystem, npm

***************************************************************************************************************/


const express = require("express")
const http = require("http")
const fs = require('fs');
const path = require("path");

let playerpath = "./src/player.json"
let questionpath = "./src/questions_1.json"
let ffAPath = "./src/freeForAll_1.json"

const app = express()
const server = http.createServer(app)
const io = require("socket.io")(server)
const port = 4000

app.use(express.static("public"))

let ffACount = 0 //used to automatically display a new ffa
let ffaRunning = false //used to only collect and send awnsers if question is ffa

let timerRunning = false //used to alternate between starting / restting the timer

let awnsers = [] //used to collect awnsers and send to the gamemaster

//used to safe selected question
let safedSet 
let safedId

//contains all games (categories awnsers etc)
let gamedata = []

server.listen(port, () => {
    console.log(`listenin on port ${port}`)
})

//all calls are named from client perspective: "send" - client sends to server | "get" - clients request data
io.on("connection", (socket) => {
    console.log("client connected")

    //all calls below are for the actual game (display / player / gamemaster)

    //sends player and question data to all clients
    io.emit("loadPlayers", currentGame.players)
    io.emit("loadQuestions", currentGame.questions)
    io.emit("selectQuestion", safedSet, safedId)

    socket.on("sendFFA", () => {
        console.log("ffa triggerd");

        ffaRunning = true
        console.log(currentGame.freeForAll);
        io.emit("loadFFA", currentGame.freeForAll[ffACount])
        ffACount++
    })

    socket.on("getPlayers", () => {
        io.emit("loadPlayers", currentGame.players)
    })

    socket.on("getQuestions", () => {
        io.emit("loadQuestions", currentGame.questions)
    })

    socket.on("sendTimer", () => {
        console.log("sendTimer recieved:", timerRunning);

        if (timerRunning == false) {
            console.log("starting timer");
            timerRunning = true
            io.emit("startTimer")
            setTimeout(function () { //after the timer is over
                if (ffaRunning == true) { //if current question is a ffa collect awnsers
                    console.log("awnsers sent");
                    io.emit("awnsers", awnsers)
                    awnsers = []
                }
                timerRunning = false
                console.log("timer reset");
            }, 31000)
        }
        else if(timerRunning == true){
            console.log("stoping timer");
            io.emit("stopTimer")
            timerRunning = false
        }
    })

    socket.on("sendSelectQuestion", (set, id) => {
        console.log("selecting question", set, id);
        safedId = id
        safedSet = set

        socket.broadcast.emit("selectQuestion", set, id)

        currentGame.questions[set].Used[id] = true
    })

    socket.on("sendCloseQuestion", () => {
        console.log("closing question");

        ffaRunning = false
        socket.broadcast.emit("closeQuestion")
        io.emit("loadQuestions", currentGame.questions)

        safedId = null
        safedSet = null
    })

    socket.on("sendOpenRules", () => {
        socket.broadcast.emit("openRules")
    })

    socket.on("sendOpenCategories", () => {
        socket.broadcast.emit("openCategories")
    })

    socket.on("sendCloseInfo", () => {
        socket.broadcast.emit("closeInfo")
    })

    socket.on("deletePlayer", (name) => {
        currentGame.deletePlayer(name)
        io.emit("loadPlayers", currentGame.players)

        updatePlayerFile()
    })

    socket.on("deletePlayerID", (id) => {
        currentGame.deletePlayerID(id)
        io.emit("loadPlayers", currentGame.players)

        updatePlayerFile()
    })

    socket.on("sendAwnser", (player, awnser) => { //collects awnsers for ffa
        let erg = player + ": " + awnser
        awnsers.push(erg)
    })

    socket.on("sendSpecialUsed", (player, pos) => {
        if (currentGame.players[player].Specials[pos] == true) {
            currentGame.players[player].Specials[pos] = false
        }
        else {
            currentGame.players[player].Specials[pos] = true
        }

        updatePlayerFile()

        io.emit("loadPlayers", currentGame.players)
    })

    socket.on("changeScore", (plusMinus, value, player) => {
        if (value == "") {}
        else if (plusMinus == "plus") {
            currentGame.players[player].Score = parseInt(currentGame.players[player].Score) + parseInt(value)
            console.log("plus");
        }
        else if (plusMinus == "minus") {
            currentGame.players[player].Score = parseInt(currentGame.players[player].Score) - parseInt(value)
        }

        updatePlayerFile()

        io.emit("loadPlayers", currentGame.players)
    })

    socket.on("postQuestion", (name, text1, sol1, text2, sol2, text3, sol3, text4, sol4, text5, sol5) => {

        currentGame.addQuestionSet(name, text1, sol1, text2, sol2, text3, sol3, text4, sol4, text5, sol5)

        io.emit("loadQuestions", currentGame.questions)

        updateQuestionFile()
    })

    socket.on("postPlayer", (name) => {
        name = name.toLowerCase()
        
        currentGame.addPlayer(name)

        updatePlayerFile()
        
        io.emit("loadPlayers", currentGame.players)
    })

    socket.on("reset", () => { //resets all scores and specials
        for (let i = 0; i < currentGame.players.length; i++) {
            currentGame.players[i].Score = 0
            currentGame.players[i].Specials[0] = true
            currentGame.players[i].Specials[1] = true
            currentGame.players[i].Specials[2] = true
         }

         updatePlayerFile()

        io.emit("loadQuestions", currentGame.questions)
        io.emit("loadPlayers", currentGame.players)
    })

    socket.on("deleteAll", () => {
        currentGame.players = []

        updatePlayerFile()

        io.emit("loadQuestions", currentGame.questions)
        io.emit("loadPlayers", currentGame.players)
    })

    //all calls below are for the editmode

    socket.on("getAllGames", () => {
        console.log("sending all games");
    
        io.emit("loadAllGames", gamedata)
    })

    socket.on("selectGame", (id) => {
        questionpath = "./src/questions_" + id + ".json"
        ffAPath = "./src/freeForAll_" + id + ".json"
    })
})

//SAVE DATA TO JSON FILES

//initially saves/updates players
if (fs.existsSync(playerpath)) {
    fs.readFile(playerpath, 'utf-8', (err, data_string) => {
        if (err) throw err;

        let data = JSON.parse(data_string);

        for (let i = 0; i < data.length; i++) {
            currentGame.addPlayer(data[i].Name)
        }
    })
}

//initially saves/updates questions
if (fs.existsSync(questionpath)) {
    fs.readFile(questionpath, 'utf-8', (err, data_string) => {
        if (err) throw err;

        let data = JSON.parse(data_string);

        for (let i = 0; i < data.length; i++) {
            currentGame.addQuestionSet(data[i].Name, data[i].Question[0], data[i].Solution[0], data[i].Question[1], data[i].Solution[1], data[i].Question[2], data[i].Solution[2], data[i].Question[3], data[i].Solution[3], data[i].Question[4], data[i].Solution[4])
        }
    })
}

//initially saves/updates ffa
if (fs.existsSync(ffAPath)) {
    fs.readFile(ffAPath, 'utf-8', (err, data_string) => {
        if (err) throw err;

        let data = JSON.parse(data_string);

        for (let i = 0; i < data.length; i++) {
            currentGame.addFreeForAll(data[i].Question, data[i].Solution)
        }
    })
}

let qPath = "./src/questions_1.json"
let fPath = "./src/freeForAll_1.json"

let run = 0

while (fs.existsSync(qPath) && fs.existsSync(fPath)) {
    console.log("exists");

    let arr = []

    fs.readFile(qPath, 'utf-8', (err, data_string) => {
        if (err) throw err;

        let data = JSON.parse(data_string);

        console.log(data);        

        arr[0] = data
    })

    fs.readFile(fPath, 'utf-8', (err, data_string) => {
        if (err) throw err;

        let data = JSON.parse(data_string);

        arr[1] = data
    })

    gamedata.push(arr)

    run ++

    qPath = "./src/questions_" + run + ".json"
    fPath = "./src/freeForAll_" + run + ".json"
}

function updatePlayerFile(){
    fs.writeFile(playerpath, JSON.stringify(currentGame.players, 0, 2), 'utf8', (error => {
        if (error) throw error;
    }))
}

function updateQuestionFile(){
    fs.writeFile(questionpath, JSON.stringify(currentGame.questions), 'utf8', (error=>{
        if(error) throw error;
    }))
}

class CurrentGame {
    constructor() {
        this.players = new Array();
        this.questions = new Array();
        this.freeForAll = new Array();
    }

    addPlayer(name) {
        if (name != "") {
            name = name.toLowerCase()
            let newPlayer = {
                Name: name,
                Score: 0,
                Specials: [true, true, true],
            };

            this.players.push(newPlayer);
        }
    }

    addQuestionSet(name, text1, sol1, text2, sol2, text3, sol3, text4, sol4, text5, sol5) {
        if (this.questions.length < 4) {
            console.log(name.toLowerCase());
            name = name.toLowerCase()

            let newSet = {
                Name: name,
                Text: [
                    text1, text2, text3, text4, text5
                ],
                Solution: [
                    sol1, sol2, sol3, sol4, sol5
                ],
                Used: [
                    false, false, false, false, false
                ]
            };

            this.questions.push(newSet);
        }
    }

    addFreeForAll(question, solution) {
        let newSet = {
            Question: question,
            Solution: solution
        };

        this.freeForAll.push(newSet);
        console.log(this.freeForAll);
    }

    deletePlayer(name){
        for (let i = 0; i < currentGame.players.length; i++) {
           if(currentGame.players[i].Name == name){
                currentGame.players.splice(i,1)
           }
        }
    }

    deletePlayerID(id){
        currentGame.players.splice(id,1)
    }
}

let currentGame = new CurrentGame