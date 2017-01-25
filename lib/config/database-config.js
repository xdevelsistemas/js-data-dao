"use strict";
const DSRethinkDBAdapter = require('js-data-rethinkdb');
class DatabaseConfig {
    contructor() {
        this._adapterOptions = { default: true };
        this._database = 'rethinkdb';
        this._adapter = new DSRethinkDBAdapter({
            host: process.env.SERVER_RETHINKDB_HOST || 'localhost',
            port: process.env.SERVER_RETHINKDB_PORT || 28015,
            db: process.env.SERVER_RETHINKDB_DB || 'appserver'
        });
    }
    getAdapterOptions() {
        return this._adapterOptions;
    }
    getDatabase() {
        return this._database;
    }
    getAdapter() {
        return this._adapter;
    }
}
exports.DatabaseConfig = DatabaseConfig;

//# sourceMappingURL=database-config.js.map
