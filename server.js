// A simple Express app with
// -> static fileserving (using middleware)
// -> JSON API: serve tasks via GET
// -> JSON API: add new tasks via POST

// IMPORTS
/* const { set } = require("express/lib/response"); */
const express = require('express');
const ngrok = require('ngrok');
const fs = require('fs');
/* const localtunnel = require('localtunnel');
 */
const playerpath = "./src/player.json"
const questionpath = "./src/questions_3.json"
const ffAPath = "./src/freeForAll_1.json"

// INIT express app
const app = express();
const port = 3000;

let timerUpdate = 0
let questionUpdate = [-1,-1]
let closeQuestion = 0
let ffa = -1
let rules = 0
let categories = 0
let solutionHidden = 0

let ffACount = -1
// MIDDLEWARES
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

if (fs.existsSync(playerpath)) {
    fs.readFile(playerpath, 'utf-8', (err, data_string) => {
        if (err) throw err;

        let data = JSON.parse(data_string);

        for (let i = 0; i < data.length; i++) {
            manager.addPlayer(data[i].Name)
        }
    })
}

if (fs.existsSync(questionpath)) {
    fs.readFile(questionpath, 'utf-8', (err, data_string) => {
        if (err) throw err;

        let data = JSON.parse(data_string);

        for (let i = 0; i < data.length; i++) {
            manager.addQuestionSet(data[i].Name, data[i].Text[0], data[i].Solution[0], data[i].Text[1], data[i].Solution[1], data[i].Text[2], data[i].Solution[2], data[i].Text[3], data[i].Solution[3],data[i].Text[4], data[i].Solution[4])
        }
    })
}

if (fs.existsSync(ffAPath)) {
    fs.readFile(ffAPath, 'utf-8', (err, data_string) => {
        if (err) throw err;

        let data = JSON.parse(data_string);

        for (let i = 0; i < data.length; i++) {
            manager.addFreeForAll(data[i].Question, data[i].Solution)
        }
    })
}

app.get('/updatePlayers', (req, res) => {
    let answer = JSON.stringify(manager.players);
    res.send(answer);
});

app.get('/updateQuestions', (req, res) => {
    let answer = JSON.stringify(manager.questions);
    res.send(answer);
});

app.get('/freeForAll', (req, res) => {
    console.log(manager.freeForAll[ffACount]);
    console.log(ffACount);

    let answer = JSON.stringify(manager.freeForAll[ffACount]);

    res.send(answer);
});

app.get('/questionText/:set/:id', (req, res) => {
    let set = req.params.set
    let id = req.params.id

    let answer = JSON.stringify(manager.questions[set].Text[id]);
    
    res.send(answer);
});

app.get('/timer', (req, res) => {
    let answer = JSON.stringify(timerUpdate)

    timerUpdate--
    
    res.send(answer);
});

app.get('/sendSelectQuestion', (req, res) => {
    let answer = JSON.stringify(questionUpdate)
    
    res.send(answer);
});

app.get('/sendCloseQuestion', (req, res) => {
    let answer = JSON.stringify(closeQuestion)

    closeQuestion--
    
    res.send(answer);
});

app.get('/rules', (req, res) => {
    let answer = JSON.stringify(rules)
    
    res.send(answer);
});

app.get('/cat', (req, res) => {
    let answer = JSON.stringify(categories)
    
    res.send(answer);
});

app.get('/toggleSolution', (req, res) => {
    let answer = JSON.stringify(solutionHidden)
    
    res.send(answer);
});

app.get('/sendFFA', (req, res) => {
    let answer = JSON.stringify(ffa)

    ffa--
    
    res.send(answer);
});

app.post('/updatePlayers', (req, res) => {

    let name = req.body.name;

    manager.addPlayer(name);

    fs.writeFile(playerpath, JSON.stringify(manager.players), 'utf8', (error=>{
        if(error) throw error;
        
    }))
    
    let answer = {text: 'new message has been created'};
    
    res.send(JSON.stringify(answer));
});

app.post('/updateQuestions', (req, res) => {

    let name = req.body.name
    let text1 = req.body.text1
    let sol1 = req.body.sol1
    let text2 = req.body.text2
    let sol2 = req.body.sol2
    let text3 = req.body.text3
    let sol3 = req.body.sol3
    let text4 = req.body.text4
    let sol4 = req.body.sol4
    let text5 = req.body.text5
    let sol5 = req.body.sol5

    manager.addQuestionSet(name, text1, sol1, text2, sol2, text3, sol3, text4, sol4, text5, sol5)

    fs.writeFile(questionpath, JSON.stringify(manager.questions, 0, 2), 'utf8', (error=>{
        if(error) throw error;
        
    }))
    
    let answer = {text: 'new message has been created'};
    
    res.send(JSON.stringify(answer));
});

app.post('/freeForAll', (req, res) => {

    let question = req.body.question
    let solution = req.body.solution

    manager.addFreeForAll(question, solution)

    fs.writeFile(ffAPath, JSON.stringify(manager.freeForAll, 0, 2), 'utf8', (error=>{
        if(error) throw error;
    }))
    
    let answer = {text: 'new message has been created'};
    
    res.send(JSON.stringify(answer));
});

app.post('/specialUsed', (req, res) => {

    let set = req.body.set
    let pos = req.body.pos

    if(manager.players[set].Specials[pos] == true){
        manager.players[set].Specials[pos] = false
        /* elem.style.backgroundColor = "var(--gray-5)" */
    }
    else{
        manager.players[set].Specials[pos] = true
        /* elem.style.backgroundColor = "var(--color-accent-1)" */
    }

    fs.writeFile(playerpath, JSON.stringify(manager.players, 0, 2), 'utf8', (error=>{
        if(error) throw error;
        
    }))
    
    let answer = {text: 'new message has been created'};
    
    res.send(JSON.stringify(answer));
});

app.post('/changeScore', (req, res) => {

    let plusMinus = req.body.plusMinus
    let value = req.body.value
    let player = req.body.player

    console.log(player);

    if(value == ""){}
    else if(plusMinus == "plus"){
        manager.players[player].Score = parseInt(manager.players[player].Score) + parseInt(value)
        console.log("plus");
    }   
    else if(plusMinus == "minus"){
        manager.players[player].Score = parseInt(manager.players[player].Score) - parseInt(value)
    }

    fs.writeFile(playerpath, JSON.stringify(manager.players, 0, 2), 'utf8', (error=>{
        if(error) throw error;
    }))
    
    let answer = {text: 'new message has been created'};
    
    res.send(JSON.stringify(answer));
});


app.post('/timer', (req, res) => {
    timerUpdate = 3

    let answer = {text: 'new message has been created'};
    
    res.send(JSON.stringify(answer));
});


app.post('/sendSelectQuestion', (req, res) => {
    let set = req.body.set
    let pos = req.body.pos

    questionUpdate[0] = set
    questionUpdate[1] = pos

    setTimeout(function(){
        manager.questions[set].Used[pos] = true
    },600)

    let answer = {text: 'new message has been created'};
    
    res.send(JSON.stringify(answer));
});

app.post('/sendCloseQuestion', (req, res) => {
    closeQuestion = 2

    let answer = {text: 'new message has been created'};
    
    res.send(JSON.stringify(answer));
});

app.post('/sendOpenRules', (req, res) => {
    let set = req.body.set
    let pos = req.body.pos

    questionUpdate[0] = set
    questionUpdate[1] = pos

    setTimeout(function(){
        manager.questions[set].Used[pos] = true
    },600)


    let answer = {text: 'new message has been created'};
    
    res.send(JSON.stringify(answer));
});

app.post('/rules', (req, res) => {
    if(rules == 0){
        rules = 1
    }
    else{
        rules = 0
    }

    let answer = {text: 'new message has been created'};
    
    res.send(JSON.stringify(answer));
}); 

app.post('/cat', (req, res) => {
    if(categories == 0){
        categories = 1
    }
    else{
        categories = 0
    }

    let answer = {text: 'new message has been created'};
    
    res.send(JSON.stringify(answer));
}); 

app.post('/cat', (req, res) => {
    if(solutionHidden == 0){
        solutionHidden = 1
    }
    else{
        solutionHidden = 0
    }

    let answer = {text: 'new message has been created'};
    
    res.send(JSON.stringify(answer));
});

app.post('/sendFFA', (req, res) => {
    ffa = 3

    let answer = {text: 'new message has been created'};

    ffACount++
    
    res.send(JSON.stringify(answer));
});

app.post('/reset', (req, res) => {

    for (let i = 0; i < manager.players.length; i++) {
       manager.players[i].Score = 0
       manager.players[i].Specials[0] = true
       manager.players[i].Specials[1] = true
       manager.players[i].Specials[2] = true
    }

    let answer = {text: 'new message has been created'};
    
    res.send(JSON.stringify(answer));
});

// START SERVER
app.listen(port, () => {
    console.log('*************************************')
    console.log('Express server app started.')
    console.log(`Server listening on port ${port}`);
    console.log('*************************************')
});

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
                Specials: [true,true,true],
            };

            this.players.push(newPlayer);
        }
    }

    addQuestionSet(name, text1, sol1, text2, sol2, text3, sol3, text4, sol4, text5, sol5) {
        if(this.questions.length < 4){
        console.log(name.toLowerCase());
        name = name.toLowerCase()
        
        let newSet = {
            Name: name,
            Text: [
                text1,text2,text3,text4,text5
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

    reAddQuestionSet(name, text1, sol1, used1, text2, sol2, used2, text3, sol3, used3, text4, sol4, used4, text5, sol5, used5) {
        if(this.questions.length < 4){
        console.log(name.toLowerCase());
        name = name.toLowerCase()
        
        let newSet = {
            Name: name,
            Text: [
                text1,text2,text3,text4,text5
            ],
            Solution: [
                sol1, sol2, sol3, sol4, sol5
            ],
            Used: [
                used1, used2, used3, used4, used5
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

    printQuestions(){
        let txt = ""

        return txt;
    }
}

let manager = new Manager