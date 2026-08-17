require("dotenv").config();

const transcript = require("discord-html-transcripts");

const db = require("./database");

const {
Client,
GatewayIntentBits,
PermissionsBitField,
ChannelType,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
StringSelectMenuBuilder,
REST,
Routes
} = require("discord.js");


const commands = require("./commands");


const client = new Client({

intents:[

GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent

]

});



async function saveDB(){

await db.write();

}



function getGuildConfig(id){

let config = db.data.config[id];


if(!config){

config = {

staffRole:"",
logs:"",
antispam:true

};


db.data.config[id]=config;


}


return config;

}



client.once("ready", async()=>{


console.log(
"✅ Bot connecté "+client.user.tag
);



const rest = new REST({version:"10"})
.setToken(process.env.TOKEN);



await rest.put(

Routes.applicationCommands(

client.user.id

),

{

body:commands

}

);



console.log(
"✅ Commandes slash installées"
);


});
client.on("interactionCreate", async interaction => {



if(interaction.isChatInputCommand()){



let config = getGuildConfig(
interaction.guild.id
);



if(interaction.commandName==="setup"){



let embed = new EmbedBuilder()

.setTitle("🎫 Centre de tickets")

.setDescription(
"Choisis une catégorie dans le menu :"
);



let menu = new StringSelectMenuBuilder()

.setCustomId("ticket_menu")

.setPlaceholder("📂 Choisir une catégorie")

.addOptions([


{
label:"Support",
description:"Demande de support",
value:"support",
emoji:"🎫"
},


{
label:"Achat",
description:"Question achat",
value:"achat",
emoji:"💳"
},


{
label:"Partenariat",
description:"Partenariat",
value:"🤝"
},


{
label:"Bug",
description:"Signaler un bug",
value:"bug",
emoji:"🛠️"
}


]);



let row = new ActionRowBuilder()

.addComponents(menu);



return interaction.reply({

embeds:[embed],

components:[row]

});


}





if(interaction.commandName==="staff"){



let role =
interaction.options.getRole("role");



config.staffRole = role.id;


await saveDB();



return interaction.reply({

content:"✅ Rôle staff enregistré",

ephemeral:true

});


}





if(interaction.commandName==="logs"){



let salon =
interaction.options.getChannel("salon");



config.logs = salon.id;


await saveDB();



return interaction.reply({

content:"✅ Salon logs enregistré",

ephemeral:true

});


}





if(interaction.commandName==="panel"){



if(!interaction.member.permissions.has(

PermissionsBitField.Flags.Administrator

)){


return interaction.reply({

content:"❌ Administrateur uniquement",

ephemeral:true

});


}



return interaction.reply({

embeds:[

new EmbedBuilder()

.setTitle("⚙️ Panel TicketBot")

.setDescription(

"👮 Staff : "+

(config.staffRole ?
"<@&"+config.staffRole+">"
:
"Non défini")

+

"\n🛡️ Anti-spam : "+

(config.antispam ?
"Activé"
:
"Désactivé")

)

],

ephemeral:true

});


}
if(interaction.isStringSelectMenu()){



if(interaction.customId==="ticket_menu"){



let type = interaction.values[0];


let config = getGuildConfig(
interaction.guild.id
);



if(config.antispam){


if(!db.data.cooldowns){

db.data.cooldowns={};

}



let last =
db.data.cooldowns[interaction.user.id];



if(
last &&
Date.now()-last < 60000
){


return interaction.reply({

content:"⚠️ Attends avant de créer un autre ticket.",

ephemeral:true

});


}



db.data.cooldowns[interaction.user.id]=Date.now();


await saveDB();


}




let ticket = await interaction.guild.channels.create({


name:

"ticket-"+type+"-"+interaction.user.username,


type:ChannelType.GuildText,



permissionOverwrites:[


{

id:interaction.guild.id,

deny:[

PermissionsBitField.Flags.ViewChannel

]

},


{

id:interaction.user.id,

allow:[

PermissionsBitField.Flags.ViewChannel,

PermissionsBitField.Flags.SendMessages,

PermissionsBitField.Flags.ReadMessageHistory

]

},



...(config.staffRole ? [{

id:config.staffRole,

allow:[

PermissionsBitField.Flags.ViewChannel,

PermissionsBitField.Flags.SendMessages,

PermissionsBitField.Flags.ReadMessageHistory

]

}] : [])


]


});





if(!db.data.tickets){

db.data.tickets=[];

}



db.data.tickets.push({


guild:interaction.guild.id,

channel:ticket.id,

user:interaction.user.id,

category:type,

staff:null,

status:"open",

created:Date.now()

});



await saveDB();




let embed = new EmbedBuilder()

.setTitle("🎫 Ticket ouvert")

.setDescription(

"👤 Créateur : "+interaction.user+

"\n📂 Catégorie : "+type+

"\n🕒 Heure : "+

new Date().toLocaleString("fr-FR")

);



let buttons = new ActionRowBuilder()

.addComponents(


new ButtonBuilder()

.setCustomId("claim")

.setLabel("🎫 Prendre")

.setStyle(ButtonStyle.Success),



new ButtonBuilder()

.setCustomId("close")

.setLabel("🔒 Fermer")

.setStyle(ButtonStyle.Danger)


);



await ticket.send({

embeds:[embed],

components:[buttons]

});



return interaction.reply({

content:"✅ Ticket créé : "+ticket,

ephemeral:true

});


}


}
if(interaction.isButton()){



let type = interaction.customId;



if(type==="claim"){



let ticket = db.data.tickets.find(

t => t.channel === interaction.channel.id

);



if(ticket){


ticket.staff = interaction.user.id;


if(!db.data.stats){

db.data.stats={};

}


if(!db.data.stats[interaction.user.id]){

db.data.stats[interaction.user.id]=0;

}


db.data.stats[interaction.user.id]++;


await saveDB();


}



return interaction.reply({

content:"🎫 Ticket pris par "+interaction.user,

ephemeral:false

});


}





if(type==="close"){



let row = new ActionRowBuilder()

.addComponents(


new ButtonBuilder()

.setCustomId("confirm_close")

.setLabel("✅ Confirmer")

.setStyle(ButtonStyle.Danger),



new ButtonBuilder()

.setCustomId("cancel_close")

.setLabel("❌ Annuler")

.setStyle(ButtonStyle.Secondary)


);



return interaction.reply({

content:"⚠️ Confirmer la fermeture du ticket ?",

components:[row],

ephemeral:true

});


}





if(type==="cancel_close"){



return interaction.update({

content:"❌ Fermeture annulée",

components:[]

});


}





if(type==="confirm_close"){



let file;



try{


file = await transcript.createTranscript(

interaction.channel,

{

limit:-1,

filename:

interaction.channel.name+"-transcript.html"

}

);


}catch(e){

console.log(e);

}



let ticket = db.data.tickets.find(

t => t.channel === interaction.channel.id

);



if(ticket){


ticket.status="closed";

ticket.closed=Date.now();


await saveDB();


}



let config = getGuildConfig(

interaction.guild.id

);



if(config.logs){



let logs = interaction.guild.channels.cache.get(

config.logs

);



if(logs){


logs.send({

content:

"🔴 Ticket fermé par "+interaction.user,

files:file ? [file] : []

});


}



}



await interaction.update({

content:"🔒 Ticket fermé",

components:[]

});



setTimeout(()=>{


interaction.channel.delete()

.catch(()=>{});


},3000);



}


}
if(interaction.commandName==="stats"){



if(!db.data.stats){

db.data.stats={};

}



let classement = Object.entries(

db.data.stats

);



let texte="Aucun staff";



if(classement.length){


texte="";


classement

.sort((a,b)=>b[1]-a[1])

.slice(0,10)

.forEach((s,i)=>{


texte +=

`${i+1}. <@${s[0]}> : ${s[1]} ticket(s)\n`;


});


}




let ouverts = db.data.tickets.filter(

t=>t.status==="open"

).length;



let embed = new EmbedBuilder()

.setTitle("📊 Statistiques TicketBot")

.setDescription(

"🎫 Tickets ouverts : **"+

ouverts+

"**\n\n🏆 Classement staff :\n"+

texte

);



return interaction.reply({

embeds:[embed]

});


}





if(interaction.commandName==="antispam"){



if(!interaction.member.permissions.has(

PermissionsBitField.Flags.Administrator

)){


return interaction.reply({

content:"❌ Administrateur uniquement",

ephemeral:true

});


}



let config = getGuildConfig(

interaction.guild.id

);



config.antispam = !config.antispam;



await saveDB();



return interaction.reply({

content:

"🛡️ Anti-spam "+

(config.antispam ? "activé" : "désactivé"),

ephemeral:true

});


}





if(interaction.commandName==="resetstats"){



if(!interaction.member.permissions.has(

PermissionsBitField.Flags.Administrator

)){


return interaction.reply({

content:"❌ Administrateur uniquement",

ephemeral:true

});


}



db.data.stats={};


await saveDB();



return interaction.reply({

content:"✅ Statistiques réinitialisées",

ephemeral:true

});


}



}
});


client.login(process.env.TOKEN);
