# Discord - irc pugbot

This is PUGBOT for pickup games which processing multiple message sources (IRC, Discord) build on node.js technology. **The project is still in development**.

Bot is inspired by old mIRC script mostly used for UT99 games: https://github.com/spydeee/PugBot - it implements most of its features and more.

## Bot commands

### Player commands

* **join** - Join to pug. Usage: !join [pug]
* **tag** - Add specific tag to your nick in pug. May use only alphanumeric characters. Usage: !tag [pug] value
* **deltag** - Remove tag from nick. Usage: !deltag [pug]
* **here** - Refresh your time information to prevent being kicked from inactivity. Usage: !here
* **leave** - Leave pug. Usage: !leave [pug] [reason]
* **lva** - Leave all pugs you joined. Usage: !lva [reason]
* **list** - List all players which are joined to the pug. Usage: !list [pug]
* **listall** - List all pugs along all channels. Usage: !listall
* **vote** - Vote for somebody to become a captain (May use only when pug is filled). Usage: !vote playername
* **unvote** - Remove your votes. Usage: !unvote
* **promote** - Promotes actual state of the pug on channel (use !promoteall to display on all channels). Usage: !promote [pug]
* **rules** - Show rules. Usage: !rules
* **rule** - Show specific rule or remind user of a specific rule. Usage !rule number [user]
* **mention** - Mention and highlight user. Usage: !mention playername
* **welcome** - Send welcome message to user. Usage: !welcome playername
* **discord** - List available Discord players. Usage: !discord

### Captain commands

* **captain** - Force yourself to become captain (May use only when pug is filled). Usage: !captain [color]
* **setcaptain** - Force someone else to become captain (May use only when pug is filled). Usage: !setcaptain playername [color]
* **unsetcaptain** - Unset captain on some team and roll another one. Usage: !unsetcaptain color
* **captainforce** - Skip waiting and force random captain choose. Usage: !captainforce
* **teams** - Show teams during player picks. Usage: !teams
* **turn** - Display which captain is currently picking players. Usage: !turn
* **pick** - Pick player to your team (May use only captain). Usage: !pick playername|playernumber

### Pug reset

* **reset** - Reset pug to player picking and captain picking. Usage: !reset [pug]
* **fullreset** - Reset pug to zero players. Usage: !fullreset [pug]

### Stats

* **avgpick** - Display avg picks of players which are joined to the pug (or with specifying players - same as avgpickspec). Usage: !avgpick [pug] [method] [player1-N]
* **avgpickspec** - Parametric display of avg picks of players. For method see pug configuration options. Usage: !avgpick [pug] [method] [player1-N]
* **last** - Display last filled pug. Usage: !last [pug] [historycount] [historyindex]
* **plast** - Shows last filled pug of specified player. Usage: !plast [playername] [pug] [historycount] [historyindex]
* **mylast** - Shows last filled pug of current player. Usage: !mylast [pug] [historycount] [historyindex]
* **trend** - Display daily pug trend based on the method of least squares. Usage: !trend [pug]
* **stats** - Display pug statistics of specific player. Usage: !oldstats [pug] playername
* **mystats** - Display your own statistics. Usage: !myoldstats [pug]
* **oldstats** - Display pug statistics of specific player (from old summarized stats). Usage: !oldstats [pug] playername
* **myoldstats** - Display your own statistics (from old summarized stats). Usage: !myoldstats

### Admin commands

* **rename** - Replace player in pug by someone else. Usage: !rename [pug] player newPlayer
* **addplayer** - Add player to pug. Usage: !addplayer [pug] playername
* **delplayer** - Remove player from pug. Optionally, you can specify the number of seconds after which the player cannot reconnect. Usage: !delplayer [pug] playername [timeout]
* **ban** - Ban user. For IRC users when using MASK the "playername" represents ban key. Usage: !ban [playername|key] [reason:specified reason] [dur:ban duration in hours] [mask:irc host mask as regex]
* **bandef** - Show ban definition - return ban command for possible update. Usage: !bandef [playername|key]
* **delban** - Delete ban. Usage: !delban playername
* **banlist** - Show banned users.
* **authlevel** - Display your auth-level. Usage: !authlevel
* **grant** - Set auth-level to some user. Use negative values to ban. Usage: !grant playername authLevel
* **delgrant** - Remove user from grant table. Usage: !delgrant playername
* **grantlist** - List granted users. Usage: !grantlist
* **channellist** - List configured channels and display channelKey of current channel. Usage: !channellist
* **deltimeout** - clear nickname from timeouts. Usage: !deltimeout [player]
* **say** - Say message. Usage: !say [message]
* **command** - Shows documentation. Usage: !command [command]

### Pugs configuration

* **createpug** - Create pug. Usage: !createpug pugName playersCount [teamsCount]
* **quickpug** - Create quickpug (Non-admin players are allowed to create one quickpug). Usage: !quickpug pugName playersCount [teamsCount]
* **deletepug** - Delete pug (Non-admin players are allowed to delete only quickpug which they created). Usage: !deletepug pugName
* **limitnocapt** - Limit the number of player "nocapt" tag. Usage: !limitnocapt [value].
* **getpugconfig** - get pug configuration. Usage: !getpugconfig [pug] [subcommand]
* **setpugconfig** - set pug configurations. Usage: !setpugconfig [pug] [subcommand] [value]

<pre>
    // Show pug configuration
    !getpugconfig ctf
    
    // Player rejoin cooldown in seconds
    !setpugconfig ctf plcooldown 60
    
    // Captain idle cooldown in seconds
    !setpugconfig ctf cptcooldown 300
    
    // Captain idle in seconds
    !setpugconfig ctf cptidle 180
    
    // Number of possible captain votes
    !setpugconfig ctf votes 1
    
    // Set maximum possible number of nocapt players
    !setpugconfig ctf limitnocapttag 5
    
    // Player picking strategy (numbers of picked players alternating by teams)
    !setpugconfig ctf picksteps 1,2,2
    
    // Avg pick statistic method. Possible: 
    // pastdays30 - from picks of past days
    // pastpicks30 - from time-independent number of past picks
    // unlimited - from unlimited stats
    // sumarize - from global summarized stats (old stats)
    !setpugconfig ctf avgpickmth pastdays30
</pre>

### Bot configuration

* **addcmd** - Add text command. For channel specific commands use *channelKey::* prefix. To exclude some command use *::DELETE* as text. For new line use *::NEWLINE* inside text. Usage: !addcmd command [text]

<pre>
    !addcmd secondChannel::info This is pugbot!::NEWLINE Another text.
    !addcmd servers Some text with servers.
    !addcmd anotherChannel::servers ::DELETE
</pre>

* **delcmd** - Remove text command. Usage: !delcmd command

### Debug + development

* **addrandom** - Adds random players to pug. Usage: !addrandom [pug] [playersCount] [tag]
* **addcustom** - Adds custom imaginary player to pug. Usage: !addrandom [pug] playername [tag]
* **addhistory** - Add pug history entry. Usage: !addhistory [pug] [time] [player1] [player2] [player3] ...
* **userinfo** - Display nick based user info on all platforms. Usage: !userinfo2 [playername]
* **userinfo2** - Display user info. Usage: !userinfo [playername]
* **quit** - Quit bot.
* **restart** - Restart bot.

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

(If you want to specify user by discord_id you must enable some extended developer flag in discord settings to see "Copy ID" under each player or channel)

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

## Configuration

Basic configuration entries are specified in **config.json** in [json format](https://www.json.org/). When the bot starts, it creates **config_live.json** and copies some configurations (like text commands) which are configurable trough bot commands.

The sample configuration is in **config_sample.json** - just copy and modify:

* **ident** - bot identification. Keep one permanent id for one bot application.
* **nickname** - bot nickname on IRC.
* **server** - IRC server.
* **discordToken** - Discord bot application token (described below).
* **discordClientId** - Discord bot application client id (described below).
* **discordGuildId** - Discord guild (server) id (described below)
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

Note: irc channels become case-insensitive now - #tHiRd and #third are the same for message input. But the bot joins the channels as is typed in configuration.

* **channelDiscord** - bot channel id (described below) *(old configuration)*
* **channelIrc** - channel on IRC. *(old configuration)*
* **discordDisable** - set true to disable bot on Discord.
* **ircDisable** - set true to disable bot on IRC (one message source must remain enabled).
* **ircAuthName** - IRC authentification user (uses AUTH command and PRIVMSG Q@CServe.quakenet.org for quakenet).
* **ircAuthPassword** - IRC authentification password.
* **ircMode** - additional IRC mode.
* **ircFloodDelay** - minimum delay between two messages sent to irc (in msecs).
* **ircAuthUsersOnly** - allow specific actions to authed users only like .join (discord id or irc auth).
* **captainPicking** - default captain picking method. Possible values: *random* (default - captain is picked randomly), *avgpick* (prefered players with higher pick rating)
* **rejoinTimeout** - default pug rejoin timeout in seconds.
* **playMultiPugs** - allow players to play multiple pugs (default false). If set to true, one player may occurs in more filled pugs.
* **format** - variable formatting of cross messages.
* **textCommands** - predefined text commands (each command must be defined as array of strings).
* **authUsers** - users and they auth levels (Discord ids, IRC auths or IRC hosts).

When bot starts it also creates **persistent.json** file, which contains current state.

## Running

### Local
Prerequestion:
- Python 2.7.+ (required)
- [NodeJS](https://nodejs.org/) (Tested at [v12.22.1](https://nodejs.org/dist/latest-v12.x/)) (required)

Follow these steps:

* fetch this git branch to some directory
* enter that directory
* run: `npm update`
* set the configuration configuration (described above)
* run: `npm install`
* run: `./build_run.sh &`

May check *log.txt* for errors. If bot does not work, kill that process and run `./build_run_debug.sh` to see the verbose output.

#### <a href="#troubleshoot_running_local">Troubleshoot</a> ####

### Docker
Place configuration as `conf/config.json`

Build: ```docker build . -t utctfpugbot```

Running:

Default config path is `conf/config.json`.<br/>
Run: ```docker run --rm --name utctfpugbot utctfpugbot```

Run + Overriding default config path (replace [PATH]):<br>```docker run --rm --name utctfpugbot -e "CONFIG_FILE=[PATH]" utctfpugbot```

## Setting up Discord bot

Follow these instructions: https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token

Get application client id and token - and put it to bot configuration.

To make bot join your channel, follow this link (with corresponding client id):
https://discordapp.com/oauth2/authorize?&client_id=YOUR_CLIENT_ID_HERE&scope=bot&permissions=0

To get Discord channel id, follow these steps: https://support.discordapp.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-

Finding discord guild id (server id) is analogous.  


## Other sources:

* https://github.com/reactiflux/discord-irc
* https://github.com/Throne3d/node-irc
* https://discord.js.org
* https://github.com/mapbox/node-sqlite3

Old checklist: https://docs.google.com/spreadsheets/d/1gFSOZTbp-CDpXWbB0Q8C0KRc4r8U7y-Uo8QLNMQh6OI/edit?usp=sharing

## Troubleshooting
### [Local Installation](#troubleshoot_running_local)
'python' is not recognized as an internal or external command<br>
1. Make sure python installed directory exists in PATH [Link](https://www.pythoncentral.io/add-python-to-path-python-is-not-recognized-as-an-internal-or-external-command/)

'python2.7' is not recognized as an internal or external command<br>
1. Make sure python installed directory exists in PATH [Link](https://www.pythoncentral.io/add-python-to-path-python-is-not-recognized-as-an-internal-or-external-command/)
2. Go to installed path and copy *python.exe* and paste it with new name *python2.7*.
