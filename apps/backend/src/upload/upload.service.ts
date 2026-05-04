import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

interface UploadedFile {
  mimetype: string;
  originalname: string;
  buffer: Buffer;
}

@Injectable()
export class UploadService {
  private readonly uploadDir = path.resolve(process.cwd(), 'uploads');
  private readonly encryptionKey: Buffer;

  constructor(private readonly config: ConfigService) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    const keySource = this.config.get<string>('CV_ENCRYPTION_KEY', 'dev-key');
    this.encryptionKey = createHash('sha256').update(keySource).digest();
  }

  async handleFileUpload(file: UploadedFile): Promise<string> {
    if (!file) throw new BadRequestException('No file uploaded');

    const { fileTypeFromBuffer } = await import('file-type');
    const detectedType = await fileTypeFromBuffer(file.buffer);
    const detectedMime = detectedType?.mime || file.mimetype;
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedMimes.includes(detectedMime)) {
      throw new BadRequestException('Only PDF and images (JPG, PNG) allowed');
    }

    const safeOriginalName = file.originalname.replace(/[^\w.\- ]/g, '_');
    const filename = `${Date.now()}-${safeOriginalName}`;
    const filepath = path.join(this.uploadDir, filename);

    const encryptedBuffer = this.encryptBuffer(file.buffer);
    await fs.promises.writeFile(filepath, encryptedBuffer);
    return filepath;
  }

  async extractTextFromPDF(filepath: string): Promise<string> {
    try {
      const fileBuffer = await this.readDecryptedFile(filepath);

      // Dynamic import to stay compatible with NodeNext/ESM interop.
      const pdfModule: any = await import('pdf-parse');

      // v2 API: named export class PDFParse
      if (pdfModule?.PDFParse) {
        const parser = new pdfModule.PDFParse({ data: fileBuffer });
        const result = await parser.getText();
        if (typeof parser.destroy === 'function') {
          await parser.destroy();
        }
        const text = result?.text?.trim() ?? '';
        if (!text) {
          throw new Error('No text extracted from PDF');
        }
        return text;
      }

      // Legacy fallback: default/function export
      const legacyParse = pdfModule?.default ?? pdfModule;
      if (typeof legacyParse === 'function') {
        const result = await legacyParse(fileBuffer);
        const text = result?.text?.trim() ?? '';
        if (!text) {
          throw new Error('No text extracted from PDF');
        }
        return text;
      }

      throw new Error('Unsupported pdf-parse export format');
    } catch (err: any) {
      throw new BadRequestException(
        `Failed to extract text from PDF: ${err?.message ?? 'Unknown error'}`,
      );
    }
  }

  async extractTextFromImage(filepath: string): Promise<string> {
    try {
      const imageBuffer = await this.readDecryptedFile(filepath);
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      const { data } = await worker.recognize(imageBuffer);
      await worker.terminate();

      const text = data?.text?.trim() ?? '';
      if (!text) {
        throw new Error('No text extracted from image');
      }
      this.assertReadableOcrText(text);
      return text;
    } catch (err: any) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new BadRequestException(
        `Failed to extract text from image: ${err?.message ?? 'Unknown error'}`,
      );
    }
  }

  getDecryptedStream(filepath: string): Readable {
    const encrypted = fs.readFileSync(filepath);
    const decrypted = this.decryptBuffer(encrypted);
    return Readable.from(decrypted);
  }

  private async readDecryptedFile(filepath: string): Promise<Buffer> {
    const encrypted = await fs.promises.readFile(filepath);
    return this.decryptBuffer(encrypted);
  }

  private encryptBuffer(buffer: Buffer): Buffer {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]);
  }

  /** Reject scans that are too short or mostly noise (OCR quality gate). */
  private assertReadableOcrText(text: string): void {
    const trimmed = text.trim();
    if (trimmed.length < 100) {
      throw new BadRequestException(
        'Could not extract sufficient text from image. Please ensure the image is clear and readable.',
      );
    }
    const alnumMatches = trimmed.match(/[a-zA-Z0-9\s]/g) ?? [];
    const alphanumericRatio =
      trimmed.length > 0 ? alnumMatches.length / trimmed.length : 0;
    if (alphanumericRatio < 0.6) {
      throw new BadRequestException(
        'Image quality too low for reliable text extraction. Please upload a clearer image or PDF.',
      );
    }
  }

  private decryptBuffer(buffer: Buffer): Buffer {
    if (buffer.length <= 28) {
      return buffer;
    }
    const iv = buffer.subarray(0, 12);
    const tag = buffer.subarray(12, 28);
    const data = buffer.subarray(28);
    try {
      const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
      decipher.setAuthTag(tag);
      return Buffer.concat([decipher.update(data), decipher.final()]);
    } catch {
      // Backward compatibility for previously stored plain files.
      return buffer;
    }
  }
}
