// core/storage/storage.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3: S3;
  private readonly bucketName: string;
  private readonly useLocalStorage: boolean;
  private readonly localStoragePath: string;

  constructor(private configService: ConfigService) {
    this.useLocalStorage = this.configService.get('USE_LOCAL_STORAGE', true);

    if (this.useLocalStorage) {
      this.localStoragePath = this.configService.get('LOCAL_STORAGE_PATH', './storage');
      this.ensureStorageDirectory();
    } else {
      this.bucketName = this.configService.get('AWS_S3_BUCKET_NAME');
      this.s3 = new S3({
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
        region: this.configService.get('AWS_REGION'),
      });
    }
  }

  private ensureStorageDirectory(): void {
    if (!fs.existsSync(this.localStoragePath)) {
      fs.mkdirSync(this.localStoragePath, { recursive: true });
    }
  }

  async uploadFile(fileName: string, buffer: Buffer, contentType: string): Promise<string> {
    if (this.useLocalStorage) {
      const filePath = path.join(this.localStoragePath, fileName);
      const dirPath = path.dirname(filePath);

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      fs.writeFileSync(filePath, buffer);
      return `/storage/${fileName}`;
    } else {
      const uploadResult = await this.s3
        .upload({
          Bucket: this.bucketName,
          Key: fileName,
          Body: buffer,
          ContentType: contentType,
        })
        .promise();

      return uploadResult.Location;
    }
  }

  async getFile(fileName: string): Promise<Buffer> {
    if (this.useLocalStorage) {
      const filePath = path.join(this.localStoragePath, fileName);
      return fs.readFileSync(filePath);
    } else {
      const file = await this.s3
        .getObject({
          Bucket: this.bucketName,
          Key: fileName,
        })
        .promise();

      return file.Body as Buffer;
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    if (this.useLocalStorage) {
      const filePath = path.join(this.localStoragePath, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } else {
      await this.s3
        .deleteObject({
          Bucket: this.bucketName,
          Key: fileName,
        })
        .promise();
    }
  }
}
