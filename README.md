# PickupBot for Discord & IRC

# Overview

This NodeJS Bot was design for managing Pickup games from multiple sources, such as Discord and IRC.

It was inspired by the old [Spydeee mIRC PugBot](https://github.com/spydeee/PugBot) that was used for UT99 games and it's implementing most of its features and more.

# Index
- [Setup](#Setup)
- [Commands](#Commands)
  - [Administrators](#Administrators)
  - [Pickup](#Pickup)
  - [Pickup: Statistics](#Pickup:-Statistics)
  - [Examples](#Command-Examples)
    - [Add Custom Commands](#Add-Custom-Commands)
    - [Banning](#Banning)
    - [Pickup Configurations](#Pickup-Configurations)
- [Main Packages Used](#Main-Packages-Used)
- [Troubleshooting](#Troubleshooting)

# Setup
Setting up a bot involve in the following steps
1. Create Discord Bot Application
2. Fetching bot source code.
3. Make a configuration file.
4. Buld & Run: Choosing whatever running the bot on a given machine or using Docker. 
    - Machine
        - Build
        - Run
    - Docker
        - Build
        - Run

## 1. Create Discord Bot Application

[Instructions](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)

Get application client id and token - and put it to bot configuration.

To make bot join your channel, follow this link (with corresponding client id):
https://discordapp.com/oauth2/authorize?&client_id=YOUR_CLIENT_ID_HERE&scope=bot&permissions=0

To get Discord channel id, follow these steps: https://support.discordapp.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-

Finding discord guild id (server id) is analogous. 

## 2. Fetching bot source code
If you're using git, use `git clone` command otherwise download the zip file and extract it to a choosen directory.

## 3. Configuration

Copy Basic configuration file from *conf/config_example.json* to *conf/config.json* and modify it.
At bot first initialization, it creates *conf/config_live.json* and copies some configurations (like text commands) which are configurable trough bot commands.
When bot starts it also creates *conf/persistent.json* file, which contains pickup current state.

``` js
[
	{
		"sources": {
			"discord": {
				"enabled": true,
				"token": "[APPLICATION-TOKEN]", // Discord bot application token
				"clientId": "[APPLICATION-CLIENT-ID]", // Discord bot application client id. (described below)
				"guildId": "[GUILD-ID]" // Discord guild (server) id. (described below)
			},
			"irc": {
				"enabled": true,
				"ident" : "[IRC-IDENT]", // Keep one permanent id for one bot application.
				"nickname": "[IRC-NICK]",
				"server": "[IRC-SERVER]",
				"authName" : "", // authentification user (uses AUTH command and PRIVMSG Q@CServe.quakenet.org for quakenet).
				"authPassword" : "", // IRC authentification password
				"mode" : "+x" // additional IRC mode
			}
		},

		"channels": {
			"default": { // bind 2way communication
				"channelDiscord": "[DISCORD-CHANNEL-ID]", // discord channel id
				"channelIrc": "[#IRC-CHANNEL-NAME]" // irc channel name
			}
		},

        // users and they auth levels (Discord ids, IRC auths or IRC hosts).
		"authUsers": {
			"[DISCORD-ID-OR-IRC-NICKNAME]" : 10 // e.g. discord user id, irc name
		},

        // variable formatting of cross messages.
		"format": { 
			"ircText": "[DIS] <{$displayUsername}> {$text}",
			"urlAttachment": "<{$displayUsername}> {$attachmentURL}",
			"discord": "[IRC] **<{$author}>** {$withMentions}"
	  	},

        // predefined text commands (each command must be defined as array of strings).
		"textCommands": {
		},

        // default captain picking method. Possible values: *random*, *avgpick*. [default: random]
        "captainPicking": "random",

        // default pug rejoin timeout in seconds. [default: 30]
        "rejoinTimeout": 30,

        // allow players to play multiple pugs. If set to true, one player may occurs in more filled pugs. [default: false]
        "playMultiPugs": false
	}
]
```

Note for IRC: Some networks does enforce channel names case-sensitive, so that #tHiRd and #third are consider different channels, please make sure you use the correct sensetive name.

## 4. Buld & Run
You can choose to run it on your local computer or using docker.
### Machine
Prerequiesition
* [NodeJS](https://nodejs.org/) (Tested at [v12.22.1](https://nodejs.org/dist/latest-v12.x/)) (required)
* Python 2.7.+ (required)

Steps
* Navigate to extracted directory using a Terminal (Windows `cmd`, Linux: Termianl) and run `npm install` this will installed all neccessary packages bot depends on.
* Build: `npm build`.
* Run: `npm run start`
* In linux you can, both build and run togther using: `./build_run.sh &`.

May check *logs/log.txt* for errors. If bot does not work, kill that process and run `./build_run_debug.sh` to see the verbose output.

  <a href="#troubleshoot_running_local">Troubleshoot</a>

### Docker
Place configuration as `conf/config.json`

Build: ```docker build . -t utctfpugbot```

Run:

Default config path is `conf/config.json`.<br/>
Run: ```docker run --rm --name utctfpugbot utctfpugbot```

Run + Overriding default config path (replace [PATH]):<br>```docker run --rm --name utctfpugbot -e "CONFIG_FILE=[PATH]" utctfpugbot```
# Commands
Commands are prefixed with '.' or with exclamation mark '!'. e.g. .help, !help<br>
[] = Required, <> = Optional


|  Command  |  Aliases | Description
| :-- | :-- | :--
| rules | | Show rules. Usage: rules
| rule | | Show specific rule or remind user of a specific rule. Usage rule number [user]
| mention | | Mention and highlight user. Usage: mention [playername]
| welcome | | Send welcome message to user. Usage: welcome [playername]
| discord | | List available Discord players. Usage: discord
| command | | Shows documentation. Usage: command [command]
## Administrators
|  Command  |  Aliases | Description
| :-- | :-- | :--
| authlevel | | Display your auth-level. Usage: authlevel
| addcmd | | Add text command. For channel specific commands use *channelKey::* prefix. To exclude some command use *::DELETE* as text. For new line use *::NEWLINE* inside text. Usage: addcmd command [text]
| delcmd | | Remove text command. Usage: delcmd command
| grant | | Set auth-level to some user. Use negative values to ban. Usage: grant playername authLevel
| delgrant | | Remove user from grant table. Usage: delgrant playername
| channellist | | List configured channels and display channelKey of current channel. Usage: channellist
| deltimeout | | clear nickname from timeouts. Usage: deltimeout [player]
| say | | Say message. Usage: say [message]
| addrandom | | Adds random players to pug. Usage: addrandom [pug] [playersCount] [tag]
| addcustom | | Adds custom imaginary player to pug. Usage: addrandom [pug] playername [tag]
| addhistory | | Add pug history entry. Usage: addhistory [pug] [time] [player1] [player2] [player3] ...
| userinfo | | Display nick based user info on all platforms. Usage: userinfo2 [playername]
| userinfo2 | | Display user info. Usage: userinfo [playername]
| restart | | Restart bot.
| quit | | Quit bot.
## Pickup

|  Command  |  Aliases | Permission | Description
| :-- | :-- | :-- | :--
| join | j | | Join to pug.
| tag | | | Add specific tag to your nick in pug. May use only alphanumeric characters. Usage: tag &lt;pugname> [value]
| deltag | | | Remove tag from nick. Usage: deltag &lt;pugname>
| here | | | Refresh your time information to prevent being kicked from inactivity. Usage: here
| leave | l | | Leave pug. Usage: leave &lt;pugname> [reason]
| leaveall? | lva | | Leave all pugs you joined. Usage: lva &lt;reason>
| list | l | | List all players which are joined to the pug. Usage: list &lt;pugname>
| listall | lsall | | List all pugs along all channels. Usage: listall
| vote | | | Vote for somebody to become a captain (May use only when pug is filled). Usage: vote [playername]
| unvote | | | Remove your votes. Usage: unvote
| promote | p | | Promotes actual state of the pug on channel (use !promoteall to display on all channels). Usage: promote [pugname]
| teams | | | Show teams during player picks. Usage: teams
| turn | t | | Display which captain is currently picking players. Usage: turn
| captain | | | Force yourself to become captain (May use only when pug is filled). Usage: captain [color]
| pick | p | Captain | Pick player to your team (May use only captain). Usage: pick playername|playernumber
| setcaptain | | Admin | Force someone else to become captain (May use only when pug is filled). Usage: setcaptain playername [color]
| unsetcaptain | | Admin | Unset captain on some team and roll another one. Usage: unsetcaptain color
| captainforce | | Admin | Skip waiting and force random captain choose. Usage: captainforce
| reset | | Admin | Reset pug to player picking and captain picking. Usage: reset [pugname]
| fullreset | | Admin | Reset pug to zero players. Usage: fullreset [pugname]
| rename | | Admin | Replace player in pug by someone else. Usage: rename [pug] player newPlayer
| addplayer | | Admin | Add player to pug. Usage: addplayer [pug] playername
| delplayer | | Admin | Remove player from pug. Optionally, you can specify the number of seconds after which the player cannot reconnect. Usage: delplayer [pug] playername [timeout]
| ban | | Admin | Ban user. For IRC users when using MASK the "playername" represents ban key. Usage: ban [playername|key] [reason:specified reason] [dur:ban duration in hours] [mask:irc host mask as regex]
| bandef | | Admin | Show ban definition - return ban command for possible update. Usage: bandef [playername|key]
| delban | | Admin | Delete ban. Usage: delban playername
| banlist | | Admin | Show banned users.
| deltimeout | | Admin | clear nickname from timeouts cooldowns. Usage: deltimeout [player]
| createpug | | Admin | Create pug. Usage: createpug pugName playersCount [teamsCount]
| quickpug | | Admin | Create quickpug (Non-admin players are allowed to create one quickpug). Usage: quickpug pugName playersCount [teamsCount]
| deletepug | | Admin | Delete pug (Non-admin players are allowed to delete only quickpug which they created). Usage: deletepug pugName
| limitnocapt | | Admin | Limit the number of player "nocapt" tag. Usage: limitnocapt [value].
| getpugconfig | | Admin | get pug configuration. Usage: getpugconfig [pug] [subcommand]
| setpugconfig | | Admin | set pug configurations. Usage: setpugconfig [pug] [subcommand] [value]

## Pickup: Statistics
|  Command  |  Aliases | Permission | Description
| :-- | :-- | :-- | :--
| avgpick | | | Display avg picks of players which are joined to the pug (or with specifying players - same as avgpickspec). Usage: avgpick [pug] [method] [player1-N]
| avgpickspec | | | Parametric display of avg picks of players. For method see pug configuration options. Usage: avgpick [pug] [method] [player1-N]
| last | | | Display last filled pug. Usage: last [pug] [historycount] [historyindex]
| plast | | | Shows last filled pug of specified player. Usage: plast [playername] [pug] [historycount] [historyindex]
| mylast | | | Shows last filled pug of current player. Usage: mylast [pug] [historycount] [historyindex]
| trend | | | Display daily pug trend based on the method of least squares. Usage: trend [pug]
| stats | | | Display pug statistics of specific player. Usage: oldstats [pug] playername
| mystats | | | Display your own statistics. Usage: myoldstats [pug]
| oldstats | | | Display pug statistics of specific player (from old summarized stats). Usage: oldstats [pug] playername
| myoldstats | | | Display your own statistics (from old summarized stats). Usage: myoldstats

## Command Examples

### Add Custom Commands
*addcmd*<br>
<pre>
!addcmd secondChannel::info This is pugbot!::NEWLINE Another text.
!addcmd servers Some text with servers.
!addcmd anotherChannel::servers ::DELETE
</pre>

### Banning

There are more possibilities, how to ban players. The ban command format is:

```
!ban [playername|key] [reason:specified reason] [dur:ban duration in hours] [mask:irc host mask as regex]
```

If the player does not exist, you must specify ban mask for the hostname. Otherwise, it bans specific player by ID on Discord or by AUTH on IRC. If you don't specify a duration, then the ban is permanent.
On Discord you simply ban player:

```
!ban player duration:24
!ban discord:player duration:24
!ban discord_id:123456 duration:24
```

How to obtain Discord UserId ? Follow [this link](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-)

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

### Pickup Configurations
```
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
```

# Main Packages Used

- [node-irc](https://github.com/Throne3d/node-irc)
- [discordjs](https://discord.js.org)
- [node-sqlite3](https://github.com/mapbox/node-sqlite3)

# Troubleshooting
## [Local Installation](#troubleshoot_running_local)
'python' is not recognized as an internal or external command<br>
1. Make sure python installed directory exists in PATH [Link](https://www.pythoncentral.io/add-python-to-path-python-is-not-recognized-as-an-internal-or-external-command/)

'python2.7' is not recognized as an internal or external command<br>
1. Make sure python installed directory exists in PATH [Link](https://www.pythoncentral.io/add-python-to-path-python-is-not-recognized-as-an-internal-or-external-command/)
2. Go to installed path and copy *python.exe* and paste it with new name *python2.7*.
