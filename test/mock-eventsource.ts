export class FetchBasedEventSource implements EventSource {
  public onmessage: ((event: MessageEvent) => void) | null = null;

  public onopen: (() => void) | null = null;

  public onerror: ((ev: Event) => void) | null = null;

  public onclose: (() => void) | null = null;

  public close() {
    this.onclose?.();
  }

  public readonly CONNECTING = 0;

  public readonly OPEN = 1;

  public readonly CLOSED = 2;

  public readyState: number = this.CONNECTING;

  public url: string;

  public withCredentials = false;

  constructor(url: string, init?: EventSourceInit) {
    this.url = url;

    this.readyState = this.OPEN;
    this.onopen?.();
    this.withCredentials = init?.withCredentials ?? false;

    // sigh
    const self = this;

    fetch(url)
      .then(async (res) => {
        if (!res.body) {
          throw new Error('no body');
        }

        const reader = res.body.getReader();

        reader.read().then(function processText({
          done,
          value,
        }): void | Promise<void> {
          if (done) {
            return undefined;
          }

          const text = new TextDecoder().decode(value);
          const lines = text.split('\n');

          // eslint-disable-next-line no-restricted-syntax
          for (const line of lines) {
            const [, data] = line.match(/^data:(.*)$/) || [];

            if (data) {
              self.onmessage?.(new MessageEvent('message', { data }));
            }
          }

          // eslint-disable-next-line consistent-return
          return reader.read().then(processText);
        });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(err);
        this.onerror?.(err);
      })
      .finally(() => {
        this.readyState = this.CLOSED;
        this.onclose?.();
      });
  }

  public addEventListener<K extends keyof EventSourceEventMap>(
    type: K,
    listener: (this: EventSource, ev: EventSourceEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions | undefined,
  ): void;
  public addEventListener(
    type: string,
    listener: (this: EventSource, event: MessageEvent<any>) => any,
    options?: boolean | AddEventListenerOptions | undefined,
  ): void;
  public addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions | undefined,
  ): void;
  public addEventListener(
    type: unknown,
    listener: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: unknown,
  ): void {
    if (type === 'message') {
      this.onmessage = listener as (event: MessageEvent) => void;
    } else if (type === 'open') {
      this.onopen = listener as () => void;
    } else if (type === 'error') {
      this.onerror = listener as (ev: Event) => void;
    } else if (type === 'close') {
      this.onclose = listener as () => void;
    }
  }

  public removeEventListener<K extends keyof EventSourceEventMap>(
    type: K,
    listener: (this: EventSource, ev: EventSourceEventMap[K]) => any,
    options?: boolean | EventListenerOptions | undefined,
  ): void;
  public removeEventListener(
    type: string,
    listener: (this: EventSource, event: MessageEvent<any>) => any,
    options?: boolean | EventListenerOptions | undefined,
  ): void;
  public removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions | undefined,
  ): void;
  public removeEventListener(
    type: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _listener: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: unknown,
  ): void {
    if (type === 'message') {
      this.onmessage = null;
    } else if (type === 'open') {
      this.onopen = null;
    } else if (type === 'error') {
      this.onerror = null;
    } else if (type === 'close') {
      this.onclose = null;
    }
  }

  public dispatchEvent(event: Event): boolean {
    if (event.type === 'open') {
      this.onopen?.();
    } else if (event.type === 'message') {
      this.onmessage?.(event as MessageEvent);
    } else if (event.type === 'error') {
      this.onerror?.(event);
    } else if (event.type === 'close') {
      this.onclose?.();
    }
    return true;
  }
}
