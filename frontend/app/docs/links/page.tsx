"use client";
import { TbArrowRight, TbArrowLeft, TbPlus } from "react-icons/tb";
import Link from "next/link";
import Button from "@/app/components/ui/Button/Button";

export default function LinksDoc() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black italic text-dark mb-3">
          Enlaces
        </h1>
        <p className="text-dark/60 text-sm md:text-base leading-relaxed">
          Cada enlace en Linkkk es un enlace inteligente. Más allá de acortar URLs,
          puedes personalizarlo, añadirle reglas y rastrear quién lo visita.
        </p>
      </div>

      {/* Creating a link */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-black italic text-dark">Crear un enlace</h2>
        <p className="text-sm text-dark/70 leading-relaxed">
          Pulsa el botón <strong>+</strong> en la navegación o &quot;Crear link&quot; en el dashboard.
          Solo necesitas la URL de destino. Linkkk genera automáticamente un slug corto y único.
        </p>
        <div className="bg-dark/5 rounded-3xl p-4 text-sm space-y-2">
          <p><strong>URL de destino:</strong> La URL a la que redirigirá tu link (obligatorio)</p>
          <p><strong>Sufijo personalizado:</strong> En vez de un slug aleatorio, elige el tuyo (solo usuarios registrados)</p>
        </div>
        <Button
          variant="solid"
          size="lg"
          className="hover:bg-primary hover:text-dark rounded-3xl"
          leftIcon={<TbPlus size={16}/>}
        >
          Crear enlace
        </Button>
      </div>

      {/* Custom suffix */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-3">Sufijos personalizados</h2>
        <p className="text-sm text-dark/70 leading-relaxed mb-3">
          Si tienes cuenta, puedes elegir un sufijo personalizado para tu link.
          Por ejemplo: <code className="bg-dark/10 px-1.5 py-0.5 rounded text-dark font-mono text-xs">linkkk.dev/r/mi-oferta</code>
        </p>
        <div className="bg-warning/10 rounded-3xl p-4 text-sm text-dark/70">
          <strong className="text-dark">Nota:</strong> Los sufijos deben ser únicos. Si ya existe, deberás elegir otro.
        </div>
      </div>

      {/* Link states */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-3">Estados de un enlace</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-3xl border border-dark/10">
            <span className="shrink-0 mt-0.5 size-3 rounded-full bg-primary" />
            <div>
              <p className="font-bold text-sm text-dark">Activo</p>
              <p className="text-xs text-dark/60">El link funciona normalmente. Evalúa reglas y redirige.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-3xl border border-dark/10">
            <span className="shrink-0 mt-0.5 size-3 rounded-full bg-dark/30" />
            <div>
              <p className="font-bold text-sm text-dark">Desactivado</p>
              <p className="text-xs text-dark/60">El link muestra una página de &quot;enlace desactivado&quot;. Puedes reactivarlo cuando quieras.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-3xl border border-dark/10">
            <span className="shrink-0 mt-0.5 size-3 rounded-full bg-danger" />
            <div>
              <p className="font-bold text-sm text-dark">Expirado</p>
              <p className="text-xs text-dark/60">Solo para invitados. Tras 7 días desde su creación, el link se elimina y no funcionará.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Editing and deleting */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-3">Editar y eliminar</h2>
        <p className="text-sm text-dark/70 leading-relaxed">
          Desde el dashboard, haz clic en cualquier link para abrir su panel de edición.
          Puedes cambiar la URL de destino, el sufijo, las reglas y el estado.
          Para eliminar un link, usa la opción en el menú del link. <strong>Esta acción es irreversible.</strong>
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
                <th className="text-left py-2 pr-4 font-black italic text-dark/50">Links</th>
                <th className="text-left py-2 pr-4 font-black italic text-dark/50">Duración</th>
                <th className="text-left py-2 font-black italic text-dark/50">Sufijo</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-dark/5">
                <td className="py-2 pr-4 font-bold">Invitado</td>
                <td className="py-2 pr-4">3</td>
                <td className="py-2 pr-4">7 días</td>
                <td className="py-2">No</td>
              </tr>
              <tr className="border-b border-dark/5">
                <td className="py-2 pr-4 font-bold">Standard</td>
                <td className="py-2 pr-4">50</td>
                <td className="py-2 pr-4">Permanentes</td>
                <td className="py-2">Sí</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-bold">PRO</td>
                <td className="py-2 pr-4">Ilimitados</td>
                <td className="py-2 pr-4">Permanentes</td>
                <td className="py-2">Sí</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-dark/10 pt-6 flex justify-between gap-4">
        <Link href="/docs/getting-started" className="flex items-center gap-2 p-4 rounded-3xl bg-dark/5 hover:bg-dark/10 transition-colors group">
          <TbArrowLeft size={18} className="text-dark/30 group-hover:text-dark group-hover:-translate-x-1 transition-all" />
          <div>
            <p className="text-xs text-dark/40">Anterior</p>
            <p className="font-black italic text-sm text-dark">Primeros pasos</p>
          </div>
        </Link>
        <Link href="/docs/rules" className="flex items-center gap-2 p-4 rounded-3xl bg-dark/5 hover:bg-dark/10 transition-colors group text-right">
          <div>
            <p className="text-xs text-dark/40">Siguiente</p>
            <p className="font-black italic text-sm text-dark">Reglas</p>
          </div>
          <TbArrowRight size={18} className="text-dark/30 group-hover:text-dark group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
