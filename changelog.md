# Changelog Material Keys Module
### v1.2.9 - 07-06-2023
Fixes: 
<ul>
    <li>Playlist Configuration: 'Unrestricted' default playmode is an option again and playlist modes function like they should again</li>
    <li>Playlist Volume: Volume display is updated correctly again</li>
    <li>Combat Tracker HP Display: When combat hadn't started yet, the hitpoints would not display properly and throw an error</li>
    <li>(Foundry V10) Macro arguments using Advanced Macros function again</li>
</ul>

Other:
<ul>
    <li>(Foundry v11) Macro arguments are now in the core, so Advanced Macros is no longer used</li>
    <li>VisualFx: Darkness changes are now smooth transistions</li>
</ul>


### v1.2.8 - 01-09-2022
Other:
<ul>
<li>Made compatible with Foundry v10</li>
<li>Cleaned up documentation</li>
<li>Improved naming of html elements to prevent compatibility issues</li>
<li>Improved FXMaster compatibility by updating to the latest API</li>
</ul>

### v1.2.7 - 17-01-2022
Additions:
<ul>
<li>Added support for the Soundscape module on the lowest function key</li>
</ul>

Fixes:
<ul>
<li>Some settings would not initialize properly, this should now be fixed</li>
</ul>

Other:
<ul>
<li>Made compatible with Foundry v9</li>
<li>Dropped compatibility with Foundry v0.7</li>
</ul>

### v1.2.6 - 21-06-2021
Fixes:
<ul>
<li>Fix issue where soundboard wouldn't be saved if the saved settings were empty</li>
</ul>

Other:
<ul>
<li>Confirmed compatibility with Foundry 0.8.7</li>
</ul>

### v1.2.5 - 02-06-2021
Fixes:
<ul>
<li>Fixed compatibility issues with Foundry 0.8.6</li>
</ul>

Additions:
<ul>
<li>Added a 'Stop All' button to the soundboard (topleft key)</li>
<li>Added a Launchpad emulator (under Game Settings) that replaces the Soundboard and Macro cheat sheets. It can run parallel to a real Launchpad, or it can be used to use MK without hardware Launchpad. It displays additional info, such as sound/macro/playlist names</li>
<li>Added a 'Clear Page' and 'Clear All' button to the soundboard and macroboard configuration</li>
<li>Added import and export buttons to the soundboard and macroboard configuration (only imports/exports metadata, not the actual audio files or the macros)</li>
<li>The number of connection error messages you will get is now configurable in the module settings</li>
<li></li>
</ul>

Other:
<ul>
<li>Major change to the soundboard and macroboard configuration. It is now displayed as pages of 16 sounds or 32 macros each, you can browse through the pages using the arrow keys at the top.</li>
<li>The amount of sounds and macros you can have in the soundboard/macroboard has been expanded to 256 for each, giving 4 full pages/screens.</li>
</ul>


### v1.2.4 - 24-04-2021
<ul>
<li>Made compatible with Foundry 0.8.1</li>
<li>In Playlist Configuration, "Playing/Stopping Color" would not update the background color when the number was changed in the textbox</li>
</ul>


### v1.2.3 - 24-03-2021
<ul>
<li>Added a help menu that can be accessed from the module settings</li>
<li>Added option to change the play/stop color for the playlist and volume control (setting can be found in the Playlist Configuration)</li>
<li>Fixed issue where the soundboard would not load sounds from a playlist</li>
<li>Fixed issue where macro's would not execute</li>
<li>Fixed issue where Furnace arguments would not be saved in the Macro Configuration</li>
<li>HP Tracker didn't update when damage was dealt</li>
</ul>

<b>Compatible Material Server version:</b><br>
v1.0.2 (unchanged): https://github.com/CDeenen/MaterialServer/releases <br>

### v1.2.2 - 12-12-2020
<ul>
<li>Fixed issue where deleting a playlist would cause an error preventing the Soundboard Configuration to show up</li>
</ul>

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
