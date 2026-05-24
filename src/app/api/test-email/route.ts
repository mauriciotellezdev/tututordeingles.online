import { sendMail } from "@/lib/mail";

export async function GET() {
  const teacherPhone = process.env.TEACHER_PHONE;

  const emailText = `¡Hola Test Student!\n\nTu clase demo de inglés ha sido agendada con éxito.\n\nFecha y Hora: lunes, 25 de mayo de 2026, 10:00 AM (CDMX)\nPlataforma: WhatsApp\nNúmero: ${teacherPhone}\n\n¡Nos vemos pronto!\nMauricio Tellez\nTu Tutor de Inglés`;

  try {
    await sendMail({
      to: "mauriciotellezdev@gmail.com",
      subject: "[TEST] Confirmación: Clase Demo de Inglés Agendada 🎉",
      text: emailText,
    });
    return Response.json({ success: true, teacherPhone });
  } catch (e: any) {
    return Response.json({ success: false, error: e.message, teacherPhone });
  }
}
