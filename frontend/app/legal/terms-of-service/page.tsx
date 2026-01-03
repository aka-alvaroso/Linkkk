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
                    para redirigir el tráfico. El servicio se proporciona &quot;tal cual&quot; y &quot;según disponibilidad&quot;.
                </p>

                <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                    <span className="text-4xl text-dark/20">03</span>
                    Planes y Límites de Uso
                </h2>
                <p className="mb-4">Linkkk ofrece diferentes niveles de servicio con límites específicos:</p>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl border-2 border-dark/20">
                        <h3 className="font-black text-lg mb-2">INVITADO</h3>
                        <ul className="text-sm space-y-1 list-disc pl-4 m-0">
                            <li>Hasta 3 enlaces</li>
                            <li>1 regla por enlace</li>
                            <li>1 condición por regla</li>
                            <li>Duración: 7 días</li>
                        </ul>
                    </div>
                    <div className="bg-white p-4 rounded-xl border-2 border-dark/20">
                        <h3 className="font-black text-lg mb-2">STANDARD (Gratis)</h3>
                        <ul className="text-sm space-y-1 list-disc pl-4 m-0">
                            <li>Hasta 50 enlaces</li>
                            <li>3 reglas por enlace</li>
                            <li>2 condiciones por regla</li>
                            <li>Duración: ilimitada</li>
                        </ul>
                    </div>
                    <div className="bg-primary/10 p-4 rounded-xl border-2 border-primary">
                        <h3 className="font-black text-lg mb-2">PRO</h3>
                        <ul className="text-sm space-y-1 list-disc pl-4 m-0">
                            <li>Enlaces ilimitados</li>
                            <li>Reglas ilimitadas</li>
                            <li>Condiciones ilimitadas</li>
                            <li>Historial completo</li>
                        </ul>
                    </div>
                </div>

                <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                    <span className="text-4xl text-dark/20">04</span>
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
                    <span className="text-4xl text-dark/20">05</span>
                    Suscripciones y Pagos
                </h2>
                <div className="bg-white p-6 rounded-2xl border-2 border-primary/20 mb-6">
                    <h3 className="font-bold text-lg mb-3">Precios del Plan PRO</h3>
                    <ul className="list-disc pl-5 space-y-2 m-0">
                        <li><strong>Mensual:</strong> 9€/mes</li>
                        <li><strong>Anual:</strong> 90€/año (equivalente a 7.50€/mes)</li>
                    </ul>
                    <p className="text-sm mt-3 text-dark/70 m-0">
                        Los precios son base. El IVA y otros impuestos aplicables se calcularán automáticamente según tu ubicación al momento del pago.
                    </p>
                </div>

                <h3 className="font-bold text-lg mb-3">Procesamiento de Pagos</h3>
                <p className="mb-4">
                    Los pagos se procesan de forma segura a través de <strong>Stripe</strong>. Linkkk no almacena datos de tarjetas de crédito.
                    Al suscribirte al plan PRO, autorizas cobros recurrentes automáticos.
                </p>

                <h3 className="font-bold text-lg mb-3 mt-6">Renovación Automática</h3>
                <p className="mb-4">
                    Las suscripciones se renuevan automáticamente al final de cada período (mensual o anual).
                    Recibirás un cargo en tu método de pago registrado. Puedes cancelar en cualquier momento desde tu configuración.
                </p>

                <h3 className="font-bold text-lg mb-3 mt-6">Fallos de Pago</h3>
                <p className="mb-4">
                    Si un pago falla, intentaremos procesarlo nuevamente. Si el pago sigue fallando, tu acceso PRO se suspenderá
                    hasta que actualices tu método de pago. No somos responsables por cargos bancarios o tarifas relacionadas con pagos rechazados.
                </p>

                <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                    <span className="text-4xl text-dark/20">06</span>
                    Cancelaciones y Reembolsos
                </h2>
                <div className="bg-light p-6 rounded-2xl border-l-4 border-warning/50 mb-4">
                    <h3 className="font-bold text-lg mb-3">Política de Cancelación</h3>
                    <p className="mb-3">
                        Puedes cancelar tu suscripción PRO en cualquier momento desde tu panel de configuración.
                        Al cancelar, mantendrás acceso PRO hasta el final de tu período de facturación actual.
                    </p>
                    <p className="mb-3">
                        <strong>Al finalizar el período:</strong> Tu cuenta volverá automáticamente al plan STANDARD.
                        Si excedes los límites del plan STANDARD (más de 50 enlaces, más de 3 reglas, etc.), los elementos excedentes se eliminarán automáticamente.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border-2 border-danger/20">
                    <h3 className="font-bold text-lg mb-3">Política de Reembolsos</h3>
                    <p className="m-0">
                        <strong>No ofrecemos reembolsos.</strong> Todos los pagos son finales y no reembolsables.
                        Al suscribirte, reconoces y aceptas esta política.
                    </p>
                </div>

                <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                    <span className="text-4xl text-dark/20">07</span>
                    Modificaciones de Precios
                </h2>
                <p className="mb-4">
                    Nos reservamos el derecho de modificar los precios del servicio en cualquier momento.
                    Si cambiamos los precios, te notificaremos con <strong>al menos 30 días de antelación</strong> por correo electrónico.
                </p>
                <p>
                    Los cambios de precio no afectarán a suscripciones activas hasta su próxima renovación.
                    Si no estás de acuerdo con el nuevo precio, puedes cancelar tu suscripción antes de la fecha de renovación.
                </p>

                <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                    <span className="text-4xl text-dark/20">08</span>
                    Propiedad Intelectual
                </h2>
                <p>
                    El servicio y su contenido original, características y funcionalidad son y seguirán siendo propiedad exclusiva de Linkkk y sus licenciantes.
                </p>

                <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                    <span className="text-4xl text-dark/20">09</span>
                    Disponibilidad del Servicio
                </h2>
                <p className="mb-4">
                    El servicio se proporciona <strong>&quot;tal cual&quot;</strong> y <strong>&quot;según disponibilidad&quot;</strong>.
                    No garantizamos que el servicio esté disponible de forma ininterrumpida o libre de errores.
                </p>
                <p>
                    Nos reservamos el derecho de suspender temporalmente el servicio por mantenimiento, actualizaciones o cualquier otra razón,
                    con o sin previo aviso.
                </p>

                <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                    <span className="text-4xl text-dark/20">10</span>
                    Limitación de Responsabilidad
                </h2>
                <p>
                    En ningún caso Linkkk, ni sus directores, empleados o afiliados, serán responsables por daños indirectos, incidentales, especiales,
                    consecuenciales o punitivos, incluyendo sin limitación, pérdida de beneficios, datos, uso, buena voluntad u otras pérdidas intangibles.
                </p>

                <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                    <span className="text-4xl text-dark/20">11</span>
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
                to redirect traffic. The service is provided &quot;as is&quot; and &quot;as available&quot;.
            </p>

            <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                <span className="text-4xl text-dark/20">03</span>
                Plans and Usage Limits
            </h2>
            <p className="mb-4">Linkkk offers different service tiers with specific limits:</p>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border-2 border-dark/20">
                    <h3 className="font-black text-lg mb-2">GUEST</h3>
                    <ul className="text-sm space-y-1 list-disc pl-4 m-0">
                        <li>Up to 3 links</li>
                        <li>1 rule per link</li>
                        <li>1 condition per rule</li>
                        <li>Duration: 7 days</li>
                    </ul>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-dark/20">
                    <h3 className="font-black text-lg mb-2">STANDARD (Free)</h3>
                    <ul className="text-sm space-y-1 list-disc pl-4 m-0">
                        <li>Up to 50 links</li>
                        <li>3 rules per link</li>
                        <li>2 conditions per rule</li>
                        <li>Duration: unlimited</li>
                    </ul>
                </div>
                <div className="bg-primary/10 p-4 rounded-xl border-2 border-primary">
                    <h3 className="font-black text-lg mb-2">PRO</h3>
                    <ul className="text-sm space-y-1 list-disc pl-4 m-0">
                        <li>Unlimited links</li>
                        <li>Unlimited rules</li>
                        <li>Unlimited conditions</li>
                        <li>Full access history</li>
                    </ul>
                </div>
            </div>

            <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                <span className="text-4xl text-dark/20">04</span>
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
                <span className="text-4xl text-dark/20">05</span>
                Subscriptions and Payments
            </h2>
            <div className="bg-white p-6 rounded-2xl border-2 border-primary/20 mb-6">
                <h3 className="font-bold text-lg mb-3">PRO Plan Pricing</h3>
                <ul className="list-disc pl-5 space-y-2 m-0">
                    <li><strong>Monthly:</strong> €9/month</li>
                    <li><strong>Yearly:</strong> €90/year (equivalent to €7.50/month)</li>
                </ul>
                <p className="text-sm mt-3 text-dark/70 m-0">
                    Prices are base prices. VAT and other applicable taxes will be calculated automatically based on your location at the time of payment.
                </p>
            </div>

            <h3 className="font-bold text-lg mb-3">Payment Processing</h3>
            <p className="mb-4">
                Payments are securely processed through <strong>Stripe</strong>. Linkkk does not store credit card data.
                By subscribing to the PRO plan, you authorize automatic recurring charges.
            </p>

            <h3 className="font-bold text-lg mb-3 mt-6">Automatic Renewal</h3>
            <p className="mb-4">
                Subscriptions automatically renew at the end of each billing period (monthly or yearly).
                You will be charged on your registered payment method. You can cancel anytime from your settings.
            </p>

            <h3 className="font-bold text-lg mb-3 mt-6">Payment Failures</h3>
            <p className="mb-4">
                If a payment fails, we will attempt to process it again. If payment continues to fail, your PRO access will be suspended
                until you update your payment method. We are not responsible for bank charges or fees related to declined payments.
            </p>

            <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                <span className="text-4xl text-dark/20">06</span>
                Cancellations and Refunds
            </h2>
            <div className="bg-light p-6 rounded-2xl border-l-4 border-warning/50 mb-4">
                <h3 className="font-bold text-lg mb-3">Cancellation Policy</h3>
                <p className="mb-3">
                    You can cancel your PRO subscription at any time from your settings panel.
                    Upon cancellation, you will retain PRO access until the end of your current billing period.
                </p>
                <p className="mb-3">
                    <strong>At the end of the period:</strong> Your account will automatically revert to the STANDARD plan.
                    If you exceed STANDARD plan limits (more than 50 links, more than 3 rules, etc.), excess items will be automatically deleted.
                </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border-2 border-danger/20">
                <h3 className="font-bold text-lg mb-3">Refund Policy</h3>
                <p className="m-0">
                    <strong>We do not offer refunds.</strong> All payments are final and non-refundable.
                    By subscribing, you acknowledge and accept this policy.
                </p>
            </div>

            <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                <span className="text-4xl text-dark/20">07</span>
                Price Modifications
            </h2>
            <p className="mb-4">
                We reserve the right to modify service prices at any time.
                If we change prices, we will notify you with <strong>at least 30 days advance notice</strong> via email.
            </p>
            <p>
                Price changes will not affect active subscriptions until their next renewal.
                If you disagree with the new price, you can cancel your subscription before the renewal date.
            </p>

            <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                <span className="text-4xl text-dark/20">08</span>
                Intellectual Property
            </h2>
            <p>
                The service and its original content, features, and functionality are and will remain the exclusive property of Linkkk and its licensors.
            </p>

            <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                <span className="text-4xl text-dark/20">09</span>
                Service Availability
            </h2>
            <p className="mb-4">
                The service is provided <strong>&quot;as is&quot;</strong> and <strong>&quot;as available&quot;</strong>.
                We do not guarantee that the service will be uninterrupted or error-free.
            </p>
            <p>
                We reserve the right to temporarily suspend the service for maintenance, updates, or any other reason,
                with or without prior notice.
            </p>

            <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                <span className="text-4xl text-dark/20">10</span>
                Limitation of Liability
            </h2>
            <p>
                In no event shall Linkkk, nor its directors, employees, or affiliates, be liable for any indirect, incidental, special,
                consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>

            <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                <span className="text-4xl text-dark/20">11</span>
                Governing Law
            </h2>
            <p>
                These Terms shall be governed and construed in accordance with the laws of <strong>Spain</strong>, without regard to its conflict of law provisions.
            </p>
        </div>
    );
}
