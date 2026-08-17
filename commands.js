const { SlashCommandBuilder } = require("discord.js");


module.exports = [


new SlashCommandBuilder()

.setName("setup")

.setDescription("Créer le panneau ticket"),



new SlashCommandBuilder()

.setName("staff")

.setDescription("Définir le rôle staff")

.addRoleOption(option =>

option

.setName("role")

.setDescription("Rôle du staff")

.setRequired(true)

),



new SlashCommandBuilder()

.setName("logs")

.setDescription("Définir le salon des logs")

.addChannelOption(option =>

option

.setName("salon")

.setDescription("Salon logs")

.setRequired(true)

),



new SlashCommandBuilder()

.setName("stats")

.setDescription("Voir les statistiques tickets"),



new SlashCommandBuilder()

.setName("close")

.setDescription("Fermer un ticket")

.addStringOption(option =>

option

.setName("raison")

.setDescription("Raison de fermeture")

.setRequired(false)

),



new SlashCommandBuilder()

.setName("panel")

.setDescription("Ouvrir le panneau de configuration"),



new SlashCommandBuilder()

.setName("antispam")

.setDescription("Activer ou désactiver l'anti-spam"),



new SlashCommandBuilder()

.setName("resetstats")

.setDescription("Réinitialiser les statistiques")


].map(command => command.toJSON());
