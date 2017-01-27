import { IDefaultAdapterOptions } from '../interfaces'
import * as JSDataRethink from 'js-data-rethinkdb'
export class DatabaseConfig {
  private _adapterOptions: IDefaultAdapterOptions
  private _adapter: JSDataRethink.RethinkDBAdapter
  private _database: string
  public constructor() {
    this._adapterOptions = { default: true }
    this._database = 'rethinkdb'
    this._adapter = new JSDataRethink.RethinkDBAdapter({
      host: process.env.SERVER_RETHINKDB_HOST || 'localhost',
      port: process.env.SERVER_RETHINKDB_PORT || 28015,
      db: process.env.SERVER_RETHINKDB_DB || 'appserver'
    })
  }
  getAdapterOptions() {
    return this._adapterOptions
  }
  getDatabase() {
    return this._database
  }
  getAdapter() {
    return this._adapter
  }
}
