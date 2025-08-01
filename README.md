# 🍎 Calorie Tracker App

A modern, cross-platform calorie tracking application built with React Native and Expo. Track your daily nutrition, monitor weight progress, and achieve your health goals with an intuitive, premium interface.

## ✨ Features

### 📊 **Today Screen**

- **Daily calorie progress** with circular progress ring
- **Quick calorie logging** with custom numeric keyboard
- **Macro breakdown** (carbs, protein, fat)
- **Health metrics overview** (BMI, weight trend)
- **Quick action buttons** for common foods

### 📅 **Weekly Planner**

- **7-day calendar view** with navigation
- **Daily calorie targets** setting
- **Weekly patterns** for recurring meal plans
- **Visual progress indicators** for each day
- **Quick calorie adjustments**

### 📈 **Progress Tracking**

- **Weight trend visualization** with interactive charts
- **Weekly deficit analysis** with custom bar charts
- **BMI tracking** and health category indicators
- **Progress statistics** (streaks, averages, goals)
- **Historical data analysis**

### ⚖️ **Weight Log**

- **Easy weight entry** with smart suggestions
- **Trend analysis** (gaining, losing, maintaining)
- **Weight history** with date tracking
- **Statistics overview** (current, goal, change)
- **Visual progress charts**

### ⚙️ **Settings & Profile**

- **Personal information** (age, gender, height, weight)
- **Activity level selection** with TDEE calculation
- **BMI calculation** and health categorization
- **Calorie goal recommendations** (weight loss/gain/maintenance)
- **Dark/light mode toggle**
- **Health metrics dashboard**

## 🏗️ **Technical Stack**

### **Frontend**

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and toolchain
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS / NativeWind** - Utility-first styling
- **React Navigation** - Screen navigation

### **State Management**

- **Zustand** - Lightweight state management
- **Persistent storage** for user data

### **UI/UX**

- **Custom components** - NumericKeyboard, PieChart, WeeklyCalendar
- **Responsive design** - Optimized for phones, tablets, and web
- **Dark mode support** - System and manual theme switching
- **Premium animations** - Smooth transitions and interactions

### **Charts & Visualization**

- **Custom bar charts** - Weekly deficit visualization
- **Circular progress rings** - Daily calorie progress
- **Trend indicators** - Weight and progress tracking

## 📱 **Platform Support**

- **iOS** - Native iOS app
- **Android** - Native Android app
- **Web** - Progressive Web App (PWA)
- **Responsive design** - Tablet and desktop optimized

## 🎯 **Key Functionality**

### **Calorie Management**

- Track daily calorie intake and expenditure
- Set personalized calorie goals based on TDEE
- Monitor weekly patterns and trends
- Quick logging with custom numeric keyboard

### **Health Metrics**

- **BMI calculation** with health categorization
- **TDEE computation** based on personal profile
- **Weight tracking** with trend analysis
- **Activity level assessment**

### **Goal Setting**

- **Multiple goal options**: Aggressive loss, moderate loss, mild loss, maintenance, weight gain
- **Personalized recommendations** based on user profile
- **Progress tracking** towards goals
- **Streak monitoring** for consistency

### **Data Visualization**

- **Interactive charts** for weight trends
- **Progress rings** for daily goals
- **Weekly overview** with visual indicators
- **Statistical summaries** and insights

## 🔧 **Installation & Setup**

### **Prerequisites**

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### **Getting Started**

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd calorie-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**

   ```bash
   npx expo start
   ```

4. **Run on your preferred platform**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app for physical device

## 📁 **Project Structure**

```
calorie-tracker/
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Tab-based screens
│   │   ├── index.tsx      # Today screen
│   │   ├── planner.tsx    # Weekly planner
│   │   ├── progress.tsx   # Progress tracking
│   │   ├── settings.tsx   # Settings & profile
│   │   └── weight-log.tsx # Weight logging
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── ui/               # UI components
│   │   ├── CalorieCard.tsx
│   │   ├── NumericKeyboard.tsx
│   │   ├── PieChart.tsx
│   │   └── WeeklyCalendar.tsx
│   └── ...               # Other components
├── store/                # State management
│   └── calorieStore.ts   # Zustand store
├── utils/                # Utility functions
│   └── dateUtils.ts      # Date manipulation
├── services/             # External services
│   └── HealthKitService.ts
└── constants/            # App constants
    ├── Colors.ts
    └── Theme.ts
```

## 🎨 **Design Philosophy**

### **Modern & Intuitive**

- Clean, minimalist interface
- Consistent design language
- Premium visual elements
- Smooth animations and transitions

### **User-Centric**

- Easy data entry with custom keyboards
- Quick actions for common tasks
- Visual feedback for all interactions
- Accessible design principles

### **Cross-Platform Excellence**

- Native feel on all platforms
- Responsive layouts for different screen sizes
- Platform-specific optimizations
- Consistent functionality across devices

## 🚀 **Future Enhancements**

- **Food database integration** for easier logging
- **Barcode scanning** for packaged foods
- **Meal planning** with recipe suggestions
- **Social features** for community support
- **Wearable device integration** (Apple Watch, Fitbit)
- **Export functionality** for data backup
- **Advanced analytics** and insights

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 **Contributing**

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 **Support**

For support, email [your-email] or create an issue in the GitHub repository.

---

**Built with ❤️ using React Native, Expo, and TypeScript**
