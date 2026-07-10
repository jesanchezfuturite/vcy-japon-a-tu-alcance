import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { name, email, phone } = data;

    // Validation
    if (!name || !email || !phone) {
      return new Response(
        JSON.stringify({ message: 'Faltan campos obligatorios' }),
        { status: 400 }
      );
    }

    const BREVO_API_KEY = import.meta.env.BREVO_API_KEY;
    const N8N_WEBHOOK_URL = import.meta.env.N8N_WEBHOOK_URL;

    if (!BREVO_API_KEY || !N8N_WEBHOOK_URL) {
      return new Response(
        JSON.stringify({ message: 'Error de configuración del servidor' }),
        { status: 500 }
      );
    }

    // 1. Create/Update Contact in Brevo
    const contactResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        attributes: {
          NOMBRE: name,
          WHATSAPP: phone,
          ORIGEN: 'Landing Japon 2026'
        },
        updateEnabled: true,
      }),
    });

    if (!contactResponse.ok) {
      const errorData = await contactResponse.json();
      console.error('Error de Brevo Contact:', errorData);
      return new Response(
        JSON.stringify({ message: 'Error al registrar el contacto' }),
        { status: 500 }
      );
    }

    // 2. Send Transactional Email
    const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'VCY Japón', email: 'noreply@futurite.info' },
        to: [
          { email: 'dev@futurite.com', name: 'Admin' },
          { email: 'ventas@viajacomoyo.net', name: 'Ventas' }
        ],
        subject: 'Nuevo Lead: Japón a tu Alcance 2026',
        htmlContent: `
          <html>
            <body>
              <h1>Nuevo Prospecto Registrado</h1>
              <p><strong>Nombre:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Teléfono/WhatsApp:</strong> ${phone}</p>
              <p><strong>Origen:</strong> Landing Japón 2026</p>
            </body>
          </html>
        `
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error('Error de Brevo Email:', errorData);
      return new Response(
        JSON.stringify({ message: 'Error al enviar el correo' }),
        { status: 500 }
      );
    }

    // 3. Send Lead to n8n Webhook
    const webhookResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        nombre: name,
        telefono: phone,
        correo: email,
        origen: 'Japón a tu alcance',
      }),
    });

    if (!webhookResponse.ok) {
      const errorData = await webhookResponse.text();
      console.error('Error de n8n Webhook:', errorData);
      return new Response(
        JSON.stringify({ message: 'Error al enviar el webhook' }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Registro y envío de correo exitoso' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en API:', error);
    return new Response(
      JSON.stringify({ message: 'Error interno del servidor' }),
      { status: 500 }
    );
  }
};
