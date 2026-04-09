import { TbArrowRight, TbArrowLeft, TbWorld, TbClick, TbDeviceMobile, TbCalendar, TbRobot, TbShieldLock, TbDots, TbArrowFork, TbForbid2, TbLock, TbWebhook } from "react-icons/tb";
import Link from "next/link";

export default function RulesDoc() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black italic text-dark mb-3">
          Reglas
        </h1>
        <p className="text-dark/60 text-sm md:text-base leading-relaxed">
          Las reglas son el corazón de Linkkk. Con ellas defines qué pasa cuando alguien
          hace clic en tu enlace, basándote en quién es, desde dónde accede y cuándo lo hace.
        </p>
      </div>

      {/* How rules work */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-3">Cómo funcionan</h2>
        <p className="text-sm text-dark/70 leading-relaxed mb-4">
          Cada regla tiene tres partes: <strong>condiciones</strong> (si pasa esto),
          <strong> acciones</strong> (haz aquello) y una <strong>acción alternativa</strong> opcional
          (si no se cumple, haz esto otro).
        </p>
        <div className="bg-dark rounded-3xl p-5 text-light text-sm font-mono space-y-1">
          <p className="text-primary font-bold">SI</p>
          <p className="pl-4">país = España <span className="text-warning">Y</span> dispositivo = móvil</p>
          <p className="text-primary font-bold">ENTONCES</p>
          <p className="pl-4">redirigir a → https://tienda.es/app</p>
          <p className="text-danger font-bold">SI NO</p>
          <p className="pl-4">redirigir a → https://tienda.es/web</p>
        </div>
      </div>

      {/* Conditions */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-4">Condiciones disponibles</h2>
        <div className="space-y-3">
          {[
            { name: "País", icon:<TbWorld size={22} />, color: "bg-primary/10 text-primary", desc: "Filtra por la ubicación geográfica del visitante. Usa códigos ISO (ES, US, DE...).", operators: "está en, no está en" },
            { name: "Dispositivo", icon:<TbDeviceMobile size={22} />, color: "bg-warning/10 text-warning", desc: "Distingue entre móvil, tablet y escritorio.", operators: "es, no es" },
            { name: "VPN", icon:<TbShieldLock size={22} />, color: "bg-info/10 text-info", desc: "Detecta si el visitante usa una VPN o proxy.", operators: "es verdadero/falso" },
            { name: "Bot", icon:<TbRobot size={22} />, color: "bg-danger/10 text-danger", desc: "Identifica bots, crawlers y scrapers automáticamente.", operators: "es verdadero/falso" },
            { name: "Fecha/Hora", icon:<TbCalendar size={22} />, color: "bg-secondary/10 text-secondary", desc: "Activa reglas antes o después de una fecha específica.", operators: "antes de, después de, igual a" },
            { name: "IP", icon:<TbDots size={22} />, color: "bg-dark/10 text-dark", desc: "Filtra por dirección IP específica.", operators: "es, no es" },
            { name: "Nº de accesos", icon:<TbClick size={22} />, color: "bg-dark/10 text-dark", desc: "Actúa según cuántas veces se ha visitado el link.", operators: "igual a, mayor que, menor que" },
          ].map((c) => (
            <div key={c.name} className="flex items-start gap-3 p-4 rounded-3xl border border-dark/10">
              <span className={`p-1 flex items-center justify-center shrink-0 rounded-lg text-xs font-black ${c.color}`}>
                {c.icon}
              </span>
              <div className="min-w-0">
                <p className="text-sm text-dark/70"><span className="text-dark font-black italic mr-2">{c.name}:</span>{c.desc}</p>
                <p className="text-xs text-dark/40 mt-1">Operadores: {c.operators}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Match logic */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-3">Lógica de combinación</h2>
        <p className="text-sm text-dark/70 leading-relaxed mb-4">
          Cuando una regla tiene varias condiciones, puedes elegir cómo combinarlas:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-primary/10 rounded-3xl p-4">
            <p className="font-black italic text-dark mb-1">AND (Y)</p>
            <p className="text-sm text-dark/60">
              <strong>Todas</strong> las condiciones deben cumplirse. Más restrictivo.
            </p>
          </div>
          <div className="bg-warning/10 rounded-3xl p-4">
            <p className="font-black italic text-dark mb-1">OR (O)</p>
            <p className="text-sm text-dark/60">
              Basta con que <strong>una</strong> condición se cumpla. Más flexible.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-4">Acciones disponibles</h2>
        <div className="space-y-3">
          {[
            { name: "Redirigir", icon: <TbArrowFork size={22} />, color: "bg-primary/10 text-primary", desc: "Envía al visitante a una URL diferente. La acción más común. Ideal para geo-segmentar, separar mobile/desktop o hacer A/B testing." },
            { name: "Bloquear acceso", icon: <TbForbid2 size={22} />, color: "bg-danger/10 text-danger", desc: "Muestra una página de acceso bloqueado. Útil para filtrar bots, VPNs o países no deseados." },
            { name: "Pedir contraseña", icon: <TbLock size={22} />, color: "bg-warning/10 text-warning", desc: "El visitante debe introducir una contraseña para acceder al destino. La contraseña se almacena hasheada con bcrypt." },
            { name: "Enviar webhook", icon: <TbWebhook size={22} />, color: "bg-info/10 text-info", desc: "Dispara una petición HTTP a la URL que configures. Perfecto para integraciones, notificaciones o automatizaciones." },
          ].map((a) => (
            <div key={a.name} className="flex items-start gap-3 p-4 rounded-3xl border border-dark/10">
              <span className={`shrink-0 p-1 rounded-lg text-xs font-black ${a.color}`}>
                {a.icon}
              </span>
              <div className="min-w-0">
                <p className="text-sm text-dark/70"><span className="text-dark font-black italic mr-2">{a.name}:</span>{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-3">Prioridad</h2>
        <p className="text-sm text-dark/70 leading-relaxed">
          Cuando un link tiene varias reglas, se evalúan por <strong>prioridad</strong> (de menor número a mayor).
          La primera regla cuyas condiciones se cumplan es la que se ejecuta. Si ninguna regla coincide,
          el link redirige a la URL de destino original.
        </p>
      </div>

      {/* Limits */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-3">Límites por plan</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark/10">
                <th className="text-left py-2 pr-4 font-black italic text-dark/50">Plan</th>
                <th className="text-left py-2 pr-4 font-black italic text-dark/50">Reglas/link</th>
                <th className="text-left py-2 font-black italic text-dark/50">Condiciones/regla</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-dark/5">
                <td className="py-2 pr-4 font-bold">Invitado</td>
                <td className="py-2 pr-4">1</td>
                <td className="py-2">1</td>
              </tr>
              <tr className="border-b border-dark/5">
                <td className="py-2 pr-4 font-bold">Standard</td>
                <td className="py-2 pr-4">3</td>
                <td className="py-2">2</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-bold">PRO</td>
                <td className="py-2 pr-4">Ilimitadas</td>
                <td className="py-2">Ilimitadas</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-dark/10 pt-6 flex justify-between gap-4">
        <Link href="/docs/links" className="flex items-center gap-2 p-4 rounded-3xl bg-dark/5 hover:bg-dark/10 transition-colors group">
          <TbArrowLeft size={18} className="text-dark/30 group-hover:text-dark group-hover:-translate-x-1 transition-all" />
          <div>
            <p className="text-xs text-dark/40">Anterior</p>
            <p className="font-black italic text-sm text-dark">Enlaces</p>
          </div>
        </Link>
        <Link href="/docs/analytics" className="flex items-center gap-2 p-4 rounded-3xl bg-dark/5 hover:bg-dark/10 transition-colors group text-right">
          <div>
            <p className="text-xs text-dark/40">Siguiente</p>
            <p className="font-black italic text-sm text-dark">Analytics</p>
          </div>
          <TbArrowRight size={18} className="text-dark/30 group-hover:text-dark group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
