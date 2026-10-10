import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.3",
        info: {
            title: "API - Gestión de Turnos Médicos",
            version: "1.0.0",
            description:
                "Documentación de la API del sistema de gestión de turnos médicos. " +
                "Para probar los endpoints protegidos, primero ejecutá POST /login: " +
                "el navegador guarda la cookie con el token y las siguientes pruebas ya van autenticadas.",
        },

        // Todas las rutas documentadas cuelgan de /api (en el mismo servidor que sirve esta página)
        servers: [{ url: "/api", description: "Servidor actual" }],

        tags: [
            { name: "Login", description: "Sesión y contraseña" },
            { name: "Pacientes", description: "ABM de pacientes y registro" },
        ],

        components: {
            // La sesión viaja en una cookie httpOnly llamada "token"
            securitySchemes: {
                cookieAuth: { type: "apiKey", in: "cookie", name: "token" },
            },

            // Piezas reutilizables: se referencian con $ref desde las rutas
            schemas: {
                Error: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Recurso no encontrado" },
                    },
                },
            },
            responses: {
                NoAutenticado: {
                    description: "No hay sesión o está vencida",
                    content: {
                        "application/json": { schema: { $ref: "#/components/schemas/Error" } },
                    },
                },
                Prohibido: {
                    description: "El rol no tiene permiso para esta acción",
                    content: {
                        "application/json": { schema: { $ref: "#/components/schemas/Error" } },
                    },
                },
                NoEncontrado: {
                    description: "El recurso no existe",
                },
            },
        },
    },

    // Dónde buscar los comentarios @openapi (relativo a la carpeta backend)
    apis: ["./dist/**/*.routes.js"],
});