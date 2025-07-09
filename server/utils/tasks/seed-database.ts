import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { seeds } from '../seeds';
import { metaDataTable } from '~~/server/db/schema';

export type SeedContext = { db: NodePgDatabase };
export type SeedPayload = { startKey: string };
export type SeedFn = (ctx: SeedContext, payload: SeedPayload) => Promise<void> | void;

export async function seedDatabase(payload: SeedPayload) {
  console.log('Seeding Database');

  let db;
  try {
    db = await useDatabase();
  } catch (error) {
    console.error('Failed to connect to database during seeding:', error);
    throw error;
  }

  const dbResponse = await db.select().from(metaDataTable).where(eq(metaDataTable.key, 'seedVersion'));

  const currentSeedVersion = dbResponse.length > 0 ? parseInt(dbResponse[dbResponse.length - 1]?.value || '0') : 0;
  const seedingForFirstTime = !(dbResponse.length > 0);

  console.log('Current Seed Version', currentSeedVersion, 'Total Seed Versions', seeds.length);

  let success = true;
  
  if (currentSeedVersion >= seeds.length) {
    console.log('Database already seeded, skipping...');
    return { result: true };
  }

  await db.transaction(async (tx) => {
    const seedCtx: SeedContext = { db: tx };

    for (let index = currentSeedVersion; index < seeds.length; index++) {
      const seedFn = seeds[index];
      if (!seedFn) throw new Error('Invalid SeedCTX at index ' + (index + 1));
      console.log('Applying SeedCTX', index + 1);
      try {
        await seedFn(seedCtx, payload);
        console.log('Successfully applied seed', index + 1);
      } catch (e) {
        console.error('Error applying seed', index, e);
        console.log('Rolling back...');
        tx.rollback();
        success = false;
        break;
      }
    }
    const updatedSeedVersion = seeds.length.toString();
    if (seedingForFirstTime) {
      console.log('First time seeding, inserting seed version');
      await tx.insert(metaDataTable).values({ key: 'seedVersion', value: updatedSeedVersion });
    } else {
      console.log('Updating seed version to', updatedSeedVersion);
      await tx
        .update(metaDataTable)
        .set({ value: updatedSeedVersion, updatedAt: new Date() })
        .where(eq(metaDataTable.key, 'seedVersion'));
    }
  });

  console.log('Database seeding completed with result:', success);
  return { result: success };
}
