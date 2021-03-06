 
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

let awnsers = [] //used to collect awnsers and send to the gamemaster

//used to safe selected question
let safedSet 
let safedId

//all calls are named from client perspective: "send" - client sends to server | "get" - clients request data
io.on("connection", (socket) => {
    console.log("client connected")

    //sends player and question data to all clients
    io.emit("loadPlayers", manager.players)
    io.emit("loadQuestions", manager.questions)
    io.emit("selectQuestion", safedSet, safedId)

    socket.on("sendFFA", () => {
        console.log("ffa triggerd");

        ffaRunning = true
        console.log(manager.freeForAll);
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

        manager.questions[set].Used[id] = true
    })

    socket.on("sendCloseQuestion", () => {
        console.log("closing question");

        ffaRunning = false
        socket.broadcast.emit("closeQuestion")
        io.emit("loadQuestions", manager.questions)

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
        manager.deletePlayer(name)
        io.emit("loadPlayers", manager.players)

        updatePlayerFile()
    })

    socket.on("deletePlayerID", (id) => {
        manager.deletePlayerID(id)
        io.emit("loadPlayers", manager.players)

        updatePlayerFile()
    })

    socket.on("sendAwnser", (player, awnser) => { //collects awnsers for ffa
        let erg = player + ": " + awnser
        awnsers.push(erg)
    })

    socket.on("sendSpecialUsed", (player, pos) => {
        if (manager.players[player].Specials[pos] == true) {
            manager.players[player].Specials[pos] = false
        }
        else {
            manager.players[player].Specials[pos] = true
        }

        updatePlayerFile()

        io.emit("loadPlayers", manager.players)
    })

    socket.on("changeScore", (plusMinus, value, player) => {
        if (value == "") {}
        else if (plusMinus == "plus") {
            manager.players[player].Score = parseInt(manager.players[player].Score) + parseInt(value)
            console.log("plus");
        }
        else if (plusMinus == "minus") {
            manager.players[player].Score = parseInt(manager.players[player].Score) - parseInt(value)
        }

        updatePlayerFile()

        io.emit("loadPlayers", manager.players)
    })

    socket.on("postQuestion", (name, text1, sol1, text2, sol2, text3, sol3, text4, sol4, text5, sol5) => {

        manager.addQuestionSet(name, text1, sol1, text2, sol2, text3, sol3, text4, sol4, text5, sol5)

        io.emit("loadQuestions", manager.questions)

        updateQuestionFile()
    })

    socket.on("postPlayer", (name) => {
        name = name.toLowerCase()
        
        manager.addPlayer(name)

        updatePlayerFile()
        
        io.emit("loadPlayers", manager.players)
    })

    socket.on("reset", () => { //resets all scores and specials
        for (let i = 0; i < manager.players.length; i++) {
            manager.players[i].Score = 0
            manager.players[i].Specials[0] = true
            manager.players[i].Specials[1] = true
            manager.players[i].Specials[2] = true
         }

         updatePlayerFile()

        io.emit("loadQuestions", manager.questions)
        io.emit("loadPlayers", manager.players)
    })

    socket.on("deleteAll", () => {
        manager.players = []

        updatePlayerFile()

        io.emit("loadQuestions", manager.questions)
        io.emit("loadPlayers", manager.players)
    })
})

//SAVE DATA TO JSON FILES

//initially saves/updates players
if (fs.existsSync(playerpath)) {
    fs.readFile(playerpath, 'utf-8', (err, data_string) => {
        if (err) throw err;

        let data = JSON.parse(data_string);

        for (let i = 0; i < data.length; i++) {
            manager.addPlayer(data[i].Name)
        }
    })
}

//initially saves/updates questions
if (fs.existsSync(questionpath)) {
    fs.readFile(questionpath, 'utf-8', (err, data_string) => {
        if (err) throw err;

        let data = JSON.parse(data_string);

        for (let i = 0; i < data.length; i++) {
            manager.addQuestionSet(data[i].Name, data[i].Text[0], data[i].Solution[0], data[i].Text[1], data[i].Solution[1], data[i].Text[2], data[i].Solution[2], data[i].Text[3], data[i].Solution[3], data[i].Text[4], data[i].Solution[4])
        }
    })
}

//initially saves/updates ffa
if (fs.existsSync(ffAPath)) {
    fs.readFile(ffAPath, 'utf-8', (err, data_string) => {
        if (err) throw err;

        let data = JSON.parse(data_string);

        for (let i = 0; i < data.length; i++) {
            manager.addFreeForAll(data[i].Question, data[i].Solution)
        }
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

    printQuestions() {
        let txt = ""

        return txt;
    }

    deletePlayer(name){
        for (let i = 0; i < manager.players.length; i++) {
           if(manager.players[i].Name == name){
                manager.players.splice(i,1)
           }
        }
    }

    deletePlayerID(id){
        manager.players.splice(id,1)
    }
}

let manager = new Manager