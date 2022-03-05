import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

const { clientId, token } = require('./config.json');

const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('Ping pong!'),
    new SlashCommandBuilder().setName('alert').setDescription('Setup a channel for getting alerts')
        .addChannelOption(option => option.setName('channel').setRequired(true).setDescription('Channel'))
        .addStringOption(option => option.setName('region').setDescription('Sets the Region to notify about')
            .addChoice('All the Ukraine', 'ALL')
            .addChoice('Vinnytska oblast', 'VINNYTSA')
            .addChoice('Volynska oblast', 'VOLYNSKA')
            .addChoice('Dnipropetrovskaya oblast', 'DNIPROPETROVSKAYA')
            .addChoice('Jitomirskaya oblast', 'JITOMIRSKAYA')
            .addChoice('Zakarpatska oblast', 'ZAKARPATSKA')
            .addChoice('Zaporizka oblast', 'ZAPORIZKA')
            .addChoice('Ivanofrankiwska oblast', 'IVANOFRANKIWSKA')
            .addChoice('Kalush', 'KALUSH')
            .addChoice('Kyiv', 'KIYEW')
            .addChoice('Kyivska oblast', 'KIYEWSKAYA')
            .addChoice('Kirowogradska oblast', 'KIROWOGRADSKA')
            .addChoice('Lvivska oblast', 'LVIVKA')
            .addChoice('Mykolaivska oblast', 'MYKOLAYIV')
            .addChoice('Odeska oblast', 'ODESKA')
            .addChoice('Poltavska oblast', 'POLTASKA')
            .addChoice('Rivnenska oblast', 'RIVENSKA')
            .addChoice('Sumska oblast', 'SUMSKA')
            .addChoice('Ternopilska oblast', 'TERNOPILSKA')
            .addChoice('Kharkivska oblast', 'HARKIVSKA')
            .addChoice('Khersonska oblast', 'HERSONSKA')
            .addChoice('Khmelnytska oblast', 'HMELNYCKA')
            .addChoice('Cherkaska oblast', 'CHERKASKA')
            .addChoice('Chernivetska oblast', 'CHERNIVETSKA')
            .addChoice('Chernigiwska oblast', 'CHERNIGIWSKA')
            .setRequired(true)
        )
        .addRoleOption(option => option.setName('role').setDescription('Role to ping about alerts, leave blank for @everyone').setRequired(false)),
    new SlashCommandBuilder().setName('removealert').setDescription('Clears alerts from a channel')
        .addChannelOption(option => option.setName('channel').setRequired(true).setDescription('Channel'))
]
    .map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);