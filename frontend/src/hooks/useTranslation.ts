import { useStore } from '../app/store';

const translations = {
  en: {
    // Navbar & Layout
    features: 'Features',
    solutions: 'Solutions',
    pricing: 'Pricing',
    testimonials: 'Testimonials',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    getStarted: 'Get Started',
    goToDashboard: 'Go to Dashboard',
    signOut: 'Sign Out',
    accountSettings: 'Account Settings',
    habits: 'Habits',
    goals: 'Goals',
    overview: 'Overview',
    applications: 'Applications',
    topics: 'Topics',

    // Hero Section
    planYourDay: 'Plan your day.',
    buildYourHabits: 'Build your habits.',
    heroSubtitle: 'The all-in-one career dashboard designed for high-performance job seekers. Organize your hunt, track learning goals, and follow habits with clinical precision.',
    getStartedFree: 'Get Started Free',
    seeHowItWorks: 'See how it works',

    // Features Section
    dailyTimetable: 'Daily Timetable',
    dailyTimetableDesc: 'Time-block your day into focused slots. Maximize deep work and structure your applications follow-ups.',
    habitTracker: 'Habit Tracker',
    habitTrackerDesc: 'Develop continuous routines. Log checks in weekly rows and watch active streaks maintain consistency.',
    weeklyGoals: 'Weekly Goals',
    weeklyGoalsDesc: 'Break down targets into achievable checklists. Reset every Monday to maintain continuous execution.',
    studyPlanner: 'Study Planner',
    studyPlannerDesc: 'Structure your learning path. Break down complex topics into checklists and track your total progress percentage.',
    jobAppTracker: 'Job Application Tracker',
    jobAppTrackerDesc: 'Organize your job search. Log submissions, track interviews, document follow-ups, and manage interview pipelines.',

    // Footer
    footerDesc: 'Ultimate productivity cockpit for habit tracking, daily planning, and career log.',
    allRightsReserved: 'All rights reserved.',

    // Dashboard Overview Page
    todayOverview: 'Today\'s Overview',
    vsYesterday: 'vs yesterday',
    activeStreak: 'Active Streak',
    streakGlow: 'Day Streak',
    completionRate: 'Completion Rate',
    weeklyTarget: 'Weekly target progress',
    focusHours: 'Focus Hours',
    focusProgress: 'weekly progress',
    loggedApps: 'Logged Job Apps',
    remainingGoals: 'remaining goals',
    checklist: 'Checklist',
    timetable: 'Timetable',
    noEvents: 'No events scheduled for today.',
    completed: 'Completed',

    // Habits Page
    habitsTitle: 'Habits Consistency',
    createHabit: 'Create Habit',
    activeHabits: 'Active Habits',
    weeklyRoutines: 'Weekly routines logged',
    currentStreak: 'Current Streak',
    longestStreak: 'Longest Streak',
    totalCompletion: 'Total Completion',
    streaksLabel: 'streaks active',
    habitsCompleted: 'completed today',

    // Goals Page
    goalsTitle: 'Weekly Goals Tracker',
    createGoal: 'Create Goal',
    activeGoals: 'Active Goals',
    goalsRemaining: 'remaining this week',
    goalsCompleted: 'Goals Completed',
    overallGoalsProgress: 'Weekly target progress',

    // Applications Page
    applicationsTitle: 'Job Applications',
    logApplication: 'Log Application',
    todayLogged: 'Today\'s Logged Total',
    weeklySubmitted: 'Weekly Submitted',
    activeInterviews: 'Active Interview Tracks',
    scheduledInterviews: 'Scheduled',
    jobAppsLabel: 'Job Apps',
    searchApps: 'Search by company name, role title or notes...',
    allStatuses: 'All Statuses',

    // Topics Page
    topicsTitle: 'Study Curriculum',
    createTopic: 'Create Topic',
    totalTopics: 'Total Topics',
    curriculumModules: 'Curriculum target modules',
    topicsCompleted: 'Completed',
    overallTopicsProgress: 'Overall Progress',
    searchTopics: 'Search topics by name or category...',
    remainingToLearn: 'remaining to learn',

    // Profile Settings
    profileSettings: 'Profile Settings',
    personalInfo: 'Personal Information',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    newPassword: 'New Password (optional)',
    confirmPassword: 'Confirm Password',
    systemNotifications: 'System Notifications',
    enableNotifications: 'Enable push alerts',
    disableNotifications: 'Disable push alerts',
    saveChanges: 'Save Changes',
    passwordPlaceholder: 'Enter new password',
    notificationsTitle: 'Push Notifications',
  },
  hi: {
    // Navbar & Layout
    features: 'विशेषताएं',
    solutions: 'समाधान',
    pricing: 'कीमतें',
    testimonials: 'प्रशंसापत्र',
    signIn: 'साइन इन',
    signUp: 'साइन अप',
    getStarted: 'शुरू करें',
    goToDashboard: 'डैशबोर्ड पर जाएं',
    signOut: 'साइन आउट',
    accountSettings: 'खाता सेटिंग्स',
    habits: 'आदतें',
    goals: 'लक्ष्य',
    overview: 'डैशबोर्ड',
    applications: 'आवेदन',
    topics: 'अध्ययन',

    // Hero Section
    planYourDay: 'अपने दिन की योजना बनाएं।',
    buildYourHabits: 'अपनी आदतें विकसित करें।',
    heroSubtitle: 'एक ही उच्च-प्रदर्शन कार्यक्षेत्र में अपनी दिनचर्या व्यवस्थित करें। अपने लक्ष्यों को ट्रैक करें, आदतों का पालन करें, और सटीक योजना बनाएं।',
    getStartedFree: 'मुफ्त में शुरू करें',
    seeHowItWorks: 'देखें कि यह कैसे काम करता है',

    // Features Section
    dailyTimetable: 'दैनिक समय सारिणी',
    dailyTimetableDesc: 'अपने दिन को केंद्रित स्लॉट में विभाजित करें। गहरे काम को अधिकतम करें और अपने आवेदनों के फॉलो-अप को व्यवस्थित करें।',
    habitTracker: 'आदत ट्रैकर',
    habitTrackerDesc: 'सतत दिनचर्या विकसित करें। साप्ताहिक पंक्तियों में लॉग इन करें और निरंतरता बनाए रखने के लिए सक्रिय आदतों की स्ट्रीक्स देखें।',
    weeklyGoals: 'साप्ताहिक लक्ष्य',
    weeklyGoalsDesc: 'लक्ष्यों को प्राप्त करने योग्य चेकलिस्ट में विभाजित करें। निरंतरता बनाए रखने के लिए हर सोमवार को रीसेट करें।',
    studyPlanner: 'अध्ययन योजनाकार',
    studyPlannerDesc: 'अपने सीखने के मार्ग को व्यवस्थित करें। जटिल विषयों को चेकलिस्ट में विभाजित करें और अपनी कुल प्रगति प्रतिशत को ट्रैक करें।',
    jobAppTracker: 'नौकरी आवेदन ट्रैकर',
    jobAppTrackerDesc: 'अपनी नौकरी की खोज को व्यवस्थित करें। सबमिशन लॉग इन करें, इंटरव्यू ट्रैक करें, फॉलो-अप का दस्तावेजीकरण करें, और इंटरव्यू पाइपलाइनों का प्रबंधन करें।',

    // Footer
    footerDesc: 'आदत ट्रैकिंग, दैनिक योजना और करियर लॉग के लिए सर्वश्रेष्ठ उत्पादकता कॉकपिट।',
    allRightsReserved: 'सर्वाधिकार सुरक्षित।',

    // Dashboard Overview Page
    todayOverview: 'आज का अवलोकन',
    vsYesterday: 'कल की तुलना में',
    activeStreak: 'सक्रिय स्ट्रीक',
    streakGlow: 'दिन की स्ट्रीक',
    completionRate: 'पूर्णता दर',
    weeklyTarget: 'साप्ताहिक लक्ष्य प्रगति',
    focusHours: 'ध्यान केंद्रित घंटे',
    focusProgress: 'साप्ताहिक प्रगति',
    loggedApps: 'नौकरी आवेदन',
    remainingGoals: 'शेष लक्ष्य',
    checklist: 'कार्य सूची',
    timetable: 'समय सारिणी',
    noEvents: 'आज के लिए कोई कार्यक्रम निर्धारित नहीं है।',
    completed: 'पूर्ण',

    // Habits Page
    habitsTitle: 'आदतों की निरंतरता',
    createHabit: 'आदत बनाएं',
    activeHabits: 'सक्रिय आदतें',
    weeklyRoutines: 'साप्ताहिक आदतें लॉग की गईं',
    currentStreak: 'वर्तमान स्ट्रीक',
    longestStreak: 'सबसे लंबी स्ट्रीक',
    totalCompletion: 'कुल पूर्णता',
    streaksLabel: 'सक्रिय स्ट्रीक्स',
    habitsCompleted: 'आज पूर्ण की गईं',

    // Goals Page
    goalsTitle: 'साप्ताहिक लक्ष्य ट्रैकर',
    createGoal: 'लक्ष्य बनाएं',
    activeGoals: 'सक्रिय लक्ष्य',
    goalsRemaining: 'इस सप्ताह शेष',
    goalsCompleted: 'पूर्ण लक्ष्य',
    overallGoalsProgress: 'साप्ताहिक लक्ष्य प्रगति',

    // Applications Page
    applicationsTitle: 'नौकरी आवेदन',
    logApplication: 'आवेदन जोड़ें',
    todayLogged: 'आज के कुल लॉग',
    weeklySubmitted: 'साप्ताहिक जमा किए गए',
    activeInterviews: 'सक्रिय साक्षात्कार ट्रैक',
    scheduledInterviews: 'निर्धारित',
    jobAppsLabel: 'नौकरी आवेदन',
    searchApps: 'कंपनी का नाम, पद या नोट्स द्वारा खोजें...',
    allStatuses: 'सभी स्थितियाँ',

    // Topics Page
    topicsTitle: 'अध्ययन पाठ्यक्रम',
    createTopic: 'विषय बनाएं',
    totalTopics: 'कुल विषय',
    curriculumModules: 'पाठ्यक्रम मॉड्यूल लक्ष्य',
    topicsCompleted: 'पूर्ण',
    overallTopicsProgress: 'कुल प्रगति',
    searchTopics: 'नाम या श्रेणी के अनुसार विषय खोजें...',
    remainingToLearn: 'सीखने के लिए शेष',

    // Profile Settings
    profileSettings: 'प्रोफ़ाइल सेटिंग्स',
    personalInfo: 'व्यक्तिगत जानकारी',
    fullName: 'पूरा नाम',
    emailAddress: 'ईमेल पता',
    newPassword: 'नया पासवर्ड (वैकल्पिक)',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    systemNotifications: 'सिस्टम सूचनाएं',
    enableNotifications: 'पुश अलर्ट चालू करें',
    disableNotifications: 'पुश अलर्ट बंद करें',
    saveChanges: 'परिवर्तन सहेजें',
    passwordPlaceholder: 'नया पासवर्ड दर्ज करें',
    notificationsTitle: 'पुश सूचनाएं',
  },
  mr: {
    // Navbar & Layout
    features: 'वैशिष्ट्ये',
    solutions: 'उपाय',
    pricing: 'किंमती',
    testimonials: 'प्रशंसापत्रे',
    signIn: 'साइन इन करा',
    signUp: 'साइन अप करा',
    getStarted: 'सुरू करा',
    goToDashboard: 'डैशबोर्डवर जा',
    signOut: 'साइन आउट करा',
    accountSettings: 'खाते सेटिंग्ज',
    habits: 'सवयी',
    goals: 'ध्येये',
    overview: 'डॅशबोर्ड',
    applications: 'अर्ज',
    topics: 'अभ्यास',

    // Hero Section
    planYourDay: 'आपल्या दिवसाचे नियोजन करा.',
    buildYourHabits: 'आपल्या सवयी विकसित करा.',
    heroSubtitle: 'एकाच उच्च-कार्यक्षमता कार्यक्षेत्रात आपले वेळापत्रक व्यवस्थित करा. आपले ध्येय ट्रॅक करा, सवयींचे पालन करा आणि उत्कृष्ट नियोजन करा.',
    getStartedFree: 'मोफत सुरू करा',
    seeHowItWorks: 'हे कसे कार्य करते ते पहा',

    // Features Section
    dailyTimetable: 'दैनिक वेळापत्रक',
    dailyTimetableDesc: 'आपल्या दिवसाला केंद्रित स्लॉटमध्ये ब्लॉक करा. सखोल कामाला चालना द्या आणि आपल्या अर्जांच्या फॉलो-अपला व्यवस्थित करा.',
    habitTracker: 'सवय ट्रॅकर',
    habitTrackerDesc: 'सतत दिनचर्या विकसित करा. साप्ताहिक ओळींमध्ये नोंदी करा आणि सातत्य राखण्यासाठी सवयींचे सक्रिय स्ट्रीक्स पहा.',
    weeklyGoals: 'साप्ताहिक ध्येये',
    weeklyGoalsDesc: 'ध्येयांना साध्य करण्यायोग्य चेकलिस्टमध्ये विभाजित करा. सातत्य राखण्यासाठी दर सोमवारी रीसेट करा.',
    studyPlanner: 'अभ्यास नियोजक',
    studyPlannerDesc: 'आपला शिकण्याचा मार्ग व्यवस्थित करा. क्लिष्ट विषयांना चेकलिस्टमध्ये विभाजित करा आणि आपल्या एकूण प्रगतीची टक्केवारी ट्रॅक करा.',
    jobAppTracker: 'नोकरी अर्ज ट्रॅकर',
    jobAppTrackerDesc: 'आपली नोकरी शोध मोहीम व्यवस्थित करा. अर्ज सबमिट करा, मुलाखती ट्रॅक करा, फॉलो-अपची नोंद करा आणि मुलाखत पाइपलाइन व्यवस्थापित करा.',

    // Footer
    footerDesc: 'सवय ट्रॅकिंग, दैनिक नियोजन आणि करिअर लॉगसाठी सर्वोत्तम उत्पादकता कॉकपिट.',
    allRightsReserved: 'सर्व हक्क राखीव.',

    // Dashboard Overview Page
    todayOverview: 'आजचा आढावा',
    vsYesterday: 'कालच्या तुलनेत',
    activeStreak: 'सक्रिय स्ट्रीक',
    streakGlow: 'दिवसांची स्ट्रीक',
    completionRate: 'पूर्णतेचा दर',
    weeklyTarget: 'साप्ताहिक ध्येय प्रगती',
    focusHours: 'केंद्रित तास',
    focusProgress: 'साप्ताहिक प्रगती',
    loggedApps: 'नोकरीचे अर्ज',
    remainingGoals: 'उर्वरित ध्येये',
    checklist: 'कार्य सूची',
    timetable: 'वेळापत्रक',
    noEvents: 'आज कोणतेही वेळापत्रक नियोजित नाही.',
    completed: 'पूर्ण झाले',

    // Habits Page
    habitsTitle: 'सवयींचे सातत्य',
    createHabit: 'सवय तयार करा',
    activeHabits: 'सक्रिय सवयी',
    weeklyRoutines: 'साप्ताहिक सवयी नोंदवल्या',
    currentStreak: 'चालू स्ट्रीक',
    longestStreak: 'दीर्घकालीन स्ट्रीक',
    totalCompletion: 'एकूण पूर्णता',
    streaksLabel: 'सक्रिय स्ट्रीक्स',
    habitsCompleted: 'आज पूर्ण झालेल्या',

    // Goals Page
    goalsTitle: 'साप्ताहिक ध्येय ट्रॅकर',
    createGoal: 'ध्येय तयार करा',
    activeGoals: 'सक्रिय ध्येये',
    goalsRemaining: 'या आठवड्यात उर्वरित',
    goalsCompleted: 'पूर्ण झालेली ध्येये',
    overallGoalsProgress: 'साप्ताहिक ध्येय प्रगती',

    // Applications Page
    applicationsTitle: 'नोकरीचे अर्ज',
    logApplication: 'अर्ज नोंदवा',
    todayLogged: 'आजचे एकूण अर्ज',
    weeklySubmitted: 'साप्ताहिक सादर केलेले',
    activeInterviews: 'सक्रिय मुलाखती',
    scheduledInterviews: 'नियोजित',
    jobAppsLabel: 'नोकरी अर्ज',
    searchApps: 'कंपनीचे नाव, पद किंवा नोट्सद्वारे शोधा...',
    allStatuses: 'सर्व स्थिती',

    // Topics Page
    topicsTitle: 'अभ्यासक्रम',
    createTopic: 'विषय तयार करा',
    totalTopics: 'एकूण विषय',
    curriculumModules: 'अभ्यासक्रम मॉड्युल ध्येय',
    topicsCompleted: 'पूर्ण',
    overallTopicsProgress: 'एकूण प्रगती',
    searchTopics: 'नाव किंवा श्रेणीनुसार विषय शोधा...',
    remainingToLearn: 'शिकण्यासाठी उर्वरित',

    // Profile Settings
    profileSettings: 'प्रोफाइल सेटिंग्ज',
    personalInfo: 'वैयक्तिक माहिती',
    fullName: 'पूर्ण नाव',
    emailAddress: 'ईमेल पत्ता',
    newPassword: 'नवीन पासवर्ड (पर्यायी)',
    confirmPassword: 'पासवर्डची पुष्टी करा',
    systemNotifications: 'सिस्टम सूचना',
    enableNotifications: 'पुश अलर्ट चालू करा',
    disableNotifications: 'पुश अलर्ट बंद करा',
    saveChanges: 'बदल जतन करा',
    passwordPlaceholder: 'नवीन पासवर्ड टाका',
    notificationsTitle: 'पुश सूचना',
  }
};

export const useTranslation = () => {
  const { language } = useStore();
  const t = translations[language] || translations.en;
  return { t, language };
};
