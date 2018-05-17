# Discord - irc pugbot

This is PUGBOT for pickup games which processing multiple message sources (irc, discord) build on node.js technology. **Project is still in development**.

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
* **tag** - Add specific tag to your nick in pug. May use only alphanumeric characters. Usage: !tag [pug] value
* **deltag** - Remove tag from nick. Usage: !deltag [pug]
* **here** - Refresh your time information to prevent being kicked from inactivity. Usage: !here
* **captain** - Force yourself to become captain (May use only when pug is filled). Usage: !captain
* **setcaptain** - Force someone else to become captain (May use only when pug is filled). Usage: !setcaptain playername
* **teams** - Show teams during player picks. Usage: !teams
* **vote** - Vote for somebody to become a captain (May use only when pug is filled). Usage: !vote playername
* **captainforce** Skip waiting and force random captain choose. Usage: !captainforce
* **turn** - Display which captain is currently picking players. Usage: !turn
* **pick** - Pick player to your team (May use only captain). Usage: !pick playername|playernumber
* **last** - Display last filled pug. Usage: !last [historycount]
* **reset** - Reset pug to player picking and captain picking. Usage: !reset [pug]
* **fullreset** - Reset pug to zero players. Usage: !fullreset [pug]
* **addhistory** - Add pug history entry. Usage: !addhistory [pug] [time] [player1] [player2] [player3] ...
* **createpug** - Create pug. Usage: !createpug pugName playersCount [teamsCount]
* **quickpug** - Create quickpug (Non-admin players are allowed to create one quickpug). Usage: !quickpug pugName playersCount [teamsCount]
* **deletepug** - Delete pug (Non-admin players are allowed to delete only quickpug which they created). Usage: !deletepug pugName
* **ban** - Ban user. Usage: !ban playername [hours]
* **delban** - Delete ban. Usage: !delban playername
* **banlist** - Show banned users.
* **rules** - Show rules,
* **stats** - Display pug statistics of specific player. Usage: !stats [pug] playername
* **mystats** - Display your own statistics. Usage: !mystats
* **userinfo** - Display user info. Usage: !userinfo playername
* **authlevel** - Display your auth-level. Usage: !authlevel
* **grant** - Set auth-level to some user. Use negative values to ban. Usage: !grant playername authLevel
* **delgrant** - Remove user from grant table. Usage: !delgrant playername
* **addcmd** - Add text command. Usage: !addcmd [command] [text]
* **delcmd** - Remove text command. Usage: !delcmd [command]
* **say** - Say message. Usage: !say [message]
* **quit** - Quit bot.
* **restart** - Restart bot.
            
