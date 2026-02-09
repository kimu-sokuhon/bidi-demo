/**
 * Audio Recorder Worklet
 */

let micStream;

export async function startAudioRecorderWorklet(audioRecorderHandler) {
  try {
    // Create an AudioContext with cross-browser compatibility
    const audioRecorderContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 16000
    });
    console.log("[AUDIO-RECORDER] AudioContext sample rate:", audioRecorderContext.sampleRate);

    // Check if running in secure context (required for AudioWorklet)
    if (!window.isSecureContext) {
      console.warn('[AUDIO-RECORDER] Not in secure context (HTTPS/localhost). AudioWorklet may not be available.');
    }

    // Check if AudioWorklet is available
    if (!audioRecorderContext.audioWorklet) {
      console.error('[AUDIO-RECORDER] AudioWorklet not available. Browser info:', {
        userAgent: navigator.userAgent,
        isSecureContext: window.isSecureContext,
        audioContextState: audioRecorderContext.state
      });
      throw new Error('AudioWorklet is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }

    // Load the AudioWorklet module
    const workletURL = new URL("./pcm-recorder-processor.js", import.meta.url);
    console.log('[AUDIO-RECORDER] Loading worklet from:', workletURL.href);

    await audioRecorderContext.audioWorklet.addModule(workletURL).catch(err => {
      console.error('[AUDIO-RECORDER] Failed to load worklet module:', err);
      throw new Error(`Failed to load audio recorder worklet module: ${err.message}`);
    });

    // Request access to the microphone
    console.log('[AUDIO-RECORDER] Requesting microphone access...');
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1 },
    });
    console.log('[AUDIO-RECORDER] Microphone access granted');

    const source = audioRecorderContext.createMediaStreamSource(micStream);

    // Create an AudioWorkletNode that uses the PCMProcessor
    const audioRecorderNode = new AudioWorkletNode(
      audioRecorderContext,
      "pcm-recorder-processor"
    );

    // Connect the microphone source to the worklet.
    source.connect(audioRecorderNode);
    audioRecorderNode.port.onmessage = (event) => {
      // Convert to 16-bit PCM
      const pcmData = convertFloat32ToPCM(event.data);

      // Send the PCM data to the handler.
      audioRecorderHandler(pcmData);
    };

    console.log('[AUDIO-RECORDER] Audio recorder worklet initialized successfully');
    return [audioRecorderNode, audioRecorderContext, micStream];
  } catch (error) {
    console.error('[AUDIO-RECORDER] Error initializing audio recorder worklet:', error);
    console.error('[AUDIO-RECORDER] Stack trace:', error.stack);

    // Clean up microphone stream if it was opened
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
      micStream = null;
    }

    throw error;
  }
}

/**
 * Stop the microphone.
 */
export function stopMicrophone(micStream) {
  micStream.getTracks().forEach((track) => track.stop());
  console.log("stopMicrophone(): Microphone stopped.");
}

// Convert Float32 samples to 16-bit PCM.
function convertFloat32ToPCM(inputData) {
  // Create an Int16Array of the same length.
  const pcm16 = new Int16Array(inputData.length);
  for (let i = 0; i < inputData.length; i++) {
    // Multiply by 0x7fff (32767) to scale the float value to 16-bit PCM range.
    pcm16[i] = inputData[i] * 0x7fff;
  }
  // Return the underlying ArrayBuffer.
  return pcm16.buffer;
}