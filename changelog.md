# Changelog Material Keys Module
### v1.2.2 - 12-12-2020
<ul>
<li>Fixed issue where deleting a playlist would cause an error preventing the Soundboard Configuration to show up</li>
<li>Confirmed Foundry 0.7.8 compatibility</li>
</li>

### v1.2.1 - 04-12-2020
<ul>
<li>Fixed issue where soundboard sounds would not play for players if a sound was picked using the file picker</li>
<li>In soundboard and macroboard configuration, color fields now have a background color that represents the color on the Launchpad</li>
<li>Soundboard and Macro Cheat Sheets added in the Game Settings tab. Cheat sheet shows an 8x8 grid with the name of the sound/macro and the background color. Sounds/macros can be activated from the cheat sheet, even if the module is disabled in the module settings (so it can be used without a Launchpad connected)</li>
</ul>

### v1.2.0 - 02-12-2020
<ul>
<li>Fixed some issues with saving the soundboard config</li>
<li>In the soundboard config screen, added option to select a playlist for each sound individually</li>
<li>In the soundboard config screen, added option to pick a sound using the file picker, including support for wildcard names</li>
<li>All changes made to the configuration screens are now immediately saved</li>
<li>Removed save button from configuration screens because they have become redundant</li>
<li>Added a 'clear all' button to macro config and soundboard config screens</li>
</li>

<b>Note:</b> Due to these changes, you might have to reconfigure (parts of) the playlist, soundboard and macro board configurations. I'm sorry about that.

### v1.1.1 - 26-11-2020
<ul>
<li>Fixed issue where new soundboard sound wouldn't save</li>
</li>

### v1.1.0 - 17-11-2020
<ul>
<li>Massive code cleanup</li>
<li>Confirmed Foundry 0.7.7 support</li>
<li>Fixed manifest link issue where Foundry wouldn't detect new updates</li>
<li>Moved colorchanger code from server to module</li>
</ul>

<b>Note 1:</b>You need to uninstall and reinstall this module for the update to work<br>
<b>Note 2:</b>You need to use a new server app: https://github.com/CDeenen/MaterialServer/releases

### v1.0.1 - 27-10-2020
Fixes:
<ul>
<li>Fixed issue where LED would not be set properly when a playlist was playing</li>
</ul>
Additions:
<ul>
<li>'Playlist control' and 'playlist volume control' can now control up to 32 tracks per playlist</li>
<li>Added method to see what page the user is on when using 'Playlist control', 'playlist volume control' and 'token health tracker'</li>
<li>Added support for new FXmaster weather effects ('Snowstorm' and 'Rain without splash')</li>
</ul>

### v1.0.0 - 21-10-2020
Initial release
