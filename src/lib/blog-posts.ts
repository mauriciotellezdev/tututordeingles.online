export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  content: string[];
  category: string;
  relatedSlugs: string[];
}

export function getReadingTime(content: string[]): number {
  const words = content.join(" ").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export const blogPosts: BlogPost[] = [
  {
    slug: "25-common-interview-questions-in-english",
    title: "25 Common Interview Questions in English (With Sample Answers)",
    description:
      "The most common English interview questions asked by US hiring managers, with sample answers and tips to sound confident and natural.",
    date: "2026-06-04",
    category: "Interviews",
    relatedSlugs: [
      "star-method-interview-answers",
      "interview-vocabulary-for-professionals",
      "how-to-describe-work-experience",
      "how-to-answer-tell-me-about-yourself",
    ],
    content: [
      "\u{1F4D8} Resumen en español: Estas son las 25 preguntas más comunes en entrevistas de trabajo en Estados Unidos. Incluye ejemplos de respuestas y estrategias para profesionistas mexicanos y LATAM que buscan trabajo en empresas estadounidenses. Si te has quedado en blanco durante una entrevista en inglés, esta guía te ayudará a prepararte con respuestas naturales y efectivas.",

      "If you're a Spanish-speaking professional preparing for a job interview in English, you've probably noticed the questions feel different. They're more behavioral. More open-ended. And the pressure of speaking in a second language makes it harder to think on your feet.",
      "This guide covers the 25 most common interview questions asked by US hiring managers, with sample answers and strategies to help you respond naturally — not like you memorized a script.",

      "## 1. Tell Me About Yourself",
      "This is almost always the first question. Keep it professional and structured: past (your experience), present (your current role), future (why you want this job).",
      "**Sample answer:** \"I'm a software engineer with five years of experience building web applications at Mexican tech companies. Currently, I lead a team of four developers, and I'm looking for an opportunity to work with a US-based engineering team where I can contribute my technical skills and continue growing professionally.\"",

      "## 2. Why Do You Want to Work Here?",
      "Research the company before the interview. Mention something specific about their product, culture, or mission.",
      "**Sample answer:** \"I admire how your company approaches remote collaboration. Your engineering blog posts about distributed teams really resonated with me because I've been working remotely for three years.\"",

      "## 3. What Are Your Strengths?",
      "Pick a strength relevant to the role and back it up with a specific example.",
      "**Sample answer:** \"My strongest skill is debugging complex systems. Last quarter, I identified and resolved a performance issue that was affecting 20% of our users. I enjoy the detective work of finding root causes.\"",

      "## 4. What Are Your Weaknesses?",
      "Be honest, but show self-awareness and active improvement.",
      "**Sample answer:** \"I used to struggle with public speaking in English. I joined a speaking practice group and started preparing presentations for my team. I'm much more comfortable now, but I still make an effort to improve every week.\"",

      "## 5. Tell Me About a Time You Faced a Challenge",
      "Use the STAR method: Situation, Task, Action, Result.",
      "**Sample answer:** \"We had a critical production outage during a holiday weekend. I organized a small team, identified the root cause within two hours, and deployed a fix. We recovered service before the next business day.\"",

      "## 6. Where Do You See Yourself in Five Years?",
      "Show ambition that aligns with the company's growth.",
      "**Sample answer:** \"I want to grow into a senior engineering role and eventually lead larger teams. I see this position as a step toward that goal because of the mentorship culture your company promotes.\"",

      "## 7. Why Should We Hire You?",
      "Summarize your unique value in 2–3 sentences.",
      "**Sample answer:** \"I bring strong technical skills, experience working across time zones, and the ability to communicate clearly in English. I've been collaborating with US-based teams for two years and understand the cultural differences in communication.\"",

      "## 8. Tell Me About a Time You Worked in a Team",
      "Highlight your role and how you contributed to the team's success.",
      "**Sample answer:** \"We were building a new feature under a tight deadline. I volunteered to handle the API integration while my teammate focused on the frontend. We shipped on time and the feature was adopted by 90% of users in the first month.\"",

      "## 9. Describe a Time You Had a Conflict With a Coworker",
      "Focus on resolution, not blame.",
      "**Sample answer:** \"A teammate and I disagreed about the architecture for a new service. Instead of arguing, we wrote a quick prototype for both approaches and presented the tradeoffs to the team. We ended up combining elements from both ideas.\"",

      "## 10. How Do You Handle Pressure?",
      "Give a concrete example of performing under stress.",
      "**Sample answer:** \"I stay calm under pressure by focusing on what I can control. During a major system migration, I broke the work into small tasks and tracked progress daily. The migration completed ahead of schedule.\"",

      "## 11. What Do You Know About Our Company?",
      "Show you've done your homework.",
      "**Sample answer:** \"Your company recently launched a new AI-powered analytics platform. I read the case study about how it helped a client reduce operational costs by 30%.\"",

      "## 12. Why Did You Leave Your Last Job?",
      "Stay positive. Focus on growth, not frustration.",
      "**Sample answer:** \"I learned a lot at my previous company, but I'm ready for a new challenge. I want to work with a more international team and expand my experience.\"",

      "## 13. What Is Your Greatest Accomplishment?",
      "Pick something measurable and impressive.",
      "**Sample answer:** \"I led the migration of our monolithic application to microservices. The project took eight months and involved coordinating with five teams. After the migration, deployment time dropped from hours to minutes.\"",

      "## 14. How Do You Prioritize Your Work?",
      "Show you have a system.",
      "**Sample answer:** \"I start each day by identifying the most impactful task and doing it first. I use a priority matrix to separate urgent from important tasks.\"",

      "## 15. Tell Me About a Time You Made a Mistake",
      "Own it and explain what you learned.",
      "**Sample answer:** \"I once deployed a change without enough testing and it caused a minor outage. Now I always add automated tests before deploying, and I run changes by a teammate for review first.\"",

      "## 16. Are You Comfortable Working in English?",
      "This is a common question for non-native speakers. Be honest but confident.",
      "**Sample answer:** \"Yes, I'm comfortable. I've been working in English daily for two years — writing documentation, attending meetings, and communicating with US colleagues. I still learn new expressions every day, but it doesn't hold me back.\"",

      "## 17. What Is Your Communication Style?",
      "Emphasize clarity and adaptability.",
      "**Sample answer:** \"I believe in over-communicating rather than under-communicating. I write clear documentation, confirm understanding after meetings, and I'm not afraid to ask questions when something isn't clear.\"",

      "## 18. Describe Your Ideal Manager",
      "Focus on what helps you do your best work.",
      "**Sample answer:** \"I work best with managers who provide clear expectations and regular feedback. I appreciate when a manager trusts me to do my work but is available for support when needed.\"",

      "## 19. How Do You Stay Motivated?",
      "Connect motivation to your work.",
      "**Sample answer:** \"I'm motivated by solving real problems. When I see my code improve someone's workflow or fix an issue they've been struggling with, that's what keeps me engaged.\"",

      "## 20. What Makes You Unique?",
      "Highlight something that genuinely sets you apart.",
      "**Sample answer:** \"I combine strong technical skills with bilingual communication abilities. I can bridge the gap between Spanish-speaking teams and English-speaking stakeholders effectively.\"",

      "## 21. Tell Me About a Time You Had to Learn Something Quickly",
      "Show your learning process.",
      "**Sample answer:** \"I was assigned to a project using a technology I had never worked with. I spent the weekend going through tutorials, built a small prototype, and was productive by Monday.\"",

      "## 22. Do You Have Any Questions for Us?",
      "Always say yes. Prepare 2–3 thoughtful questions.",
      "**Sample questions:** \"What does a typical first week look like?\", \"How does the team handle code reviews?\", \"What are the biggest challenges the team is facing right now?\"",

      "## 23. How Do You Handle Feedback?",
      "Show openness and growth mindset.",
      "**Sample answer:** \"I welcome feedback. After code reviews, I take notes on what I can improve. I also ask my manager for regular feedback so I don't have to wait for annual reviews.\"",

      "## 24. Describe Your Work Ethic",
      "Use examples from your career.",
      "**Sample answer:** \"I take ownership of my work. When I commit to a deadline, I do everything I can to meet it. If I see something broken, I fix it even if it's not my responsibility.\"",

      "## 25. What Are Your Salary Expectations?",
      "Research the market rate and give a range.",
      "**Sample answer:** \"Based on my research and experience, I'm looking for a range between X and Y. I'm open to discussing based on the full compensation package.\"",

      "---",
      "This guide is part of our comprehensive [English for Job Interviews](/english-for-job-interviews) resource. For more targeted preparation, check out these related guides:",
      "",
      "- [STAR Method Interview Answers in English](/blog/star-method-interview-answers) — Learn how to structure behavioral responses that US recruiters expect.",
      "- [Interview Vocabulary for Professionals](/blog/interview-vocabulary-for-professionals) — Key phrases to use naturally in your next interview.",
      "- [How to Describe Work Experience in English](/blog/how-to-describe-work-experience) — Talk about your professional background with clarity and confidence.",
      "",
      "If you'd like personalized practice, [book a private tutoring session](/signup) with a native English speaker who specializes in interview preparation for LATAM professionals.",
    ],
  },
];
