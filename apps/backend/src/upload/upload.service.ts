import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
const pdfParse = require('pdf-parse');

@Injectable()
export class UploadService {
  private uploadDir = 'uploads';

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async handleFileUpload(file: any): Promise<string> {
    if (!file) throw new BadRequestException('No file uploaded');

    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Only PDF and images (JPG, PNG) allowed');
    }

    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(this.uploadDir, filename);
    fs.writeFileSync(filepath, file.buffer);

    return filepath;
  }

  async extractTextFromPDF(filepath: string): Promise<string> {
    try {
      const fileBuffer = fs.readFileSync(filepath);
      const data = await pdfParse(fileBuffer);
      return data.text;
    } catch (err) {
      throw new BadRequestException('Failed to extract text from PDF');
    }
  }

  async extractTextFromImage(filepath: string): Promise<string> {
    return 'Image OCR not yet implemented. Please use PDF.';
  }
}
