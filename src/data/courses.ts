
export interface Slide {
  title: string;
  content: string; // Markdown
  image?: string; // URL to illustration (fallback)
  imageAlt?: string;
  visualType?: 
    | 'pyramid-intro' 
    | 'pyramid-levels' 
    | 'brain-cognitive' 
    | 'puzzle-mece'
    | 'scale-fact-opinion'
    | 'fog-clarity'
    | 'magnifying-glass'
    | 'rule-of-three'
    | 'pattern-three'
    | 'path-options'
    | 'target-arrow'
    | 'checklist'
    | 'email-comparison'
    | 'ladder-abstraction'
    | 'velcro-teflon'
    | 'dance-abstract-concrete'
    | 'prep-framework'
    | 'timeline-ppf'
    | 'pause-button';
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
  isLocked: boolean;
  type: 'video' | 'exercise' | 'quiz' | 'reading';
  content?: string; // Legacy support or for simple lessons
  slides?: Slide[]; // For structured, illustrated lessons
  exercisePrompt?: string; // For exercises
}

export interface CourseData {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  level: string;
  duration: string;
  lessonsCount: number;
  xp: number;
  progress: number;
  imageGradient: string;
  modules: {
    title: string;
    lessons: Lesson[];
  }[];
}

export const CLEAR_THINKING_COURSE: CourseData = {
  id: 'clear-thinking',
  title: 'Clear Thinking',
  description: 'Learn to organize your thoughts and articulate complex ideas with precision.',
  longDescription: "In a world of noise, clarity is a superpower. This course isn't just about speaking—it's about thinking. You'll learn how to structure your ideas before you speak, use mental models to analyze problems, and deliver your message with undeniable logic and precision. Perfect for leaders, presenters, and anyone who wants to be understood the first time.",
  level: 'Intermediate',
  duration: '4.5h',
  lessonsCount: 16,
  xp: 850,
  progress: 0,
  imageGradient: 'from-blue-500 to-indigo-600',
  modules: [
    {
      title: 'Module 1: The Foundation of Logic',
      lessons: [
        { 
          id: 'l1-1', 
          title: 'The Pyramid Principle', 
          duration: '8 min', 
          isCompleted: false, 
          isLocked: false, 
          type: 'reading',
          slides: [
            {
              title: "What is the Pyramid Principle?",
              content: "The Pyramid Principle is a communication framework created by Barbara Minto at McKinsey & Company. It suggests that your ideas should be organized in a pyramid structure, starting with the most important information first.",
              image: "https://picsum.photos/seed/pyramid/800/600",
              imageAlt: "Abstract pyramid structure",
              visualType: 'pyramid-intro'
            },
            {
              title: "The Three Levels",
              content: "1. **Start with the answer first.** (The top of the pyramid)\n2. **Group and summarize your supporting arguments.** (The middle level)\n3. **Order your supporting ideas logically.** (The base level)",
              image: "https://picsum.photos/seed/structure/800/600",
              imageAlt: "Hierarchical structure diagram",
              visualType: 'pyramid-levels'
            },
            {
              title: "Why it works",
              content: "By starting with the main point, you reduce the cognitive load on your audience. They don't have to guess where you are going; they can focus on *why* your conclusion is correct.",
              image: "https://picsum.photos/seed/brain/800/600",
              imageAlt: "Brain and cognitive load illustration",
              visualType: 'brain-cognitive'
            },
            {
              title: "Key Concepts",
              content: "- **Top-Down Thinking:** Always start with the conclusion.\n- **Mutually Exclusive, Collectively Exhaustive (MECE):** Ensure your arguments cover the whole problem without overlapping.",
              image: "https://picsum.photos/seed/puzzle/800/600",
              imageAlt: "Puzzle pieces fitting together",
              visualType: 'puzzle-mece'
            }
          ]
        },
        { 
          id: 'l1-2', 
          title: 'Practice: Build Your Pyramid', 
          duration: '15 min', 
          isCompleted: false, 
          isLocked: true, 
          type: 'exercise',
          exercisePrompt: "Think of a recent decision you made at work or in your personal life. Structure your explanation using the Pyramid Principle. Start with your conclusion, then list 3 supporting arguments."
        },
        { 
          id: 'l1-3', 
          title: 'Separating Fact from Opinion', 
          duration: '10 min', 
          isCompleted: false, 
          isLocked: true, 
          type: 'reading',
          slides: [
            {
              title: "Fact vs. Opinion",
              content: "Clear thinking requires distinguishing between objective reality (facts) and subjective interpretation (opinions).\n\n- **Fact:** A statement that can be proven true or false. \"The meeting started at 10:00 AM.\"\n- **Opinion:** A statement of belief or feeling. \"The meeting was too long.\"",
              image: "https://picsum.photos/seed/scale/800/600",
              imageAlt: "Balance scale weighing fact and opinion",
              visualType: 'scale-fact-opinion'
            },
            {
              title: "The Danger of Blurring",
              content: "When we present opinions as facts, we lose credibility. When we treat facts as opinions, we lose touch with reality.",
              image: "https://picsum.photos/seed/fog/800/600",
              imageAlt: "Foggy landscape representing confusion",
              visualType: 'fog-clarity'
            },
            {
              title: "Strategy: The Proof Test",
              content: "Always ask: \"How would I prove this?\" If you can't prove it with data or observation, it's likely an opinion.",
              image: "https://picsum.photos/seed/magnify/800/600",
              imageAlt: "Magnifying glass examining details",
              visualType: 'magnifying-glass'
            }
          ]
        },
        { 
          id: 'l1-4', 
          title: 'Practice: The Fact-Check Challenge', 
          duration: '12 min', 
          isCompleted: false, 
          isLocked: true, 
          type: 'exercise',
          exercisePrompt: "Read the following statement and identify which parts are facts and which are opinions: 'Our project is failing because the timeline is unrealistic. We missed two deadlines last week, and the team is demoralized.'"
        },
      ]
    },
    {
      title: 'Module 2: Structuring Your Message',
      lessons: [
        { 
          id: 'l2-1', 
          title: 'The Rule of Three', 
          duration: '6 min', 
          isCompleted: false, 
          isLocked: true, 
          type: 'reading',
          slides: [
            {
              title: "The Power of Three",
              content: "The Rule of Three is a writing principle that suggests that a trio of events or characters is more humorous, satisfying, or effective than other numbers.",
              image: "https://picsum.photos/seed/three/800/600",
              imageAlt: "Number three artistic representation",
              visualType: 'rule-of-three'
            },
            {
              title: "Why Three?",
              content: "Three is the smallest number required to create a pattern. It combines brevity with rhythm.\n\n*   \"Life, liberty, and the pursuit of happiness\"\n*   \"Blood, sweat, and tears\"\n*   \"Stop, look, and listen\"",
              image: "https://picsum.photos/seed/pattern/800/600",
              imageAlt: "Geometric pattern",
              visualType: 'pattern-three'
            },
            {
              title: "Applying it",
              content: "When you present options, offer three. When you list reasons, list three. It feels complete without being overwhelming.",
              image: "https://picsum.photos/seed/options/800/600",
              imageAlt: "Three path options",
              visualType: 'path-options'
            }
          ]
        },
        { 
          id: 'l2-2', 
          title: 'Practice: Rewrite with Rule of 3', 
          duration: '10 min', 
          isCompleted: false, 
          isLocked: true, 
          type: 'exercise',
          exercisePrompt: "Take this list of 7 items and group them into 3 logical categories: Apples, Pears, Carrots, Broccoli, Bananas, Spinach, Oranges."
        },
        { 
          id: 'l2-3', 
          title: 'Bottom-Line Up Front (BLUF)', 
          duration: '8 min', 
          isCompleted: false, 
          isLocked: true, 
          type: 'reading',
          slides: [
            {
              title: "What is BLUF?",
              content: "BLUF is a standard in military communication that has been adopted by the business world. It means putting the most important information—the \"bottom line\"—at the very beginning of your message.",
              image: "https://picsum.photos/seed/arrow/800/600",
              imageAlt: "Direct arrow hitting target",
              visualType: 'target-arrow'
            },
            {
              title: "How to use BLUF",
              content: "1. **Identify the core message.** What do you want the recipient to know or do?\n2. **Put it in the first sentence.** Don't bury the lead.\n3. **Provide context afterwards.**",
              image: "https://picsum.photos/seed/checklist/800/600",
              imageAlt: "Checklist on a clipboard",
              visualType: 'checklist'
            },
            {
              title: "Example: Bad vs Good",
              content: "**Bad:** \"I was looking at the data from last week and noticed a trend...\"\n\n**Good (BLUF):** \"We need to increase our budget by 10% to meet the Q3 target. Here is the data that supports this...\"",
              image: "https://picsum.photos/seed/email/800/600",
              imageAlt: "Email comparison",
              visualType: 'email-comparison'
            }
          ]
        },
        { 
          id: 'l2-4', 
          title: 'Practice: Email Makeover (BLUF)', 
          duration: '15 min', 
          isCompleted: false, 
          isLocked: true, 
          type: 'exercise',
          exercisePrompt: "Rewrite the following email using BLUF: 'Hi team, I was thinking about the upcoming presentation and realized we might need more time. The client asked for some extra slides. So, can we move the meeting to Friday?'"
        },
      ]
    },
    {
      title: 'Module 3: Precision in Language',
      lessons: [
        { id: 'l3-1', title: 'Eliminating Filler Words', duration: '10 min', isCompleted: false, isLocked: true, type: 'video' },
        { id: 'l3-2', title: 'Drill: The "Um" Counter', duration: '20 min', isCompleted: false, isLocked: true, type: 'exercise', exercisePrompt: "Record yourself speaking for 1 minute about your favorite hobby. Count how many times you say 'um', 'uh', or 'like'." },
        { 
          id: 'l3-3', 
          title: 'Concrete vs. Abstract Language', 
          duration: '12 min', 
          isCompleted: false, 
          isLocked: true, 
          type: 'reading',
          slides: [
            {
              title: "The Ladder of Abstraction",
              content: "Language exists on a ladder. At the top, ideas are abstract and vague. At the bottom, they are concrete and specific.\n\n**Abstract:** \"Vehicle\"\n**Concrete:** \"Red 1967 Ford Mustang\"",
              image: "https://picsum.photos/seed/ladder/800/600",
              imageAlt: "Ladder illustration",
              visualType: 'ladder-abstraction'
            },
            {
              title: "Why Concrete Sticks",
              content: "Our brains are wired to remember images and sensory details. Abstract concepts slide off the brain like Teflon; concrete details stick like Velcro.",
              image: "https://picsum.photos/seed/velcro/800/600",
              imageAlt: "Velcro texture",
              visualType: 'velcro-teflon'
            },
            {
              title: "The Abstract-Concrete Dance",
              content: "Great communicators move up and down the ladder. They state a high-level principle (Abstract), then immediately ground it with a specific example (Concrete).",
              image: "https://picsum.photos/seed/dance/800/600",
              imageAlt: "Dancers moving",
              visualType: 'dance-abstract-concrete'
            }
          ]
        },
        { id: 'l3-4', title: 'Practice: Make it Concrete', duration: '15 min', isCompleted: false, isLocked: true, type: 'exercise', exercisePrompt: "Turn this abstract statement into a concrete one: 'We need to improve performance soon.'" },
      ]
    },
    {
      title: 'Module 4: Advanced Applications',
      lessons: [
        { id: 'l4-1', title: 'Handling Q&A with Grace', duration: '15 min', isCompleted: false, isLocked: true, type: 'video' },
        { id: 'l4-2', title: 'Simulation: The Hot Seat', duration: '25 min', isCompleted: false, isLocked: true, type: 'exercise', exercisePrompt: "Simulate a Q&A session. Imagine you are defending a controversial proposal. Answer 3 tough questions." },
        { 
          id: 'l4-3', 
          title: 'Structuring Impromptu Responses', 
          duration: '10 min', 
          isCompleted: false, 
          isLocked: true, 
          type: 'reading',
          slides: [
            {
              title: "The PREP Framework",
              content: "When caught off guard, use PREP to structure your answer instantly:\n\n1. **P**oint (State your main idea)\n2. **R**eason (Why is this true?)\n3. **E**xample (Give evidence)\n4. **P**oint (Restate your main idea)",
              image: "https://picsum.photos/seed/structure/800/600",
              imageAlt: "Building blocks structure",
              visualType: 'prep-framework'
            },
            {
              title: "The Past-Present-Future Model",
              content: "Another great structure for updates or status reports:\n\n- **Past:** What have we done?\n- **Present:** Where are we now?\n- **Future:** What comes next?",
              image: "https://picsum.photos/seed/timeline/800/600",
              imageAlt: "Timeline illustration",
              visualType: 'timeline-ppf'
            },
            {
              title: "Buying Time",
              content: "Need a moment to think? Don't say \"Um...\" \n\nInstead, pause, take a breath, or repeat the question: \"That's an important question. Let me break it down...\"",
              image: "https://picsum.photos/seed/pause/800/600",
              imageAlt: "Pause button symbol",
              visualType: 'pause-button'
            }
          ]
        },
        { id: 'l4-4', title: 'Final Assessment: The Pitch', duration: '30 min', isCompleted: false, isLocked: true, type: 'quiz' },
      ]
    }
  ]
};
