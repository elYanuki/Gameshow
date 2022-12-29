const socket = io();

let boardContent = document.querySelector('#questions > .content')
let selectedBoard = null

/**
 * listens for a new list of boardnames and their uuids then displays list in sidebar
 */
socket.on('boardList', (data) => {	
	let html = ""
	data.forEach(item => {
		html += `<div class="board" data-uuid="${item.uuid}" onclick="selectBoard('${item.uuid}', '${item.name}')">${item.name}</div>`
	})

	html += `
	<p class="new" onclick="createBoard()">create new</p>
	<div class="bottombar">
		<p onclick="openInfo('rules')">rules</p>
		<p onclick="openInfo('categories')">categories</p>
		<p class="close" onclick="openInfo('close')">close</p>
	</div>
	`

	document.querySelector('#boards').innerHTML = html

	highlightSelectedBoard()
})

/**
 * toggles visibility of rules and categorie info
 * @param {String} action what to open "rules" "categories" or "close"
 */
function openInfo(action){
	document.querySelector('#rules').style.display = "none"
	document.querySelector('#categories').style.display = "none"
	document.querySelector('.bottombar .close').style.color = "var(--color-contrast)"

	if(action == "rules"){
		document.querySelector('#rules').style.display = "grid"
	}
	else if(action == "categories"){
		document.querySelector('#categories').style.display = "grid"
	}
	else{
		document.querySelector('.bottombar .close').style.color = "var(--gray-600)"
	}
}

function selectBoard(uuid, name){
	//check if board is already opened
	if(selectedBoard != null && selectedBoard.name == name){
		socket.emit('request-board', uuid)
		return
	}

	let safedUUIDs = JSON.parse(localStorage["gameshow-bord-used"] || null)
	
	//check if board is in list of safed UUIDs
	if (safedUUIDs == null || !safedUUIDs.includes(uuid)) {
		createPopup(1, 'You have never edited this board, are you sure you want to open "' + name +'" ?', () => {
			socket.emit('request-board', uuid);

			if(popupCheckBox == false)
				addKnownUUID(uuid);
		})
		return
	}

	//is in list of knows uuids
	socket.emit('request-board', uuid);
}

/**
 * recievs data for whole gameboard and displays it
 */
socket.on('loadBoard', (board) => {
	console.log("new board recieved", board);

	selectedBoard = board

	renderBoard()
	generateFFAEditor(selectedBoard.ffa)

	openInfo("close")
	closeEditor("cancel")

	if(ffaEditOpen == true)
		editFFA()

	highlightSelectedBoard()
})

/**
 * iterates over all boards and higlights the one that is "selectedBoard"
 */
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

/**
 * generates inputs to edit free for all questions
 * @param data if given
 */
function generateFFAEditor(data){
	document.querySelector('#ffa-editor').innerHTML = "<p>no input</p><p>question</p><p>solution</p><i class='fa-solid fa-circle-info info-popup'></i>"
	
	let html = ""

	for (let i = 0; i < 10; i++) {
			console.log(data[i])

			html+= `
			<input class="type" type="checkbox" ${(data[i].type == 11 ? "checked" : "")}>
			<input class="text" type="text" placeholder="${i+1}" value="${data[i].question}">
			<input class="solution" type="text" placeholder="${i+1}" value="${data[i].solution}">
			`
	}

	document.querySelector('#ffa-editor').innerHTML += html + `<p onclick="editFFA()" class="close">close</p>`
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

const typeInfos = [
	"'Default questions allow you to input a question and a solution - the question will be visible to all players - the solution only to the gamemaster.'",
	"'Image questions have the option to input a question image for example a picture of many people. You can then ask the question - where is the policeman - and set a image with the policeman highlighted as the solution image. Images should be providet as urls(the easiest way to use custom images is to upload them to https://imgur.com/ - right click and copy image url) you can easily right click any image from google and copy its link.  If no solution image is providet it will automatically be set to the question image.'",
	"'Multiple choice questions allow you to enter 4 options which will be displayed algonside the question.  All 4 of these should be providet for style reasons but it doesnt break anything if you leave one out.'"
]

function changeQuestionType(type, data){
	let questionText = editor.querySelectorAll('.content .textar')[0]?.value || ""
	let solutionText = editor.querySelectorAll('.content .textar')[1]?.value || ""

	console.log(questionText, solutionText);
	
	let html = `
	<textarea placeholder="question" class="textar" name="w3review" rows="2" cols="40">${data ? data.text : questionText}</textarea>
	<textarea placeholder="solution" class="textar" name="w3review" rows="2" cols="40">${data ? data.solution : solutionText}</textarea>`

	document.querySelector('.info-popup').style.setProperty("--content", typeInfos[0])

	switch(parseInt(type)){
		case 1:
			html += `
			<input type="text" placeholder="image one (question)" ${data ? "value='" + data.img[0] + "'" : ""}>
			<input type="text" placeholder="image two (solution)" ${data ? "value='" + data.img[1] + "'" : ""}>`
			
			document.querySelector('.info-popup').style.setProperty("--content", typeInfos[1])
			break
		case 2:
			html += `
			<input type="text" placeholder="choice one" ${data ? "value='" + data.options[0] + "'" : ""}>
			<input type="text" placeholder="choice two" ${data ? "value='" + data.options[1] + "'" : ""}>
			<input type="text" placeholder="choice three" ${data ? "value='" + data.options[2] + "'" : ""}>
			<input type="text" placeholder="choice four" ${data ? "value='" + data.options[3] + "'" : ""}>`
			
			document.querySelector('.info-popup').style.setProperty("--content", typeInfos[2])
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

/**
 * @param {String} action either save or cancel decides what to do with the data
 */
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
				if(inputs[1].value == "" || inputs[1].value == " ") {inputs[1].value = inputs[0].value}
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
	createPopup(0, 'Delete board "' + selectedBoard.name + '" ? this action is irreversable', () => {
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

//************ utility ************//

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


//----------- popup -----------//

let popupCheckBox = false

/**
 * 
 * @param {String} text will be displayed to the user
 * @param {function} confirm will be executed if the user confirms
 */
function createPopup(type, text, confirm){
	popupCheckBox = false

	document.querySelector('.popup-content').innerHTML = ""

	let b = document.createElement("div")
	b.classList.add("buttons")

	let p1 = document.createElement("p")
	p1.onclick = function(){closePopup(confirm)}
	p1.innerHTML = "confirm"

	let p2 = document.createElement("p")
	p2.onclick = function(){closePopup()}
	p2.innerHTML = "cancel"
	
	let t = document.createElement("p")
	t.classList.add("text")
	t.innerHTML = text

	
	b.appendChild(p1)
	b.appendChild(p2)
	document.querySelector('.popup-content').append(t)
	document.querySelector('.popup-content').append(b)

	if(type == 1){
		let c = document.createElement("input")
		c.type = "checkbox"
		c.classList.add("show-again")
		c.name = "show-again"
		c.onchange = function() {popupCheckBox = this.checked}
		
		let l = document.createElement("label")
		l.innerHTML = "warn me again next time"
		l.classList.add("show-again-label")
		l.for = "show-again"

		document.querySelector('.popup-content').append(c)
		document.querySelector('.popup-content').append(l)
	}
	
	document.querySelector('#popup').style.display = "grid"
}

function closePopup(run){
	if(run)
	run()

	document.querySelector('#popup').style.display = "none"
}


//************ listerners ************//

document.addEventListener("keydown", e => {
	switch (e.key) {
		case "Escape":
			closeEditor("cancel")
			if(ffaEditOpen == true)
				editFFA()
			break;
		case "Enter":
			closeEditor("save")
			if(ffaEditOpen == true)
				editFFA()
			break;
	}
})