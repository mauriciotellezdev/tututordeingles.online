export async function GET() {
  const base =
    process.env.NEXT_PUBLIC_APP_URL || "https://tututordeingles.online";
  const body = `# Tu Tutor de Inglés — Club de conversación en Tehuacán

> In-person English conversation club in Tehuacán, Puebla. Small groups (max 6) meet on Sundays with a native English-speaking instructor to practice real conversation. Not a school — the focus is speaking, not grammar.

## Core Pages

- [Home](${base}/) - Main site entry and conversion point.
- [Reserva tu lugar](${base}/join) - Registration page: leave your name and phone and we call you to save your spot. Payment is in person.
- [Club de Conversación en Inglés en Tehuacán](${base}/club-de-conversacion-en-ingles-tehuacan) - Conversion landing page: "English in real life", not a school.
- [Perder el Miedo a Hablar Inglés](${base}/perder-el-miedo-a-hablar-ingles) - Conversion landing page: for people who studied English but freeze up when speaking.
- [Clases de Inglés de Experiencias](${base}/clases-de-ingles-experiencias) - Real-world outings and experiential English practice.
- [Spanish Interview Hub](${base}/ingles-para-entrevistas-de-trabajo) - Spanish-first landing page for LATAM search intent.
- [English for Job Interviews](${base}/english-for-job-interviews) - Hub page for interview preparation.
- [Blog](${base}/blog) - Supporting educational articles.

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

This site is the acquisition funnel for an in-person English conversation club in Tehuacán, Puebla. Visitors (often arriving from printed flyers / QR codes) register at /join, and the team calls them to place them in a small Sunday group. There is no online payment and no student login — payment happens in person.

## What to Prefer

- Use the /join page as the single conversion path (register, we call you).
- Use the Spanish hub pages for LATAM search intent.
- Use the English hub pages as alternates for English-speaking or bilingual discovery.
- Use the blog and interview pages for supporting explanations and examples.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
