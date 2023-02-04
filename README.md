# What's Important

## Data structures

```typescript

type BulletType = 'daily_checkbox' | 'weekly_checkbox' | 'monthly_checkbox' | 'once';
type BulletStatus = 'done' | 'not_started' | 'in_progress';

type Bullet = {
    image: File,
    description: string,
    type: BulletType,
    status: BulletStatus,
}

```

Service worker