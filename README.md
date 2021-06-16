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

## Todo

- [ ] idle release

## Others


## License

MIT

[npm-image]: https://img.shields.io/npm/v/poolize.svg
[npm-url]: https://www.npmjs.com/package/poolize
[node-image]: https://img.shields.io/badge/node.js-%3E=8-brightgreen.svg
[node-url]: https://nodejs.org/download/
