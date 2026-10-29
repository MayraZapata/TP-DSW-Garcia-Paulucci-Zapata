
import { MikroORM } from "@mikro-orm/mysql";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";

const DB_URL = process.env.DB_URL;
const DB_NAME = process.env.DB_NAME;
const DB_SSL_CA = process.env.DB_SSL_CA;

if (!DB_URL || !DB_NAME) {
    throw new Error("Faltan DB_URL o DB_NAME en las variables de entorno.");
}

export const orm = await MikroORM.init({
    entities: ['dist/**/*.entity.js'],
    entitiesTs: ['src/**/*.entity.ts'],

    dbName: DB_NAME,
    clientUrl: DB_URL,

    ...(DB_SSL_CA
        ? {
            driverOptions: {
                connection: {
                    ssl: {
                        ca: DB_SSL_CA,
                        rejectUnauthorized: true,
                    },
                },
            },
        }
        : {}),

    highlighter: new SqlHighlighter(),
    debug: process.env.NODE_ENV !== "production",
});

export const syncSchema = async () => {
    const generator = orm.getSchemaGenerator();
};
