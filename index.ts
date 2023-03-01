import DiscordJS, { ColorResolvable, Intents, MessageActionRow, MessageButton, MessageComponentInteraction, MessageEmbed, Permissions, TextChannel } from 'discord.js';
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
            option = option.replace(/\s/g, '');

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
            console.log('Alert added in server ' + channel.guild.name + ' for region ' + option);
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
    if (commandName === 'regions') {
        let str = 'https://www.etryvoga.com/api/v1/notification/region';
        fetch(str)
        .then(response => response.json())
        .then(async json => {
            let values = Object.keys(json);
            const embed = new MessageEmbed()
                .setTitle('Available Regions / Доступні регіони')
                .setDescription(values.join(', '))
                .setColor('GREY')
                .setURL(str)
            
            await interaction.reply({embeds: [embed]})
        })
    }
    if (commandName === 'shelters') {
        const embed = new MessageEmbed()
            .setTitle('Bomb Shelters / Бомбосховища')
            .setColor('GREY')
        
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setStyle('LINK')
                    .setURL('https://github.com/Dqu1J/shelters')
                    .setLabel('🏠')
            );
        
        await interaction.reply({embeds: [embed], components: [row]});
    }
});

function sendAlerts() {
    try {
        sqlite.getChannels(function(res: any) {
            for (let channel of res) {
                channel = channel as Map<String, String>;
                let getString = "https://www.etryvoga.com/api/v1/notification?region=" + channel.region;
                let lastid = channel.last;

                fetch(getString)
                .then(response => response.json())
                .then(json => {
                    if (lastid === '-1') lastid = json[0].id;
                    let skip = json[0].id - (lastid as number);

                    for (let i = 0; i < skip; i++) {
                        if (json[i] == undefined) continue;

                        let id = json[i].id;
                        let title = json[i].title as string;
                        let desc = json[i].body as string;
                        let date = json[i].createdAtParsed as string;
                        let region = json[i].region as string;
                        let type = json[i].type as string;

                        if (id <= lastid) continue;

                        let color: ColorResolvable = 'BLURPLE';
                        if (type === 'CANCEL') {
                            color = 'GREEN';
                        } else if (type === 'SIREN') {
                            color = 'RED';
                        } else if (type === 'ARTILLERY') {
                            color = 'ORANGE';
                        }

                        let sendchannel = client.channels.cache.get(channel.channel);
                        if (sendchannel === undefined) continue;
                        sendchannel = sendchannel as DiscordJS.TextChannel;

                        let role: string = channel.role;
                        let roleString = (role === '-1') ? '@everyone' : ('<@&' + role + '>')

                        const embed = new MessageEmbed()
                            .setColor(color)
                            .setTitle(title)
                            .setDescription(desc)
                            .setFooter({text: date + " / " + region, iconURL: undefined});
                        
                        try {
                            if (sendchannel.guild.me === null) continue;
                            if (sendchannel.permissionsFor(sendchannel.guild.me).toArray().includes("SEND_MESSAGES")) {
                                sendchannel.send({embeds: [embed], content: roleString});
                            }
                        } catch (e) {
                            continue;
                        }
                    }

                    sqlite.updateLast(json[0].id, channel.channel);
                })
            }
        })
    } catch (e) {
        console.error((e as Error).message);
    }

    console.log('Announced');
}

client.on('ready', () => {
    console.log('Servers:')
    client.guilds.cache.each(guild => console.log(guild.name));
    console.log('Ready!');

    setInterval(sendAlerts, 60000);
});

client.login(token);