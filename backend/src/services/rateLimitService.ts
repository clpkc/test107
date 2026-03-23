export interface RateLimitOptions {
  perMinute: number;
  burstCount: number;
  burstWindowMs: number;
}

export class RateLimitService {
  private readonly events: number[] = [];

  constructor(private readonly options: RateLimitOptions) {}

  allow(now = Date.now()): boolean {
    const minuteAgo = now - 60_000;
    const burstAgo = now - this.options.burstWindowMs;

    while (this.events.length > 0 && this.events[0] < minuteAgo) {
      this.events.shift();
    }

    const minuteCount = this.events.length;
    const burstCount = this.events.filter((t) => t >= burstAgo).length;
    if (minuteCount >= this.options.perMinute) return false;
    if (burstCount >= this.options.burstCount) return false;

    this.events.push(now);
    return true;
  }
}
