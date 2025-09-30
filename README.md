# MindAscent - Mental Health & Performance for Athletes

MindAscent is a sleek, modern web application designed to help athletes of all levels support their mental health and performance through daily check-ins, guided exercises, education, and resources.

## 🎯 Features

### Authentication & User Management
- **Public Landing Page**: Hero section with value proposition and call-to-action
- **User Registration**: Comprehensive signup form with email, username, sport, experience level, and goals
- **Username Uniqueness**: Real-time validation with Firestore transactions
- **User Profiles**: Personalized profiles stored in Firestore with preferences
- **Secure Authentication**: Firebase Auth with persistent sessions

### Core Mental Training Features
- **Daily/Weekly Check-Ins**: Track mood, stress, energy, and motivation with intuitive sliders
- **Exercise Suggestions**: Breathing exercises, visualization, mindfulness, and confidence building
- **Education Hub**: Learn about sports psychology topics like burnout, confidence, recovery, and anxiety
- **Resource Center**: Crisis support, professional contacts, and helpful resources
- **Streaks & Badges**: Track progress with 3, 7, and 30-day streaks and achievement badges
- **Progress Tracking**: Visual data and historical progress monitoring

## 🛠 Tech Stack

- **Frontend**: React + TypeScript with Next.js
- **Styling**: Tailwind CSS (black/grey/red theme)
- **Animations**: Framer Motion
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Caching**: Local storage for offline functionality

## 📁 Project Structure

```
MindAscent/
├── src/
│   ├── components/     # Reusable UI components (buttons, sliders, cards)
│   ├── pages/          # Next.js route pages
│   ├── screens/        # Full screen views (Dashboard, CheckIn, EducationHub, etc.)
│   ├── services/       # API/database connections (Firebase)
│   ├── contexts/       # React contexts (AuthContext)
│   ├── utils/          # Helper functions (dates, XP logic, streaks)
│   ├── data/           # Placeholder data and mock content
│   ├── types/          # TypeScript interfaces and types
│   └── styles/         # Global styles and Tailwind config
├── public/             # Static assets (images, icons, logos)
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project (for authentication and database)

### 1. Clone and Install
```bash
git clone <repository-url>
cd MindAscent
npm install
```

### 2. Firebase Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable Authentication with Email/Password provider
4. Create Firestore database in production mode

#### Configure Environment Variables
1. Copy `.env.local.example` to `.env.local`
2. Get your Firebase config from Project Settings > General > Your apps
3. Replace the placeholder values in `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

#### Deploy Firestore Rules
```bash
# Install Firebase CLI if you haven't already
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project directory
firebase init firestore

# Deploy the security rules
firebase deploy --only firestore:rules
```

### 3. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🔐 Authentication Flow

### User Registration
1. **Landing Page** (`/`) - Public page with CTA buttons
2. **Multi-Step Sign Up** (`/signup`) - 3-step wizard with progress indicator:
   
   **Step 1: Account Setup**
   - Email (validated format)
   - Username (unique, 3-20 characters, alphanumeric + underscore, real-time availability)
   - Password (8+ characters with letter and number, strength indicator)
   
   **Step 2: Profile Essentials**
   - Primary Sport (from predefined list)
      - Level (Recreational/Amateur/Collegiate/Professional/Other)
   - Age (must be 13+)
   - Optional: Country/Region
   
   **Step 3: Goals & Preferences**
   - Mental Training Goals (1-5 selections: Stress, Confidence, Motivation, Energy, Focus)
   - Optional: About Me (140 chars max)
   - Required: Terms of Service and Data Use Policy agreement

### User Login
1. **Login Page** (`/login`) - Email/password authentication
2. Automatic profile loading and last login timestamp update
3. Redirect to dashboard upon successful authentication

### Security Features
- Firestore transactions ensure username uniqueness
- Client-side and server-side validation
- Secure password requirements with strength indicators
- Session persistence with Firebase Auth
- User data isolation (users can only access their own data)
- Real-time username availability checking

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MindAscent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Add your Firebase config to `src/services/firebase.ts`

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Key Components

### Authentication
- Secure sign-up and login with Firebase Auth
- Protected routes with auth context
- User profile management

### Daily Check-ins
- 4 interactive sliders (Mood, Stress, Energy, Motivation)
- Optional notes field
- Automatic streak tracking
- Local storage backup for offline use

### Mental Exercises
- Categorized exercises (breathing, mindfulness, visualization, etc.)
- Step-by-step instructions
- Difficulty levels (beginner, intermediate, advanced)
- Filtering and search functionality

### Education Hub
- Articles on sports psychology topics
- Categorized content (burnout, confidence, recovery, injury, anxiety, myths)
- Reading time estimates
- Searchable content with tags

### Resource Center
- Crisis hotlines and emergency support
- Professional contacts and clinics
- Mental health websites and apps
- Location-based resources

## 🔥 Features in Detail

### Streak System
- **3-Day Streak**: First milestone badge
- **7-Day Streak**: Weekly consistency badge
- **30-Day Streak**: Monthly dedication badge
- Longest streak tracking
- Visual progress indicators

### Data & Analytics
- Check-in history with trends
- Average scoring over time
- Streak statistics
- Progress visualization

### Offline Capability
- Local storage backup for check-ins
- Cached exercise content
- Offline-first approach with Firebase sync

## 🎨 Design System

### Color Palette
- **Primary**: Black (#000000) and Dark Grey (#1F2937)
- **Accent**: Vibrant Red (#DC2626)
- **Text**: White (#FFFFFF) and Grey variants
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### Typography
- Clean, modern fonts
- Clear hierarchy with proper spacing
- Accessible contrast ratios

## 🧪 Development Guidelines

### Code Style
- TypeScript for type safety
- Functional components with hooks
- Consistent naming conventions
- Proper error handling with try/catch

### Component Structure
- Reusable components in `/components`
- Full-screen views in `/screens`
- Page-level components in `/pages`
- Shared utilities in `/utils`

### Error Handling
- Comprehensive error boundaries
- User-friendly error messages
- Graceful degradation for offline scenarios
- Loading states for async operations

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Environment Variables
Create a `.env.local` file with:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📈 Future Roadmap (Phase 2)

- Advanced analytics and insights
- Coach/trainer collaboration features
- Team management capabilities
- Integration with wearable devices
- Advanced exercise tracking
- Personalized recommendations
- Social features and community
- Mobile app development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support & Resources

### Mental Health Resources
- **Crisis Text Line**: Text HOME to 741741
- **National Suicide Prevention Lifeline**: 988
- **SAMHSA Helpline**: 1-800-662-4357

### Technical Support
- Check the issues page for known problems
- Submit bug reports with detailed steps to reproduce
- Feature requests are welcome!

---

**Built with ❤️ for athletes who want to strengthen their mental game**
