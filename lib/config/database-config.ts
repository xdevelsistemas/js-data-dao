import { IDefaultAdapterOptions } from '../interfaces'
import * as JSDataRethink from 'js-data-rethinkdb'
import {getEnv} from './utils'

export class DatabaseConfig {
  private _adapterOptions: IDefaultAdapterOptions
  private _adapter: JSDataRethink.RethinkDBAdapter
  private _database: string
  public constructor () {

    let opts: JSDataRethink.IBaseRethinkDBAdapter = {
      rOpts: {
        servers: [
          { host: getEnv('SERVER_RETHINKDB_HOST') || 'localhost' }
        ],
        db: getEnv('SERVER_RETHINKDB_DB') || 'appserver'
      }
    }

    this._adapterOptions = { default: true }
    this._database = 'rethinkdb'
    this._adapter = new JSDataRethink.RethinkDBAdapter(opts)
  }
  get adapterOptions () {
    return this._adapterOptions
  }
  get database () {
    return this._database
  }
  get adapter () {
    return this._adapter
  }
}
