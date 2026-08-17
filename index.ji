require("dotenv").config();

const fs = require("fs");
const transcript = require("discord-html-transcripts");

const {
Client,
GatewayIntentBits,
PermissionsBitField,
ChannelType,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
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


if(!fs.existsSync("./config.json")){

fs.writeFileSync(
"./config.json",

JSON.stringify({

staffRole:"",
logs:"",
categories:{
support:"",
achat:"",
partenariat:"",
bug:""
}

},null,2)

);

}


let config=require("./config.json");


let stats={};



function save(){

fs.writeFileSync(
"./config.json",
JSON.stringify(config,null,2)
);

}



client.once("ready",async()=>{


console.log(
"✅ Bot connecté "+client.user.tag
);


const rest=new REST({version:"10"})
.setToken(process.env.TOKEN);



await rest.put(

Routes.applicationCommands(client.user.id),

{

body:commands

}

);


console.log(
"✅ Commandes installées"
);


});



async function logs(guild,text,file){


if(!config.logs) return;


let salon =
guild.channels.cache.get(config.logs);


if(!salon) return;


salon.send({

content:text,

files:file ? [file] : []

});


}



client.on("interactionCreate",async interaction=>{


if(interaction.isChatInputCommand()){



if(interaction.commandName==="setup"){


let embed=new EmbedBuilder()

.setTitle("🎫 Centre de support")

.setDescription(

"Choisis la catégorie de ton ticket :\n\n"+
"🎫 Support\n"+
"💳 Achat\n"+
"🤝 Partenariat\n"+
"🛠️ Bug"

);



let row=new ActionRowBuilder()

.addComponents(

new ButtonBuilder()
.setCustomId("support")
.setLabel("🎫 Support")
.setStyle(ButtonStyle.Primary),


new ButtonBuilder()
.setCustomId("achat")
.setLabel("💳 Achat")
.setStyle(ButtonStyle.Success),


new ButtonBuilder()
.setCustomId("partenariat")
.setLabel("🤝 Partenariat")
.setStyle(ButtonStyle.Secondary),


new ButtonBuilder()
.setCustomId("bug")
.setLabel("🛠️ Bug")
.setStyle(ButtonStyle.Danger)

);



return interaction.reply({

embeds:[embed],

components:[row]

});


}
if(interaction.commandName==="staff"){

let role =
interaction.options.getRole("role");

config.staffRole=role.id;

save();

return interaction.reply({
content:"✅ Rôle staff enregistré",
ephemeral:true
});

}



if(interaction.commandName==="logs"){

let salon =
interaction.options.getChannel("salon");

config.logs=salon.id;

save();

return interaction.reply({
content:"✅ Salon logs enregistré",
ephemeral:true
});

}


if(interaction.commandName==="claim"){


if(!interaction.channel.name.startsWith("ticket-")){

return interaction.reply({

content:"❌ Cette commande doit être utilisée dans un ticket.",

ephemeral:true

});

}



await interaction.reply({

content:
"🎫 Ticket pris en charge par "+interaction.user,

});



if(config.logs){

let salon =
interaction.guild.channels.cache.get(config.logs);



if(salon){

salon.send({

content:
`📌 ${interaction.user} a pris en charge ${interaction.channel}`

});

}

}


}




if(interaction.commandName==="unclaim"){


if(!interaction.channel.name.startsWith("ticket-")){

return interaction.reply({

content:"❌ Cette commande doit être utilisée dans un ticket.",

ephemeral:true

});

}



await interaction.reply({

content:
"🔓 Ticket libéré par "+interaction.user

});



if(config.logs){

let salon =
interaction.guild.channels.cache.get(config.logs);



if(salon){

salon.send({

content:
`🔓 ${interaction.user} a libéré ${interaction.channel}`

});

}

}


}
if(interaction.commandName==="close"){

try{


await interaction.reply(
"📄 Création du transcript..."
);


const file =
await transcript.createTranscript(
interaction.channel,
{
limit:-1,
filename:
`${interaction.channel.name}.html`
}
);


await logs(
interaction.guild,
`🔒 Ticket fermé par ${interaction.user}`,
file
);



setTimeout(()=>{

interaction.channel.delete().catch(()=>{});

},3000);



}catch(error){

console.log(error);


interaction.channel.delete().catch(()=>{});


}

}



}



if(interaction.isButton()){


let type = interaction.customId;





if(
type==="support" ||
type==="achat" ||
type==="partenariat" ||
type==="bug"
){


let salon = await interaction.guild.channels.create({

name:
"ticket-"+type+"-"+interaction.user.username,


type:
ChannelType.GuildText,


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



let date = new Date().toLocaleString("fr-FR");



let embed = new EmbedBuilder()

.setTitle("🎫 Ticket ouvert")

.setDescription(

"👤 **Créateur :** "+interaction.user+

"\n📂 **Catégorie :** "+type+

"\n🕒 **Ouverture :** "+date+

"\n👮 **Staff assigné :** Aucun"

);



let boutons = new ActionRowBuilder()

.addComponents(


new ButtonBuilder()

.setCustomId("claim_ticket")

.setLabel("🎫 Prendre le ticket")

.setStyle(ButtonStyle.Success),



new ButtonBuilder()

.setCustomId("unclaim_ticket")

.setLabel("🔓 Libérer")

.setStyle(ButtonStyle.Secondary),



new ButtonBuilder()

.setCustomId("close_ticket")

.setLabel("🔒 Fermer")

.setStyle(ButtonStyle.Danger)


);



await salon.send({

embeds:[embed],

components:[boutons]

});



config.stats.opened++;

save();



await logs(

interaction.guild,

"🟢 Ticket ouvert : "+salon.name

);



return interaction.reply({

content:"✅ Ticket créé : "+salon,

ephemeral:true

});


}
let noms={

support:"support",

achat:"achat",

partenariat:"partenariat",

bug:"bug"

};



let salon = await interaction.guild.channels.create({


name:
"ticket-"+type+"-"+interaction.user.username,


type:
ChannelType.GuildText,



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

return interaction.reply({

content:"✅ Ticket créé",

ephemeral:true
if(interaction.customId==="claim_ticket"){


let embed = interaction.message.embeds[0];


let staff = interaction.user;


let newEmbed = EmbedBuilder.from(embed)
.setDescription(
embed.description.replace(
"👮 **Staff assigné :** Aucun",
"👮 **Staff assigné :** "+staff
)
);



await interaction.message.edit({

embeds:[newEmbed]

});



if(!config.stats.claimed[staff.id]){

config.stats.claimed[staff.id]=0;

}


config.stats.claimed[staff.id]++;


save();



await interaction.reply({

content:
"🎫 Ticket pris par "+staff,

ephemeral:false

});


}





if(interaction.customId==="unclaim_ticket"){


let embed = interaction.message.embeds[0];


let newEmbed = EmbedBuilder.from(embed)
.setDescription(
embed.description.replace(
/👮 \*\*Staff assigné :\*\*.*/,
"👮 **Staff assigné :** Aucun"
)
);



await interaction.message.edit({

embeds:[newEmbed]

});



await interaction.reply({

content:
"🔓 Ticket libéré",

ephemeral:false

});


}





if(interaction.customId==="close_ticket"){


await interaction.reply(
"🔒 Fermeture du ticket..."
);



config.stats.closed++;


save();



await logs(

interaction.guild,

"🔴 Ticket fermé : "+interaction.channel.name

);



setTimeout(()=>{


interaction.channel.delete().catch(()=>{});


},3000);


}
});

}



});


client.login(process.env.TOKEN);
