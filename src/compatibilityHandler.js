import { compatibleCore } from "./misc.js";

let isV12 = false;


export function compatibilityInit() {
    isV12 = compatibleCore('12');
}

export function compatibilityHandler(id, ...args) {
    //console.log('combatibiliyHandler',id, args)

    if (id == 'sceneDarkness')         return sceneDarkness();
    else if (id == 'audioHelper')           return audioHelper();
    else if (id == 'newSound')          return newSound(args[0]);
    else if (id == 'onSoundEnd')            return onSoundEnd(args[0], args[1]);
    else if (id == 'mergeObject')           return mergeObj(args);
}

function sceneDarkness() {
    if (isV12)   return canvas.scene.environment.darknessLevel;
    else         return canvas.scene.darkness;
}

function audioHelper() {
    if (isV12)  return foundry.audio.AudioHelper;
    else        return AudioHelper;
}

function newSound(src) {
    if (isV12)  return new foundry.audio.Sound(src);
    else        return new Sound(src);
}

function onSoundEnd(sound, cb) {
    if (isV12)  sound.addEventListener('end', cb);
    else        sound.on('end', cb);
}

function mergeObj(args) {
    if (isV12)   return foundry.utils.mergeObject(args[0], args[1], args[2]);
    else         return mergeObject(args[0], args[1], args[2]);
}