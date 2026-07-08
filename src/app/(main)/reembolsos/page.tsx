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

      <LegalSection heading="2. Pagos en persona">
        <p>
          El pago de las clases se realiza en persona (efectivo o
          transferencia). Si pagaste por adelantado clases que aún no has tomado
          y decides no continuar, puedes solicitar la devolución de las clases
          no utilizadas escribiendo a{" "}
          <a
            href="mailto:mauricio@tututordeingles.online"
            className="text-blue-400 underline"
          >
            mauricio@tututordeingles.online
          </a>
          . La devolución se hace por el mismo medio en que pagaste.
        </p>
      </LegalSection>

      <LegalSection heading="3. Clases parcialmente utilizadas">
        <p>
          Si ya tomaste una o más clases de un paquete que pagaste por
          adelantado, podemos devolverte la parte no utilizada, descontando las
          clases ya impartidas al precio vigente.
        </p>
      </LegalSection>

      <LegalSection heading="4. Cancelación y reprogramación de clases">
        <p>
          Si no puedes asistir a una sesión, contáctanos con al menos 24 horas
          de anticipación para reprogramar sin costo.
        </p>
      </LegalSection>

      <LegalSection heading="5. Cómo solicitar una devolución">
        <p>
          Escríbenos a{" "}
          <a
            href="mailto:mauricio@tututordeingles.online"
            className="text-blue-400 underline"
          >
            mauricio@tututordeingles.online
          </a>{" "}
          con tu nombre y el motivo. Respondemos normalmente en un plazo de 2 a
          3 días hábiles.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
