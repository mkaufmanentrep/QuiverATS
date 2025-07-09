import { randomUUID } from 'uncrypto';

export default defineNitroPlugin(async () => {
  console.log('Starting Vidur application...');
  
  const startKey = randomUUID();

  const payload: SeedPayload = {
    startKey,
  };

  try {
    console.log('Seeding database...');
    await seedDatabase(payload);
    
    console.log('Configuring storage...');
    await configureStorage();
    
    console.log('Configuring cache...');
    await configureCache();
    
    console.log('Logging first access key...');
    await logFirstAccessKeyIfPresent();
    
    console.log('Replaying cron jobs...');
    await replayCron();
    
    console.log('Vidur application started successfully');
  } catch (error) {
    console.error('Failed to start Vidur application:', error);
    throw error;
  }
});
