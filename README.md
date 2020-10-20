# Material Keys
Material Keys is a <a href="https://foundryvtt.com/">Foundry VTT</a> module that allows you to control various features of Foundry using a Novation Launchpad Mk3. The Launchpad is a MIDI controller, that has 80 physical keys, each with an RGB LED.<br>
<br>
Material Keys currently has 7 different functions:<br>
<ul>
<li>Audio Effects Soundboard</li>
<li>Playlist Control</li>
<li>Playlist Volume Control</li>
<li>Visual Effects Control</li>
<li>Combat Tracker</li>
<li>Token Health Tracker</li>
<li>Macro Board</li>
</ul>
Each of these functions are discussed in detail below.

## Getting Started
Besides the Material Keys module and the Launchpad, you will also need to use a companion app, called MIDI Bridge. MIDI Bridge is a simple app that will bridge the communication between the Launchpad and Foundry, since Foundry does not support USB devices natively. The app can be downloaded <a href=" ">here</a>.<br>
Connection between the app and both Foundry and the Launchpad should be automatic, if not, you can find more details <a href=" ">here</a>.

## Using the Module
The module needs to be enabled, and the correct MIDI bridge address must be set for the module to work. Please see the section on the <a href=" ">module settings</a> below.<br>
<br>
3 different key types can be found on the Launchpad:
<ul>
<li><b>Function keys: </b>The 8 vertical keys on the right, the function of these keys is to change between the various Material Keys functions<li>
<li><b>Control keys: </b>The 8 horizontal keys on the top, the function of which will change depending on the selected function<li>
<li><b>Main keys: </b>The other 64 keys that form the majority of keys<li>
</ul>

### Audio Effects Soundboard
Using the Audio Effects Soundboard, you can easily play audio tracks.<br>
You could, for example, set up some keys to play battle effects, such as clashing swords, arrow hits, or explosions. Another thing you could do is to create an atmosphere, by setting some keys to play, for example, weather sounds.<br>
You can enter the Audio Effects Soundboard by pressing the first Function key from the top<br>
Once you've set up the soundboard, pressing a key will play the pre-set sound and change the LED to indicate the sound is playing. Pressing the key again will stop the sound.<br>

#### Soundboard Configuration
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
The LED color is represented by a number. This number corresponds with a factory programmed color, as can be seen in the image below. Besides filling in a number, you could also press the palette button next to the number field, which allows the Launchpad to display all the available colors. There are 2 groups of 64 colors, and by pressing the fading green function key (rightmost key), you can switch between the groups. The currently selected color will be fading, and pressing a key will send the color of that key to the Soundboard Configuration screen.<br>
An empty color field will be interpreted as a 0, which means that the LED will be off.

### Playlist Control
The playlist control screen gives easy control over up to 8 playlists. For each of these playlists, up to 8 tracks can be directly controlled.<br>
For each of these tracks and playlists, you have an indicator showing that the track is playing and you can stop or play tracks or playlists.<br>
You can enter the playlist control by pressing the second function key from the top.<br>
<br>
The screen is divided into 8 columns, where each column represents a playlist. The control (uppermost) key indicates and controls the playlist. If that playlist is playing, the LED will turn green, if that playlist is not playing, it will turn red. Pressing the key when the playlist is not playing will start the playlist, pressing the key when the playlist is playing will stop it. The same functionality can be found in the other 8 keys in the column. These 8 keys represent the first 8 tracks in the playlist (first track is at the top).

#### Playlist Configuration
The playlist control can be configured in the playlist configuration screen, which can be found in the module settings.<br>
<br>
<b>Play Method:</b> The play method determines what to do when a track is playing, while another track is requested. By setting it to 'Unrestricted', you can play as many tracks at the same time as you want. Setting it to 'One track per playlist' will automatically stop all playing tracks in the playlist, ensuring that only one track is playing at a time. Setting 'Play Method' to 'One track in total' will limit playback to only one track in total.<br>
<b>Note:<b> This play method only applies if tracks are started using the Launchpad, you can still play more tracks using Foundry's internal audio player.<br>
<br>
<b>Playlists:</b> Here you can select which playlists correspond to which column in the Playlist Control screen.

### Playlist Volume Control
The playlist volulme control screen gives control over the volume of the tracks that have been set up in the Playlist Control.<br>
You can enter the playlist volume control by pressing the third function key from the top.<br>
<br>
The 8 control keys in the top represent the 8 playlists from the playlist control screen. The fading LED indicates which playlist you are currently controlling, and selecting a different control key will switch the control to the corresponding playlist.<br>
The main keys are again divided into 8 columns, but here each column represents a track, which correspond to the first 8 tracks in the playlist. The amount of LEDs that are on represents the volume of the track. Pressing any of the keys sets the volume to that level. If a playlist and/or track is playing, the corresponding LEDs will turn green.

### Visual Effects Control

### Combat Tracker
The combat tracker screen gives a rough indication of the initiative order, and it can be used to start or stop the combat and go to the next or previous turn.<br>
You can enter the combat tracker screen by pressing the fifth function key from the top.<br>
<br>
The combat tracker can be divided into 2 parts:

#### Initiative Tracker
The top part gives the initative tracker. If there are tokens in Foundry's combat tracker, these will be displayed on the top rows. The color can be green, yellow or red, indicating a friendly, neutral or hostile token, respectively. Alternatively it can be white, which means that the token has been defeated. Pressing one of these buttons will pan the screen to that token, and select the token. Once combat has started, a fading LED will indicate whose turn it is. If more than 8 tokens are in the combat tracker, they will fill up the rows below. A total of 32 tokens can be displayed.

#### Controls
The bottom part gives 3 control buttons: start/stop combat, previous turn, next turn.<br>
If no tokens are in Foundry's combat tracker, all buttons will fade, indicating that they are inactive.<br>
One one or more tokens are in the combat tracker, the start/stop button will stop fading, indicating that it can be pressed to start the combat.<br>
Once combat has started, all buttons stop fading, and the color of the buttons change. The start/stop button now turns red to indicate that it is now the stop combat button, and the next/previous buttons turn green.

### Token Health Tracker
The token health screen gives a rough indication of the relative health of each token in the combat tracker.<br>
You can enter the token health screen by pressing the 6th function button from the top.<br>
<br>
Each column, including the control keys, correspond with a token in the combat tracker. They are horizontally ordered by initiative, and colored to indicate hostility, just like the combat tracker. The amount of LEDs that are on, represent the relative health of the token, so an empty bar means the token has 0 health, while a full bar means the token has full health. A blinking column indicates whose turn it is.<br>
If there are more than 8 tokens in the initiative tracker, you can press the same function key again to go to the next 8 tokens, which changes the color of the function key to indicate this, going from green, to blue, to purple, to yellow. A total of 32 tokens can be displayed.

### Macro Board