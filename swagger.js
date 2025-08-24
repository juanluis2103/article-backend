const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "Articles API",
    version: "1.0.0",
    description: "API para gestionar artículos y subir imágenes (JPG/PNG).",
  },
  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Servidor local",
    },
  ],
  components: {
    schemas: {
      Article: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string", example: "Mi artículo" },
          content: { type: "string", example: "Contenido del artículo" },
          date: { type: "string", format: "date-time" },
          image: { type: "string", example: "article_172...png" },
        },
      },
      CreateArticleInput: {
        type: "object",
        properties: {
          title: { type: "string", minLength: 5, maxLength: 30 },
          content: { type: "string" },
        },
        required: ["title", "content"],
      },
      UpdateArticleInput: {
        type: "object",
        properties: {
          title: { type: "string", minLength: 5, maxLength: 30 },
          content: { type: "string" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "error" },
          message: { type: "string" },
          error: { type: "string" },
        },
      },
    },
  },
};

// Paths: aquí documentas cada endpoint
const paths = {
  "/create": {
    post: {
      summary: "Crear un artículo",
      tags: ["Articles"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateArticleInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Artículo creado",
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/Article" } },
          },
        },
        400: { description: "Error de validación" },
      },
    },
  },
  "/getArticles": {
    get: {
      summary: "Listar artículos",
      tags: ["Articles"],
      parameters: [
        {
          in: "query",
          name: "top",
          schema: { type: "integer" },
          description: "Número máximo de artículos",
        },
      ],
      responses: {
        200: {
          description: "Lista de artículos",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/Article" },
              },
            },
          },
        },
      },
    },
  },
  "/article/{id}": {
    get: {
      summary: "Obtener artículo por ID",
      tags: ["Articles"],
      parameters: [
        { in: "path", name: "id", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Artículo encontrado",
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/Article" } },
          },
        },
        404: { description: "No encontrado" },
      },
    },
    put: {
      summary: "Actualizar artículo por ID",
      tags: ["Articles"],
      parameters: [
        { in: "path", name: "id", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateArticleInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Artículo actualizado",
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/Article" } },
          },
        },
        404: { description: "No encontrado" },
      },
    },
    delete: {
      summary: "Eliminar artículo por ID",
      tags: ["Articles"],
      parameters: [
        { in: "path", name: "id", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: { description: "Artículo eliminado" },
        404: { description: "No encontrado" },
      },
    },
  },
  "/upload-image/{id}": {
    post: {
      summary: "Subir imagen JPG/PNG y asociarla a un artículo",
      tags: ["Articles"],
      parameters: [
        { in: "path", name: "id", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                file0: { type: "string", format: "binary" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Imagen subida y vinculada" },
        400: { description: "Archivo inválido" },
        404: { description: "Artículo no encontrado" },
      },
    },
  },
};

// Genera spec final
const swaggerSpec = {
  ...swaggerDefinition,
  paths,
};

module.exports = swaggerSpec;
