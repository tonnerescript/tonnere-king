require("dotenv").config();

const {
Client,
GatewayIntentBits,
PermissionsBitField,
ChannelType,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} = require("discord.js");

const fs = require("fs");


const client = new Client({
 intents:[
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent
 ]
});
if(!fs.existsSync("./config.json")){
fs.writeFileSync("./config.json", JSON.stringify({
staffRole:"",
logs:""
}, null, 2));
}

let config = require("./config.json");


client.once("ready",()=>{
console.log("✅ Bot connecté "+client.user.tag);
});

client.on("interactionCreate",async interaction=>{
if(!interaction.isButton()) return;


if(interaction.customId==="open_ticket"){


let channel = await interaction.guild.channels.create({

name:"ticket-"+interaction.user.username,

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
PermissionsBitField.Flags.SendMessages
]
},
{
id:config.staffRole,
allow:[
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
}
]

});


let embed=new EmbedBuilder()
.setTitle("🎫 Ticket")
.setDescription(
"Bienvenue dans ton ticket.\n\n"+
"Un membre du staff va répondre.\n\n"+
"🔒 Clique sur fermer pour terminer."
);


let row=new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("close_ticket")
.setLabel("Fermer")
.setStyle(ButtonStyle.Danger)

);


channel.send({
content:`${interaction.user}`,
embeds:[embed],
components:[row]
});


interaction.reply({
content:"✅ Ticket créé",
ephemeral:true
});


}



if(interaction.customId==="close_ticket"){

await interaction.channel.delete();

}
});

client.on("messageCreate", async message => {

if(message.author.bot) return;


// Création du panel ticket

if(message.content === "!setup"){

if(!message.member.permissions.has(
PermissionsBitField.Flags.Administrator
)) return message.reply("❌ Pas la permission");


let embed = new EmbedBuilder()
.setTitle("🎫 Support")
.setDescription(
"Besoin d'aide ?\n\n"+
"Clique sur le bouton ci-dessous pour ouvrir un ticket."
);


let row = new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("open_ticket")
.setLabel("Créer un ticket")
.setStyle(ButtonStyle.Primary)

);


message.channel.send({
embeds:[embed],
components:[row]
});


}



// Définir le rôle staff

if(message.content.startsWith("!staff")){

if(!message.member.permissions.has(
PermissionsBitField.Flags.Administrator
)) return;


let role = message.mentions.roles.first();

if(!role)
return message.reply("Mentionne un rôle");


config.staffRole = role.id;


fs.writeFileSync(
"./config.json",
JSON.stringify(config,null,2)
);


message.reply(
"✅ Rôle staff configuré"
);

}




// Définir salon logs

if(message.content.startsWith("!logs")){

if(!message.member.permissions.has(
PermissionsBitField.Flags.Administrator
)) return;


let channel = message.mentions.channels.first();

if(!channel)
return message.reply("Mentionne un salon");


config.logs = channel.id;


fs.writeFileSync(
"./config.json",
JSON.stringify(config,null,2)
);


message.reply(
"✅ Salon logs configuré"
);

}




// Ajouter quelqu'un dans un ticket

if(message.content.startsWith("!add")){

if(!message.channel.name.startsWith("ticket-"))
return;


let user = message.mentions.users.first();

if(!user)
return message.reply("Mentionne un utilisateur");


message.channel.permissionOverwrites.create(
user.id,
{
ViewChannel:true,
SendMessages:true
}
);


message.reply(
"✅ Utilisateur ajouté"
);

}




// Retirer quelqu'un

if(message.content.startsWith("!remove")){

if(!message.channel.name.startsWith("ticket-"))
return;


let user = message.mentions.users.first();

if(!user)
return message.reply("Mentionne un utilisateur");


message.channel.permissionOverwrites.delete(
user.id
);


message.reply(
"✅ Utilisateur retiré"
);

}



});

client.login(process.env.TOKEN);
