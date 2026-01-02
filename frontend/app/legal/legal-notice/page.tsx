"use client";

import { useLanguage } from "@/app/hooks/useLanguage";

export default function LegalNotice() {
    const { currentLocale } = useLanguage();

    if (currentLocale === 'es') {
        return (
            <div className="prose prose-lg max-w-none text-dark">
                <h1 className="text-4xl md:text-5xl font-black italic mb-8">Aviso Legal</h1>
                <div className="bg-light border-l-4 border-dark/20 p-4 mb-8 rounded-r-xl">
                    <p className="font-bold italic m-0 text-dark/80">
                        Última actualización: {new Date().toLocaleDateString('es-ES')}
                    </p>
                </div>

                <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                    <span className="text-4xl text-dark/20">01</span>
                    Datos Identificativos
                </h2>
                <div className="bg-white p-6 rounded-2xl border-2 border-dark shadow-[4px_4px_0_var(--color-dark)]">
                    <p className="mb-4">
                        En cumplimiento con el deber de información recogido en el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico, se reflejan a continuación los siguientes datos:
                    </p>
                    <ul className="list-none pl-0 space-y-2 m-0">
                        <li><strong>Titular:</strong> Álvaro Barbero Roldán</li>
                        <li><strong>Domicilio:</strong> Córdoba, España</li>
                        <li><strong>Email de contacto:</strong> <a href="mailto:help@linkkk.dev" className="font-bold hover:text-primary transition-colors">help@linkkk.dev</a></li>
                    </ul>
                </div>

                <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                    <span className="text-4xl text-dark/20">02</span>
                    Usuarios
                </h2>
                <p>
                    El acceso y/o uso de este portal de Linkkk atribuye la condición de USUARIO, que acepta, desde dicho acceso y/o uso, las Condiciones Generales de Uso aquí reflejadas.
                </p>

                <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                    <span className="text-4xl text-dark/20">03</span>
                    Uso del Portal
                </h2>
                <p>
                    Linkkk proporciona el acceso a multitud de informaciones, servicios, programas o datos (en adelante, &quot;los contenidos&quot;) en Internet pertenecientes a Linkkk o a sus licenciantes a los que el USUARIO pueda tener acceso.
                </p>
                <div className="bg-light p-6 rounded-2xl border border-dark/10">
                    <p className="font-bold mb-2">El USUARIO asume la responsabilidad del uso del portal:</p>
                    <ul className="list-disc pl-5 space-y-2 m-0">
                        <li>El USUARIO se compromete a hacer un uso adecuado de los contenidos y servicios.</li>
                        <li>No emplearlos para actividades ilícitas, ilegales o contrarias a la buena fe y al orden público.</li>
                        <li>No difundir contenidos o propaganda de carácter racista, xenófobo, pornográfico-ilegal, de apología del terrorismo o atentatorio contra los derechos humanos.</li>
                    </ul>
                </div>

                <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                    <span className="text-4xl text-dark/20">04</span>
                    Exclusión de Garantías y Responsabilidad
                </h2>
                <p>
                    Linkkk no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza que pudieran ocasionar, a título enunciativo: errores u omisiones en los contenidos, falta de disponibilidad del portal o la transmisión de virus o programas maliciosos o lesivos en los contenidos, a pesar de haber adoptado todas las medidas tecnológicas necesarias para evitarlo.
                </p>
            </div>
        );
    }

    return (
        <div className="prose prose-lg max-w-none text-dark">
            <h1 className="text-4xl md:text-5xl font-black italic mb-8">Legal Notice</h1>
            <div className="bg-light border-l-4 border-dark/20 p-4 mb-8 rounded-r-xl">
                <p className="font-bold italic m-0 text-dark/80">
                    Last updated: {new Date().toLocaleDateString('en-US')}
                </p>
            </div>

            <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                <span className="text-4xl text-dark/20">01</span>
                Identifying Data
            </h2>
            <div className="bg-white p-6 rounded-2xl border-2 border-dark shadow-[4px_4px_0_var(--color-dark)]">
                <p className="mb-4">
                    In compliance with the duty of information contained in Article 10 of Law 34/2002, of July 11, on Information Society Services and Electronic Commerce, the following data is reflected below:
                </p>
                <ul className="list-none pl-0 space-y-2 m-0">
                    <li><strong>Owner:</strong> Álvaro Barbero Roldán</li>
                    <li><strong>Location:</strong> Córdoba, Spain</li>
                    <li><strong>Contact Email:</strong> <a href="mailto:help@linkkk.dev" className="font-bold hover:text-primary transition-colors">help@linkkk.dev</a></li>
                </ul>
            </div>

            <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                <span className="text-4xl text-dark/20">02</span>
                Users
            </h2>
            <p>
                Access to and/or use of this Linkkk portal attributes the condition of USER, who accepts, from said access and/or use, the General Conditions of Use reflected herein.
            </p>

            <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                <span className="text-4xl text-dark/20">03</span>
                Use of the Portal
            </h2>
            <p>
                Linkkk provides access to a multitude of information, services, programs, or data (hereinafter, &quot;the contents&quot;) on the Internet belonging to Linkkk or its licensors to which the USER may have access.
            </p>
            <div className="bg-light p-6 rounded-2xl border border-dark/10">
                <p className="font-bold mb-2">The USER assumes responsibility for the use of the portal:</p>
                <ul className="list-disc pl-5 space-y-2 m-0">
                    <li>The USER undertakes to make appropriate use of the contents and services.</li>
                    <li>Not to use them for illicit, illegal activities or contrary to good faith and public order.</li>
                    <li>Not to disseminate content or propaganda of a racist, xenophobic, pornographic-illegal nature, advocating terrorism or attacking human rights.</li>
                </ul>
            </div>

            <h2 className="text-2xl font-black italic mt-12 mb-6 flex items-baseline gap-3">
                <span className="text-4xl text-dark/20">04</span>
                Exclusion of Guarantees and Liability
            </h2>
            <p>
                Linkkk is not responsible, in any case, for damages of any nature that could cause, by way of example: errors or omissions in the contents, lack of availability of the portal or the transmission of viruses or malicious or harmful programs in the contents, despite having adopted all the necessary technological measures to avoid it.
            </p>
        </div>
    );
}
