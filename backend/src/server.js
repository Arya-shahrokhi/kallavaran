import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

const start = async () => {
  await connectDB();
  const server = app.listen(env.port, () => {
    console.log(`[server] در حالت ${env.nodeEnv} روی پورت ${env.port} بالا آمد`);
  });

  const shutdown = async (signal) => {
    console.log(`[server] ${signal} دریافت شد، خاموش شدن تدریجی...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  ['SIGINT', 'SIGTERM'].forEach((s) => process.on(s, () => shutdown(s)));
  process.on('unhandledRejection', (reason) => {
    console.error('[fatal] unhandledRejection', reason);
    shutdown('unhandledRejection');
  });
};

start().catch((err) => {
  console.error('[fatal] اجرای سرور شکست خورد', err);
  process.exit(1);
});
