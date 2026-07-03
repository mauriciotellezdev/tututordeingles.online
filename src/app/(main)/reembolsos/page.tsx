import type { Metadata } from "next";
import { LegalDoc, LegalSection } from "@/shared/legal/legal-doc";
import { BASE_URL } from "@/shared/seo/business";

export const metadata: Metadata = {
  title: "Política de Reembolsos y Cancelaciones",
  description:
    "Política de reembolsos y cancelaciones de las clases de inglés de Tu Tutor de Inglés.",
  alternates: { canonical: `${BASE_URL}/reembolsos` },
};

export default function ReembolsosPage() {
  return (
    <LegalDoc
      title="Política de Reembolsos y Cancelaciones"
      updated="3 de julio de 2026"
    >
      <p>
        Queremos que quedes satisfecho con tus clases. Esta política explica
        cómo funcionan los reembolsos y las cancelaciones.
      </p>

      <LegalSection heading="1. Clase de prueba gratuita">
        <p>
          Tu primera clase es gratuita y sin compromiso, para que conozcas el
          método antes de pagar.
        </p>
      </LegalSection>

      <LegalSection heading="2. Créditos no utilizados">
        <p>
          Si compraste créditos y no has tomado ninguna de las clases
          correspondientes, puedes solicitar un reembolso dentro de los 14 días
          naturales posteriores a la compra escribiendo a{" "}
          <a
            href="mailto:mauricio@tututordeingles.online"
            className="text-blue-400 underline"
          >
            mauricio@tututordeingles.online
          </a>
          . El reembolso se realiza al mismo método de pago original.
        </p>
      </LegalSection>

      <LegalSection heading="3. Créditos parcialmente utilizados">
        <p>
          Si ya tomaste una o más clases de un paquete, podemos reembolsar los
          créditos no utilizados, descontando las clases ya impartidas al precio
          de clase individual vigente.
        </p>
      </LegalSection>

      <LegalSection heading="4. Cancelación y reprogramación de clases">
        <p>
          Puedes reprogramar o cancelar una clase sin costo con al menos 24
          horas de anticipación; el crédito se conserva. Las cancelaciones con
          menos de 24 horas o las inasistencias sin aviso pueden descontar el
          crédito de la clase.
        </p>
      </LegalSection>

      <LegalSection heading="5. Pagos por OXXO y SPEI">
        <p>
          Para pagos en efectivo (OXXO) o transferencia (SPEI), el reembolso se
          procesa una vez confirmado el pago original y puede tardar unos días
          hábiles adicionales según el método.
        </p>
      </LegalSection>

      <LegalSection heading="6. Cómo solicitar un reembolso">
        <p>
          Escríbenos a{" "}
          <a
            href="mailto:mauricio@tututordeingles.online"
            className="text-blue-400 underline"
          >
            mauricio@tututordeingles.online
          </a>{" "}
          con el correo de tu cuenta y el motivo. Respondemos normalmente en un
          plazo de 2 a 3 días hábiles.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
