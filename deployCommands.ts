import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

const { clientId, token } = require('./config.json');

const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('Ping pong!'),
    new SlashCommandBuilder().setName('alert').setDescription('Setup a channel for getting alerts')
        .addChannelOption(option => option.setName('channel').setRequired(true).setDescription('Channel'))
        .addStringOption(option => option.setName('region').setDescription('Sets the Region to notify about').setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('Role to ping about alerts, leave blank for @everyone').setRequired(false)),
    new SlashCommandBuilder().setName('removealert').setDescription('Clears alerts from a channel')
        .addChannelOption(option => option.setName('channel').setRequired(true).setDescription('Channel')),
    new SlashCommandBuilder().setName('regions').setDescription('Displays all the regions available to notify you about'),
    new SlashCommandBuilder().setName('shelters').setDescription('Displays shelters of major cities of Ukraine')
]
    .map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);