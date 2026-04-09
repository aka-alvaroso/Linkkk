import { TbArrowLeft } from "react-icons/tb";
import Link from "next/link";

export default function SecurityDoc() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black italic text-dark mb-3">
          Seguridad
        </h1>
        <p className="text-dark/60 text-sm md:text-base leading-relaxed">
          La seguridad no es un extra en Linkkk, es parte del diseño. Desde el cifrado
          de datos hasta la detección de bots, cada capa está pensada para proteger
          tanto a ti como a los visitantes de tus links.
        </p>
      </div>

      {/* Data protection */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-4">Protección de datos</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-3xl border border-dark/10">
            <p className="font-bold text-sm text-dark mb-1">Contraseñas</p>
            <p className="text-xs text-dark/60">
              Hasheadas con bcrypt (12 rounds, estándar OWASP). Nunca se almacenan en texto plano.
              Esto aplica tanto a contraseñas de usuario como a las de links protegidos.
            </p>
          </div>
          <div className="p-4 rounded-3xl border border-dark/10">
            <p className="font-bold text-sm text-dark mb-1">IPs anonimizadas</p>
            <p className="text-xs text-dark/60">
              Las direcciones IP se utilizan internamente para geolocalización, detección de VPN
              y evaluación de reglas de condición IP. En el panel de analytics se muestran siempre
              anonimizadas (último octeto enmascarado). Los datos de acceso se anonimizan
              completamente tras 12 meses.
            </p>
          </div>
          <div className="p-4 rounded-3xl border border-dark/10">
            <p className="font-bold text-sm text-dark mb-1">Datos de pago</p>
            <p className="text-xs text-dark/60">
              Los pagos se procesan íntegramente a través de Stripe (PCI DSS Level 1).
              Linkkk no almacena números de tarjeta ni datos bancarios.
            </p>
          </div>
          <div className="p-4 rounded-3xl border border-dark/10">
            <p className="font-bold text-sm text-dark mb-1">No vendemos datos</p>
            <p className="text-xs text-dark/60">
              Los datos de analytics son tuyos. No los compartimos ni vendemos a terceros. Punto.
            </p>
          </div>
        </div>
      </div>

      {/* Authentication */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-4">Autenticación</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-3xl border border-dark/10">
            <p className="font-bold text-sm text-dark mb-1">Sesiones con JWT</p>
            <p className="text-xs text-dark/60">
              Las sesiones usan tokens JWT con expiración de 30 días, almacenados en cookies
              HttpOnly + SameSite para prevenir XSS y CSRF.
            </p>
          </div>
          <div className="p-4 rounded-3xl border border-dark/10">
            <p className="font-bold text-sm text-dark mb-1">OAuth 2.0</p>
            <p className="text-xs text-dark/60">
              Puedes registrarte con Google o GitHub. Usamos el flujo de autorización estándar
              de OAuth 2.0, sin acceder a datos innecesarios de tu cuenta.
            </p>
          </div>
          <div className="p-4 rounded-3xl border border-dark/10">
            <p className="font-bold text-sm text-dark mb-1">Protección CSRF</p>
            <p className="text-xs text-dark/60">
              Todas las operaciones que modifican datos requieren un token CSRF válido,
              previniendo ataques de falsificación de peticiones.
            </p>
          </div>
        </div>
      </div>

      {/* Detection */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-4">Detección automática</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-danger/10 rounded-3xl p-5">
            <p className="font-black italic text-dark mb-2">Detección de bots</p>
            <p className="text-sm text-dark/60">
              Linkkk identifica automáticamente crawlers, scrapers y bots mediante análisis
              de User-Agent. Puedes usarlo como condición en tus reglas para bloquearlos
              o redirigirlos.
            </p>
          </div>
          <div className="bg-info/10 rounded-3xl p-5">
            <p className="font-black italic text-dark mb-2">Detección de VPN</p>
            <p className="text-sm text-dark/60">
              Detectamos conexiones a través de VPN y proxies usando inteligencia de IP.
              Útil para filtrar tráfico no genuino o limitar acceso por región real.
            </p>
          </div>
        </div>
      </div>

      {/* Infrastructure */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-4">Infraestructura</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-3xl border border-dark/10">
            <p className="font-bold text-sm text-dark mb-1">Cabeceras HTTP seguras</p>
            <p className="text-xs text-dark/60">
              Helmet.js configura CSP, HSTS, X-Frame-Options y otras cabeceras de seguridad
              en todas las respuestas del servidor.
            </p>
          </div>
          <div className="p-4 rounded-3xl border border-dark/10">
            <p className="font-bold text-sm text-dark mb-1">Rate limiting</p>
            <p className="text-xs text-dark/60">
              Los endpoints sensibles (login, verificación de contraseña) tienen límites
              de peticiones para prevenir ataques de fuerza bruta.
            </p>
          </div>
          <div className="p-4 rounded-3xl border border-dark/10">
            <p className="font-bold text-sm text-dark mb-1">CORS configurado</p>
            <p className="text-xs text-dark/60">
              Solo dominios autorizados pueden hacer peticiones a la API. El acceso desde
              dominios no permitidos está bloqueado.
            </p>
          </div>
        </div>
      </div>

      {/* Open source */}
      <div className="bg-primary/10 rounded-3xl p-5">
        <h3 className="font-black italic text-dark mb-2">Código abierto</h3>
        <p className="text-sm text-dark/70 leading-relaxed">
          El código fuente de Linkkk está disponible en GitHub. Puedes auditar la seguridad,
          reportar vulnerabilidades o contribuir. Si Linkkk cierra, puedes auto-alojarlo.
        </p>
      </div>

      {/* GDPR */}
      <div>
        <h2 className="text-xl font-black italic text-dark mb-3">GDPR y tus derechos</h2>
        <p className="text-sm text-dark/70 leading-relaxed mb-3">
          Como usuario de Linkkk, tienes derecho a:
        </p>
        <ul className="space-y-2 text-sm text-dark/70">
          <li className="flex gap-2"><strong className="text-dark shrink-0">Acceso:</strong> Consultar qué datos tenemos sobre ti</li>
          <li className="flex gap-2"><strong className="text-dark shrink-0">Rectificación:</strong> Corregir datos incorrectos</li>
          <li className="flex gap-2"><strong className="text-dark shrink-0">Eliminación:</strong> Borrar tu cuenta y todos tus datos desde Ajustes</li>
          <li className="flex gap-2"><strong className="text-dark shrink-0">Portabilidad:</strong> Exportar tus datos (próximamente)</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="border-t border-dark/10 pt-6">
        <Link href="/docs/plans" className="flex items-center gap-2 p-4 rounded-3xl bg-dark/5 hover:bg-dark/10 transition-colors group">
          <TbArrowLeft size={18} className="text-dark/30 group-hover:text-dark group-hover:-translate-x-1 transition-all" />
          <div>
            <p className="text-xs text-dark/40">Anterior</p>
            <p className="font-black italic text-sm text-dark">Planes</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
