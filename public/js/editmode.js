const socket = io();

let boardContent = document.querySelector('#questions > .content')
let selectedBoard = null

socket.on('boardList', (data) => {	
	let html = ""
	data.forEach(item => {
		html += `<div class="board" data-uuid="${item.uuid}" onclick="selectBoard(this)">${item.name}</div>`	
	})

	html += `<p class="new" onclick="createBoard()">create new</p>`

	document.querySelector('#boards').innerHTML = html

	highlightSelectedBoard()
})

function selectBoard(elem){
	let uuid = elem.dataset.uuid

	if(localStorage["gameshow-bord-used"]){
		let data = JSON.parse(localStorage["gameshow-bord-used"])

		for (let i = 0; i < data.length; i++) {
			if(data[i] == uuid){
				socket.emit('request-board', uuid);
				return
			}
		}
	}

	//not found in localstorrage - prompt
	createPopup('You have never edited this board, are you sure you want to open "' + elem.innerHTML +'" ?', () => {
		socket.emit('request-board', uuid);
		addKnownUUID(uuid);
	})
}

socket.on('loadBoard', (board) => {
	console.log("new board recieved", board);

	selectedBoard = board

	console.log(selectedBoard.ffa);

	renderBoard()
	generateFFAEditor(selectedBoard.ffa)

	highlightSelectedBoard()
})

function highlightSelectedBoard(){
	if(selectedBoard == null) return

	document.querySelectorAll('#boards .board').forEach(item => {
		if(item.dataset.uuid == selectedBoard.uuid){
			item.classList.add("selectedBoard")
		}
		else{
			item.classList.remove("selectedBoard")
		}
	 })
}

function createBoard(){
	selectedBoard = 
	{
		"name" : "new board",
		"uuid" : uuidv4(),
		"board" : [
			{
				"name": "",
				"questions": [
					{
						"type": 0,
						"text": "",
						"solution": "",
						"used": false
					},
					{
						"type": 0,
						"text": "",
						"solution": "",
						"used": false
					},
					{
						"type": 0,
						"text": "",
						"solution": "",
						"used": false
					},
					{
						"type": 0,
						"text": "",
						"solution": "",
						"used": false
					},
					{
						"type": 0,
						"text": "",
						"solution": "",
						"used": false
					},
				]
			},
			{
				"name": "",
				"questions": [
					{
						"type": 0,
						"text": "",
						"solution": "",
						"used": false
					},
					{
						"type": 0,
						"text": "",
						"solution": "",
						"used": false
					},
					{
						"type": 0,
						"text": "",
						"solution": "",
						"used": false
					},
					{
						"type": 0,
						"text": "",
						"solution": "",
						"used": false
					},
					{
						"type": 0,
						"text": "",
						"solution": "",
						"used": false
					},
				]
			},
			{
				"name": "",
				"questions": [
					{
						"type": 0,
						"text": "",
						"solution": "",
						"used": false
					},
					{
						"type": 0,
						"text": "",
						"solution": "",
						"used": false
					},
					{
						"type": 0,
						"text": "",
						"solution": "",
						"used": false
					},
					{
						"type": 0,
						"text": "",
						"solution": "",
						"used": false
					},
					{
						"type": 0,
						"text": "",
						"solution": "",
						"used": false
					},
				]
			},
			{
				"name": "",
				"questions": [
					{
						"type": 0,
						"text": "",
						"solution": "",
						"used": false
					},
					{
						"type": 0,
						"text": "",
						"solution": "",
						"used": false
					},
					{
						"type": 0,
						"text": "",
						"solution": "",
						"used": false
					},
					{
						"type": 0,
						"text": "",
						"solution": "",
						"used": false
					},
					{
						"type": 0,
						"text": "",
						"solution": "",
						"used": false
					},
				]
			},
		],
		"ffa" : [
			{
				type: 10,
				question: "",
				solution: ""
			},
			{
				type: 10,
				question: "",
				solution: ""
			},
			{
				type: 10,
				question: "",
				solution: ""
			},
			{
				type: 10,
				question: "",
				solution: ""
			},
			{
				type: 10,
				question: "",
				solution: ""
			},
			{
				type: 10,
				question: "",
				solution: ""
			},
			{
				type: 10,
				question: "",
				solution: ""
			},
			{
				type: 10,
				question: "",
				solution: ""
			},
			{
				type: 10,
				question: "",
				solution: ""
			},
			{
				type: 10,
				question: "",
				solution: ""
			},
		]
	}

	renderBoard()

	socket.emit("add-board", selectedBoard)

	addKnownUUID(selectedBoard.uuid)

	console.log(selectedBoard);
}

function generateFFAEditor(data){
	 document.querySelector('#ffa-editor').innerHTML = "<p>no input</p><p>question</p><p>solution</p>"
	
	for (let i = 0; i < 10; i++) {
			let i1 = document.createElement("input")
				i1.classList.add("type")
				i1.type = "checkbox"
				i1.checked = (data[i].type == 11)

			let i2 = document.createElement("input")
				i2.classList.add("text")
				i2.placeholder = i
				i2.value = data[i].question
				console.log(data[i].question);

			let i3 = document.createElement("input")
				i3.classList.add("solution")
				i3.placeholder = i
				i3.value = data[i].solution

			document.querySelector('#ffa-editor').appendChild(i1)
			document.querySelector('#ffa-editor').appendChild(i2)
			document.querySelector('#ffa-editor').appendChild(i3)
	}

	document.querySelector('#ffa-editor').innerHTML += `<p onclick="editFFA()" class="close">close</p>`
}

let ffaEditOpen = false
function editFFA(){
	if(selectedBoard == null){
		return
	}
		

	document.querySelector('#ffa-editor').classList.toggle("active")

	if(ffaEditOpen == true){
		ffaEditOpen = false

		let ffas = []

		for (let i = 0; i < 10; i++) {
			let newFFA = {
				type: document.querySelectorAll('#ffa-editor .type')[i].checked ? 11 : 10,
				question: document.querySelectorAll('#ffa-editor .text')[i].value,
				solution: document.querySelectorAll('#ffa-editor .solution')[i].value
			};

			ffas.push(newFFA)
		}

		console.log(ffas);

		selectedBoard.ffa = ffas

		updateServer()
	}
	else
	ffaEditOpen = true
}

let editor = document.querySelector('#editor')
let editmode = false

let row
let column

function editQuestion(elem){
	if(editmode == false){
		editmode = true
		
		
		row = elem.dataset.row
		column = elem.dataset.column
		
		changeQuestionType(selectedBoard.board[column].questions[row].type, selectedBoard.board[column].questions[row])
		
		editor.classList.add("active")

		elem.classList.add("edit")

		document.querySelectorAll('#questions .catname')[column].classList.add("edit")
		document.querySelectorAll('#questions .points')[row].classList.add("edit")
	}
	else{
		//error or something
	}
}

function changeQuestionType(type, data){
	let html = `
	<textarea placeholder="question" class="textar" name="w3review" rows="3" cols="50">${data ? data.text : ""}</textarea>
	<textarea placeholder="solution" class="textar" name="w3review" rows="3" cols="50">${data ? data.solution : ""}</textarea>`

	/* <input type="text" placeholder="question" ${data ? "value='" + data.text + "'" : ""}>
	<input type="text" placeholder="solution" ${data ? "value='" + data.solution + "'" : ""}> */

	switch(parseInt(type)){
		case 1:
			html += `
			<input type="text" placeholder="image one (question)" ${data ? "value='" + data.img[0] + "'" : ""}>
			<input type="text" placeholder="image two (solution)" ${data ? "value='" + data.img[1] + "'" : ""}>`
			break
		case 2:
			html += `
			<input type="text" placeholder="choice one" ${data ? "value='" + data.options[0] + "'" : ""}>
			<input type="text" placeholder="choice two" ${data ? "value='" + data.options[1] + "'" : ""}>
			<input type="text" placeholder="choice three" ${data ? "value='" + data.options[2] + "'" : ""}>
			<input type="text" placeholder="choice four" ${data ? "value='" + data.options[3] + "'" : ""}>`
			break
	}

	editor.querySelector('.content').innerHTML = html
	editor.querySelector('.typesel').value = type
}

function renderBoard(){
	let html = ""

	for (let j = 0; j < 5; j++) {//rows
		for (let i = 0; i < 4; i++) {//collumns
			let type

			switch(selectedBoard.board[i].questions[j].type){
				case 0:
					type = "default"
					break
				case 1:
					type = "image"
					break
				case 2:
					type = "multiple choice"
					break
			}

			html += `
			<div onclick="editQuestion(this)" class="question" data-column="${i}" data-row="${j}">
				<p class="type">${type}</p>
				<p class="text">${selectedBoard.board[i].questions[j].text == "" ? "no question yet" : selectedBoard.board[i].questions[j].text}</p>
				<p class="solution">${selectedBoard.board[i].questions[j].solution == "" ? "no solution yet" : selectedBoard.board[i].questions[j].solution}</p>
				<p class="info">click to edit</p>
			</div>`
		}
	}
	boardContent.innerHTML = html

	document.querySelector('.boardname').value = selectedBoard.name
	document.querySelector('.boardname').disabled = false
	
	for (let i = 0; i < 4; i++) {
		let input = document.querySelectorAll('.catname input')[i]

		input.disabled = false
		input.value = selectedBoard.board[i].name
		input.placeholder = "enter category name"
	}

	document.querySelector('#questions .empty').style.display = "none"
}

function closeEditor(action){
	if(action == "save"){
		let data

		let inputs = document.querySelectorAll("#editor input")
		let areas = document.querySelectorAll("#editor textarea")
		console.log(areas[0].innerHTML);

		switch(parseInt(editor.querySelector('.typesel').value)){
			case 0://default
				data = {
					"type": 0,
					"text": areas[0].value,
					"solution": areas[1].value,
					"used": false
				}
				break
			case 1://image
				if(inputs[1] == "" || inputs[1] == " ") inputs[1] == inputs[0]
				data = {
					"type": 1,
					"text": areas[0].value,
					"solution": areas[1].value,
					"img" : [inputs[0].value, inputs[1].value],
					"used": false
				}
				break
			case 2://mulitple choice
				data = {
					"type": 2,
					"text": areas[0].value,
					"solution": areas[1].value,
					"options": [inputs[0].value, inputs[1].value, inputs[2].value, inputs[3].value],
					"used": false
				}
				break
		}

		selectedBoard.board[column].questions[row] = data
		console.log(data);
	
		renderBoard()

		updateServer()
	}
	
	editor.classList.remove("active")
	document.querySelectorAll(".edit").forEach(elem => {
		elem.classList.remove("edit")
	});

	document.querySelectorAll('.catname').forEach(element => {
		element.disabled = true
		element.placeholder = ""
	});

	editmode = false
}

function deleteBoard(){
	if(selectedBoard != null)
	createPopup('Delete board "' + selectBoard.name + '" ? this action is irreversable', () => {
		socket.emit("delete-board", selectedBoard.uuid)

		document.querySelector('.boardname').value = ""
		document.querySelector('.boardname').disabled = true
		
		for (let i = 0; i < 4; i++) {
			let input = document.querySelectorAll('.catname input')[i]

			input.disabled = true
			input.value = ""
			input.placeholder = ""
		}

		document.querySelector('#questions .empty').style.display = "block"

		boardContent.innerHTML = ""
	})
}

function renameCategory(cat, value){
	selectedBoard.board[cat].name = value
	updateServer()
}

function renameBoard(value){
	selectedBoard.name = value;
	updateServer()
}

function updateServer(){
	socket.emit("update-board", selectedBoard)
}

//----------- utility -----------//

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

function shakeEmpty(){
	if(selectedBoard != null) return

	document.querySelector('#questions .empty').style.animationPlayState = "running"

	setTimeout(function(){
		document.querySelector('#questions .empty').style.animationPlayState = "paused"
	},500)

	return true
}

function addKnownUUID(uuid){
	if(localStorage["gameshow-bord-used"]){
		let content = JSON.parse(localStorage["gameshow-bord-used"])
		content.push(uuid)
		localStorage["gameshow-bord-used"] = JSON.stringify(content)
	}
	else{
		let content = []
		content.push(uuid)
		localStorage["gameshow-bord-used"] = JSON.stringify(content)
	}
}

/**
 * 
 * @param {String} text will be displayed to the user
 * @param {function} confirm will be executed if the user confirms
 */
function createPopup(text, confirm){
	document.querySelector('.popup-content .buttons').innerHTML = ""

	let p1 = document.createElement("p")
	p1.innerHTML = "confirm"
	p1.onclick = function(){closePopup(confirm)}

	let p2 = document.createElement("p")
	p2.innerHTML = "cancel"
	p2.onclick = function(){closePopup()}

	document.querySelector('.popup-content .buttons').appendChild(p1)
	document.querySelector('.popup-content .buttons').appendChild(p2)
	document.querySelector('.popup-content p').innerHTML = text
	document.querySelector('#popup').style.display = "grid"
}

function closePopup(run){
	if(run)
	run()

	document.querySelector('#popup').style.display = "none"
}