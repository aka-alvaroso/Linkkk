"use client";
import { TbArrowRight, TbPlus, TbUser, TbUserPlus } from "react-icons/tb";
import Link from "next/link";
import Button from "@/app/components/ui/Button/Button";

export default function GettingStarted() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black italic text-dark mb-3">
          Primeros pasos
        </h1>
        <p className="text-dark/60 text-sm md:text-base leading-relaxed">
          Linkkk no es un acortador de URLs. Es un motor de reglas para tus enlaces.
          Decide qué pasa cuando alguien hace clic: redirige, bloquea, pide contraseña
          o dispara un webhook, todo basado en condiciones como país, dispositivo o VPN.
        </p>
      </div>

      {/* What makes it different */}
      <div className="bg-primary/10 rounded-3xl p-6">
        <h2 className="text-xl font-black italic text-dark mb-3">
          ¿En qué se diferencia de Bitly?
        </h2>
        <p className="text-sm text-dark/70 leading-relaxed">
          Bitly acorta URLs. Linkkk les da <strong>comportamiento</strong>. Puedes definir
          condiciones (país, dispositivo, VPN, bots, horario) y acciones (redirigir, bloquear,
          contraseña, webhook). Un link que hace cosas diferentes según quién haga clic.
        </p>
      </div>

      {/* Two ways to start */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-4">
          Dos formas de empezar
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-dark/10 rounded-3xl p-5 space-y-3">
            <div className="inline-flex p-2 size-10 rounded-3xl bg-warning/10 items-center justify-center">
              <TbUser size={32} className="text-warning" />
            </div>
            <h3 className="font-black italic text-lg">Como invitado</h3>
            <p className="text-sm text-dark/60 leading-relaxed">
              Sin registro, sin email. Crea hasta <strong>3 links</strong> que duran <strong>7 días</strong>.
              Incluye 1 regla por link con 1 condición. Perfecto para probar.
            </p>
          </div>

          <div className="border border-dark/10 rounded-3xl p-5 space-y-3">
            <div className="inline-flex p-2 size-10 rounded-3xl bg-primary/10 items-center justify-center">
              <TbUserPlus size={32} className="text-primary" />
            </div>
            <h3 className="font-black italic text-lg">Con cuenta</h3>
            <p className="text-sm text-dark/60 leading-relaxed">
              Regístrate con email o con Google/GitHub. Plan gratuito con <strong>50 links permanentes</strong>,
              3 reglas por link, analytics completos y QR personalizables.
            </p>
          </div>
        </div>
      </div>

      {/* Quick start steps */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-4">
          Crea tu primer link en 30 segundos
        </h2>
        <ol className="space-y-4">
          <li className="flex gap-4">
            <span className="shrink-0 w-8 h-8 rounded-full bg-dark text-light inline-flex items-center justify-center text-sm font-black">1</span>
            <div>
              <p className="font-bold text-dark">Pega tu URL</p>
              <p className="text-sm text-dark/60">Da igual lo larga o fea que sea. Pulsa el botón <strong>+</strong> o &quot;Crear link&quot;.</p>
            </div>
            <Button
              variant="outline"
              size="md"
              className="rounded-3xl"
              leftIcon={<TbPlus size={16}/>}
            >
              Crear enlace
            </Button>
          </li>
          <li className="flex gap-4">
            <span className="shrink-0 w-8 h-8 rounded-full bg-dark text-light inline-flex items-center justify-center text-sm font-black">2</span>
            <div>
              <p className="font-bold text-dark">Define reglas (opcional)</p>
              <p className="text-sm text-dark/60">Añade condiciones y acciones. Por ejemplo: &quot;Si el visitante usa VPN → bloquear&quot;.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="shrink-0 w-8 h-8 rounded-full bg-dark text-light inline-flex items-center justify-center text-sm font-black">3</span>
            <div>
              <p className="font-bold text-dark">Comparte y olvídate</p>
              <p className="text-sm text-dark/60">El link se adapta a cada visitante automáticamente. Tú defines la lógica una vez.</p>
            </div>
          </li>
        </ol>
      </div>

      {/* Next steps */}
      <div className="border-t border-dark/10 pt-6">
        <p className="text-xs font-black italic text-dark/40 uppercase tracking-wider mb-3">
          Siguiente
        </p>
        <Link
          href="/docs/links"
          className="flex items-center justify-between p-4 rounded-xl bg-dark/5 hover:bg-dark/10 transition-colors group"
        >
          <div>
            <p className="font-black italic text-dark">Enlaces</p>
            <p className="text-sm text-dark/50">Crear, editar, eliminar y personalizar tus links</p>
          </div>
          <TbArrowRight size={20} className="text-dark/30 group-hover:text-dark group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
