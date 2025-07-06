<p align="center">
  <a href="https://linkkk.dev/"><img src="frontend/public/images/logo.png" width="128"></a>
  <h1 align="center"><a href="https://linkkk.dev">Linkkk</a></h1>
  <p align="center">Acortar, reunir estadísticas y aumentar la personalización de tus enlaces</p>
</p>




## 🚀 ¿Qué es Linkkk?
Linkkk es un servicio que principalmente trata de acortar enlaces, nació como un <b>Proyecto de Fin de Grado (TFG)</b> que hice para terminar mi Grado Superior en Desarrollo de Aplicaciones Web. 
Además de permitir acortar enlaces, Linkkk tiene algunas funcionalidades extra como, generación de códigos QR para los enlaces, posibiliad de añadir ajustes avanzados a los enlaces entre otras.

## ✨ Características Destacadas

### 🎯 Funcionalidades Principales
  - **Usabilidad sin registro**: Linkkk permite el uso del servicio sin necesidad de que el usuario esté registrado, sin embargo, habrán limitaciones que se detallarán más abajo.
  - **Acortar URLs**: Genera a partir de una url, un enlace corto que redirige al enlace destino.
  - **Gestión de Links**: Posibilidad de gestionar enlaces pudiendo crear nuevos, editar existente o eliminarlos.
  - **Gestión de Grupos**: Posibilidad de gestionar grupos, útiles para organizar enlaces.
  - **Gestión de etiquetas**: Posibilidad de gestionar etiquetas, útiles para identificar y gestionar enlaces.
  - **Analíticas**: Cada enlace, almacenará unas analíticas que se podrán ver en una dashboard del enlace. Estas analíticas son:
    - **Número de accesos**: Número de accesos totales al enlace.
    - **Gráfica de accesos recientes**: Una gráfica donde se muestran el número de accesos al enlace de cada día de la última semana.
    - **Gráfica de tipos de dispositivo**: Una gráfica donde se muestra el % accesos según el tipo de dispositivo.
    - **Tabla de accesos**: Una tabla donde se muestran todos los accesos al enlace con información como si ha usado VPN, el país, la IP, el tipo de dispositivo y la fecha.

### 🛠️ Funcionalidades Adicionales
  - **Generación de códigos QR**: Linkkk permite generar códigos QR que llevan a un enlace concreto.
  - **API para desarrolladores**: Linkkk tiene una API para desarrolladores que se encuentra en fase `BETA`, y sólo dispone de 2 endpoints usables.
  - **Ajustes avanzados**: Linkkk dispone de varios ajustes avanzados que los usuarios pueden usar a la hora de crear un enlace o editarlo. Estos son:
    - **Fecha de expiración**: Establece una fecha concreta que, una vez llegada, el enlace dejará de funcionar.
    - **Límite de accesos**: Establece un límite de accesos máximo al enlace, una vez alcanzado no será accesible.
    - **Contraseña**: Protege el enlace con una contraseña que permitirá acceder al enlace si se introduce.
    - **Bloqueo de países**: Bloquea ciertos países del acceso al enlace.
    - **Redirección inteligente**: Permite, según el tipo de dispositivo del usuario, redirigir a un enlace final u otro.
    - **Metadatos**: Permite cambiar los metadatos del enlace mostrados en Redes Sociales al compartirlo.
    - **Sufijo personalizado**: Cambia el sufijo del enlace para que sea más fácil de recordar.
     
## 👤 Tipos de Usuario

### 🚶 Invitado
Son usuarios por defecto, permite usar la aplicación sin necesidad de registrarse.
Estos usuarios disponen de algunas limitaciones:
  - **Límite de enlaces**: Los invitados podrán crear un máximo de `10` enlaces.
  - **Panel de detalle**: Los invitados no podrán acceder al panel de detalles de un enlace.
  - **Fecha de expiración**: Los enlaces creados por invitados expirarán automáticamente a los `7` días desde su creación.
  - **Creación de grupos y etiquetas**: Los invitados no podrán crear grupos ni etiquetas.

`Nota: En caso de que un usuario invitado haya creado X enlaces y desee pasar a una cuenta de usuario, podrá registrarse y sus enlaces se traspasarán automáticamente a la nueva cuenta.
También, si un usuario ya tenía cuenta creada pero sin iniciar sesión ha creado algún enlace, si inicia sesión también se traspasarán los enlaces creados con el modo invitado.`

### 🧑‍💻 Usuarios Registrados
Una cuenta es considerada usuario cuando se ha registrado.
Los usuarios disponen de ciertas características como estas:
  - **Panel de detalle**: Los usuarios podrán entrar al panel de detalle de un enlace pudiendo ver sus analíticas.
  - **Límite de enlaces**: Los usuarios podrán crear hasta `50` enlaces, ampliando el límite con respecto a invitados.
  - **Fecha de expiración**: Los enlaces creados por usuarios, no expirarán.
  - **Creación de grupos y etiquetas**: Los usuarios podrán crear un máximo de `5` grupos y `15` etiquetas.
  - **API para desarrolladores**: Los usuarios podrán usar la API para desarrolladores con un límite de 100 peticiones por día.


### ⭐ Usuarios PRO
Una cuenta es considerara PRO cuando se ha suscrito mensualmente al servicio.
Los usuarios PRO son los que más ventajas tienen, aquí van:
  - **Generación de QR**: Los usuarios PRO, podrán generar códigos QR para sus enlaces.
  - **Límite de enlaces**: Los usuarios PRO no tendrán límite de creación de enlaces.
  - **Ajustes avanzados**: Los usuarios PRO podrán crear y editar sus enlaces con los ajustes PRO (o avanzados).
  - **Creación de grupos y etiquetas**: Los usuarios PRO podrán crear `50` grupos y `100` etiquetas.

## ⚙️ Tecnologías Utilizadas
Tecnologías utilizadas en el proyecto:

### 🖥️ Front-End (Cliente)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)  ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

### ☁️ Back-End (Servidor)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)  ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![Stripe](https://img.shields.io/badge/Stripe-5469d4?style=for-the-badge&logo=stripe&logoColor=ffffff)  ![Zod](https://img.shields.io/badge/zod-%233068b7.svg?style=for-the-badge&logo=zod&logoColor=white)

### 🗄️ Base de Datos
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

