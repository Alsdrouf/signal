import {
  audioDataToAudioBuffer,
  getSampleEventsFromSoundFont,
  renderAudio,
} from "@ryohey/wavelet"
import { encode } from "wav-encoder"
import { downloadBlob } from "../../common/helpers/Downloader"
import { songToSynthEvents } from "../../common/helpers/songToSynthEvents"
import Song from "../../common/song"
import RootStore from "../stores/RootStore"

const waitForAnimationFrame = () =>
  new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()))

export const exportSongAsJson = ({ song, synth, exportStore }: RootStore) => async () => {
  const soundFontData = synth.loadedSoundFontData
  if (soundFontData === null) {
    return
  }
  const sampleRate = 44100
  const events = songToSynthEvents(song, sampleRate)

  exportStore.isCanceled = false
  exportStore.openExportProgressDialog = true
  exportStore.progress = 0

  const baseDelayFor1Ms = 11025 / 240
  const result = [];
  let lastStopAt = 0

  try {
    for (let i = 0; i < events.length; i++) {
      const event = events[i]
      const nextEvent = events[i + 1]
      console.log(event);
      if(event.type === 'midi' && event.midi.subtype === 'noteOn' && nextEvent?.type === 'midi'){
        const freq = 440 * Math.pow(2, (event.midi.noteNumber - 69) / 12)
        //@ts-ignore
        const startAt = event.delayTime / baseDelayFor1Ms
        const endAt = nextEvent.delayTime / baseDelayFor1Ms
        const durationInMs = endAt - startAt

        //First note
        if(result.length === 0 && startAt > 0){
          result.push([0,2], [startAt, 2])
        } else if (result.length > 0 && startAt > lastStopAt){
          result.push([0, 2], [startAt - lastStopAt, 2])
        }
        result.push([freq, 2], [durationInMs, 2])
        lastStopAt = startAt + durationInMs
      }
    }
  } catch (e){}
  exportStore.progress = 1
  exportStore.openExportProgressDialog = false
  console.log(result);
}

export const exportSongAsWav =
  ({ song, synth, exportStore }: RootStore) =>
  async () => {
    const soundFontData = synth.loadedSoundFontData
    if (soundFontData === null) {
      return
    }

    const sampleEvents = getSampleEventsFromSoundFont(
      new Uint8Array(soundFontData),
    )
    const sampleRate = 44100
    const events = songToSynthEvents(song, sampleRate)

    exportStore.isCanceled = false
    exportStore.openExportProgressDialog = true
    exportStore.progress = 0

    try {
      const samples = sampleEvents.map((e) => e.event)
      const audioData = await renderAudio(samples, events, {
        sampleRate,
        bufferSize: 128,
        cancel: () => exportStore.isCanceled,
        waitForEventLoop: waitForAnimationFrame,
        onProgress: (numFrames, totalFrames) =>
          (exportStore.progress = numFrames / totalFrames),
      })

      exportStore.progress = 1

      const audioBuffer = audioDataToAudioBuffer(audioData)

      const wavData = await encode({
        sampleRate: audioBuffer.sampleRate,
        channelData: [
          audioBuffer.getChannelData(0),
          audioBuffer.getChannelData(1),
        ],
      })

      const blob = new Blob([wavData], { type: "audio/wav" })
      exportStore.openExportProgressDialog = false
      downloadBlob(blob, "song.wav")
    } catch (e) {
      console.warn(e)
    }
  }

export const cancelExport =
  ({ exportStore }: RootStore) =>
  () => {
    exportStore.isCanceled = true
  }

export const canExport = (song: Song) =>
  song.allEvents.some((e) => e.tick >= 120)
