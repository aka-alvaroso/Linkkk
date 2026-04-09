import { TbArrowRight, TbArrowLeft } from "react-icons/tb";
import Link from "next/link";

export default function QRCodesDoc() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black italic text-dark mb-3">
          Códigos QR
        </h1>
        <p className="text-dark/60 text-sm md:text-base leading-relaxed">
          Cada link de Linkkk tiene su propio código QR personalizable. Lo mejor:
          los escaneos QR se rastrean por separado, así puedes medir offline vs online.
        </p>
      </div>

      {/* Customization */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-4">Personalización</h2>
        <p className="text-sm text-dark/70 leading-relaxed mb-4">
          Desde el panel de edición de un link, accede a la pestaña de QR para personalizar:
        </p>
        <div className="space-y-3">
          {[
            { label: "Color de primer plano", desc: "El color de los puntos del QR. Por defecto negro." },
            { label: "Color de fondo", desc: "El fondo del QR. Por defecto blanco." },
            { label: "Logo personalizado", desc: "Sube tu logo y aparecerá centrado en el QR. Ajusta el tamaño a tu gusto." },
            { label: "Estilo de puntos", desc: "Elige entre cuadrados, redondeados o puntos circulares." },
            { label: "Estilo de esquinas", desc: "Las esquinas del QR pueden ser cuadradas o redondeadas." },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-3xl border border-dark/10">
              <p className="font-bold text-sm text-dark">{item.label}</p>
              <p className="text-xs text-dark/60 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tracking */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-3">Tracking de escaneos</h2>
        <p className="text-sm text-dark/70 leading-relaxed">
          Cuando alguien escanea el QR, Linkkk lo registra como un acceso con fuente &quot;QR&quot;
          en vez de &quot;directo&quot;. En tus analytics verás la proporción de clics directos
          vs escaneos, útil para medir campañas físicas (flyers, tarjetas, carteles).
        </p>
      </div>

      {/* Dynamic QR */}
      <div className="bg-info/10 rounded-3xl p-5">
        <h3 className="font-black italic text-dark mb-2">QR dinámicos</h3>
        <p className="text-sm text-dark/70 leading-relaxed">
          Los códigos QR de Linkkk son <strong>dinámicos</strong>: apuntan a tu short link,
          no a la URL de destino. Esto significa que puedes cambiar el destino sin
          reimprimir el QR. Las reglas también se aplican a los escaneos QR.
        </p>
      </div>

      {/* Availability */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-3">Disponibilidad</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark/10">
                <th className="text-left py-2 pr-4 font-black italic text-dark/50">Plan</th>
                <th className="text-left py-2 pr-4 font-black italic text-dark/50">QR básico</th>
                <th className="text-left py-2 font-black italic text-dark/50">Personalización</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-dark/5">
                <td className="py-2 pr-4 font-bold">Invitado</td>
                <td className="py-2 pr-4">No</td>
                <td className="py-2">No</td>
              </tr>
              <tr className="border-b border-dark/5">
                <td className="py-2 pr-4 font-bold">Standard</td>
                <td className="py-2 pr-4">Sí</td>
                <td className="py-2">Sí</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-bold">PRO</td>
                <td className="py-2 pr-4">Sí</td>
                <td className="py-2">Sí</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-dark/10 pt-6 flex justify-between gap-4">
        <Link href="/docs/analytics" className="flex items-center gap-2 p-4 rounded-3xl bg-dark/5 hover:bg-dark/10 transition-colors group">
          <TbArrowLeft size={18} className="text-dark/30 group-hover:text-dark group-hover:-translate-x-1 transition-all" />
          <div>
            <p className="text-xs text-dark/40">Anterior</p>
            <p className="font-black italic text-sm text-dark">Analytics</p>
          </div>
        </Link>
        <Link href="/docs/plans" className="flex items-center gap-2 p-4 rounded-3xl bg-dark/5 hover:bg-dark/10 transition-colors group text-right">
          <div>
            <p className="text-xs text-dark/40">Siguiente</p>
            <p className="font-black italic text-sm text-dark">Planes</p>
          </div>
          <TbArrowRight size={18} className="text-dark/30 group-hover:text-dark group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
