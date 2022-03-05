import DiscordJS, { Intents, MessageEmbed, Permissions, TextChannel } from 'discord.js';
import fetch from 'node-fetch';

const { token } = require('./config.json');
var sqlite = require("./modules/database");

const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ping') {
        await interaction.reply({ content: 'Pong!', ephemeral: true });
    }
    if (commandName === 'alert') {
        let perms = interaction.member?.permissions as DiscordJS.Permissions;
        if (perms.has(Permissions.FLAGS.ADMINISTRATOR)) {            
            let channel = interaction.options.getChannel('channel') as DiscordJS.GuildBasedChannel;
            if (!channel.isText()) {
                await interaction.reply({ content: 'Text channel required!', ephemeral: true });
                return;
            }
            channel = channel as DiscordJS.TextChannel;
            
            let option = interaction.options.getString('region');
            if (option == null) {
                await interaction.reply({ content: 'Region required!', ephemeral: true });
                return;
            }

            let role = interaction.options.getRole('role');
            let roleid;
            if (role == null) {
                roleid = '-1';
            } else {
                role = role as DiscordJS.Role;
                roleid = role.id;
            }

            sqlite.addChannel(channel.id, option, roleid);

            await interaction.reply({ content: 'Success!', ephemeral: true })
        } else {
            await interaction.reply({ content: 'You are not an admin!', ephemeral: true });
        }
    }
    if (commandName === 'removealert') {
        let perms = interaction.member?.permissions as DiscordJS.Permissions;
        if (perms.has(Permissions.FLAGS.ADMINISTRATOR)) {
            let channel = interaction.options.getChannel('channel') as DiscordJS.GuildBasedChannel;
            if (!channel.isText()) {
                await interaction.reply({ content: 'Text channel required!', ephemeral: true });
                return;
            }
            channel = channel as DiscordJS.TextChannel;

            sqlite.removeChannel(channel.id);

            await interaction.reply({ content: 'Success!', ephemeral: true })
        } else {
            await interaction.reply({ content: 'You are not an admin!', ephemeral: true });
        }
    }
});

var lastid : number | undefined = undefined;
var announced: [string] = [''];
function sendAlerts() {
    let getString = "https://www.etryvoga.com/api/v1/notification?region=ALL";

    fetch(getString)
    .then(response => response.json())
    .then(json => {
        if (lastid === undefined) lastid = json[0].id;
        let skip = json[0].id - (lastid as number);
        lastid = json[0].id;

        for (let i = 0; i < skip; i++) {
            let id = json[i].id;
            let title = json[i].title as string;
            let desc = json[i].body as string;
            let date = json[i].createdAtParsed as string;
            let region = json[i].region as string;
            
            if (id in announced) continue;
            announced.push(id);

            sqlite.getChannels(function(res: any) {
                for (let channel of res) {
                    channel = channel as Map<String, String>;
                    if ((channel.region !== "ALL") && (channel.region !== region)) continue;
                    
                    let sendchannel = client.channels.cache.get(channel.channel);
                    if (sendchannel === undefined) continue;
                    sendchannel = sendchannel as DiscordJS.TextChannel;

                    let role: string = channel.role;
                    let roleString = (role === '-1') ? '@everyone' : ('<@&' + role + '>')
                    
                    const embed = new MessageEmbed()
                        .setColor('RED')
                        .setTitle(title)
                        .setDescription(desc)
                        .setFooter({text: date + " / " + region, iconURL: undefined});
                    
                    sendchannel.send({embeds: [embed], content: roleString})
                }
            });
        }
    })
}

client.on('ready', () => {
    console.log('Ready');

    setInterval(sendAlerts, 60000);
});

client.login(token);