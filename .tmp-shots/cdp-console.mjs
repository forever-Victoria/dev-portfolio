const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const port = '9225';

async function main() {
  let page;
  for (let i = 0; i < 30; i += 1) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      page = targets.find((t) => t.type === 'page');
      if (page) break;
    } catch { /* retry */ }
    await sleep(300);
  }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pending = new Map();
  const logs = [];
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
    if (m.method === 'Runtime.exceptionThrown') {
      logs.push('EXC ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
    }
    if (m.method === 'Runtime.consoleAPICalled') {
      logs.push('CONSOLE ' + m.params.type + ' ' + m.params.args.map((a) => a.value ?? a.description).join(' '));
    }
    if (m.method === 'Log.entryAdded') {
      logs.push('LOG ' + m.params.entry.level + ' ' + m.params.entry.text + ' ' + (m.params.entry.url || ''));
    }
    if (m.method === 'Network.loadingFailed') {
      logs.push('FAILED ' + m.params.errorText + ' ' + (m.params.blockedReason || ''));
    }
  };
  await new Promise((r) => { ws.onopen = r; });
  const send = (method, params = {}) => new Promise((resolve) => {
    id += 1; pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Network.enable');
  await send('Page.enable');
  await send('Page.reload', { ignoreCache: true });
  await sleep(4000);
  const html = await send('Runtime.evaluate', { expression: `document.getElementById('root').innerHTML.slice(0, 300)`, returnByValue: true });
  console.log('ROOT:', JSON.stringify(html.result.result.value));
  console.log(logs.slice(0, 40).join('\n'));
  ws.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
