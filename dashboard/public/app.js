async function loadStats(){


let res = await fetch("/api/stats");

let data = await res.json();



document.getElementById("open").textContent =
data.ouverts;



document.getElementById("close").textContent =
data.fermes;



}



async function loadTickets(){


let res = await fetch("/api/tickets");

let tickets = await res.json();



let table =
document.getElementById("tickets");



table.innerHTML="";



tickets.forEach(ticket=>{


let tr =
document.createElement("tr");



tr.innerHTML = `

<td>${ticket.channel}</td>

<td>${ticket.user}</td>

<td>${ticket.category}</td>

<td>${ticket.status}</td>

<td>${ticket.staff || "Aucun"}</td>

`;



table.appendChild(tr);



});


}



loadStats();

loadTickets();



setInterval(()=>{

loadStats();

loadTickets();

},5000);
