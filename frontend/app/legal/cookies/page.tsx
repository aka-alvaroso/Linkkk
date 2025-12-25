"use client";

import { useLanguage } from "@/app/hooks/useLanguage";

export default function CookiePolicy() {
    const { currentLocale } = useLanguage();

    if (currentLocale === 'es') {
        return (
            <div className="prose prose-lg max-w-none text-dark">
                <h1 className="text-4xl md:text-5xl font-black italic mb-8">Política de Cookies</h1>
                <div className="bg-light border-l-4 border-dark/20 p-4 mb-8 rounded-r-xl">
                    <p className="font-bold italic m-0 text-dark/80">
                        Última actualización: {new Date().toLocaleDateString('es-ES')}
                    </p>
                </div>

                <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                    <span className="text-4xl text-dark/20">01</span>
                    ¿Qué son las cookies?
                </h2>
                <div className="bg-white p-6 rounded-2xl border-2 border-dark/10">
                    <p className="m-0">
                        Una cookie es un pequeño fichero de texto que se almacena en su navegador cuando visita casi cualquier página web.
                        Su utilidad es que la web sea capaz de recordar su visita cuando vuelva a navegar por esa página.
                    </p>
                </div>

                <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                    <span className="text-4xl text-dark/20">02</span>
                    Cookies utilizadas en este sitio web
                </h2>
                <p>Linkkk utiliza las siguientes cookies <strong>técnicas y propias</strong>:</p>

                <div className="overflow-x-auto my-6 rounded-2xl border border-dark/20 shadow-sm">
                    <table className="min-w-full text-left text-sm border-collapse m-0">
                        <thead>
                            <tr className="bg-dark text-light">
                                <th className="p-4 border-b border-light/20 font-black tracking-wider">Nombre</th>
                                <th className="p-4 border-b border-light/20 font-black tracking-wider">Propósito</th>
                                <th className="p-4 border-b border-light/20 font-black tracking-wider">Duración</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            <tr className="border-b border-dashed border-dark/10 hover:bg-light/50 transition-colors">
                                <td className="p-4 font-mono font-bold text-dark">NEXT_LOCALE</td>
                                <td className="p-4">Almacena la preferencia de idioma del usuario.</td>
                                <td className="p-4 text-center bg-gray-50 font-bold text-dark/60">1 año</td>
                            </tr>
                            <tr className="border-b border-dashed border-dark/10 hover:bg-light/50 transition-colors">
                                <td className="p-4 font-mono font-bold text-dark">token</td>
                                <td className="p-4">Gestiona la sesión del usuario autenticado registrado.</td>
                                <td className="p-4 text-center bg-gray-50 font-bold text-dark/60">7 días</td>
                            </tr>
                            <tr className="hover:bg-light/50 transition-colors">
                                <td className="p-4 font-mono font-bold text-dark">guestToken</td>
                                <td className="p-4">Gestiona la sesión del usuario invitado (no registrado).</td>
                                <td className="p-4 text-center bg-gray-50 font-bold text-dark/60">7 días</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                    <span className="text-4xl text-dark/20">03</span>
                    Desactivación o eliminación de cookies
                </h2>
                <p>
                    En cualquier momento podrá ejercer su derecho de desactivación o eliminación de cookies de este sitio web.
                    Estas acciones se realizan de forma diferente en función del navegador que esté usando (Chrome, Firefox, Safari, etc.).
                </p>
                <div className="bg-light p-4 mt-4 text-sm rounded-xl border border-warning/30">
                    <p className="m-0 italic text-dark/70">
                        Tenga en cuenta que al desactivar estas cookies técnicas, es posible que algunas funcionalidades básicas (como mantener su sesión iniciada o el idioma preferido) dejen de funcionar correctamente.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="prose prose-lg max-w-none text-dark">
            <h1 className="text-4xl md:text-5xl font-black italic mb-8">Cookie Policy</h1>
            <div className="bg-light border-l-4 border-dark/20 p-4 mb-8 rounded-r-xl">
                <p className="font-bold italic m-0 text-dark/80">
                    Last updated: {new Date().toLocaleDateString('en-US')}
                </p>
            </div>

            <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                <span className="text-4xl text-dark/20">01</span>
                What are cookies?
            </h2>
            <div className="bg-white p-6 rounded-2xl border-2 border-dark/10">
                <p className="m-0">
                    A cookie is a small text file that is stored in your browser when you visit almost any website.
                    Its utility is that the web is able to remember your visit when you return to browse that page.
                </p>
            </div>

            <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                <span className="text-4xl text-dark/20">02</span>
                Cookies used on this website
            </h2>
            <p>Linkkk uses the following <strong>first-party technical cookies</strong>:</p>

            <div className="overflow-x-auto my-6 rounded-2xl border border-dark/20 shadow-sm">
                <table className="min-w-full text-left text-sm border-collapse m-0">
                    <thead>
                        <tr className="bg-dark text-light">
                            <th className="p-4 border-b border-light/20 font-black tracking-wider">Name</th>
                            <th className="p-4 border-b border-light/20 font-black tracking-wider">Purpose</th>
                            <th className="p-4 border-b border-light/20 font-black tracking-wider">Duration</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        <tr className="border-b border-dashed border-dark/10 hover:bg-light/50 transition-colors">
                            <td className="p-4 font-mono font-bold text-dark">NEXT_LOCALE</td>
                            <td className="p-4">Stores the user's language preference.</td>
                            <td className="p-4 text-center bg-gray-50 font-bold text-dark/60">1 year</td>
                        </tr>
                        <tr className="border-b border-dashed border-dark/10 hover:bg-light/50 transition-colors">
                            <td className="p-4 font-mono font-bold text-dark">token</td>
                            <td className="p-4">Manages the session for authenticated registered users.</td>
                            <td className="p-4 text-center bg-gray-50 font-bold text-dark/60">7 days</td>
                        </tr>
                        <tr className="hover:bg-light/50 transition-colors">
                            <td className="p-4 font-mono font-bold text-dark">guestToken</td>
                            <td className="p-4">Manages the session for guest users (non-registered).</td>
                            <td className="p-4 text-center bg-gray-50 font-bold text-dark/60">7 days</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                <span className="text-4xl text-dark/20">03</span>
                Deactivation or elimination of cookies
            </h2>
            <p>
                At any time you may exercise your right to deactivate or eliminate cookies from this website.
                These actions are performed differently depending on the browser you are using (Chrome, Firefox, Safari, etc.).
            </p>
            <div className="bg-light p-4 mt-4 text-sm rounded-xl border border-warning/30">
                <p className="m-0 italic text-dark/70">
                    Please note that by disabling these technical cookies, some basic functionalities (such as keeping you signed in or your preferred language) may stop working correctly.
                </p>
            </div>
        </div>
    );
}
