import type { Metadata } from "next";
import { LegalDoc, LegalSection } from "@/shared/legal/legal-doc";
import { BASE_URL } from "@/shared/seo/business";

export const metadata: Metadata = {
  title: "Aviso de Privacidad",
  description:
    "Aviso de privacidad de Tu Tutor de Inglés conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).",
  alternates: { canonical: `${BASE_URL}/aviso-de-privacidad` },
  robots: { index: true, follow: true },
};

export default function AvisoDePrivacidadPage() {
  return (
    <LegalDoc title="Aviso de Privacidad" updated="3 de julio de 2026">
      <p>
        En cumplimiento con la Ley Federal de Protección de Datos Personales en
        Posesión de los Particulares (LFPDPPP), su Reglamento y los Lineamientos
        del Aviso de Privacidad, ponemos a tu disposición el presente Aviso de
        Privacidad.
      </p>

      <LegalSection heading="1. Responsable de tus datos personales">
        <p>
          <strong className="text-white">Mauricio Tellez</strong> (“Tu Tutor de
          Inglés”), con domicilio en Tehuacán, Puebla, México, y correo de
          contacto{" "}
          <a
            href="mailto:mauricio@tututordeingles.online"
            className="text-blue-400 underline"
          >
            mauricio@tututordeingles.online
          </a>
          , es responsable del tratamiento y protección de tus datos personales.
        </p>
      </LegalSection>

      <LegalSection heading="2. Datos personales que recabamos">
        <p>Para prestarte nuestros servicios podemos recabar:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Datos de identificación y contacto: nombre, correo electrónico y
            número de teléfono/WhatsApp.
          </li>
          <li>
            Datos de tu progreso académico: resultados de tu examen de ubicación
            y clases agendadas.
          </li>
          <li>
            Datos técnicos y de seguridad: dirección IP, identificador de
            navegador y agente de usuario, tratados de forma cifrada (hash)
            únicamente para prevenir el abuso y fraude en los registros.
          </li>
          <li>
            Datos de facturación y pago: procesados directamente por nuestro
            proveedor de pagos (Stripe). No almacenamos los datos completos de
            tu tarjeta.
          </li>
        </ul>
        <p>
          No recabamos datos personales sensibles. No solicitamos ni tratamos
          datos de menores de edad sin el consentimiento de quien ejerza la
          patria potestad.
        </p>
      </LegalSection>

      <LegalSection heading="3. Finalidades del tratamiento">
        <p>
          <strong className="text-white">Finalidades primarias</strong>{" "}
          (necesarias para el servicio):
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Crear y administrar tu cuenta e iniciar sesión mediante códigos de
            verificación por correo.
          </li>
          <li>Agendar, confirmar y dar seguimiento a tus clases de inglés.</li>
          <li>Procesar tus pagos y administrar tus créditos.</li>
          <li>
            Enviarte comunicaciones transaccionales (códigos de acceso,
            confirmaciones de clase).
          </li>
          <li>Prevenir fraude y uso abusivo de la plataforma.</li>
        </ul>
        <p>
          <strong className="text-white">Finalidades secundarias</strong> (no
          necesarias): envío de información promocional y mejoras del servicio.
          Puedes oponerte a estas finalidades enviando un correo a la dirección
          de contacto sin que ello afecte la prestación del servicio.
        </p>
      </LegalSection>

      <LegalSection heading="4. Transferencias de datos">
        <p>
          Compartimos datos únicamente con los proveedores necesarios para
          operar el servicio, quienes actúan como encargados y están obligados a
          mantener la confidencialidad:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-white">Stripe</strong> — procesamiento de
            pagos.
          </li>
          <li>
            <strong className="text-white">Brevo</strong> — envío de correos
            transaccionales.
          </li>
          <li>
            <strong className="text-white">Vercel y Cloudflare</strong> —
            alojamiento e infraestructura del sitio.
          </li>
          <li>
            Proveedor de base de datos para el almacenamiento seguro de la
            información.
          </li>
        </ul>
        <p>No vendemos ni comercializamos tus datos personales con terceros.</p>
      </LegalSection>

      <LegalSection heading="5. Derechos ARCO">
        <p>
          Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte (derechos
          ARCO) al tratamiento de tus datos personales, así como a revocar tu
          consentimiento. Para ejercerlos, envía una solicitud a{" "}
          <a
            href="mailto:mauricio@tututordeingles.online"
            className="text-blue-400 underline"
          >
            mauricio@tututordeingles.online
          </a>{" "}
          indicando tu nombre, el derecho que deseas ejercer y una descripción
          clara de tu solicitud. Responderemos en los plazos que marca la ley.
        </p>
      </LegalSection>

      <LegalSection heading="6. Uso de cookies y tecnologías de rastreo">
        <p>
          Utilizamos cookies y tecnologías similares para mantener tu sesión
          iniciada, recordar la campaña por la que llegaste al sitio y, con tu
          consentimiento, medir el rendimiento del sitio y de nuestra
          publicidad. Puedes administrar tus preferencias desde el aviso de
          cookies del sitio o desde la configuración de tu navegador.
        </p>
      </LegalSection>

      <LegalSection heading="7. Cambios al aviso de privacidad">
        <p>
          Este aviso puede actualizarse en cualquier momento. Publicaremos la
          versión vigente en esta página con su fecha de actualización. Te
          recomendamos revisarla periódicamente.
        </p>
      </LegalSection>

      <p className="text-xs text-white/40">
        Al registrarte y utilizar Tu Tutor de Inglés manifiestas que has leído y
        aceptas el presente Aviso de Privacidad.
      </p>
    </LegalDoc>
  );
}
