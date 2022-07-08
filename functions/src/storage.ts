import * as functions from 'firebase-functions';

import * as storage from '@google-cloud/storage';
const client = new storage.Storage();

import * as sharp from 'sharp';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';

import { v4 as uuidv4 } from 'uuid';

export const resizeAvatar = functions.storage
  .object()
  .onFinalize(async (object: any) => {
    try {
      // generate a unique name we'll use for the temp directories
      const uniqueName = uuidv4();

      // Get the bucket original image was uploaded to
      const bucket = client.bucket(object.bucket);

      // Set up bucket directory
      const filePath: any = object.name;
      const fileName: any = filePath.split('/').pop();
      const bucketDir = path.dirname(filePath);

      // create some temp working directories to process images
      const workingDir = path.join(os.tmpdir(), `images_${uniqueName}`);
      const tmpFilePath = path.join(workingDir, `source_${uniqueName}.png`);

      // We dont want to process images already resized
      if (
        fileName.includes('thumb@') ||
        !object.contentType.includes('image')
      ) {
        console.log('Exiting image resizer!');
        return false;
      }

      // Ensure directory exists
      await fs.ensureDir(workingDir);

      // Download source file
      await bucket.file(filePath).download({
        destination: tmpFilePath,
      });

      // Resize images
      const sizes = [128, 256, 384];
      const uploadPromises = sizes.map(async (size) => {
        const thumbName = `thumb@${size}_${fileName}`;
        const thumbPath = path.join(workingDir, thumbName);

        if (size < 300) {
          // Square aspect ratio
          // Good for profile images
          await sharp(tmpFilePath)
            .rotate()
            .resize(size, size)
            .toFile(thumbPath);
        } else {
          // 16:9 aspect ratio
          // const height = Math.floor(size * 0.5625);
          const height = Math.floor(size * 1);

          await sharp(tmpFilePath)
            .rotate()
            .resize(size, height)
            .toFile(thumbPath);
        }

        const downloadtoken = object.metadata.firebaseStorageDownloadTokens;
        console.log('metadata', object.metadata);
        console.log('contentType', object.metadata.contentType);
        // upload to original bucket
        return bucket.upload(thumbPath, {
          destination: path.join(bucketDir, thumbName),
          metadata: {
            contentType: 'image/png', // That's the event object from the Cloud Functions trigger
            metadata: {
              optimized: true, // other custom flags
              firebaseStorageDownloadTokens: downloadtoken, // access token
            },
          },
        });
      });

      // Process promises outside of the loop for performance purposes
      await Promise.all(uploadPromises);

      // Remove the temp directories
      await fs.remove(workingDir);
      await fs.remove(bucketDir);

      return Promise.resolve();
    } catch (error) {
      // If we have an error, return it
      // This will allow us to view it in the firebase function logs
      return Promise.reject(error);
    }
  });
