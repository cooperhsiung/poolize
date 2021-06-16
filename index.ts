/**
 * Created by Cooper on 2021/06/16.
 */
import { EventEmitter } from 'events';

interface Worker {
  new (value?: any): Object;
  exec(): Promise<any>;
}

type Options = {
  size: number;
  worker: Worker;
};

export default class Pool extends EventEmitter {
  private size: number;
  private running: any[];
  private idle: any[];
  private waiting: any[];
  constructor({ size, worker }: Options) {
    super();
    this.size = size;
    this.running = [];
    this.idle = Array(size)
      .fill(0)
      .map((_, i) => new worker(i + 1));

    //
    this.on('release', () => {
      if (this.waiting.length) {
        let w = this.idle.pop();
        if (w) {
          let defer = this.waiting.pop();
          defer(w);
        }
      }
    });

    // [1,2,3] fifo
    this.waiting = [];
  }

  get(): Promise<Worker> {
    return new Promise((resolve, reject) => {
      setTimeout(reject, 1000, 'timeout');
      //
      let w = this.idle.pop();
      if (w) {
        return resolve(w);
      } else {
        this.waiting.unshift(resolve);
      }
    });
  }

  async put(worker: Worker) {
    this.idle.unshift(worker);
    console.log('========= this.idle', this.idle.length);
    this.emit('release');
  }
}
