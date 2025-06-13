export class GameState {
  public score: number = 0;
  public lives: number = 3;
  public currentLevel: number = 1;
  public highScore: number = 0;
  
  private achievements: Set<string> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  public addScore(points: number): void {
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveToStorage();
    }
    
    // Check for score achievements
    this.checkScoreAchievements();
  }

  public loseLife(): void {
    this.lives = Math.max(0, this.lives - 1);
  }

  public gainLife(): void {
    this.lives = Math.min(9, this.lives + 1);
  }

  public nextLevel(): void {
    this.currentLevel++;
    this.addScore(1000 * this.currentLevel); // Bonus for completing level
    
    // Check for level achievements
    this.checkLevelAchievements();
  }

  public reset(): void {
    this.score = 0;
    this.lives = 3;
    this.currentLevel = 1;
  }

  private checkScoreAchievements(): void {
    if (this.score >= 10000 && !this.achievements.has('score_10k')) {
      this.achievements.add('score_10k');
      this.triggerAchievement('Score Master', 'Reached 10,000 points!');
    }
    
    if (this.score >= 50000 && !this.achievements.has('score_50k')) {
      this.achievements.add('score_50k');
      this.triggerAchievement('High Scorer', 'Reached 50,000 points!');
    }
  }

  private checkLevelAchievements(): void {
    if (this.currentLevel >= 5 && !this.achievements.has('level_5')) {
      this.achievements.add('level_5');
      this.triggerAchievement('Explorer', 'Completed 5 levels!');
    }
    
    if (this.currentLevel >= 10 && !this.achievements.has('level_10')) {
      this.achievements.add('level_10');
      this.triggerAchievement('Adventurer', 'Completed 10 levels!');
    }
  }

  private triggerAchievement(title: string, description: string): void {
    // In a full implementation, this would show a notification
    console.log(`🏆 Achievement Unlocked: ${title} - ${description}`);
  }

  public getAchievements(): string[] {
    return Array.from(this.achievements);
  }

  private saveToStorage(): void {
    try {
      const data = {
        highScore: this.highScore,
        achievements: Array.from(this.achievements)
      };
      localStorage.setItem('nexus-platformer-save', JSON.stringify(data));
    } catch (error) {
      console.warn('Could not save game state');
    }
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('nexus-platformer-save');
      if (saved) {
        const data = JSON.parse(saved);
        this.highScore = data.highScore || 0;
        this.achievements = new Set(data.achievements || []);
      }
    } catch (error) {
      console.warn('Could not load game state');
    }
  }
}