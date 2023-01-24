 
/**************************************************************************************************************

USE: manages gameshow, saves data, syncs clients
AUTHOR: Yanik Kendler
DEPENDS ON: socket, express, filsystem, npm

***************************************************************************************************************/

const express = require("express")
const http = require("http")
const fs = require('fs');

const playerpath = "./src/player.json"
const questionpath = "./src/boards.json"

const app = express()
const server = http.createServer(app)
const io = require("socket.io")(server)
const port = 80

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

//compiled list of name and uuid of all boards
let boardList = []

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

    socket.emit("boardList", boardList)

    
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
                stopTimer(true)
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

    socket.on("toggleImage", (hint, solution) => {
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
        io.emit("loadPlayers", manager.players)
        updatePlayerFile()

        manager.questions.forEach((category)=>{
            category.questions.forEach((question)=>{
                question.used = false
            })
        })
    })

    socket.on("deleteAll", () => {
        manager.players = []

        updatePlayerFile()

        manager.questions.forEach((category)=>{
            category.questions.forEach((question)=>{
                question.used = false
            })
        })

        io.emit("loadQuestions", manager.questions)
        io.emit("loadPlayers", manager.players)
    })

    socket.on("update-board", (board) => {
        manager.updateBoard(board)
    })
    
    socket.on("add-board", (board) => {
        manager.addBoard(board)
    })

    socket.on("request-board", (uuid) => {
        manager.boards.forEach(item => {
            if(item.uuid == uuid)
                socket.emit("loadBoard", item)
        })
    })

    socket.on("setQuestions", (uuid) => {
        manager.setQuestions(uuid)
    })
    
    socket.on("delete-board", (uuid) => {
        manager.deleteBoard(uuid)
    })
    
    socket.on("force-backup", () => {
        backUpBoards(true)
    })
})

function stopTimer(sound = false){
    io.emit("stopTimer", sound)

    setTimeout(function(){//super ugly but should fix things and im drunk rn so doesnt matter
        if (ffaRunning == true) { //if current question is a ffa send collected answers to gamemaster
            console.log("answer sent to clients");
            io.emit("answers", answers)
            answers = []
        }
    },500)

    timerRunning = false
    clearTimeout(timerRec)
}

function createBoardList(){ //compiles list of all names and uuids of boards
    boardList = []
    manager.boards.forEach(item => {
        boardList.push({"name" : item.name, "uuid": item.uuid})
    });

    io.emit("boardList", boardList)

    console.log(boardList);
}

//SAVE DATA TO JSON FILES

try {
    if (!fs.existsSync("./src/backups")) {
        fs.mkdirSync("./src/backups");
    }
}
catch (err) {
    console.error(err);
}

const secsInADay = 86400000
const secsInHour = 3600000
const daysToKeepBackups = 7
let lastCheck = Date.now()

function backUpBoards(force = false){
    const now = Date.now()

    if(now - lastCheck < secsInHour && force === false) return
    
    lastCheck = now

    let newestBackup = -1
    let backupContents = fs.readdirSync("./src/backups/")
    let backupsToDelete = []

    backupContents.forEach(item => {
        let timeInt = parseInt(item)

        if(timeInt > newestBackup)
            newestBackup = timeInt

        if(backupContents.length - backupsToDelete.length > 7 && 
           timeInt < now - (secsInADay * daysToKeepBackups))
            backupsToDelete.push(item)
    });


    if(now - newestBackup > secsInADay || force === true){
        fs.writeFile(`./src/backups/${now}.json`, JSON.stringify(manager.boards, 0, 2), 'utf8', ( (error) => {
            if(error) throw error;
        }))
    }

    backupsToDelete.forEach((item) => {
        fs.unlink("./src/backups/" + item, (err) => {
            if (err) throw err;
        });
    })
}

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
    
                manager.setBoards(data)

                resolve("file read")
            })
        }
    })
}

function updatePlayerFile(){
    fs.writeFile(playerpath, JSON.stringify(manager.players, 0, 2), 'utf8', (error => {
        if (error) throw error;
    }))
}

function updateBoardFile(){
    fs.writeFile(questionpath, JSON.stringify(manager.boards, 0, 2), 'utf8', (error=>{
        if(error) throw error;
    }))
}

server.listen(port, () => {
    console.log(`listenin on port ${port}`)
})

class Manager {

    constructor() {
        this.boards = new Array();

        this.players = new Array();
        this.questions = new Array();
        this.freeForAll = new Array();

        this.currentBoardUUID = null
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

    setQuestions(uuid){ //sets currently used question set
        if(uuid == "clear"){
            this.questions = []
            this.freeForAll = []
            this.currentBoardUUID = null
            io.emit("loadQuestions", this.questions)
            return
        }

        this.boards.forEach(item => {
            if(item.uuid == uuid){
                this.questions = item.board
                
                //sets all question usages to false in case a running game changed them
                this.questions.forEach((category)=>{
                    category.questions.forEach((question)=>{
                        question.used = false
                    })
                })
                updateBoardFile()

                this.freeForAll = item.ffa

                this.currentBoardUUID = uuid

                io.emit("loadQuestions", this.questions)
            }
        });
    }

    setBoards(boards){
        this.boards = boards

        createBoardList()
    }

    addBoard(board){
        this.boards.push(board)

        updateBoardFile()
    }
    
    deleteBoard(uuid){
        for (let i = 0; i < this.boards.length; i++) {
            if(this.boards[i].uuid == uuid){ //uuids match
                console.log("deleting");

                this.boards.splice(i,1)
            }
        }

        createBoardList()
        updateBoardFile()
    }

    updateBoard(board){
        console.log("update board");
        for (let i = 0; i < this.boards.length; i++) {

            if(this.boards[i].uuid == board.uuid){ //uuids match - item will be replaced
                this.boards[i] = board

                if(this.currentBoardUUID == this.boards[i].uuid){
                    this.questions = this.boards[i]

                    this.setQuestions(this.currentBoardUUID)
                    io.emit("loadQuestions", manager.questions)
                }

                updateBoardFile()
                createBoardList()

                backUpBoards()
            }
        }
    }
    
    addBoard(board){
        this.boards.push(board)

        updateBoardFile()
        createBoardList()
    }

    setPlayers(players){
        manager.players = players
    }

    setFFA(ffa){
        manager.freeForAll = ffa
    }
}

let manager = new Manager