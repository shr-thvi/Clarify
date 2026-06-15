# 🏗️ Technical Architecture - Advanced Features

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Interface Layer                         │
│  (React Components with Tailwind CSS + Advanced Animations)    │
├─────────────────────────────────────────────────────────────────┤
│  │ Profile Dropdown │ Learning Profile │ Human Feedback │ ... │
└──────────┬──────────────────────────────────────────────────────┘
           │
           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    State Management Layer                       │
│  (React Hooks - useState, useEffect, useContext)               │
├─────────────────────────────────────────────────────────────────┤
│  ├─ Auth State (isLoggedIn, currentUser, authToken)            │
│  ├─ Modal States (showLearningProfile, showHumanFeedback...)   │
│  ├─ Feature States (selectedSubject, bookmarkedIds...)         │
│  └─ Theme States (darkMode, colorTheme, notifications...)     │
└──────────┬──────────────────────────────────────────────────────┘
           │
           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                         │
│  (Custom Hooks + Utility Functions)                            │
├─────────────────────────────────────────────────────────────────┤
│  ├─ Learning Analytics Engine                                  │
│  ├─ Spaced Repetition Scheduler                               │
│  ├─ Cognitive Load Calculator                                 │
│  ├─ Learning Style Analyzer                                   │
│  └─ Adaptive Difficulty Engine                                │
└──────────┬──────────────────────────────────────────────────────┘
           │
           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API Layer                                    │
│  (Express.js REST API)                                          │
├─────────────────────────────────────────────────────────────────┤
│  ├─ /api/learning-profile (GET/POST)                           │
│  ├─ /api/feedback (POST)                                       │
│  ├─ /api/expert-reviews (GET/POST)                             │
│  ├─ /api/resources (GET)                                       │
│  └─ /api/adaptive-recommendations (GET)                        │
└──────────┬──────────────────────────────────────────────────────┘
           │
           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Data Persistence Layer                       │
│  (Local JSON + Future: PostgreSQL)                             │
├─────────────────────────────────────────────────────────────────┤
│  ├─ data/users.json (User profiles)                            │
│  ├─ data/learning-profiles.json                                │
│  ├─ data/feedback-history.json                                 │
│  ├─ data/expert-reviews.json                                   │
│  └─ data/resources.json                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### 1. **LearningProfileModule.tsx**
**Purpose**: Comprehensive analytics dashboard for learning psychology

**Props**:
```typescript
interface LearningProfileModuleProps {
  user: UserType | null;
  onClose: () => void;
}
```

**State**:
```typescript
interface LearningMetrics {
  topicsLearned: string[];
  totalDoubts: number;
  correctRewriteCount: number;
  averageConfidence: number;
  learningStyle: "visual" | "auditory" | "kinesthetic" | "reading-writing";
  optimalLearningTime: string;
  retentionRate: number;
  cognitiveLoadLevel: "low" | "medium" | "high";
  streakDays: number;
  weeklyGoal: number;
  weeklyProgress: number;
  motivationScore: number;
  focusRating: number;
}
```

**Features**:
- Tab-based navigation (Overview | Psychology | Recommendations)
- Real-time metrics calculation
- Spaced repetition scheduling
- Adaptive learning suggestions

**Styling Approach**:
- Glassmorphic cards with backdrop blur
- Gradient backgrounds (indigo → purple → pink)
- Smooth animations and hover effects
- Progress bars with color coding

---

### 2. **HumanFeedbackPanel.tsx**
**Purpose**: Collect structured feedback from users and community

**Props**:
```typescript
interface HumanFeedbackPanelProps {
  doubtTitle?: string;
  onClose: () => void;
}
```

**State**:
```typescript
interface FeedbackItem {
  id: string;
  doubtTitle: string;
  rating: number;
  helpful: boolean | null;
  comment: string;
  instructorFeedback?: string;
  peerReviews?: { reviewer: string; comment: string }[];
  timestamp: string;
}
```

**Features**:
- 5-star rating system
- Helpful/Not Helpful buttons
- Comment section (500 char limit)
- Feedback history tab
- Instructor feedback display
- Peer review aggregation

---

### 3. **ExpertReviewPanel.tsx**
**Purpose**: Display expert reviews and allow requesting additional feedback

**Props**:
```typescript
interface ExpertReviewPanelProps {
  doubtTitle?: string;
  originalDoubt?: string;
  rewrittenDoubt?: string;
  onClose: () => void;
}
```

**Features**:
- Side-by-side doubt comparison
- Expert credentials and rating
- Specific improvement suggestions
- Request review functionality
- Review impact metrics

---

### 4. **EnhancedStudyResources.tsx**
**Purpose**: Curated resource library with advanced filtering

**Props**:
```typescript
interface StudyResourcesProps {
  onClose: () => void;
}
```

**Features**:
- Multi-criteria filtering (subject, type, difficulty)
- Full-text search
- Bookmarking system
- Instructor information display
- Download statistics
- Star ratings

---

## Data Models

### User Learning Profile
```typescript
interface UserLearningProfile {
  userId: string;
  learningStyle: LearningStyle;
  topicsLearned: Topic[];
  performanceMetrics: PerformanceMetrics;
  scheduledReviews: SpacedRepetitionItem[];
  cognitiveLoadHistory: CognitiveLoadRecord[];
  adaptiveDifficultyLevel: number;
  lastUpdated: Date;
}
```

### Feedback Data Model
```typescript
interface FeedbackRecord {
  id: string;
  userId: string;
  doubtId: string;
  rating: number;
  helpful: boolean;
  comment: string;
  expertReview?: ExpertReview;
  peerReviews: PeerReview[];
  timestamp: Date;
  impact: ImpactMetrics;
}
```

### Spaced Repetition Schedule
```typescript
interface SpacedRepetitionItem {
  id: string;
  topic: string;
  lastReviewedDate: Date;
  nextReviewDate: Date;
  interval: number; // days
  easeFactor: number; // 1.3-2.5
  repetitions: number;
  quality: number; // 0-5
}
```

---

## Algorithms & Logic

### 1. **Cognitive Load Calculation**
```typescript
function calculateCognitiveLoad(
  studySessionDuration: number,
  topicDifficulty: number,
  userConfidence: number
): "low" | "medium" | "high" {
  const loadScore = 
    (studySessionDuration * 0.3) + 
    (topicDifficulty * 0.4) + 
    ((100 - userConfidence) * 0.3);
  
  if (loadScore < 30) return "low";
  if (loadScore < 70) return "medium";
  return "high";
}
```

### 2. **Spaced Repetition (SM-2 Algorithm)**
```typescript
function calculateNextReview(
  quality: number, // 0-5 rating
  easeFactor: number,
  repetitions: number
): { nextDate: Date; newEaseFactor: number } {
  let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;
  
  let interval: number;
  if (repetitions === 0) interval = 1;
  else if (repetitions === 1) interval = 3;
  else interval = Math.round(easeFactor * Math.pow(newEaseFactor, repetitions - 1));
  
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  
  return { nextDate, newEaseFactor };
}
```

### 3. **Adaptive Difficulty Adjustment**
```typescript
function getAdaptiveDifficulty(
  performanceMetrics: PerformanceMetrics
): "beginner" | "intermediate" | "advanced" {
  const adjustmentFactor = 
    (performanceMetrics.successRate * 0.4) +
    (performanceMetrics.averageConfidence * 0.3) +
    (performanceMetrics.retentionRate * 0.3);
  
  if (adjustmentFactor < 60) return "beginner";
  if (adjustmentFactor < 80) return "intermediate";
  return "advanced";
}
```

### 4. **Learning Style Detection**
```typescript
function determineLearningStyle(
  userResponses: QuizResponse[]
): LearningStyle {
  const scores = {
    visual: 0,
    auditory: 0,
    kinesthetic: 0,
    readingWriting: 0
  };
  
  // Process responses with weighted scoring
  userResponses.forEach(response => {
    scores[response.category] += response.weight;
  });
  
  // Return highest scoring style
  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)[0][0] as LearningStyle;
}
```

---

## Performance Optimizations

### 1. **Component Memoization**
```typescript
const StatCard = React.memo(({ icon, label, value }: Props) => {
  return /* JSX */;
}, (prevProps, nextProps) => {
  return prevProps.value === nextProps.value;
});
```

### 2. **Lazy Loading**
```typescript
const LearningProfileModule = lazy(() => 
  import('./components/LearningProfileModule')
);
```

### 3. **Data Caching**
```typescript
const cachedMetrics = useMemo(() => {
  return calculateMetrics(learningData);
}, [learningData]);
```

### 4. **Debounced Search**
```typescript
const debouncedSearch = useCallback(
  debounce((term: string) => {
    filterResources(term);
  }, 300),
  []
);
```

---

## API Endpoints (Future Implementation)

### Learning Profile
```
GET  /api/learning-profile/:userId
POST /api/learning-profile/:userId
PATCH /api/learning-profile/:userId/metrics
```

### Feedback System
```
POST /api/feedback
GET  /api/feedback/:userId
GET  /api/feedback/:doubtId
DELETE /api/feedback/:feedbackId
```

### Expert Reviews
```
GET /api/expert-reviews/:doubtId
POST /api/expert-reviews/request
GET /api/expert-reviews/:userId
```

### Resources
```
GET /api/resources?subject=&difficulty=&type=
GET /api/resources/:resourceId
POST /api/resources/bookmark
GET /api/resources/bookmarks/:userId
```

### Analytics
```
GET /api/analytics/dashboard/:userId
GET /api/analytics/progress/:userId
GET /api/analytics/recommendations/:userId
```

---

## Security Considerations

### Authentication & Authorization
- JWT token-based auth
- Secure password hashing (bcryptjs)
- Rate limiting on API endpoints
- CORS protection

### Data Privacy
- User data encryption at rest
- Private profile option
- GDPR compliance
- Secure session management

### Input Validation
- XSS prevention through React's auto-escaping
- SQL injection prevention (JSON storage)
- File upload validation
- Comment length limits

---

## Testing Strategy

### Unit Tests
```typescript
describe('LearningProfileModule', () => {
  test('calculates cognitive load correctly', () => {
    const load = calculateCognitiveLoad(60, 7, 60);
    expect(load).toBe('medium');
  });

  test('determines learning style from responses', () => {
    const style = determineLearningStyle(mockResponses);
    expect(style).toBe('visual');
  });
});
```

### Integration Tests
- API endpoint testing
- Data persistence verification
- State management flow
- User interaction workflows

### E2E Tests
- Complete learning flow
- Feedback submission
- Expert review request
- Resource bookmarking

---

## Scalability & Future Improvements

### Phase 1 (Current)
- ✅ Local JSON storage
- ✅ Single-user mode
- ✅ Basic analytics

### Phase 2 (Next)
- PostgreSQL integration
- Multi-user support
- Real-time collaboration
- Advanced analytics

### Phase 3 (Future)
- Machine learning recommendations
- AI expert reviews
- Mobile app
- Offline support
- Community features

---

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     User's Browser (Client)                     │
│         (React SPA - dist/index.html, dist/assets/)             │
└─────────────────────────────┬──────────────────────────────────┘
                              │
                              ↓ (HTTPS/TLS)
┌──────────────────────────────────────────────────────────────────┐
│                         Docker Container                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │            Express.js Server (Node.js)                    │ │
│  │  - REST API endpoints                                      │ │
│  │  - User authentication                                     │ │
│  │  - Business logic                                          │ │
│  │  - Static file serving                                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬──────────────────────────────────┘
                              │
                              ↓
            ┌─────────────────────────────────┐
            │    Local Data Storage           │
            │   (/data directory - JSON)      │
            └─────────────────────────────────┘
```

---

**Architecture designed for scalability, maintainability, and user-centric learning experiences.** 🚀
