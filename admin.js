const fs = require("fs");
const { EmbedBuilder } = require("discord.js");

let config = require("./config.json");


function save(){

fs.writeFileSync(
"./config.json",
JSON.stringify(config,null,2)
);

}



module.exports = {

async execute(interaction){


if(!interaction.member.permissions.has("Administrator")){

return interaction.reply({

content:"❌ Administrateur uniquement",

ephemeral:true

});

}



if(interaction.commandName==="panel"){


let embed = new EmbedBuilder()

.setTitle("⚙️ Panel configuration TicketBot")

.setDescription(

"🎫 Tickets ouverts : "+
config.stats.opened+

"\n🔴 Tickets fermés : "+
config.stats.closed+

"\n\n🛡️ Anti-spam : "+
(config.antispam ? "Activé" : "Désactivé")+

"\n\n👮 Staff : "+
(config.staffRole ? "<@&"+config.staffRole+">" : "Non défini")

);



return interaction.reply({

embeds:[embed],

ephemeral:true

});

}





if(interaction.commandName==="antispam"){


config.antispam =
!config.antispam;


save();


return interaction.reply({

content:

"🛡️ Anti-spam "+
(config.antispam ? "activé" : "désactivé"),

ephemeral:true

});


}





if(interaction.commandName==="resetstats"){


config.stats.opened=0;

config.stats.closed=0;

config.stats.claimed={};


save();


return interaction.reply({

content:"✅ Statistiques réinitialisées",

ephemeral:true

});


}


}

};
