import * as alt from 'alt-server';
import { SYSTEM_EVENTS } from '../../../shared/enums/system';
import { View_Events_Chat, View_Events_Input_Menu } from '../../../shared/enums/views';
import { ANIMATION_FLAGS } from '../../../shared/flags/AnimationFlags';
import IErrorScreen from '../../../shared/interfaces/IErrorScreen';
import { InputMenu } from '../../../shared/interfaces/InputMenus';
import ISpinner from '../../../shared/interfaces/ISpinner';
import { Particle } from '../../../shared/interfaces/Particle';
import { ProgressBar } from '../../../shared/interfaces/ProgressBar';
import { Task, TaskCallback } from '../../../shared/interfaces/TaskTimeline';
import { sha256Random } from '../../utility/encryption';
import utility from './utility';

/**
 * Play an animation on this player.
 * @param {string} dictionary
 * @param {string} name
 * @param {ANIMATION_FLAGS} flags
 * @param {number} [duration=-1]
 * @return {*}  {void}
 * @memberof EmitPrototype
 */
function animation(
    player: alt.Player,
    dictionary: string,
    name: string,
    flags: ANIMATION_FLAGS,
    duration: number = -1,
): void {
    if (player.data.isDead) {
        alt.logWarning(`[Athena] Cannot play ${dictionary}@${name} while player is dead.`);
        return;
    }

    alt.emitClient(player, SYSTEM_EVENTS.PLAYER_EMIT_ANIMATION, dictionary, name, flags, duration);
}

/**
 * Play an animation on this player.
 * @param {string} name
 * @param {number} duration
 * @return {*}  {void}
 * @memberof EmitPrototype
 */
function scenario(player: alt.Player, name: string, duration: number): void {
    if (player.data.isDead) {
        return;
    }

    alt.emitClient(player, SYSTEM_EVENTS.PLAYER_EMIT_SCENARIO, name, duration);
}

/**
 * Synchronize a local variable to access locally for this player.
 * @param {string} key
 * @param {*} value
 * @memberof EmitPrototype
 */
function meta(player: alt.Player, key: string, value: any): void {
    alt.nextTick(() => {
        alt.emitClient(player, SYSTEM_EVENTS.META_SET, key, value);
    });
}

/**
 * Send a message to this player's chat box.
 * @param {string} message
 * @memberof EmitPrototype
 */
function message(player: alt.Player, message: string): void {
    alt.emitClient(player, View_Events_Chat.Append, message);
}

/**
 * Send a notification to this player.
 * @param {string} message
 * @memberof EmitPrototype
 */
function notification(player: alt.Player, message: string): void {
    alt.emitClient(player, SYSTEM_EVENTS.PLAYER_EMIT_NOTIFICATION, message);
}

/**
 * Play a particle effect at a specific coordinate.
 * @param {Particle} particle
 * @param {boolean} [emitToNearbyPlayers=false]
 */
function particle(player: alt.Player, particle: Particle, emitToNearbyPlayers = false): void {
    if (!emitToNearbyPlayers) {
        alt.emitClient(player, SYSTEM_EVENTS.PLAY_PARTICLE_EFFECT, particle);
        return;
    }

    const nearbyPlayers = utility.getClosestPlayers(player, 10);
    for (let i = 0; i < nearbyPlayers.length; i++) {
        const player = nearbyPlayers[i];
        alt.emitClient(player, SYSTEM_EVENTS.PLAY_PARTICLE_EFFECT, particle);
    }
}

/**
 * Create a progress bar that eventually ends itself.
 * @param {alt.Player} player
 * @param {ProgressBar} progressbar
 * @returns {string} A unique identifier to remove the progress bar.
 */
function createProgressBar(player: alt.Player, progressbar: ProgressBar): string {
    if (!progressbar.uid) {
        progressbar.uid = sha256Random(JSON.stringify(progressbar));
    }

    alt.emitClient(player, SYSTEM_EVENTS.PROGRESSBAR_CREATE, progressbar);
    return progressbar.uid;
}

/**
 * Remove a progress bar based on its unique identifier.
 * @param {alt.Player} player
 * @param {string} uid
 */
function removeProgressBar(player: alt.Player, uid: string) {
    alt.emitClient(player, SYSTEM_EVENTS.PROGRESSBAR_REMOVE, uid);
}

/**
 * Play a sound without any positional data.
 * @param {alt.Player} p
 * @param {string} audioName
 * @param {number} [volume=0.35]
 */
function sound2D(p: alt.Player, audioName: string, volume: number = 0.35) {
    alt.emitClient(p, SYSTEM_EVENTS.PLAYER_EMIT_SOUND_2D, audioName, volume);
}

/**
 * Play a sound from at a target's location for this player.
 * @param {string} audioName
 * @param {alt.Entity} target
 * @memberof EmitPrototype
 */
function sound3D(p: alt.Player, audioName: string, target: alt.Entity): void {
    alt.emitClient(p, SYSTEM_EVENTS.PLAYER_EMIT_SOUND_3D, target, audioName);
}

/**
 * Play a frontend sound for this player.
 * @param {string} audioName
 * @param {string} ref
 * @memberof EmitPrototype
 */
function soundFrontend(p: alt.Player, audioName: string, ref: string): void {
    alt.emitClient(p, SYSTEM_EVENTS.PLAYER_EMIT_FRONTEND_SOUND, audioName, ref);
}

/**
 * Force the player to perform an uncancellable task timeline.
 * @param {Array<Task | TaskCallback>} tasks
 */
function taskTimeline(player: alt.Player, tasks: Array<Task | TaskCallback>) {
    alt.emitClient(player, SYSTEM_EVENTS.PLAYER_EMIT_TASK_TIMELINE, tasks);
}

function inputMenu(player: alt.Player, inputMenu: InputMenu) {
    alt.emitClient(player, View_Events_Input_Menu.SetMenu, inputMenu);
}

/**
 * Create a spinner in the bottom-right corner.
 * @param {alt.Player} player
 * @param {ISpinner} spinner
 */
function createSpinner(player: alt.Player, spinner: ISpinner) {
    alt.emitClient(player, SYSTEM_EVENTS.PLAYER_EMIT_SPINNER, spinner);
}

/**
 * Clear a spinner in the bottom-right corner.
 * No UID necessary since it can only have one spinner at a time.
 * @param {alt.Player} player
 */
function clearSpinner(player: alt.Player) {
    alt.emitClient(player, SYSTEM_EVENTS.PLAYER_EMIT_SPINNER_CLEAR);
}

/**
 * Create a full-screen message. Cannot be cleared by the player.
 * @param {alt.Player} player
 * @param {IErrorScreen} screen
 */
function createErrorScreen(player: alt.Player, screen: IErrorScreen) {
    alt.emitClient(player, SYSTEM_EVENTS.PLAYER_EMIT_ERROR_SCREEN, screen);
}

/**
 * Clear a full-screen message.
 * @param {alt.Player} player
 */
function clearErrorScreen(player: alt.Player) {
    alt.emitClient(player, SYSTEM_EVENTS.PLAYER_EMIT_ERROR_SCREEN_CLEAR);
}

export default {
    animation,
    scenario,
    createProgressBar,
    createSpinner,
    clearSpinner,
    createErrorScreen,
    clearErrorScreen,
    inputMenu,
    meta,
    message,
    notification,
    particle,
    removeProgressBar,
    sound2D,
    sound3D,
    soundFrontend,
    taskTimeline,
};
