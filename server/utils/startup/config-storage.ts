import type { Driver as UnstorageDriver } from 'unstorage';
import fsLite from 'unstorage/drivers/fs';
import { s3Driver } from '@profilecity/unstorage-s3-driver';

export async function configureStorage() {
  console.log('Configuring storage...');
  const storage = useStorage();

  const config = useRuntimeConfig().storage;
  
  console.log('Storage config:', { engine: config.engine });

  let driver: UnstorageDriver;

  switch (config.engine) {
    case 's3':
      if (!config.s3) {
        throw new Error('Selected blob storage service s3. No config provided.');
      }
      console.log('Using S3 storage driver');
      driver = s3Driver({
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
        bucket: config.s3.partition,
        endpoint: config.s3.endpoint,
        region: config.s3.region,
      });
      break;
    case 'local':
      if (!config.local) {
        throw new Error('Selected blob storage service local. No config provided.');
      }
      console.log('Using local storage driver, mounting files on:', config.local.baseDir);
      
      // Ensure directory exists
      const fs = await import('fs');
      const path = await import('path');
      const fullPath = path.resolve(config.local.baseDir);
      
      if (!fs.existsSync(fullPath)) {
        console.log('Creating storage directory:', fullPath);
        fs.mkdirSync(fullPath, { recursive: true });
      }
      
      driver = fsLite({
        base: config.local.baseDir,
      });
      break;
    default:
      throw new Error('No storage engine specified. Storage functions will not work.');
  }

  console.log(`Successfully mounted ${config.engine} storage driver`);

  storage.mount(BLOB_STORAGE_KEY, driver);
}
