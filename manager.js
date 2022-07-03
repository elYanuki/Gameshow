class Manager {
    constructor() {
        this.players = new Array();
        this.questions = new Array();
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

            this.loadView()
        }
    }

    addQuestionSet(name, text1, sol1, text2, sol2, text3, sol3, text4, sol4, text5, sol5) {
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
                true, true, true, true, true
            ]
        };

        this.questions.push(newSet);

        this.loadView()
    }

    updateQuestionSet(name, text1, sol1, used1, text2, sol2, used2, text3, sol3, used3, text4, sol4, used4, text5, sol5, used5) {
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

        for (let i = 0; i < this.questions.length; i++) {
            if(this.questions[i].Name == name){
                this.questions[i] = newSet
                this.loadView()
            }
        }
    }

    loadView(){
        let playerHtml = ""
        for (let i = 0; i < this.players.length; i++) {
            playerHtml += `
            <div class="player" player-id="${i}">
                <p class="name">${this.players[i].Name}</p>
                <div class="points-parent"><p class="points">${this.players[i].Score}</p></div>
                <div>
                    <div onclick="toggelSpecialUsed(this, ${i}, 0)"><i class="fa-solid fa-hand-point-right"></i></div>
                    <div onclick="toggelSpecialUsed(this, ${i}, 1)"><i class="fa-solid fa-file-pen"></i></div>
                    <div onclick="toggelSpecialUsed(this, ${i}, 2)"><i class="fa-solid fa-shield-halved"></i></div>
                </div>
                <i class="fa-solid fa-pen-to-square" onclick="changeScorePopup(${i}, event)"></i>
            </div>`
        }

        playerHtml += `<div class="add"><input type="text" id="name-input"/><i class="fa-solid fa-circle-plus" onclick="data.addPlayer(document.getElementById('name-input').value)"></i></div>`

        playerParent.innerHTML = playerHtml

        let questionHtml = ""
        for (let i = 0; i < this.questions.length; i++) {
            questionHtml += `
            <div class="catergory" cat-id="${i}">
                <h1>${this.questions[i].Name}</h1>
                <div onclick="selectQuestion(${i},0)"><p>100</p></div>
                <div onclick="selectQuestion(${i},1)"><p>200</p></div>
                <div onclick="selectQuestion(${i},2)"><p>300</p></div>
                <div onclick="selectQuestion(${i},3)"><p>400</p></div>
                <div onclick="selectQuestion(${i},4)"><p>500</p></div>
            </div>`
        }

        questionHtml += `<div id="selected"><p class="text"></p><p onclick="closeQuestion(); killTimer()">schließen</p></div>`

        questionParent.innerHTML = questionHtml

        selected = document.getElementById('selected')
    }

    printQuestions(){
        let txt = ""

        return txt;
    }

    getText(set, pos){
        switch (pos){
            case 0:
                return this.questions[set].Text1
            case 1:
                return this.questions[set].Text2
            case 2:
                return this.questions[set].Text3
            case 3:
                return this.questions[set].Text4
            case 4:
                return this.questions[set].Text5
        }  
    }
}
