export async function GET() {
  const base =
    process.env.NEXT_PUBLIC_APP_URL || "https://tututordeingles.online";
  const body = `# Tu Tutor de Inglés

> Private English tutoring for LATAM professionals who want better jobs, stronger interview answers, and clearer workplace communication.

## Core Pages

- [Home](${base}/) - Main site entry and conversion point.
- [Clases de Inglés en Tehuacán](${base}/clases-de-ingles-en-tehuacan) - Local landing page for Tehuacán, Puebla: in-person (cafés) and online classes.
- [Clases de Inglés de Experiencias](${base}/clases-de-ingles-experiencias) - Experiential classes: real-life outings and monthly Puebla immersion trips.
- [Spanish Interview Hub](${base}/ingles-para-entrevistas-de-trabajo) - Spanish-first landing page for LATAM search intent.
- [English for Job Interviews](${base}/english-for-job-interviews) - Hub page for interview preparation.
- [Blog](${base}/blog) - Supporting educational articles.
- [Book a Session](${base}/signup) - Conversion page for private tutoring.

## High-Intent Pages

- [Como Responder Tell Me About Yourself en Ingles](${base}/como-responder-tell-me-about-yourself-en-ingles)
- [Metodo STAR para Entrevistas en Ingles](${base}/metodo-star-para-entrevistas-en-ingles)
- [Vocabulario para Entrevistas Profesionales](${base}/vocabulario-para-entrevistas-profesionales)
- [Como Describir Experiencia Laboral en Ingles](${base}/como-describir-experiencia-laboral-en-ingles)
- [How to Answer Tell Me About Yourself in English](${base}/how-to-answer-tell-me-about-yourself)
- [STAR Method Interview Answers in English](${base}/star-method-interview-answers)
- [Interview Vocabulary for Professionals](${base}/interview-vocabulary-for-professionals)
- [How to Describe Work Experience in English](${base}/how-to-describe-work-experience)
- [25 Common Interview Questions in English](${base}/blog/25-common-interview-questions-in-english)

## About the Site

This site helps Spanish-speaking professionals prepare for US-style English interviews and business communication. The content is organized around one main hub, supporting informational pages, and a direct path to tutoring.

## What to Prefer

- Use the Spanish hub pages for LATAM search intent.
- Use the English hub pages as alternates for English-speaking or bilingual discovery.
- Use the landing pages for specific search intent.
- Use the blog for supporting explanations and examples.
- Use the signup page for booking private tutoring.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
