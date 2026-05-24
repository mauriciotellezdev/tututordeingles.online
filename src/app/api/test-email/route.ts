import { sendMail } from "@/lib/mail";
import { getTeacherData } from "@/lib/models/teacher";

export async function GET() {
  try {
    const teacher = await getTeacherData();

    const emailText = `¡Hola Test Student!\n\nTu clase demo de inglés ha sido agendada con éxito.\n\nFecha y Hora: lunes, 25 de mayo de 2026, 10:00 AM (CDMX)\nPlataforma: WhatsApp\nNúmero: ${teacher.phone}\n\n¡Nos vemos pronto!\nMauricio Tellez\nTu Tutor de Inglés`;

    await sendMail({
      to: "mauriciotellezdev@gmail.com",
      subject: "[TEST DB] Confirmación: Clase Demo de Inglés Agendada 🎉",
      text: emailText,
    });

    return Response.json({ success: true, phone: teacher.phone, email: teacher.email });
  } catch (e: any) {
    return Response.json({ success: false, error: e.message });
  }
}
