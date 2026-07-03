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
          Ofrecemos clases privadas de inglés 1 a 1, presenciales en Tehuacán o
          en línea por WhatsApp/videollamada. La primera clase de prueba es
          gratuita. Las clases posteriores se pagan mediante créditos: 1 crédito
          equivale a 1 clase privada de 60 minutos.
        </p>
      </LegalSection>

      <LegalSection heading="2. Cuenta y acceso">
        <p>
          El acceso es mediante un código de verificación enviado a tu correo.
          Eres responsable de mantener la confidencialidad de tu cuenta y de la
          veracidad de los datos que proporcionas. Está prohibido crear cuentas
          múltiples para abusar de promociones o del programa de referidos.
        </p>
      </LegalSection>

      <LegalSection heading="3. Pagos y créditos">
        <p>
          Los precios se muestran en pesos mexicanos (MXN) e incluyen los
          métodos de pago disponibles (tarjeta, transferencia SPEI y OXXO) a
          través de Stripe. Los créditos se acreditan una vez confirmado el
          pago. Los pagos por OXXO o SPEI pueden tardar en confirmarse; tus
          créditos se activan automáticamente al confirmarse el pago.
        </p>
      </LegalSection>

      <LegalSection heading="4. Agendado, cambios y cancelaciones">
        <p>
          Las clases deben agendarse con al menos 24 horas de anticipación,
          sujeto a disponibilidad. Para reprogramar o cancelar una clase,
          contáctanos con al menos 24 horas de anticipación. Las inasistencias
          sin aviso pueden descontar el crédito de la clase.
        </p>
      </LegalSection>

      <LegalSection heading="5. Programa de referidos">
        <p>
          Puedes ganar créditos cuando un estudiante nuevo se registre con tu
          enlace y realice su primer pago. Nos reservamos el derecho de anular
          bonificaciones obtenidas de forma fraudulenta o mediante cuentas
          relacionadas.
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
