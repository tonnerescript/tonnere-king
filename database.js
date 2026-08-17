const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");


const adapter = new JSONFile("database.json");

const db = new Low(adapter, {

config:{},

tickets:[],

stats:{}

});


async function init(){

await db.read();

await db.write();

}


init();


module.exports = db;
