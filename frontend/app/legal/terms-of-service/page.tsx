"use client";

import { useLanguage } from "@/app/hooks/useLanguage";

export default function TermsOfService() {
    const { currentLocale } = useLanguage();

    if (currentLocale === 'es') {
        return (
            <div className="prose prose-lg max-w-none text-dark">
                <h1 className="text-4xl md:text-5xl font-black italic mb-8">Términos y Condiciones</h1>
                <div className="bg-light border-l-4 border-dark/20 p-4 mb-8 rounded-r-xl">
                    <p className="font-bold italic m-0 text-dark/80">
                        Última actualización: {new Date().toLocaleDateString('es-ES')}
                    </p>
                </div>

                <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                    <span className="text-4xl text-dark/20">01</span>
                    Aceptación de los Términos
                </h2>
                <p>
                    Al acceder y utilizar <strong>Linkkk</strong>, aceptas cumplir y estar sujeto a estos Términos y Condiciones.
                    Si no estás de acuerdo con alguna parte de los términos, no podrás acceder al servicio.
                </p>

                <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                    <span className="text-4xl text-dark/20">02</span>
                    Descripción del Servicio
                </h2>
                <p>
                    Linkkk es una herramienta que permite acortar URLs y aplicar reglas condicionales (geolocalización, tipo de dispositivo, etc.)
                    para redirigir el tráfico. El servicio se proporciona "tal cual" y "según disponibilidad".
                </p>

                <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                    <span className="text-4xl text-dark/20">03</span>
                    Uso del Servicio
                </h2>
                <p>Te comprometes a utilizar el servicio únicamente para fines legales. Queda expresamente prohibido:</p>
                <div className="bg-white border-2 border-danger/20 rounded-2xl p-6 mt-4">
                    <ul className="list-disc pl-5 space-y-2 m-0 marker:text-danger">
                        <li>Acortar enlaces a contenido <strong>ilegal, fraudulento, phishing o malware</strong>.</li>
                        <li>Utilizar el servicio para enviar spam o comunicaciones no solicitadas.</li>
                        <li>Intentar interferir con el funcionamiento técnico del servicio.</li>
                    </ul>
                </div>
                <p className="mt-4 text-sm bg-light p-3 rounded-lg border-l-4 border-warning/50">
                    Nos reservamos el derecho de eliminar cualquier enlace y bloquear el acceso a cualquier usuario que viole estas condiciones,
                    sin previo aviso y a nuestra entera discreción.
                </p>

                <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                    <span className="text-4xl text-dark/20">04</span>
                    Propiedad Intelectual
                </h2>
                <p>
                    El servicio y su contenido original, características y funcionalidad son y seguirán siendo propiedad exclusiva de Linkkk y sus licenciantes.
                </p>

                <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                    <span className="text-4xl text-dark/20">05</span>
                    Limitación de Responsabilidad
                </h2>
                <p>
                    En ningún caso Linkkk, ni sus directores, empleados o afiliados, serán responsables por daños indirectos, incidentales, especiales,
                    consecuenciales o punitivos, incluyendo sin limitación, pérdida de beneficios, datos, uso, buena voluntad u otras pérdidas intangibles.
                </p>

                <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                    <span className="text-4xl text-dark/20">06</span>
                    Ley Aplicable
                </h2>
                <p>
                    Estos Términos se regirán e interpretarán de acuerdo con las leyes de <strong>España</strong>, sin tener en cuenta sus disposiciones sobre conflictos de leyes.
                </p>
            </div>
        );
    }

    return (
        <div className="prose prose-lg max-w-none text-dark">
            <h1 className="text-4xl md:text-5xl font-black italic mb-8">Terms of Service</h1>
            <div className="bg-light border-l-4 border-dark/20 p-4 mb-8 rounded-r-xl">
                <p className="font-bold italic m-0 text-dark/80">
                    Last updated: {new Date().toLocaleDateString('en-US')}
                </p>
            </div>

            <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                <span className="text-4xl text-dark/20">01</span>
                Acceptance of Terms
            </h2>
            <p>
                By accessing and using <strong>Linkkk</strong>, you agree to comply with and be bound by these Terms of Service.
                If you do not agree to any part of the terms, you may not access the service.
            </p>

            <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                <span className="text-4xl text-dark/20">02</span>
                Service Description
            </h2>
            <p>
                Linkkk is a tool that allows you to shorten URLs and apply conditional rules (geolocation, device type, etc.)
                to redirect traffic. The service is provided "as is" and "as available".
            </p>

            <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                <span className="text-4xl text-dark/20">03</span>
                Use of Service
            </h2>
            <p>You agree to use the service only for lawful purposes. The following is expressly prohibited:</p>
            <div className="bg-white border-2 border-danger/20 rounded-2xl p-6 mt-4">
                <ul className="list-disc pl-5 space-y-2 m-0 marker:text-danger">
                    <li>Shortening links to <strong>illegal, fraudulent, phishing, or malware</strong> content.</li>
                    <li>Using the service to send spam or unsolicited communications.</li>
                    <li>Attempting to interfere with the technical operation of the service.</li>
                </ul>
            </div>
            <p className="mt-4 text-sm bg-light p-3 rounded-lg border-l-4 border-warning/50">
                We reserve the right to remove any link and block access to any user who violates these conditions,
                without prior notice and at our sole discretion.
            </p>

            <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                <span className="text-4xl text-dark/20">04</span>
                Intellectual Property
            </h2>
            <p>
                The service and its original content, features, and functionality are and will remain the exclusive property of Linkkk and its licensors.
            </p>

            <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                <span className="text-4xl text-dark/20">05</span>
                Limitation of Liability
            </h2>
            <p>
                In no event shall Linkkk, nor its directors, employees, or affiliates, be liable for any indirect, incidental, special,
                consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>

            <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                <span className="text-4xl text-dark/20">06</span>
                Governing Law
            </h2>
            <p>
                These Terms shall be governed and construed in accordance with the laws of <strong>Spain</strong>, without regard to its conflict of law provisions.
            </p>
        </div>
    );
}
