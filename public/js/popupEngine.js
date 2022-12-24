let popup = document.createElement("div")
popup.style.cssText = `
	position: absolute;
	inset: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 100;
	transition: all .5s;
	display: none;
	place-content: center;
	border-radius: .5rem;`

let popupContent = document.createElement("div")
popupContent.style.cssText = `
	background-color: hsl(0, 0%, 20%);
	padding: 2vw;`

let popupText = document.createElement("p")
popupText.style.cssText = `
text-align: center;
margin-bottom: 1rem;`

let popupButtons = document.createElement("div")
popupButtons.style.cssText = `
display: flex;
gap: 1rem;
justify-content: center;`

popupContent.appendChild(popupText)
popupContent.appendChild(popupButtons)
popup.appendChild(popupContent)
document.body.appendChild(popup)

/**
 * 
 * @param {String} text text that wil be displayed to the user
 * @param {function} confirm will be executed if the user confirms
 * @param {function} cancel will be executed if the user cancels
 */
function createPopup(text, confirm, cancel){
	popupButtons.innerHTML = ""

	let p1 = document.createElement("p")
	p1.innerHTML = "confirm"
	p1.onclick = function(){closePopup(confirm)}

	let p2 = document.createElement("p")
	p2.innerHTML = "cancel"
	p2.onclick = function(){closePopup(cancel)}

	popupButtons.appendChild(p1)
	popupButtons.appendChild(p2)
	popupText.innerHTML = text
	popup.style.display = "grid"
}

function closePopup(run){
	console.log(run);

	if(run)
	run()

	popup.style.display = "none"
}