import { TbArrowRight, TbArrowLeft, TbCheck, TbX } from "react-icons/tb";
import Link from "next/link";

export default function PlansDoc() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black italic text-dark mb-3">
          Planes
        </h1>
        <p className="text-dark/60 text-sm md:text-base leading-relaxed">
          Linkkk tiene un modelo freemium. Puedes usar la plataforma sin pagar nada,
          incluso sin crear cuenta. PRO solo quita límites.
        </p>
      </div>

      {/* Plan comparison */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-4">Comparativa</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-dark/20">
                <th className="text-left py-3 pr-4 font-black italic text-dark">Feature</th>
                <th className="text-center py-3 px-3 font-black italic text-dark/50">Invitado</th>
                <th className="text-center py-3 px-3 font-black italic text-dark/50">Standard</th>
                <th className="text-center py-3 px-3 font-black italic text-primary">PRO</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Links", guest: "3", standard: "50", pro: "Ilimitados" },
                { feature: "Duración links", guest: "7 días", standard: "Permanentes", pro: "Permanentes" },
                { feature: "Reglas por link", guest: "1", standard: "3", pro: "Ilimitadas" },
                { feature: "Condiciones por regla", guest: "1", standard: "2", pro: "Ilimitadas" },
                { feature: "Historial analytics", guest: "7 días", standard: "30 días", pro: "Sin límite" },
                { feature: "Sufijo personalizado", guest: false, standard: true, pro: true },
                { feature: "Códigos QR", guest: false, standard: true, pro: true },
                { feature: "Personalización QR", guest: false, standard: true, pro: true },
                { feature: "Gráficos analytics", guest: false, standard: true, pro: true },
                { feature: "OAuth (Google/GitHub)", guest: false, standard: true, pro: true },
                { feature: "Soporte prioritario", guest: false, standard: false, pro: true },
              ].map((row) => (
                <tr key={row.feature} className="border-b border-dark/5">
                  <td className="py-2.5 pr-4 font-medium text-dark">{row.feature}</td>
                  {[row.guest, row.standard, row.pro].map((val, i) => (
                    <td key={i} className="py-2.5 px-3 text-center">
                      {typeof val === "boolean" ? (
                        val ? (
                          <TbCheck size={18} className="text-primary mx-auto" strokeWidth={3} />
                        ) : (
                          <TbX size={18} className="text-dark/20 mx-auto" strokeWidth={3} />
                        )
                      ) : (
                        <span className={`text-sm ${i === 2 ? "font-bold text-dark" : "text-dark/70"}`}>
                          {val}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-3">Precio de PRO</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl border border-dark/10">
            <p className="text-dark/50 text-xs font-black italic uppercase tracking-wider mb-1">Mensual</p>
            <p className="text-3xl font-black italic text-dark">3.50€<span className="text-base font-bold text-dark/40 ml-1">/mes</span></p>
          </div>
          <div className="p-5 rounded-3xl border border-primary bg-primary/5">
            <p className="text-primary text-xs font-black italic uppercase tracking-wider mb-1">Anual</p>
            <p className="text-3xl font-black italic text-dark">2.90€<span className="text-base font-bold text-dark/40 ml-1">/mes</span></p>
            <p className="text-xs text-dark/50 mt-1">34.80€ facturados anualmente</p>
          </div>
        </div>
      </div>

      {/* What happens if */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-4">Preguntas frecuentes</h2>
        <div className="space-y-4">
          <div>
            <p className="font-bold text-sm text-dark mb-1">¿Qué pasa si supero los límites?</p>
            <p className="text-sm text-dark/60">
              Recibes un aviso. Los links existentes siguen funcionando, nunca rompemos links activos.
              Simplemente no podrás crear nuevos hasta subir de plan.
            </p>
          </div>
          <div>
            <p className="font-bold text-sm text-dark mb-1">¿Puedo cancelar PRO en cualquier momento?</p>
            <p className="text-sm text-dark/60">
              Sí. Al cancelar, mantienes PRO hasta el final del periodo pagado.
              Después pasas a Standard automáticamente. Tus links permanecen.
            </p>
          </div>
          <div>
            <p className="font-bold text-sm text-dark mb-1">¿Puedo pasar de invitado a Standard?</p>
            <p className="text-sm text-dark/60">
              Sí, solo tienes que registrarte. Tus links de invitado se migran a tu nueva cuenta
              y dejan de tener fecha de expiración.
            </p>
          </div>
          <div>
            <p className="font-bold text-sm text-dark mb-1">¿Qué método de pago aceptáis?</p>
            <p className="text-sm text-dark/60">
              El pago se procesa a través de Stripe. Aceptamos tarjetas de crédito/débito y otros
              métodos según tu país. Linkkk nunca almacena datos de tu tarjeta.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-dark/10 pt-6 flex justify-between gap-4">
        <Link href="/docs/qr-codes" className="flex items-center gap-2 p-4 rounded-3xl bg-dark/5 hover:bg-dark/10 transition-colors group">
          <TbArrowLeft size={18} className="text-dark/30 group-hover:text-dark group-hover:-translate-x-1 transition-all" />
          <div>
            <p className="text-xs text-dark/40">Anterior</p>
            <p className="font-black italic text-sm text-dark">Códigos QR</p>
          </div>
        </Link>
        <Link href="/docs/security" className="flex items-center gap-2 p-4 rounded-3xl bg-dark/5 hover:bg-dark/10 transition-colors group text-right">
          <div>
            <p className="text-xs text-dark/40">Siguiente</p>
            <p className="font-black italic text-sm text-dark">Seguridad</p>
          </div>
          <TbArrowRight size={18} className="text-dark/30 group-hover:text-dark group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
