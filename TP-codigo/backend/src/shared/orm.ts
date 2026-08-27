import { MikroORM } from "@mikro-orm/mysql";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";

export const orm = await MikroORM.init({

    entities: ['dist/**/*.entity.js'],
    entitiesTs: ['src/**/*.entity.ts'],

    dbName: 'gestion_turnos',

    clientUrl:
        'mysql://UsuarioBD:SqlPassword-DSW@localhost:3306/gestion_turnos',

    highlighter: new SqlHighlighter(),

    debug: true,

});

export const syncSchema = async () => {

    const generator = orm.getSchemaGenerator();

};