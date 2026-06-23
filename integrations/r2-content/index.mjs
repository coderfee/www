import 'dotenv/config';
import { syncLocalContent, syncRemoteContent } from './content-sync.mjs';

export default function r2Content(options = {}) {
  let syncedRemoteContent = false;

  async function syncRemoteContentOnce(logger) {
    if (syncedRemoteContent) {
      return;
    }

    syncedRemoteContent = true;
    const summary = await syncRemoteContent(options);
    logger.info(
      `Synced newsletter ${summary.newsletter.outputFiles}/${summary.newsletter.remoteFiles}, blog ${summary.blog.outputFiles}/${summary.blog.remoteFiles}.`,
    );
  }

  return {
    name: 'r2-content',
    hooks: {
      'astro:config:setup': async ({ command, logger }) => {
        if (command !== 'build') {
          return;
        }

        await syncRemoteContentOnce(logger);
      },
      'astro:server:setup': async ({ logger }) => {
        const summary = await syncLocalContent(options);
        logger.info(
          `Synced local newsletter ${summary.newsletter.outputFiles}/${summary.newsletter.sourceFiles}, blog ${summary.blog.outputFiles}/${summary.blog.sourceFiles}.`,
        );
      },
      'astro:build:start': async ({ logger }) => {
        await syncRemoteContentOnce(logger);
      },
    },
  };
}
