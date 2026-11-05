import 'dotenv/config';
import { syncLocalContent, syncRemoteContent } from './content-sync.mjs';

const useLocalContent = process.env.CONTENT_SOURCE === 'local';

export default function r2Content(options = {}) {
  let syncedContent = false;

  async function syncContentOnce(logger) {
    if (syncedContent) {
      return;
    }

    syncedContent = true;

    if (useLocalContent) {
      const summary = await syncLocalContent(options);
      logger.info(
        `Synced local newsletter ${summary.newsletter.outputFiles}/${summary.newsletter.sourceFiles}, blog ${summary.blog.outputFiles}/${summary.blog.sourceFiles}.`,
      );
      return;
    }

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

        await syncContentOnce(logger);
      },
      'astro:server:setup': async ({ logger }) => {
        const summary = await syncLocalContent(options);
        logger.info(
          `Synced local newsletter ${summary.newsletter.outputFiles}/${summary.newsletter.sourceFiles}, blog ${summary.blog.outputFiles}/${summary.blog.sourceFiles}.`,
        );
      },
      'astro:build:start': async ({ logger }) => {
        await syncContentOnce(logger);
      },
    },
  };
}
