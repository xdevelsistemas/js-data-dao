"use strict";

const api_error_1 = require('../services/api-error');
const service_lib_1 = require('../services/service-lib');
const _ = require('lodash');
class DAO {
    constructor(currentModel, joins = [], exclude = []) {
        if (!currentModel) {
            throw Error('classe não instanciada corretamente');
        }
        this.options = {
            with: joins
        };
        this.exclude = exclude;
        this.collection = currentModel;
    }
    /**
     * busca todos os registros
     *
     * @param {Object} [query={}]
     * @param {*} user
     * @returns {JSData.JSDataPromise<Array<T>>}
     *
     * @memberOf DAO
     */
    findAll(query = {}, user) {
        return this.collection.findAll(this.activeRecords(query), this.options);
    }
    /**
     * find register by id
     *
     * @param {string} id
     * @param {*} user
     * @returns {JSData.JSDataPromise<T>}
     *
     * @memberOf DAO
     */
    find(id, user) {
        return this.collection.find(id, this.options).then(register => {
            if (register.active) {
                return register;
            } else {
                throw 'Registro não encontrado';
            }
        });
    }
    /**
     * create registro
     *
     * @param {T} obj
     * @param {*} user
     * @returns {JSData.JSDataPromise<T>}
     *
     * @memberOf DAO
     */
    create(obj, user) {
        throw new api_error_1.APIError('Nao implementado', 500);
        // return this.collection.create(obj)
    }
    /**
     * altera registro
     *
     * @param {string} id
     * @param {T} obj
     * @param {*} user
     * @returns {JSData.JSDataPromise<T>}
     *
     * @memberOf DAO
     */
    update(id, user, obj) {
        if (!service_lib_1.ServiceLib.validateFields(obj, Object.keys(obj), this.exclude)) {
            throw 'Alguns dados são obrigatórios, corrija-os e tente novamente';
        }
        return this.collection.update(id, obj);
    }
    /**
     * delete registro
     *
     * @param {string} id
     * @param {*} user
     * @returns {JSData.JSDataPromise<boolean>}
     *
     * @memberOf DAO
     */
    delete(id, user) {
        // return this.collection.destroy(id)
        //     .then(() => true)
        //     .catch(() => false)
        return this.collection.find(id).then(register => {
            if (_.isEmpty(register)) {
                throw 'Registro não encontrado';
            }
            let newObj = register;
            newObj.active = false;
            return this.collection.update(id, newObj).then(() => true);
        });
    }
    /**
     * realize search query using limits and page control
     *
     * @param {Object} search
     * @param {*} user
     * @param {number} [page]
     * @param {number} [limit]
     * @param {Array<string>} [order]
     * @returns {JSData.JSDataPromise<IResultSearch<T>>}
     *
     * @memberOf DAO
     */
    paginatedQuery(search, user, page, limit, order) {
        search = this.activeRecords(search);
        let _page = page || 1;
        let _limit = limit || 10;
        let _order = [];
        let params = Object.assign({}, search, {
            orderBy: _order,
            offset: _limit * (_page - 1),
            limit: _limit
        });
        return this.collection.findAll(search).then(countResult => {
            return this.collection.findAll(params).then(results => {
                return {
                    page: _page,
                    total: countResult.length,
                    result: results
                };
            });
        });
    }
    /**
     * Faz um merge com uma possível pesquisa para buscar somente dados ativos
     *
     * @param {Object} [query={}]
     * @returns {*}
     *
     * @memberOf DAO
     */
    activeRecords(query = {}) {
        return _.merge(query, { where: { active: { '===': true } } });
    }
}
exports.DAO = DAO;
//# sourceMappingURL=dao.js.map
