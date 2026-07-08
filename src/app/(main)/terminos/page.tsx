import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc, LegalSection } from "@/shared/legal/legal-doc";
import { BASE_URL } from "@/shared/seo/business";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Términos y condiciones de uso del servicio de clases de inglés de Tu Tutor de Inglés.",
  alternates: { canonical: `${BASE_URL}/terminos` },
};

export default function TerminosPage() {
  return (
    <LegalDoc title="Términos y Condiciones" updated="3 de julio de 2026">
      <p>
        Al registrarte y usar Tu Tutor de Inglés (“el servicio”), operado por
        Mauricio Tellez en Tehuacán, Puebla, México, aceptas estos términos.
      </p>

      <LegalSection heading="1. El servicio">
        <p>
          Ofrecemos un club de conversación en inglés presencial en Tehuacán.
          Para participar te registras con tu nombre y teléfono y nosotros te
          llamamos para darte los detalles. El pago de las clases se realiza en
          persona.
        </p>
      </LegalSection>

      <LegalSection heading="2. Registro">
        <p>
          El registro se realiza a través del formulario del sitio, donde
          proporcionas tu nombre y teléfono. Eres responsable de la veracidad de
          los datos que proporcionas. Está prohibido enviar registros falsos o
          duplicados para abusar de promociones.
        </p>
      </LegalSection>

      <LegalSection heading="3. Pagos">
        <p>
          Los precios se muestran en pesos mexicanos (MXN). El pago de las
          clases se realiza en persona, en efectivo o por transferencia
          bancaria. No procesamos pagos en línea a través del sitio.
        </p>
      </LegalSection>

      <LegalSection heading="4. Agendado, cambios y cancelaciones">
        <p>
          Si no puedes asistir a una sesión, contáctanos con al menos 24 horas
          de anticipación para reprogramar. Las inasistencias sin aviso pueden
          afectar tu lugar en el club.
        </p>
      </LegalSection>

      <LegalSection heading="5. Referidos">
        <p>
          Puedes recibir beneficios cuando invites a una persona nueva que se
          registre y se una al club. Nos reservamos el derecho de anular
          bonificaciones obtenidas de forma fraudulenta.
        </p>
      </LegalSection>

      <LegalSection heading="6. Conducta esperada">
        <p>
          Esperamos respeto mutuo durante las clases. Nos reservamos el derecho
          de suspender el servicio ante conductas abusivas, sin obligación de
          reembolso en dichos casos.
        </p>
      </LegalSection>

      <LegalSection heading="7. Reembolsos">
        <p>
          Las condiciones de reembolso se detallan en nuestra{" "}
          <Link href="/reembolsos" className="text-blue-400 underline">
            Política de Reembolsos y Cancelaciones
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection heading="8. Privacidad">
        <p>
          El tratamiento de tus datos se rige por nuestro{" "}
          <Link href="/aviso-de-privacidad" className="text-blue-400 underline">
            Aviso de Privacidad
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection heading="9. Cambios a los términos">
        <p>
          Podemos actualizar estos términos; la versión vigente se publicará en
          esta página. El uso continuo del servicio implica la aceptación de los
          cambios.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
