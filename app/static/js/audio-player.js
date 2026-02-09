/**
 * Audio Player Worklet
 */

export async function startAudioPlayerWorklet() {
    try {
        // 1. Create an AudioContext
        const audioContext = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: 24000
        });

        // Check if running in secure context (required for AudioWorklet)
        if (!window.isSecureContext) {
            console.warn('[AUDIO-PLAYER] Not in secure context (HTTPS/localhost). AudioWorklet may not be available.');
        }

        // Make sure audioWorklet is available
        if (!audioContext.audioWorklet) {
            console.error('[AUDIO-PLAYER] AudioWorklet not available. Browser info:', {
                userAgent: navigator.userAgent,
                isSecureContext: window.isSecureContext,
                audioContextState: audioContext.state
            });
            throw new Error('AudioWorklet is not supported in this browser. Please use Chrome, Edge, or Safari.');
        }

        // 2. Load your custom processor code
        const workletURL = new URL('./pcm-player-processor.js', import.meta.url);
        console.log('[AUDIO-PLAYER] Loading worklet from:', workletURL.href);

        await audioContext.audioWorklet.addModule(workletURL).catch(err => {
            console.error('[AUDIO-PLAYER] Failed to load worklet module:', err);
            throw new Error(`Failed to load audio worklet module: ${err.message}`);
        });

        // 3. Create an AudioWorkletNode
        const audioPlayerNode = new AudioWorkletNode(audioContext, 'pcm-player-processor');

        // 4. Connect to the destination
        audioPlayerNode.connect(audioContext.destination);

        console.log('[AUDIO-PLAYER] Audio worklet initialized successfully');
        // The audioPlayerNode.port is how we send messages (audio data) to the processor
        return [audioPlayerNode, audioContext];
    } catch (error) {
        console.error('[AUDIO-PLAYER] Error initializing audio worklet:', error);
        console.error('[AUDIO-PLAYER] Stack trace:', error.stack);
        throw error;
    }
}