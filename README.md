# Material Keys
Material Keys is a <a href="https://foundryvtt.com/">Foundry VTT</a> module that allows you to control various features of Foundry using a Novation Launchpad Mk3. The Launchpad is a MIDI controller, that has 80 physical keys, each with an RGB LED.<br>
<br>
Material Keys currently has 7 different functions:<br>
<ul>
<li><a href="https://github.com/CDeenen/MaterialKeys#audio-effects-soundboard">Audio Effects Soundboard</a></li>
<li><a href="https://github.com/CDeenen/MaterialKeys#playlist-control">Playlist Control</a></li>
<li><a href="https://github.com/CDeenen/MaterialKeys#playlist-volume-control">Playlist Volume Control</a></li>
<li><a href="https://github.com/CDeenen/MaterialKeys#visual-effects-control">Visual Effects Control</a></li>
<li><a href="https://github.com/CDeenen/MaterialKeys#combat-tracker">Combat Tracker</a></li>
<li><a href="https://github.com/CDeenen/MaterialKeys#token-health-tracker">Token Health Tracker</a></li>
<li><a href="https://github.com/CDeenen/MaterialKeys#macro-board">Macro Board</a></li>
</ul>
Each of these functions are discussed in detail below.

# Using the Module
Besides the Material Keys module and the Launchpad, you will also need to use a companion app, called MIDI Bridge. MIDI Bridge is a simple app that will bridge the communication between the Launchpad and Foundry, since Foundry does not support USB devices natively. The app can be downloaded <a href="https://github.com/CDeenen/MaterialKeys/releases">here</a>.<br>
Connection between the app and both Foundry and the Launchpad should be automatic, if not, you can find more details <a href="https://github.com/CDeenen/MaterialKeys/blob/main/App/README.md">here</a>.<br>
<br>
The module needs to be enabled, and the correct MIDI bridge address must be set for the module to work. Please see the section on the <a href=" ">module settings</a> below.<br>
<br>
3 different key types can be found on the Launchpad:
<ul>
<li><b>Function keys: </b>The 8 vertical keys on the right, the function of these keys is to change between the various Material Keys functions</li>
<li><b>Control keys: </b>The 8 horizontal keys on the top, the function of which will change depending on the selected function</li>
<li><b>Main keys: </b>The other 64 keys that form the majority of keys</li>
</ul>

<img src="https://github.com/CDeenen/MaterialKeys/blob/master/Module/img/Keys.png" width="500">

## Audio Effects Soundboard
Using the Audio Effects Soundboard, you can easily play audio tracks.<br>
You could, for example, set up some keys to play battle effects, such as clashing swords, arrow hits, or explosions. Another thing you could do is to create an atmosphere, by setting some keys to play, for example, weather sounds.<br>
You can enter the Audio Effects Soundboard by pressing the first Function key from the top.<br>
Once you've set up the soundboard, pressing a key will play the pre-set sound and change the LED to indicate the sound is playing. Pressing the key again will stop the sound.<br>

### Soundboard Configuration
The Audio Effects Soundboard is set-up in the Soundboard Configuration screen, which can be found in the module settings.<br>
In the top right, you set the playlist from which you will select the sounds. Once you've done that you can edit each individual key. The rest of the Soundboard Configuration screen is divided into 64 boxes, each representing a key, ordered as you find them on the Launchpad (For example, Sound 81 corresponds with the top left key).<br>
<ul>
<li><b>Sound:</b> Using the drop-down menu you can select the desired sound from the previously selected playlist</li>
<li><b>Toggle:</b> This determines what should be done once a sound is activated. You can either change the LED color ('Color'), cause the LED to blink on and off ('Blink'), or cause the LED to fade on and off ('Fade'). Once the sound has finished playing, the LED will automatically switch to the off mode</li>
<li><b>On:</b> This sets the color when the chosen sound is playing, and 'Toggle' is set to 'Color'. See below for information on what the color number represents</li>
<li><b>Off:</b> This sets the color when the chosen sound is not playing. See below for information on what the color number represents</li>
<li><b>Playback:</b> Sets the playback mode. The sound can either play once ('Once'), be played on repeat ('Repeat'), or only be played as long as the key is pressed ('Hold')</li>
<li><b>Volume:</b> Sets the playback volume. This volume is relative to the 'Interface' volume</li>
</ul>

<img src="https://github.com/CDeenen/MaterialKeys/blob/master/Module/img/SoundboardConfiguration.png" width="500">

The LED color is represented by a number. This number corresponds with a factory programmed color, as can be seen in the image below. Besides filling in a number, you could also press the palette button next to the number field, which allows the Launchpad to display all the available colors. There are 2 groups of 64 colors, and by pressing the fading green function key (rightmost key), you can switch between the groups. The currently selected color will be fading, and pressing a key will send the color of that key to the Soundboard Configuration screen.<br>
An empty color field will be interpreted as a 0, which means that the LED will be off.

<img src="https://github.com/CDeenen/MaterialKeys/blob/master/Module/img/FactoryColors.png" width="1000">

## Playlist Control
The playlist control screen gives easy control over up to 8 playlists. For each of these playlists, up to 8 tracks can be directly controlled.<br>
For each of these tracks and playlists, you have an indicator showing that the track is playing and you can stop or play tracks or playlists.<br>
You can enter the playlist control by pressing the second function key from the top.<br>
<br>
The screen is divided into 8 columns, where each column represents a playlist. The control (uppermost) key indicates and controls the playlist. If that playlist is playing, the LED will turn green, if that playlist is not playing, it will turn red. Pressing the key when the playlist is not playing will start the playlist, pressing the key when the playlist is playing will stop it. The same functionality can be found in the other 8 keys in the column. These 8 keys represent the first 8 tracks in the playlist (first track is at the top).

<img src="https://github.com/CDeenen/MaterialKeys/blob/master/Module/img/PlaylistControl.jpg" width="500">

### Playlist Configuration
The playlist control can be configured in the playlist configuration screen, which can be found in the module settings.<br>
<br>
<b>Play Method:</b> The play method determines what to do when a track is playing, while another track is requested. By setting it to 'Unrestricted', you can play as many tracks at the same time as you want. Setting it to 'One track per playlist' will automatically stop all playing tracks in the playlist, ensuring that only one track is playing at a time. Setting 'Play Method' to 'One track in total' will limit playback to only one track in total.<br>
<b>Note:</b> This play method only applies if tracks are started using the Launchpad, you can still play more tracks using Foundry's internal audio player.<br>
<br>
<b>Playlists:</b> Here you can select which playlists correspond to which column in the Playlist Control screen.

<img src="https://github.com/CDeenen/MaterialKeys/blob/master/Module/img/PlaylistConfiguration.png" width="500">

### Playlist Volume Control
The playlist volulme control screen gives control over the volume of the tracks that have been set up in the Playlist Control.<br>
You can enter the playlist volume control by pressing the third function key from the top.<br>
<br>
The 8 control keys in the top represent the 8 playlists from the playlist control screen. The fading LED indicates which playlist you are currently controlling, and selecting a different control key will switch the control to the corresponding playlist.<br>
The main keys are again divided into 8 columns, but here each column represents a track, which correspond to the first 8 tracks in the playlist. The amount of LEDs that are on represents the volume of the track. Pressing any of the keys sets the volume to that level. If a playlist and/or track is playing, the corresponding LEDs will turn green.

<img src="https://github.com/CDeenen/MaterialKeys/blob/master/Module/img/VolumeControl.jpg" width="500">

## Visual Effects Control
The visual effects control screen gives you control over certain visual effects. For most of these effects, the <a href="https://foundryvtt.com/packages/fxmaster/">FXMaster</a> module is required. The visual effects control has 2 tabs.<br>
You can enter the visual effects control by pressing the fourth function key from the top. Furthermore, you can switch between the two tabs by pressing that key again, changing the color from green (tab 1) to red (tab 2).<br>
<br>

### Tab 1
There are 3 sections on this tab, separated by empty keys.<br>
<b>Darkness:</b> On the left, there is a column of greyscale keys. These keys change the darkness level of the current scene, with the brightness of the keys corresponding to the darkness level.<br>
<b>Color overlay:</b> (FXMaster required) The second section, containing a column of colored keys, creates an overlay of that color. So, pressing the green key gives the scene a green overlay.<br>
<b>Extended color overlay:</b> (FXMaster required) The third section, containing 3 columns of red, green and blue keys, give further control over these colored overlays. Pressing the main keys in this section set the amount of red, green or blue in the overlay, by pressing the correspondingly colored keys. The 3 control (topmost) keys display this color, and pressing one of those keys clears the overlay.

<img src="https://github.com/CDeenen/MaterialKeys/blob/master/Module/img/VisualFx1.jpg" width="500">

### Tab 2
Tab 2 contains 2 sections, both requiring FXMaster:<br>
<b>Weather effects:</b> The keys on the left control the FXMaster weather effects. The keys are colored in a way to approximate the weather effect, for example blue for rain, or grey for fog. You can switch on as many of the effects as you like, where fading keys indicate that that effects is on. Pressing one of the red keys in the bottom disables all weather effects.<br>
<b>Filters:</b> To the right of the weather effects, there are 4 buttons. They control the FXMaster filters. From the top to the bottom: Underwater Filter, Predator Filter, Old Film Filter and Bloom Filter. Filters that are on are indicated by a fading key. The red key at the bottom disables all filters.

<img src="https://github.com/CDeenen/MaterialKeys/blob/master/Module/img/VisualFx2.jpg" width="500">

## Combat Tracker
The combat tracker screen gives a rough indication of the initiative order, and it can be used to start or stop the combat and go to the next or previous turn.<br>
You can enter the combat tracker screen by pressing the fifth function key from the top.<br>
<br>
The combat tracker can be divided into 2 parts:

### Initiative Tracker
The top part gives the initative tracker. If there are tokens in Foundry's combat tracker, these will be displayed on the top rows. The color can be green, yellow or red, indicating a friendly, neutral or hostile token, respectively. Alternatively it can be white, which means that the token has been defeated. Pressing one of these buttons will pan the screen to that token, and select the token. Once combat has started, a fading LED will indicate whose turn it is. If more than 8 tokens are in the combat tracker, they will fill up the rows below. A total of 32 tokens can be displayed.

### Controls
The bottom part gives 3 control buttons: start/stop combat, previous turn, next turn.<br>
If no tokens are in Foundry's combat tracker, all buttons will fade, indicating that they are inactive.<br>
One one or more tokens are in the combat tracker, the start/stop button will stop fading, indicating that it can be pressed to start the combat.<br>
Once combat has started, all buttons stop fading, and the color of the buttons change. The start/stop button now turns red to indicate that it is now the stop combat button, and the next/previous buttons turn green.

<img src="https://github.com/CDeenen/MaterialKeys/blob/master/Module/img/CombatTracker.jpg" width="500">

## Token Health Tracker
The token health screen gives a rough indication of the relative health of each token in the combat tracker.<br>
You can enter the token health screen by pressing the 6th function button from the top.<br>
<br>
Each column, including the control keys, correspond with a token in the combat tracker. They are horizontally ordered by initiative, and colored to indicate hostility, just like the combat tracker. The amount of LEDs that are on, represent the relative health of the token, so an empty bar means the token has 0 health, while a full bar means the token has full health. A blinking column indicates whose turn it is.<br>
If there are more than 8 tokens in the initiative tracker, you can press the same function key again to go to the next 8 tokens, which changes the color of the function key to indicate this, going from green, to blue, to purple, to yellow. A total of 32 tokens can be displayed.

<img src="https://github.com/CDeenen/MaterialKeys/blob/master/Module/img/HPTracker.jpg" width="500">

## Macro Board
The macro board allows you to run macro's. You can use chat or script macro's, and when you have <a href="https://foundryvtt.com/packages/furnace/">The Furnace</a> installed, you can use advanced macro's with arguments.<br>
You can enter the Macro Board by pressing the 7th function button from the top.<br>
Once you've set up the macro board, pressing a key will run the pre-set macro.<br>

### Macro Board Configuration
The macro board configuration is similar to the audio effects soundboard. You can access it from the module settings screen, by pressing the Macro Configuration button.<br>
The Macro Configuration screen is divided into 64 boxes, each representing a key, ordered as you find them on the Launchpad (For example, Sound 81 corresponds with the top left key).<br>
<ul>
<li><b>Macro:</b> Using the drop-down menu you can select the desired macro</li>
<li><b>Furnace Arguments:</b> (The Furnace required) Here you can enter arguments for Furnace macro's. Normally, to run a Furnace macro, you'd call "/my-macro-name argument1 argument2 argument3", in this box, you only have to enter "argument1 argument2 argument3". Please refer to the Furnace documentation for more info on using Furnace macro's.</li>
<li><b>Color:</b> This sets the color of the corresponding macro key. See below for information on what the color number represents</li>
</ul>

<img src="https://github.com/CDeenen/MaterialKeys/blob/master/Module/img/MacroConfiguration.png" width="500">

The LED color is represented by a number. This number corresponds with a factory programmed color, as can be seen in the image below. Besides filling in a number, you could also press the palette button next to the number field, which allows the Launchpad to display all the available colors. There are 2 groups of 64 colors, and by pressing the fading green function key (rightmost key), you can switch between the groups. The currently selected color will be fading, and pressing a key will send the color of that key to the Soundboard Configuration screen.<br>
An empty color field will be interpreted as a 0, which means that the LED will be off.

<img src="https://github.com/CDeenen/MaterialKeys/blob/master/Module/img/FactoryColors.png" width="1000">

# Module Settings
In the module settings screen, you can find some settings, and 3 buttons:<br>
<ul>
<li><b>Playlist Configuration: </b>Enter the playlist configuration screen</li>
<li><b>Soundboard Configuration: </b>Enter the soundboard configuration screen</li>
<li><b>Macro Configuration: </b>Enter the macro configuration screen</li>
</ul>
Below those buttons, you will find the following settings:<br>
<ul>
<li><b>Enable Module:</b> Enables the module</li>
<li><b>Brightness:</b> Sets the LED brightness of the Launchpad</li>
<li><b>MIDI Bridge Address:</b> Sets the IP address of the MIDI bridge, see below</li>
</ul>

<img src="https://github.com/CDeenen/MaterialKeys/blob/master/Module/img/ModuleSettings.png" width="500">

### MIDI Bridge Address
You need to fill in the IP address of the companion app. When running this app from the same computer as the Foundry client, you should be able to get away with using:<br>
localhost:3001<br>
Otherwise, fill in the IP address that the MIDI Bridge app outputs when it starts up.<br>
More details on the app can be found <a href="https://github.com/CDeenen/MaterialKeys/blob/main/App/README.md">here</a>.

# Software Versions & Module Incompatibilities
<b>Foundry VTT:</b> Tested on 0.6.6 & 0.7.4<br>
<b>Module Incompatibilities:</b> None known.<br>

# Feedback
If you have any suggestions or bugs to report, feel free to contact me on Discord (Cris#6864), or send me an email: cdeenen@outlook.com.

# Credits
<b>Author:</b> Cristian Deenen (Cris#6864 on Discord)<br>

# Abandonment
Abandoned modules are a (potential) problem for Foundry, because users and/or other modules might rely on abandoned modules, which might break in future Foundry updates.<br>
I consider this module abandoned if all of the below cases apply:
<ul>
  <li>This module/github page has not received any updates in at least 3 months</li>
  <li>I have not posted anything on "the Foundry" and "the League of Extraordinary Foundry VTT Developers" Discord servers in at least 3 months</li>
  <li>I have not responded to emails or PMs on Discord in at least 1 month</li>
  <li>I have not announced a temporary break from development, unless the announced end date of this break has been passed by at least 3 months</li>
</ul>
If the above cases apply (as judged by the "League of Extraordinary Foundry VTT Developers" admins), I give permission to the "League of Extraordinary Foundry VTT Developers" admins to assign one or more developers to take over this module, including requesting the Foundry team to reassign the module to the new developer(s).<br>
I require the "League of Extraordinary Foundry VTT Developers" admins to send me an email 2 weeks before the reassignment takes place, to give me one last chance to prevent the reassignment.<br>
I require to be credited for my work in all future releases.
