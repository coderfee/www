import 'dotenv/config';
import { syncRemoteContent } from './content-sync.mjs';

async function main() {
  console.log('Starting remote content sync.');
  try {
    const summary = await syncRemoteContent();
    console.log('Remote content sync complete.');
    await notifyFeishu({ status: 'success', summary });
  } catch (error) {
    await notifyFeishu({ status: 'failure', error });
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function notifyFeishu(result) {
  const webhookUrl = process.env.FEISHU_WEBHOOK;

  if (!webhookUrl) {
    console.log('Feishu sync webhook is not configured.');
    return;
  }

  const time = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  const text =
    result.status === 'success'
      ? [
          '博客内容同步成功',
          `newsletter: ${result.summary.newsletter.outputFiles}/${result.summary.newsletter.remoteFiles}`,
          `blog: ${result.summary.blog.outputFiles}/${result.summary.blog.remoteFiles}`,
          `time: ${time}`,
        ].join('\n')
      : ['博客内容同步失败', `error: ${getErrorMessage(result.error)}`, `time: ${time}`].join('\n');

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        msg_type: 'text',
        content: { text },
      }),
    });

    if (!response.ok) {
      throw new Error(`Feishu webhook failed: ${response.status}`);
    }

    console.log('Feishu sync notification sent.');
  } catch (error) {
    console.warn(error);
  }
}

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
