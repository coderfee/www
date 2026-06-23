import 'dotenv/config';
import { syncWereadData } from './weread-sync.mjs';

export default function wereadData(options = {}) {
  let syncedWereadData = false;

  async function syncWereadDataOnce(logger) {
    if (syncedWereadData) {
      return;
    }

    syncedWereadData = true;
    logger.info('Syncing WeRead data.');
    const summary = await syncWereadData(options);
    logger.info(`Synced WeRead data ${summary.modes.join(', ')} to ${summary.outputFile}.`);
  }

  return {
    name: 'weread-data',
    hooks: {
      'astro:config:setup': async ({ command, logger }) => {
        if (command !== 'build') {
          return;
        }

        await syncWereadDataOnce(logger);
      },
      'astro:build:start': async ({ logger }) => {
        await syncWereadDataOnce(logger);
      },
      'astro:server:setup': async ({ logger }) => {
        await syncWereadDataOnce(logger);
      },
    },
  };
}
