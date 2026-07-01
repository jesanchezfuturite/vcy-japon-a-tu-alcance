import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
//#region src/pages/api/contact.ts
var contact_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var POST = async ({ request }) => {
	try {
		const { name, email, phone } = await request.json();
		if (!name || !email || !phone) return new Response(JSON.stringify({ message: "Faltan campos obligatorios" }), { status: 400 });
		const BREVO_API_KEY = process.env.BREVO_API_KEY;
		if (!BREVO_API_KEY) {
			console.warn("BREVO_API_KEY no configurada. Simulando éxito.");
			return new Response(JSON.stringify({ message: "Éxito (Simulado)" }), { status: 200 });
		}
		const response = await fetch("https://api.brevo.com/v3/contacts", {
			method: "POST",
			headers: {
				"accept": "application/json",
				"api-key": BREVO_API_KEY,
				"content-type": "application/json"
			},
			body: JSON.stringify({
				email,
				attributes: {
					NOMBRE: name,
					WHATSAPP: phone,
					ORIGEN: "Landing Japon 2026"
				},
				listIds: [2],
				updateEnabled: true
			})
		});
		if (!response.ok) {
			const errorData = await response.json();
			console.error("Error de Brevo:", errorData);
			return new Response(JSON.stringify({ message: "Error al procesar el registro" }), { status: 500 });
		}
		return new Response(JSON.stringify({ message: "Registro exitoso" }), { status: 200 });
	} catch (error) {
		console.error("Error en API:", error);
		return new Response(JSON.stringify({ message: "Error interno del servidor" }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/contact@_@ts
var page = () => contact_exports;
//#endregion
export { page };
