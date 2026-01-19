import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

export class AudioRecorder {
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;

  async startRecording(): Promise<void> {
    try {
      // İzin iste
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        throw new Error('Mikrofon izni gerekli!');
      }

      // Audio ayarları
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Kayıt başlat
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      this.recording = recording;
    } catch (error) {
      console.error('Kayıt başlatma hatası:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<string | null> {
    if (!this.recording) {
      return null;
    }

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      return uri;
    } catch (error) {
      console.error('Kayıt durdurma hatası:', error);
      return null;
    }
  }

  async playRecording(uri: string): Promise<void> {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      this.sound = sound;
      await sound.playAsync();
    } catch (error) {
      console.error('Çalma hatası:', error);
    }
  }

  async deleteRecording(uri: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch (error) {
      console.error('Silme hatası:', error);
    }
  }

  isRecording(): boolean {
    return this.recording !== null;
  }

  cleanup(): void {
    if (this.sound) {
      this.sound.unloadAsync();
      this.sound = null;
    }
  }
}
