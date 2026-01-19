import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

// Whisper ile ses transkribe etme
export async function transcribeAudio(
  audioFilePath: string,
  openaiClient: OpenAI
): Promise<string> {
  try {
    // Ses dosyasını oku
    const audioFile = fs.createReadStream(audioFilePath);

    // Whisper API'ye gönder
    const response = await openaiClient.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'tr', // Türkçe
      response_format: 'text',
    });

    return response as unknown as string;
  } catch (error) {
    console.error('Whisper transkripsiyon hatası:', error);
    throw error;
  }
}

// Buffer'dan ses transkribe etme
export async function transcribeAudioBuffer(
  audioBuffer: Buffer,
  filename: string,
  openaiClient: OpenAI
): Promise<string> {
  try {
    // Geçici dosya oluştur
    const tempDir = path.join(__dirname, '../../uploads');
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `temp-${Date.now()}-${filename}`);
    
    // Buffer'ı dosyaya yaz
    fs.writeFileSync(tempFilePath, audioBuffer);

    // Transkribe et
    const transcription = await transcribeAudio(tempFilePath, openaiClient);

    // Geçici dosyayı sil
    fs.unlinkSync(tempFilePath);

    return transcription;
  } catch (error) {
    console.error('Buffer transkripsiyon hatası:', error);
    throw error;
  }
}

// Ses dosyası formatını kontrol et
export function validateAudioFormat(filename: string): boolean {
  const validExtensions = ['.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm'];
  const ext = path.extname(filename).toLowerCase();
  
  return validExtensions.includes(ext);
}

// Ses dosyası boyutunu kontrol et (max 25MB)
export function validateAudioSize(fileSize: number): boolean {
  const maxSize = 25 * 1024 * 1024; // 25MB
  return fileSize <= maxSize;
}

// Ses metni temizleme (fazla boşluklar, noktalama düzeltme)
export function cleanTranscription(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Çoklu boşlukları tek boşluğa çevir
    .replace(/\s([.,!?])/g, '$1') // Noktalama işaretlerinden önceki boşlukları kaldır
    .replace(/^[a-zçğıöşü]/, (c) => c.toUpperCase()); // İlk harfi büyüt
}
