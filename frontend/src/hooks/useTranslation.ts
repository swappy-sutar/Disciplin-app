import { useStore } from '../app/store';

const translations = {
  en: {
    // Navbar
    features: 'Features',
    solutions: 'Solutions',
    pricing: 'Pricing',
    testimonials: 'Testimonials',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    getStarted: 'Get Started',
    goToDashboard: 'Go to Dashboard',

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
  },
  hi: {
    // Navbar
    features: 'विशेषताएं',
    solutions: 'समाधान',
    pricing: 'कीमतें',
    testimonials: 'प्रशंसापत्र',
    signIn: 'साइन इन',
    signUp: 'साइन अप',
    getStarted: 'शुरू करें',
    goToDashboard: 'डैशबोर्ड पर जाएं',

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
  },
  mr: {
    // Navbar
    features: 'वैशिष्ट्ये',
    solutions: 'उपाय',
    pricing: 'किंमती',
    testimonials: 'प्रशंसापत्रे',
    signIn: 'साइन इन करा',
    signUp: 'साइन अप करा',
    getStarted: 'सुरू करा',
    goToDashboard: 'डैशबोर्डवर जा',

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
  }
};

export const useTranslation = () => {
  const { language } = useStore();
  const t = translations[language] || translations.en;
  return { t, language };
};
