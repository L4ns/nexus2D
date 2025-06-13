export class Rectangle {
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  public get left(): number {
    return this.x;
  }

  public get right(): number {
    return this.x + this.width;
  }

  public get top(): number {
    return this.y;
  }

  public get bottom(): number {
    return this.y + this.height;
  }

  public get centerX(): number {
    return this.x + this.width / 2;
  }

  public get centerY(): number {
    return this.y + this.height / 2;
  }

  public intersects(other: Rectangle): boolean {
    return !(
      this.right <= other.left ||
      this.left >= other.right ||
      this.bottom <= other.top ||
      this.top >= other.bottom
    );
  }

  public contains(x: number, y: number): boolean {
    return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom;
  }

  public overlaps(other: Rectangle): { x: number; y: number } {
    const overlapX = Math.min(this.right - other.left, other.right - this.left);
    const overlapY = Math.min(this.bottom - other.top, other.bottom - this.top);
    return { x: overlapX, y: overlapY };
  }
}