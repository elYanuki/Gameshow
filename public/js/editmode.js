const socket = io();

let boardContent = document.querySelector('#questions > .content')
function createBoard(){
	let html = ""

	for (let i = 0; i < 4; i++) {//collumns
		for (let j = 0; j < 5; j++) {//rows
			html += `
			<div onclick="editQuestion(this)" class="question">
				<p class="type">default</p>
				<p class="text">no quesdsaf sdaf sdaf sadf asdf asdf asdf afsd asfd asfas df asdf as fa df asfd a sasdf tion yet</p>
				<p class="solution">nodaf asdf sadf asfd asdf afas asdf asfdasdf asdfasdf asfsaf asfadf asdf solution yet</p>
				<p class="info">click to edit</p>
			</div>`
		}
	}

	boardContent.innerHTML = html
	document.querySelector('#questions .empty').style.display = "none"
}

function editQuestion(elem){

}