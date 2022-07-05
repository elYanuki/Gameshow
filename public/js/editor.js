let preview = document.getElementById('preview')

const socket = io();

socket.on("connect", () => {
    console.log(socket);
    console.log(socket.id);
})

socket.emit("getAllGames")

socket.on('loadAllGames', (data) => {
    console.log(data);

    let html = ""

    for (let i = 0; i < data.length; i++) {
        html += `
        <div class="preview-item" onclick="editGame(i)">
            <p class="preview-catname">GAME ${i+1}</p>
            <div>
                <p class="preview-cat">${data[i][0][0].Name}</p>
                <p class="preview-cat">${data[i][0][1].Name}</p>
                <p class="preview-cat">${data[i][0][2].Name}</p>
                <p class="preview-cat">${data[i][0][3].Name}</p>
            </div>
        </div>`
    }

    preview.innerHTML = html
})

function editGame(){
    preview.style.display = "none"
}
