import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface UploadedFile {
  mimetype: string;
  originalname: string;
  buffer: Buffer;
}

@Injectable()
export class UploadService {
  private readonly uploadDir = path.resolve(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async handleFileUpload(file: UploadedFile): Promise<string> {
    if (!file) throw new BadRequestException('No file uploaded');

    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Only PDF and images (JPG, PNG) allowed');
    }

    const safeOriginalName = file.originalname.replace(/[^\w.\- ]/g, '_');
    const filename = `${Date.now()}-${safeOriginalName}`;
    const filepath = path.join(this.uploadDir, filename);

    await fs.promises.writeFile(filepath, file.buffer);
    return filepath;
  }

  async extractTextFromPDF(filepath: string): Promise<string> {
    try {
      const fileBuffer = await fs.promises.readFile(filepath);

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
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      const { data } = await worker.recognize(filepath);
      await worker.terminate();

      const text = data?.text?.trim() ?? '';
      if (!text) {
        throw new Error('No text extracted from image');
      }
      return text;
    } catch (err: any) {
      throw new BadRequestException(
        `Failed to extract text from image: ${err?.message ?? 'Unknown error'}`,
      );
    }
  }
}
