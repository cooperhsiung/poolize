# poolize

[![NPM Version][npm-image]][npm-url]
[![Node Version][node-image]][node-url]

make resource pooling

## Installation

```bash
npm i poolize -S
```

## Usage

```typescript
import Pool from 'poolize';
// for commonjs -> const Pool = require('poolize').default;

class TaskHandler {
  // your heavy progress
  async exec(a: number, b: number): Promise<number> {
    await sleep(300);
    return a * b;
  }
}

const pool = new Pool<TaskHandler>({
  min: 10,
  worker: TaskHandler,
});

async function test() {
  for (let i = 0; i < 22; i++) {
    ;(async function () {
      const result = await pool.exec(i, i);

      console.log('job:', i, 'result:', result, 'running:', pool.running, 'idle:', pool.idleSize);
    })().catch((err) => {
      console.error(err);
    });
  }
}

test();
```

also you can release resource manually
```typescript
const worker = await pool.acquire();
const result = await worker.exec(i, i);
pool.release(worker);

console.log('job:', i, 'result:', result, 'running:', pool.running, 'idle:', pool.idleSize);
```


## Examples

examples are listed at [examples](https://github.com/cooperhsiung/poolize/tree/master/examples)

## Performance

`autocannon http://127.0.0.1:3000/bcrypt`

normal bcrypt

```
┌─────────┬────────┬────────┬────────┬────────┬───────────┬──────────┬───────────┐
│ Stat    │ 2.5%   │ 50%    │ 97.5%  │ 99%    │ Avg       │ Stdev    │ Max       │
├─────────┼────────┼────────┼────────┼────────┼───────────┼──────────┼───────────┤
│ Latency │ 131 ms │ 164 ms │ 245 ms │ 262 ms │ 165.16 ms │ 25.29 ms │ 315.39 ms │
└─────────┴────────┴────────┴────────┴────────┴───────────┴──────────┴───────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬───────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg   │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼───────┼─────────┼─────────┤
│ Req/Sec   │ 50      │ 50      │ 60      │ 67      │ 60.2  │ 4.31    │ 50      │
├───────────┼─────────┼─────────┼─────────┼─────────┼───────┼─────────┼─────────┤
│ Bytes/Sec │ 13.3 kB │ 13.3 kB │ 15.9 kB │ 17.8 kB │ 16 kB │ 1.14 kB │ 13.3 kB │
└───────────┴─────────┴─────────┴─────────┴─────────┴───────┴─────────┴─────────┘
```

after poolize with `worker_threads`
```
┌─────────┬───────┬───────┬───────┬───────┬──────────┬─────────┬───────────┐
│ Stat    │ 2.5%  │ 50%   │ 97.5% │ 99%   │ Avg      │ Stdev   │ Max       │
├─────────┼───────┼───────┼───────┼───────┼──────────┼─────────┼───────────┤
│ Latency │ 20 ms │ 23 ms │ 26 ms │ 28 ms │ 23.06 ms │ 3.93 ms │ 103.37 ms │
└─────────┴───────┴───────┴───────┴───────┴──────────┴─────────┴───────────┘
┌───────────┬────────┬────────┬────────┬────────┬────────┬─────────┬────────┐
│ Stat      │ 1%     │ 2.5%   │ 50%    │ 97.5%  │ Avg    │ Stdev   │ Min    │
├───────────┼────────┼────────┼────────┼────────┼────────┼─────────┼────────┤
│ Req/Sec   │ 388    │ 388    │ 427    │ 464    │ 423.91 │ 23.73   │ 388    │
├───────────┼────────┼────────┼────────┼────────┼────────┼─────────┼────────┤
│ Bytes/Sec │ 103 kB │ 103 kB │ 113 kB │ 123 kB │ 112 kB │ 6.28 kB │ 103 kB │
└───────────┴────────┴────────┴────────┴────────┴────────┴─────────┴────────┘
```




## Todo

- [ ] idle release

## Others


## License

MIT

[npm-image]: https://img.shields.io/npm/v/poolize.svg
[npm-url]: https://www.npmjs.com/package/poolize
[node-image]: https://img.shields.io/badge/node.js-%3E=8-brightgreen.svg
[node-url]: https://nodejs.org/download/
