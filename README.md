# Discord - irc pugbot

This is PUGBOT for pickup games which processing multiple message sources (IRC, Discord) build on node.js technology. **The project is still in development**.

Bot is inspired by old mIRC script mostly used for UT99 games: https://github.com/spydeee/PugBot - it implements most of its features and more.

Other sources:

* https://github.com/reactiflux/discord-irc
* https://github.com/Throne3d/node-irc
* https://discord.js.org
* https://github.com/mapbox/node-sqlite3

Checklist: https://docs.google.com/spreadsheets/d/1gFSOZTbp-CDpXWbB0Q8C0KRc4r8U7y-Uo8QLNMQh6OI/edit?usp=sharing

## Bot commands

* **help** - Shows help information. Usage: !help [command]
* **join** - Join to pug. Usage: !join [pug]
* **addplayer** - Add player to pug. Usage: !addplayer [pug] playername
* **delplayer** - Remove player from pug. Usage: !delplayer [pug] playername
* **rename** - Replace player in pug by someone else. Usage: !rename [pug] player newPlayer
* **addrandom** - Adds random players to pug. Usage: !addrandom [pug] [playersCount] [tag]
* **addcustom** - Adds custom imaginary player to pug. Usage: !addrandom [pug] playername [tag]
* **leave** - Leave pug. Usage: !leave [pug] [reason]
* **lva** - Leave all pugs you joined. Usage: !lva [reason]
* **list** - List all players which are joined to the pug. Usage: !list [pug]
* **listall** - List all pugs along all channels. Usage: !listall
* **tag** - Add specific tag to your nick in pug. May use only alphanumeric characters. Usage: !tag [pug] value
* **deltag** - Remove tag from nick. Usage: !deltag [pug]
* **here** - Refresh your time information to prevent being kicked from inactivity. Usage: !here
* **welcome** - Send welcome message to user. Usage: !welcome playername
* **captain** - Force yourself to become captain (May use only when pug is filled). Usage: !captain
* **setcaptain** - Force someone else to become captain (May use only when pug is filled). Usage: !setcaptain playername [color]
* **unsetcaptain** - Unset captain on some team and roll another one. Usage: !unsetcaptain color
* **teams** - Show teams during player picks. Usage: !teams
* **vote** - Vote for somebody to become a captain (May use only when pug is filled). Usage: !vote playername
* **unvote** - Remove your votes. Usage: !unvote
* **captainforce** - Skip waiting and force random captain choose. Usage: !captainforce
* **turn** - Display which captain is currently picking players. Usage: !turn
* **pick** - Pick player to your team (May use only captain). Usage: !pick playername|playernumber
* **promote** - Promotes actual state of the pug on channel (use !promoteall to display on all channels). Usage: !promote [pug]
* **last** - Display last filled pug. Usage: !last [historycount]
* **reset** - Reset pug to player picking and captain picking. Usage: !reset [pug]
* **fullreset** - Reset pug to zero players. Usage: !fullreset [pug]
* **addhistory** - Add pug history entry. Usage: !addhistory [pug] [time] [player1] [player2] [player3] ...
* **createpug** - Create pug. Usage: !createpug pugName playersCount [teamsCount]
* **quickpug** - Create quickpug (Non-admin players are allowed to create one quickpug). Usage: !quickpug pugName playersCount [teamsCount]
* **deletepug** - Delete pug (Non-admin players are allowed to delete only quickpug which they created). Usage: !deletepug pugName
* **ban** - Ban user. For IRC users when using MASK the "playername" represents ban key. Usage: !ban [playername|key] [reason:specified reason] [dur:ban duration in hours] [mask:irc host mask as regex]
* **bandef** - Show ban definition - return ban command for possible update. Usage: !bandef [playername|key]
* **delban** - Delete ban. Usage: !delban playername
* **banlist** - Show banned users.
* **discord** - List available Discord players. Usage: !discord
* **mention** - Mention and highlight user. Usage: !mention playername
* **rules** - Show rules. Usage: !rules
* **rule** - Show specific rule. Usage !rule number
* **stats** - Display pug statistics of specific player. Usage: !stats [pug] playername
* **mystats** - Display your own statistics. Usage: !mystats
* **userinfo** - Display user info. Usage: !userinfo playername
* **authlevel** - Display your auth-level. Usage: !authlevel
* **grant** - Set auth-level to some user. Use negative values to ban. Usage: !grant playername authLevel
* **delgrant** - Remove user from grant table. Usage: !delgrant playername
* **grantlist** - List granted users. Usage: !grantlist
* **channellist** - List configured channels and display channelKey of current channel. Usage: !channellist
* **addcmd** - Add text command. For channel specific commands use *channelKey::* prefix. To exclude some command use *::DELETE* as text. For new line use *::NEWLINE* inside text. Usage: !addcmd command [text]

<pre>
    !addcmd secondChannel::info This is pugbot!::NEWLINE Another text.
    !addcmd servers Some text with servers.
    !addcmd anotherChannel::servers ::DELETE
</pre>

* **delcmd** - Remove text command. Usage: !delcmd command
* **say** - Say message. Usage: !say [message]
* **quit** - Quit bot.
* **restart** - Restart bot.
            
## Configuration

Basic configuration entries are specified in **config.json** in [json format](https://www.json.org/). When the bot starts, it creates **config_live.json** and copies some configurations (like text commands) which are configurable trough bot commands.

The sample configuration is in **config_sample.json** - just copy and modify:

* **ident** - bot identification. Keep one permanent id for one bot application.
* **nickname** - bot nickname on IRC.
* **server** - IRC server.
* **discordToken** - Discord bot application token (described below).
* **discordClientId** - Discord bot application client id (described below).
* **channels** - Set of channel configuration where the bot is present. One of *channelDiscord* or *channelIrc* or both must be set per each key. Example:

<pre>
channels: {
    'default' : {
        'channelDiscord' : '123456',
        'channelIrc' : '#first'
    },
    'second' : {
        'channelDiscord' : '778899',
        'channelIrc' : '#second'
    },
    'another' : {
        'channelIrc' : '#third'
    }
}
</pre>

* **channelDiscord** - bot channel id (described below) *(old configuration)*
* **channelIrc** - channel on IRC. *(old configuration)*
* **discordDisable** - set true to disable bot on Discord.
* **ircDisable** - set true to disable bot on IRC (one message source must remain enabled).
* **ircAuthName** - IRC authentification user (uses AUTH command and PRIVMSG Q@CServe.quakenet.org for quakenet).
* **ircAuthPassword** - IRC authentification password.
* **ircMode** - additional IRC mode.
* **ircFloodDelay** - minimum delay between two messages sent to irc (in msecs).
* **ircAuthUsersOnly** - allow specific actions to authed users only like .join (discord id or irc auth).
* **format** - variable formatting of cross messages.
* **textCommands** - predefined text commands (each command must be defined as array of strings).
* **authUsers** - users and they auth levels (Discord ids, IRC auths or IRC hosts).

When bot starts it also creates **persistent.json** file, which contains current state.

## Installation

The bot requires [nodejs](https://nodejs.org/) of version at least v6.14.

Follow these steps:


* fetch this git branch to some directory
* enter that directory
* run **npm update**
* set the configuration configuration (described above)
* run **./build_run.sh &**

May check **log.txt** for errors. If bot does not work, kill that process and run **./build_run_debug.sh** to see the verbose output.

## Setting up Discord bot

Follow these instructions: https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token

Get application client id and token - and put it to bot configuration.

To make bot join your channel, follow this link (with corresponding client id):
https://discordapp.com/oauth2/authorize?&client_id=YOUR_CLIENT_ID_HERE&scope=bot&permissions=0

To get Discord channel id, follow these steps: https://support.discordapp.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-

## How to BAN users

There are more possibilities, how to ban players. The ban command format is:

```
!ban [playername|key] [reason:specified reason] [dur:ban duration in hours] [mask:irc host mask as regex]
```

If the player does not exist, you must specify ban mask for the hostname. Otherwise, it bans specific player by ID on Discord or by AUTH on IRC. If you don't specify a duration, then the ban is permanent.

### BAN examples:

On Discord you simply ban player:

```
!ban player duration:24
!ban discord:player duration:24
!ban discord_id:123456 duration:24
```

On IRC you may ban specific player - but the player **must** be online and **authed**:

```
!ban irc_player
```

Otherwise, you must specify regexp masks (make sure you have correctly escaped mask):

```
!ban some_player duration:24 mask:player\.users.*
```

Or specify more masks:

```
!ban some_player duration:24 reason:denied mask:player\.users.* mask:smt\.net\.dk.*
```

When you want update ban, type !bandef command:

```
!bandef some_player
```

It shows ban command with all parameters to further updates.