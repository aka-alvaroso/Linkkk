function renderError(title, message) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        

        @font-face {
          font-family: 'Brice';
          src: url('/assets/font/Brice-Bold.ttf') format('truetype');
          font-weight: bold;
          font-style: normal;
          font-display: swap;
        }

        .font-brice {
            font-family: 'Brice', sans-serif;
        }

        .templace-container {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #2F52E0;
          color: white;
        }

        .templace-container .content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .templace-container .content h1 {
          font-size: 3.5rem;
          font-weight: bold;
          font-family: 'Brice', sans-serif;
          color: #FFE066;
        }

        .templace-container .content p {
          font-size: 1.5rem;
          font-weight: bold;
          font-family: 'Brice', sans-serif;
          color: white;
        }

      </style>
    </head>
    <body">
      <div class="templace-container">
        <div class="templace-container content">
          <h1>${title}</h1>
          <p>${message}</p>
        </div>
    </body>
    </html>
  `;
}

function renderPasswordForm(shortCode, errorMessage = "", userData) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Enlace protegido</title>
      <link rel="icon" href="/public/images/logo.png" type="image/x-icon" />
      <link rel="shortcut icon" href="/public/images/logo.png" type="image/x-icon" />
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        @font-face {
          font-family: 'Brice';
          src: url('/assets/font/Brice-Bold.ttf') format('truetype');
          font-weight: bold;
          font-style: normal;
          font-display: swap;
        }

        .font-brice {
            font-family: 'Brice', sans-serif;
        }

        .templace-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #2F52E0;
          color: white;
        }

        .templace-container .logo {
          width: 3rem;
          height: 3rem;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: white;
          color: #2F52E0;
          border-radius: 0.5rem;
          font-size: 2rem;
          font-weight: bold;
          font-family: 'Brice', sans-serif;
          border: 2px dashed white;
          transition: all 0.2s ease;
        }
          
        .templace-container .logo:hover {
          background-color: transparent;
          color: white;
        }

        .templace-container h1 {
          font-size: 3.5rem;
          font-weight: bold;
          font-family: 'Brice', sans-serif;
          color: #FFE066;
          text-align: center;
        }

        .templace-container form {
          margin-top: 2rem;
        }

        
        .templace-container input, .templace-container button {
          padding: 0.75rem;
          margin: 0.5rem;
          font-size: 1rem;
        }

        .templace-container input {
          background-color: transparent;
          border: 2px dashed #FFE066;
          border-radius: 0.5rem;
          color: #FFE066;
        } 

        
        .templace-container input:focus {
          outline: none;
          border: 2px solid #FFE066;
        }

        .templace-container input::placeholder {
          color: #FFE066;
        }

       .templace-container button {
          background-color: #FFE066;
          color: #2F52E0;
          border: 2px dashed #ffe066;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

      .templace-container button:hover {
          background-color: transparent;
          color: #FFE066;
        }

      .templace-container img {
          width: 200px;
          height: auto;
          margin-top: 2rem;
        }

        .templace-container a {
          color: #FFE066;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .error {
          background-color: #991b1bdd;
          color: #ef4444;
          padding: 0.5rem;
          border-radius: 0.5rem;
          margin-top: 1rem;
        }



      </style>
    </head>
    <body>
      <div class="templace-container">
        <a href="https://linkkk.dev/" class="logo">
          <p>k.</p>
        </a>
        <h1>Enlace protegido</h1>
        <form method="POST" action="/r/${shortCode}">
          <input type="password" name="password" placeholder="Contraseña" required />
          <input type="hidden" name="userData" value="${userData}" />
          <button type="submit">Acceder</button>
        </form>
        ${errorMessage ? `<p class="error">${errorMessage}</p>` : ""}
        <img src="/public/images/linky_security.png" alt="Linky Security" />
      </div>
    </body>
    </html>
  `;
}

module.exports = {
  renderError,
  renderPasswordForm,
};
