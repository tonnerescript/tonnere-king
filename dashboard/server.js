const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(express.json());

app.use(express.static(
path.join(__dirname,"public")
));



const DB = path.join(
__dirname,
"../database.json"
);



function getDB(){

if(!fs.existsSync(DB)){

return {
config:{},
tickets:[],
stats:{}
};

}


return JSON.parse(
fs.readFileSync(DB,"utf8")
);

}



app.get("/api/stats",(req,res)=>{


let db = getDB();



let ouverts =
db.tickets.filter(
t=>t.status==="open"
).length;



let fermes =
db.tickets.filter(
t=>t.status==="closed"
).length;



res.json({

ouverts,

fermes,

staff:
db.stats || {}

});


});



app.get("/api/tickets",(req,res)=>{


let db=getDB();


res.json(
db.tickets || []
);


});



app.get("/",(req,res)=>{


res.sendFile(

path.join(
__dirname,
"public/index.html"

)

);


});



app.listen(3001,()=>{


console.log(
"🌐 Dashboard lancé sur le port 3001"
);


});
