import { IDefaultAdapterOptions } from '../interfaces'
import * as JSDataRethink from 'js-data-rethinkdb'
export class DatabaseConfig {
  private _adapterOptions: IDefaultAdapterOptions
  private _adapter: JSDataRethink.RethinkDBAdapter
  private _database: string
  public constructor () {

    let opts: JSDataRethink.IBaseRethinkDBAdapter = {
      rOpts: {
        servers: [
          { host: process.env.SERVER_RETHINKDB_HOST || 'localhost' }
        ],
        db: process.env.SERVER_RETHINKDB_DB || 'appserver'
      }
    }

    this._adapterOptions = { default: true }
    this._database = 'rethinkdb'
    this._adapter = new JSDataRethink.RethinkDBAdapter(opts)
  }
  getAdapterOptions () {
    return this._adapterOptions
  }
  getDatabase () {
    return this._database
  }
  getAdapter () {
    return this._adapter
  }
}
