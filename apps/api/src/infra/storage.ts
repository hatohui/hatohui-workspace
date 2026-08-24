import { Global, Injectable, Module } from '@nestjs/common';
import {
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class Storage {
  private readonly client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
    },
  });

  private readonly bucket = process.env.R2_BUCKET_NAME as string;
  private readonly publicUrl = process.env.R2_PUBLIC_URL as string;

  getSignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds: number,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.client, command, {
      expiresIn: expiresInSeconds,
    });
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }

  async getObjectBytes(key: string): Promise<Buffer> {
    const result = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    return Buffer.from(await result.Body!.transformToByteArray());
  }

  async putObject(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  deleteObject(key: string): Promise<unknown> {
    return this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  /// Relocates an object, used to move a staged upload into its permanent
  /// home once the record that owns it exists. Copy-then-delete, because S3
  /// has no rename; a failed delete leaves a harmless staging orphan rather
  /// than losing the file.
  async moveObject(fromKey: string, toKey: string): Promise<void> {
    if (fromKey === toKey) return;

    await this.client.send(
      new CopyObjectCommand({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${fromKey}`,
        Key: toKey,
      }),
    );
    await this.deleteObject(fromKey);
  }
}

@Global()
@Module({
  providers: [Storage],
  exports: [Storage],
})
export class StorageModule {}
