import { Exercise, EducationCard, Resource } from '@/types';

// Placeholder exercise data
export const exercisesData: Exercise[] = [
  {
    id: 'box-breathing',
    title: 'Box Breathing',
    description: 'Master the 4-4-4-4 breathing technique used by athletes and Navy SEALs to maintain focus under pressure.',
    category: 'breathing',
    duration: 1,
    difficulty: 'beginner',
    instructions: [
      'Sit or stand in a comfortable position',
      'Inhale through your nose for 4 counts',
      'Hold your breath for 4 counts',
      'Exhale through your mouth for 4 counts',
      'Hold empty for 4 counts',
      'Repeat for 4 complete rounds'
    ],
    benefits: [
      'Improves focus and concentration',
      'Reduces stress and anxiety',
      'Enhances mental clarity',
      'Builds emotional regulation',
      'Activates calm nervous system response'
    ],
    tags: ['breathing', 'focus', 'stress-relief', 'performance', 'navy-seal-technique'],
  },
  {
    id: 'body-scan',
    title: 'Guided Body Scan',
    description: 'A systematic mindfulness practice to cultivate deep body awareness, release tension, and calm the nervous system.',
    category: 'mindfulness',
    duration: 11,
    difficulty: 'beginner',
    instructions: [
      'Find a quiet place and lie down or sit comfortably with your back supported',
      'Close your eyes and take 3 slow, deep breaths—soften your jaw and shoulders',
      'Bring gentle attention to the crown of your head—notice any sensation',
      'Move attention slowly to your forehead and eyes—relax any tension',
      'Scan your jaw, neck, and throat—allow them to soften',
      'Bring awareness to your shoulders, then down each arm to the hands and fingers',
      'Notice your chest and the natural rise and fall of your breath',
      'Rest attention in your abdomen—allow it to expand naturally',
      'Shift focus to your lower back and hips—release any gripping',
      'Move through thighs, knees, calves, ankles, and finally the feet and toes',
      'Take a final full-body awareness—sense your body as a whole',
      'End with 2–3 deep breaths and gently open your eyes'
    ],
    benefits: [
      'Enhances interoceptive awareness',
      'Reduces physical and mental tension',
      'Improves emotional regulation',
      'Supports recovery and stress balance',
      'Builds mindfulness consistency'
    ],
    tags: ['mindfulness', 'body-scan', 'relaxation', 'awareness', 'recovery', 'calming'],
  },
  {
    id: 'mantra-meditation',
    title: 'Mantra Meditation',
    description: 'Repeat an empowering present-tense mantra to build focus, confidence, and emotional stability.',
    category: 'mindfulness',
    duration: 5,
    difficulty: 'beginner',
    instructions: [
      'Choose a positive present-tense mantra (e.g. "I am focused")',
      'Sit upright, relaxed but alert',
      'Repeat the mantra mentally or aloud at a steady rhythm',
      'If distracted, gently return to the phrase without judgment',
      'Feel the meaning of the words as you repeat',
      'Continue for several minutes or a set number of repetitions'
    ],
    benefits: [
      'Builds attentional control',
      'Enhances confidence and self-talk',
      'Reduces intrusive thoughts',
      'Improves emotional regulation'
    ],
    tags: ['mindfulness', 'focus', 'confidence', 'self-talk', 'affirmation'],
  },
  {
    id: 'post-performance-reflection',
    title: 'Post-Performance Reflection',
    description: 'Integrate your performance by identifying strengths, challenges, emotions, and next-step adjustments to build resilient confidence.',
    category: 'confidence',
    duration: 5,
    difficulty: 'beginner',
    instructions: [
      'Find a quiet space and take 2 steady breaths',
      'List 2–3 things that went well (evidence of capability)',
      'Note 1–2 challenges objectively (no self-blame)',
      'Describe emotional shifts across phases',
      'Define one concrete adjustment or mental cue for next time',
      'Complete the confidence integration phrase',
      'Review insights before your next session' 
    ],
    benefits: [
      'Builds adaptive confidence',
      'Improves emotional awareness',
      'Transforms setbacks into adjustments',
      'Reinforces strengths explicitly'
    ],
    tags: ['reflection', 'confidence', 'growth', 'learning', 'mental-skills'],
  },
  {
    id: 'progressive-muscle-relaxation',
    title: 'Progressive Muscle Relaxation',
    description: 'Systematically tense then release muscle groups from feet to face to build body awareness and reduce tension.',
    category: 'recovery',
    duration: 2,
    difficulty: 'beginner',
    instructions: [
      'Find a comfortable seated or lying position',
      'Start with feet: tense strongly for ~5 seconds, then release',
      'Move upward through calves, thighs, glutes, abdomen, chest, hands, arms, shoulders, neck, face',
      'Notice contrast between tension and relaxation in each area',
      'Finish with a gentle full-body tension and complete release',
      'Breathe slowly and evenly throughout'
    ],
    benefits: [
      'Reduces physical tension',
      'Improves interoceptive awareness',
      'Calms nervous system',
      'Supports recovery and sleep'
    ],
    tags: ['relaxation', 'recovery', 'body-awareness', 'reset'],
  },
  {
    id: 'gratitude-journal',
    title: 'Gratitude Journal',
    description: 'Structured micro-reflection to anchor small wins, build positive focus, and reinforce self-compassion after training or competition.',
    category: 'confidence',
    duration: 5,
    difficulty: 'beginner',
    instructions: [
      'Take 2 slow breaths to transition out of training mindset',
      'List 3 things you are grateful for from today',
      'List 3 things you are proud of yourself for',
      'Notice how your mood shifts as you write',
      'Optional: write one short affirmation integrating a gratitude or strength',
      'Review entries and carry forward one word or theme'
    ],
    benefits: [
      'Builds positive mindset',
      'Increases self-compassion',
      'Improves emotional regulation',
      'Enhances focus & clarity',
      'Supports relaxation & recovery'
    ],
    tags: ['gratitude', 'reflection', 'confidence', 'mindset', 'journaling'],
  },
  {
    id: 'five-senses-awareness',
    title: 'Five Senses Awareness',
    description: 'Ground yourself in the present by noticing 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.',
    category: 'mindfulness',
    duration: 4,
    difficulty: 'beginner',
    instructions: [
      'Pause and take a slow breath',
      'List 5 things you can see',
      'List 4 things you can touch',
      'List 3 things you can hear',
      'List 2 things you can smell',
      'List 1 thing you can taste',
      'Notice the shift in your body and attention'
    ],
    benefits: [
      'Reduces anxiety via grounding',
      'Improves present-moment awareness',
      'Calms nervous system',
      'Enhances sensory focus'
    ],
    tags: ['mindfulness', 'grounding', 'anxiety', 'senses', 'present-moment'],
  },
  {
    id: 'visualization',
    title: 'Visualization',
    description: 'Visualize a successful performance. Feel the emotions and sensations of success, stay present in the game, and lock into flow.',
    category: 'visualization',
    duration: 5,
    difficulty: 'beginner',
    instructions: [
      'Close your eyes and take a slow breath',
      'Picture the setting of your performance or game vividly',
      'Visualize yourself executing with confidence and flow',
      'Stay present and focus on actions, not outcomes',
      'Anchor one word that captures this state (e.g., “Flow”)'
    ],
    benefits: [
      'Builds confidence through mental rehearsal',
      'Enhances focus on controllables',
      'Promotes flow state familiarity',
      'Reduces performance anxiety'
    ],
    tags: ['visualization', 'confidence', 'focus', 'flow', 'performance'],
  },
  {
    id: 'open-awareness',
    title: 'Open Awareness Meditation',
    description: 'Sit quietly and let your attention roam freely. Observe sounds, sensations, and sights without judgment. Stay curious and inclusive.',
    category: 'mindfulness',
    duration: 5,
    difficulty: 'beginner',
    instructions: [
      'Sit comfortably and soften the shoulders',
      'Open awareness to include sounds, sensations, and sights',
      'Observe experiences arise and pass without judgment',
      'Gently widen attention when it narrows',
      'Optionally note a reflection of what you noticed'
    ],
    benefits: [
      'Builds non-judgmental awareness',
      'Enhances attentional flexibility',
      'Reduces reactivity',
      'Supports calm and curiosity'
    ],
    tags: ['mindfulness', 'awareness', 'non-judgment', 'curiosity', 'present-moment'],
  },
];

// Placeholder education content
export const educationData: EducationCard[] = [
  // Moved editorial resources from resources into education as linkable cards
  {
    id: 'ed-7',
    title: 'Strength Isn’t Just Physical: Exploring Athletes’ Mental Health',
    description: 'Overview of prevalence, stigma, and why mental health matters in sport.',
    category: 'myths',
    readTime: 8,
  content: '',
    url: 'https://www.mcleanhospital.org/essential/athlete-mh?',
    tags: ['article', 'stigma', 'destigmatization', 'mental-health'],
  },
  {
    id: 'ed-8',
    title: 'The Importance of Mental Health in Sports',
    description: 'Resilience, mind–body connection, and performance benefits of well-being.',
    category: 'confidence',
    readTime: 7,
  content: '',
    url: 'https://www.massgeneralbrigham.org/en/about/newsroom/articles/the-importance-of-mental-health-in-sports?',
    tags: ['article', 'resilience', 'mind-body', 'performance'],
  },
  {
    id: 'ed-9',
    title: 'Mental Health in Athletes: Breaking the Stigma',
    description: 'Stigma, common conditions, and when to seek help.',
    category: 'myths',
    readTime: 3,
  content: '',
    url: 'https://health.clevelandclinic.org/mental-health-in-athletes?',
    tags: ['article', 'stigma', 'anxiety', 'depression'],
  },
  {
    id: 'ed-10',
    title: 'The Mental Health Crisis in Sports: The Perfect Storm of Contemporary Factors',
    description: 'Youth risk factors, social pressures, and systemic contributors.',
    category: 'anxiety',
    readTime: 5,
  content: '',
    url: 'https://nata.kglmeridian.com/view/journals/attr/58/9/article-p677.xml?',
    tags: ['article', 'youth', 'risk', 'pressures'],
  },
  {
    id: 'ed-11',
    title: 'The Mental Health of Elite Athletes: A Narrative Systematic Review',
    description: 'Clinical insights into prevalence, risk, and protective factors at the elite level.',
    category: 'anxiety',
    readTime: 20,
  content: '',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4996886',
    tags: ['article', 'elite', 'clinical', 'research'],
  },
  {
    id: 'ed-12',
    title: 'Inside the Recovery: Athletes’ Mental Health and Injuries',
    description: 'How injuries affect mental health and the road to recovery.',
    category: 'injury',
    readTime: 7,
  content: '',
    url: 'https://www.youtube.com/watch?v=baKEGeQeDug',
    tags: ['video', 'injury', 'recovery', 'mental-health'],
  },
  {
    id: 'ed-13',
    title: 'The mental health crisis in college sports (Cailin Bracken talk)',
    description: 'First-hand perspective on student-athlete pressures and support needs.',
    category: 'anxiety',
    readTime: 18,
  content: '',
    url: 'https://www.youtube.com/watch?v=kQ8mxNpP5mc',
    tags: ['video', 'college', 'pressures', 'student-athlete'],
  },
  {
    id: 'ed-14',
    title: 'For NCAA Student-Athletes’ Mental Health: A More Educated …',
    description: 'Awareness, education, and campus care pathways for student-athletes.',
    category: 'anxiety',
    readTime: 4,
  content: '',
    url: 'https://www.youtube.com/watch?v=IvPhn4FZhxg',
    tags: ['video', 'awareness', 'education', 'campus'],
  },
  {
    id: 'ed-15',
    title: 'Dear Sports – More Than an Athlete (Tribute Video)',
    description: 'Identity beyond sport and the human side of athletes.',
    category: 'confidence',
    readTime: 3,
  content: '',
    url: 'https://www.youtube.com/watch?v=DlT3NAoU_rQ',
    tags: ['video', 'identity', 'motivation', 'purpose'],
  },
  {
    id: 'ed-16',
    title: 'Mental Health in High School Sports',
    description: 'Youth education and awareness for athletes, parents, and coaches.',
    category: 'anxiety',
    readTime: 7,
  content: '',
    url: 'https://www.youtube.com/watch?v=4azkLJc3RbQ',
    tags: ['video', 'youth', 'education', 'awareness'],
  },
];

// Placeholder resource data
export const resourcesData: Resource[] = [
  {
    id: 'r1',
    title: 'National Suicide Prevention Lifeline (U.S.) – 988',
    description: 'Free and confidential crisis support via call or chat in the U.S.',
    type: 'hotline',
    contact: 'https://988lifeline.org',
    availability: '24/7',
    isEmergency: true,
    tags: ['crisis', 'suicide', 'hotline', 'US', 'support'],
  },
  {
    id: 'r2',
    title: 'Kids Help Phone (Canada)',
    description: 'Youth crisis and counseling support by phone, text, and chat in Canada.',
    type: 'hotline',
    contact: 'https://kidshelpphone.ca',
    availability: '24/7',
    isEmergency: true,
    tags: ['crisis', 'youth', 'Canada', 'text', 'chat'],
  },
  {
    id: 'r3',
    title: 'Crisis Text Line (U.S., U.K., Canada, Ireland)',
    description: 'Text-based crisis help available in multiple countries.',
    type: 'hotline',
    contact: 'https://www.crisistextline.org',
    availability: '24/7',
    isEmergency: true,
    tags: ['crisis', 'text', 'US', 'UK', 'Canada', 'Ireland'],
  },
  {
    id: 'r4',
    title: 'SAMHSA’s National Helpline (U.S.)',
    description: '24/7 treatment referral and information for mental health and substance use.',
    type: 'hotline',
    contact: 'https://www.samhsa.gov/find-help/national-helpline',
    availability: '24/7',
    isEmergency: false,
    tags: ['addiction', 'mental-health', 'US', 'helpline', 'treatment'],
  },
  {
    id: 'r6',
    title: 'NCAA Mental Health Best Practices',
    description: 'Guidance for supporting the mental health of student-athletes.',
    type: 'website',
    contact: 'https://www.ncaa.org/sports/2016/5/2/mental-health-best-practices.aspx',
    tags: ['NCAA', 'student-athlete', 'guide', 'best-practices'],
  },
  {
    id: 'r7',
    title: 'Jed Foundation – Mental Health Resources',
    description: 'Resource center focused on college student mental health.',
    type: 'website',
    contact: 'https://jedfoundation.org/mental-health-resource-center',
    tags: ['college', 'students', 'resources', 'JED'],
  },
  {
    id: 'r9',
    title: 'HeadsUpGuys',
    description: 'Practical resources for men’s mental health and suicide prevention.',
    type: 'website',
    contact: 'https://headsupguys.org',
    tags: ['men', 'mental-health', 'suicide-prevention', 'resources'],
  },
  {
    id: 'r10',
    title: 'Talkspace – Online Therapy Platform',
    description: 'Virtual therapy access with licensed professionals.',
    type: 'professional',
    contact: 'https://www.talkspace.com',
    tags: ['therapy', 'online', 'virtual', 'counseling'],
  },
];

// Helper functions to get data
export const getExerciseById = (id: string): Exercise | undefined => {
  return exercisesData.find(exercise => exercise.id === id);
};

export const getExercisesByCategory = (category: string): Exercise[] => {
  return exercisesData.filter(exercise => exercise.category === category);
};

export const getEducationById = (id: string): EducationCard | undefined => {
  return educationData.find(card => card.id === id);
};

export const getEducationByCategory = (category: string): EducationCard[] => {
  return educationData.filter(card => card.category === category);
};

export const getResourcesByType = (type: string): Resource[] => {
  return resourcesData.filter(resource => resource.type === type);
};

export const searchResources = (query: string): Resource[] => {
  const lowerQuery = query.toLowerCase();
  return resourcesData.filter(resource => 
    resource.title.toLowerCase().includes(lowerQuery) ||
    resource.description.toLowerCase().includes(lowerQuery) ||
    resource.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};
