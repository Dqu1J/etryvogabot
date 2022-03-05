# etryvogabot
Discord bot, which sends notifications about unsafety in specific regions of Ukraine. Uses eTryvoga API

Invite to your server:
https://discord.com/api/oauth2/authorize?client_id=949447460298842153&permissions=2147617792&scope=applications.commands%20bot

All the regions available:
https://www.etryvoga.com/api/v1/notification/region
Can't display all of the regions due to Discord's limit to 25 options

### Setting up
Create a `config.json` file:
```json
{
  "token": "token",
  "clientId": "clientId"
}
```

Run ./deployCommands.ts  
Run ./setupDb.ts  
Then, run the bot: ./index.ts  
