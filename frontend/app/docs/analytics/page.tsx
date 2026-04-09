import { TbArrowRight, TbArrowLeft } from "react-icons/tb";
import Link from "next/link";

export default function AnalyticsDoc() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black italic text-dark mb-3">
          Analytics
        </h1>
        <p className="text-dark/60 text-sm md:text-base leading-relaxed">
          Cada clic en tus enlaces queda registrado. Linkkk te muestra quién accede,
          desde dónde, con qué dispositivo y si es un visitante real o un bot.
        </p>
      </div>

      {/* What we track */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-4">Qué registramos</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { label: "Fecha y hora", desc: "Momento exacto del acceso" },
            { label: "País", desc: "Geolocalización por IP (anonimizada)" },
            { label: "Dispositivo", desc: "Móvil, tablet o escritorio" },
            { label: "Navegador", desc: "Chrome, Firefox, Safari, Edge..." },
            { label: "VPN detectada", desc: "Si el visitante usa VPN o proxy" },
            { label: "Bot detectado", desc: "Si es un crawler o scraper" },
            { label: "Fuente", desc: "Clic directo o escaneo de QR" },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3 p-3 rounded-3xl border border-dark/10">
              <span className="shrink-0 size-2 rounded-full bg-primary mt-1.5" />
              <div>
                <p className="text-sm font-bold text-dark">{item.label}</p>
                <p className="text-xs text-dark/50">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Aggregated stats */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-3">Estadísticas agregadas</h2>
        <p className="text-sm text-dark/70 leading-relaxed mb-4">
          Además del historial individual, Linkkk calcula métricas agregadas para cada link:
        </p>
        <ul className="space-y-2 text-sm text-dark/70">
          <li className="flex gap-2"><strong className="text-dark shrink-0">Clics por día:</strong> Gráfico temporal con datos diarios</li>
          <li className="flex gap-2"><strong className="text-dark shrink-0">Top países:</strong> Los países con más clics</li>
          <li className="flex gap-2"><strong className="text-dark shrink-0">Navegadores:</strong> Distribución por navegador</li>
          <li className="flex gap-2"><strong className="text-dark shrink-0">Direct vs QR:</strong> Proporción de clics directos vs escaneos QR</li>
          <li className="flex gap-2"><strong className="text-dark shrink-0">VPN/Bots:</strong> Cantidad de accesos desde VPN y bots detectados</li>
        </ul>
      </div>

      {/* Dashboard overview */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-3">Panel general</h2>
        <p className="text-sm text-dark/70 leading-relaxed">
          En el dashboard verás un resumen global con:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {["Total links", "Total clics", "Escaneos QR", "Links activos"].map((label) => (
            <div key={label} className="bg-dark/5 rounded-3xl p-3 text-center">
              <p className="text-xs text-dark/50">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Retention */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-3">Retención de datos</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark/10">
                <th className="text-left py-2 pr-4 font-black italic text-dark/50">Plan</th>
                <th className="text-left py-2 font-black italic text-dark/50">Historial</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-dark/5">
                <td className="py-2 pr-4 font-bold">Invitado</td>
                <td className="py-2">Últimos 7 días</td>
              </tr>
              <tr className="border-b border-dark/5">
                <td className="py-2 pr-4 font-bold">Standard</td>
                <td className="py-2">Últimos 30 días</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-bold">PRO</td>
                <td className="py-2">Sin límite</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Privacy note */}
      <div className="bg-primary/10 rounded-3xl p-5">
        <h3 className="font-black italic text-dark mb-2">Sobre la privacidad</h3>
        <p className="text-sm text-dark/70 leading-relaxed">
          Las direcciones IP se anonimizan para cumplir con GDPR. No almacenamos datos
          personales identificables de los visitantes. Solo registramos datos agregados
          necesarios para las analytics y la evaluación de reglas.
        </p>
      </div>

      {/* Navigation */}
      <div className="border-t border-dark/10 pt-6 flex justify-between gap-4">
        <Link href="/docs/rules" className="flex items-center gap-2 p-4 rounded-3xl bg-dark/5 hover:bg-dark/10 transition-colors group">
          <TbArrowLeft size={18} className="text-dark/30 group-hover:text-dark group-hover:-translate-x-1 transition-all" />
          <div>
            <p className="text-xs text-dark/40">Anterior</p>
            <p className="font-black italic text-sm text-dark">Reglas</p>
          </div>
        </Link>
        <Link href="/docs/qr-codes" className="flex items-center gap-2 p-4 rounded-3xl bg-dark/5 hover:bg-dark/10 transition-colors group text-right">
          <div>
            <p className="text-xs text-dark/40">Siguiente</p>
            <p className="font-black italic text-sm text-dark">Códigos QR</p>
          </div>
          <TbArrowRight size={18} className="text-dark/30 group-hover:text-dark group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
