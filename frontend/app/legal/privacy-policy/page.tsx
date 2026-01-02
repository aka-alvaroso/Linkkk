"use client";

import { useLanguage } from "@/app/hooks/useLanguage";

export default function PrivacyPolicy() {
    const { currentLocale } = useLanguage();

    if (currentLocale === 'es') {
        return (
            <div className="prose prose-lg max-w-none text-dark">
                <h1 className="text-4xl md:text-5xl font-black italic mb-8">Política de Privacidad</h1>

                <div className="bg-light border-l-4 border-dark/20 p-4 mb-8 rounded-r-xl">
                    <p className="font-bold italic m-0 text-dark/80">
                        Última actualización: {new Date().toLocaleDateString('es-ES')}
                    </p>
                </div>

                <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                    <span className="text-4xl text-dark/20">01</span>
                    Responsable del Tratamiento
                </h2>
                <div className="mb-8">
                    <p className="mb-4">
                        El responsable del tratamiento de sus datos personales es:
                    </p>
                    <div className="bg-white p-6 rounded-2xl border-2 border-dark shadow-[4px_4px_0_var(--color-dark)]">
                        <ul className="list-none pl-0 space-y-2 m-0">
                            <li><strong>Titular:</strong> Álvaro Barbero Roldán (en adelante, &quot;el Titular&quot;)</li>
                            <li><strong>Domicilio:</strong> Córdoba, España</li>
                            <li><strong>Email de contacto:</strong> <a href="mailto:help@linkkk.dev" className="font-bold hover:text-primary transition-colors">help@linkkk.dev</a></li>
                        </ul>
                    </div>
                </div>

                <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                    <span className="text-4xl text-dark/20">02</span>
                    Datos que recopilamos
                </h2>
                <p className="mb-4">En Linkkk recopilamos los siguientes tipos de datos para garantizar el funcionamiento del servicio:</p>
                <ul className="list-none space-y-4 pl-0">
                    <li className="bg-white p-4 rounded-xl border border-dark/20">
                        <strong className="text-dark text-lg block mb-1">Datos de Usuario</strong>
                        Si te registras o apuntas a la lista de espera, recopilamos tu dirección de correo electrónico, nombre de usuario y contraseña (cifrada).
                    </li>
                    <li className="bg-white p-4 rounded-xl border border-dark/20">
                        <strong className="text-dark text-lg block mb-1">Datos de Cookies y Sesión</strong>
                        Utilizamos cookies técnicas para mantener tu sesión y preferencias (como el idioma).
                    </li>
                    <li className="bg-white p-4 rounded-xl border border-dark/20">
                        <strong className="text-dark text-lg block mb-1">Datos de Acceso a Enlaces</strong>
                        <p className="mb-2">Cuando un usuario visita un enlace corto creado en Linkkk, recopilamos automáticamente:</p>
                        <ul className="list-disc pl-5 space-y-1 text-dark/80 bg-light p-3 rounded-lg">
                            <li>Dirección IP (para geolocalización y detección de abuso).</li>
                            <li>Tipo de dispositivo y navegador (User Agent).</li>
                            <li>País de origen.</li>
                            <li>Detección de VPN o Bots.</li>
                        </ul>
                        <p className="text-sm mt-3 italic text-dark/60">
                            Estos datos son estrictamente necesarios para proporcionar las analíticas avanzadas y las reglas de redirección, que son la funcionalidad principal del servicio.
                        </p>
                    </li>
                </ul>

                <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                    <span className="text-4xl text-dark/20">03</span>
                    Finalidad del tratamiento
                </h2>
                <p>Tratamos sus datos para las siguientes finalidades esenciales:</p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-white p-4 rounded-xl border border-dark/10 shadow-sm hover:border-dark/30 transition-colors">
                        <span className="font-bold block mb-1">Servicio Principal</span>
                        Proporcionar el servicio de acortamiento y gestión de enlaces.
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-dark/10 shadow-sm hover:border-dark/30 transition-colors">
                        <span className="font-bold block mb-1">Reglas Lógicas</span>
                        Ejecutar las reglas condicionales configuradas (ej. bloquear bots, redirección por país).
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-dark/10 shadow-sm hover:border-dark/30 transition-colors">
                        <span className="font-bold block mb-1">Analíticas</span>
                        Mostrar estadísticas agregadas y anónimas a los creadores de los enlaces.
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-dark/10 shadow-sm hover:border-dark/30 transition-colors">
                        <span className="font-bold block mb-1">Seguridad</span>
                        Garantizar la seguridad de la plataforma y prevenir abusos (spam, phishing).
                    </div>
                </div>

                <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                    <span className="text-4xl text-dark/20">04</span>
                    Alojamiento y Transferencias
                </h2>
                <div className="bg-white p-6 rounded-2xl border-2 border-dark/20">
                    <p className="mb-2">
                        Nuestros servidores están alojados en <strong>OVH</strong>, en centros de datos ubicados en <strong>Canadá</strong>.
                    </p>
                    <p className="text-sm text-dark/70 m-0">
                        Canadá cuenta con una <strong>decisión de adecuación</strong> de la Comisión Europea, lo que garantiza un nivel de protección de datos equivalente al estándar europeo (GDPR).
                    </p>
                </div>

                <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                    <span className="text-4xl text-dark/20">05</span>
                    Sus Derechos
                </h2>
                <p className="mb-6">
                    Como usuario, tiene derecho a acceder, rectificar, suprimir sus datos, limitar su tratamiento u oponerse al mismo.
                </p>
                <p>
                    Para ejercer estos derechos, contáctenos en <a href="mailto:help@linkkk.dev" className="font-bold underline decoration-2 decoration-primary underline-offset-2 hover:text-primary transition-colors">help@linkkk.dev</a>.
                </p>
            </div>
        );
    }

    // English Version (Default)
    return (
        <div className="prose prose-lg max-w-none text-dark">
            <h1 className="text-4xl md:text-5xl font-black italic mb-8">Privacy Policy</h1>

            <div className="bg-light border-l-4 border-dark/20 p-4 mb-8 rounded-r-xl">
                <p className="font-bold italic m-0 text-dark/80">
                    Last updated: {new Date().toLocaleDateString('en-US')}
                </p>
            </div>

            <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                <span className="text-4xl text-dark/20">01</span>
                Data Controller
            </h2>
            <div className="mb-8">
                <p className="mb-4">
                    The data controller responsible for your personal information is:
                </p>
                <div className="bg-white p-6 rounded-2xl border-2 border-dark shadow-[4px_4px_0_var(--color-dark)]">
                    <ul className="list-none pl-0 space-y-2 m-0">
                        <li><strong>Owner:</strong> Álvaro Barbero Roldán (hereinafter, &quot;the Owner&quot;)</li>
                        <li><strong>Location:</strong> Córdoba, Spain</li>
                        <li><strong>Contact Email:</strong> <a href="mailto:help@linkkk.dev" className="font-bold hover:text-primary transition-colors">help@linkkk.dev</a></li>
                    </ul>
                </div>
            </div>

            <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                <span className="text-4xl text-dark/20">02</span>
                Data We Collect
            </h2>
            <p className="mb-4">At Linkkk, we collect the following types of data to ensure service functionality:</p>
            <ul className="list-none space-y-4 pl-0">
                <li className="bg-white p-4 rounded-xl border border-dark/20">
                    <strong className="text-dark text-lg block mb-1">User Data</strong>
                    If you register, we collect your email address, username, and password (hashed).
                </li>
                <li className="bg-white p-4 rounded-xl border border-dark/20">
                    <strong className="text-dark text-lg block mb-1">Cookies & Session Data</strong>
                    We use technical cookies to maintain your session and preferences (such as language).
                </li>
                <li className="bg-white p-4 rounded-xl border border-dark/20">
                    <strong className="text-dark text-lg block mb-1">Link Access Data</strong>
                    <p className="mb-2">When a user visits a short link created on Linkkk, we automatically collect:</p>
                    <ul className="list-disc pl-5 space-y-1 text-dark/80 bg-light p-3 rounded-lg">
                        <li>IP Address (for geolocation and abuse detection).</li>
                        <li>Device type and browser (User Agent).</li>
                        <li>Country of origin.</li>
                        <li>VPN or Bot detection status.</li>
                    </ul>
                    <p className="text-sm mt-3 italic text-dark/60">
                        These data are strictly necessary to provide advanced analytics and redirection rules, which are the core functionality of the service.
                    </p>
                </li>
            </ul>

            <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                <span className="text-4xl text-dark/20">03</span>
                Purpose of Processing
            </h2>
            <p>We process your data for the following essential purposes:</p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white p-4 rounded-xl border border-dark/10 shadow-sm hover:border-dark/30 transition-colors">
                    <span className="font-bold block mb-1">Core Service</span>
                    To provide link shortening and management services.
                </div>
                <div className="bg-white p-4 rounded-xl border border-dark/10 shadow-sm hover:border-dark/30 transition-colors">
                    <span className="font-bold block mb-1">Logic Rules</span>
                    To execute conditional rules configured by users (e.g., block bots, redirect by country).
                </div>
                <div className="bg-white p-4 rounded-xl border border-dark/10 shadow-sm hover:border-dark/30 transition-colors">
                    <span className="font-bold block mb-1">Analytics</span>
                    To display aggregated, anonymous statistics to link creators.
                </div>
                <div className="bg-white p-4 rounded-xl border border-dark/10 shadow-sm hover:border-dark/30 transition-colors">
                    <span className="font-bold block mb-1">Security</span>
                    To ensure platform security and prevent abuse (spam, phishing).
                </div>
            </div>

            <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                <span className="text-4xl text-dark/20">04</span>
                Hosting and Transfers
            </h2>
            <div className="bg-white p-6 rounded-2xl border-2 border-dark/20">
                <p className="mb-2">
                    Our servers are hosted by <strong>OVH</strong>, in data centers located in <strong>Canada</strong>.
                </p>
                <p className="text-sm text-dark/70 m-0">
                    Canada has an <strong>adequacy decision</strong> from the European Commission, ensuring a level of data protection equivalent to European standards (GDPR).
                </p>
            </div>

            <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                <span className="text-4xl text-dark/20">05</span>
                Your Rights
            </h2>
            <p className="mb-6">
                As a user, you have the right to access, rectify, delete your data, limit processing, or object to it.
            </p>
            <p>
                To exercise these rights, contact us at <a href="mailto:help@linkkk.dev" className="font-bold underline decoration-2 decoration-primary underline-offset-2 hover:text-primary transition-colors">help@linkkk.dev</a>.
            </p>
        </div>
    );
}

