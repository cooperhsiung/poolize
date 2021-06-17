/**
 * Created by Cooper on 2021/06/16.
 */
export interface Worker {
  exec?: (...args: any) => Promise<any>;
}

const defaultOptions = {
  min: 1,
  max: 10,
  idleTimeout: 30 * 1000, // 30 second
  acquireTimeout: 1000, // 1 second
};

// destroy, release,
// auto recycle?

export default class Pool<T extends Worker> {
  private min: number;
  private max: number;
  private idleTimeout: number;
  private acquireTimeout: number;
  //
  private factory: new (...args: any) => T;
  private idleQueue: T[];
  private deferQueue: ((worker: T) => void)[];
  public running: number;

  constructor(options: Partial<typeof defaultOptions> & { worker: new (...args: any) => T }) {
    this.min = options.min || defaultOptions.min;
    this.max = options.max || defaultOptions.max;
    this.idleTimeout = options.idleTimeout || defaultOptions.idleTimeout;
    this.acquireTimeout = options.acquireTimeout || defaultOptions.acquireTimeout;
    // init workers
    this.factory = options.worker;
    this.idleQueue = Array(this.min)
      .fill(1)
      .map(() => new this.factory());
    // [1,2,3] fifo
    this.deferQueue = [];
    this.running = 0;
  }

  // fetch a worker from pool
  acquire(): Promise<T> {
    return new Promise((resolve, reject) => {
      setTimeout(reject, this.acquireTimeout, 'timeout');
      const worker = this.idleQueue.pop();
      if (worker) {
        this.running++;
        return resolve(worker);
      } else if (this.size < this.max) {
        this.running++;
        return resolve(new this.factory());
      } else {
        this.deferQueue.unshift(resolve); // fifo
      }
    });
  }

  // execute task directly
  async exec(...args: any) {
    const worker = await this.acquire();
    if (worker.exec) {
      const result = await worker.exec(...args);
      this.release(worker);
      return result;
    } else {
      throw new Error('worker does not implement a exec function');
    }
  }

  // put a worker back to the pool
  release(worker: T) {
    this.running--;
    this.idleQueue.unshift(worker);
    if (this.deferQueue.length) {
      const worker = this.idleQueue.pop();
      if (worker) {
        this.running++;
        const defer = this.deferQueue.pop();
        if (defer) {
          defer(worker);
        }
      }
    }
  }

  // put into a worker, no use
  async put(worker: T) {
    this.idleQueue.unshift(worker);
  }

  // total object in the pool
  get size(): number {
    return this.running + this.idleQueue.length;
  }

  // available workers number
  get idleSize(): number {
    return this.idleQueue.length;
  }
}
