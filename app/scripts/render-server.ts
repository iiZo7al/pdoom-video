import path from 'node:path';
import { createServer } from 'vite';

const APP = path.resolve(import.meta.dir, '..');
export interface RenderServer { url: string; stop(): Promise<void> }

export async function serverReady(url: string): Promise<boolean> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!r.ok) return false;
    return (await r.text()).includes('id="c"');
  } catch { return false; }
}

/** One owned server, with an OS-assigned port and explicit readiness. */
export async function startRenderServer(): Promise<RenderServer> {
  const server = await createServer({
    root: APP,
    configFile: path.join(APP, 'vite.config.ts'),
    server: { host: '127.0.0.1', port: 0, strictPort: true, hmr: false, open: false },
  });
  try {
    await server.listen();
    const address = server.httpServer?.address();
    if (!address || typeof address === 'string') throw new Error('Render server has no listening port');
    const url = `http://127.0.0.1:${address.port}`;
    const deadline = Date.now() + 60000;
    while (Date.now() < deadline) {
      if (await serverReady(url)) return { url, stop: () => server.close() };
      if (!server.httpServer?.listening) throw new Error('Render server stopped before it was ready');
      await Bun.sleep(200);
    }
    throw new Error('Render server did not become ready within 60 seconds');
  } catch (e) {
    await server.close();
    throw e;
  }
}
