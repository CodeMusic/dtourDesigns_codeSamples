import jwt from 'jsonwebtoken';
import { Guid } from 'guid-typescript';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { headers } from 'next/headers';
import { db, SimulatedConsciousness } from './db_mysql';
import { Model, ModelStatic } from 'sequelize';
import { debugLog } from '../api/error-handler';


export const simulatedConsciousnessesRepo = {
    getCodeMusai,
    getAll,
    getAllPartial,
    getAllForUser,
    getById,
    create,
    update,
    delete: _delete
};

async function getCodeMusai() {
    try 
    {
        const codeMusaiName = 'CodeMusai';

        return await (db.SimulatedConsciousness as ModelStatic<Model<any, any>>).findAll({
            where: {
                    name: codeMusaiName
            }
        });
    } 
    catch 
    {
        throw 'CodeMusai not found.';
    }
}

async function getAll() {
    return await (db.SimulatedConsciousness as ModelStatic<Model<any, any>>).findAll();
}

async function getAllPartial(limit: number, page: number, userId?: number) {
    page = Math.max(1, page);
    limit = Math.max(1, limit);

    try {
        const options = {
            limit: limit,
            offset: (page - 1) * limit,
            order: [['createdAt', 'DESC']], // Assuming you might want to order results
            where: {} as any
        };

        if (userId) {
            options.where.userId = userId; // Add userId to where clause if provided
        }

        var resultsSet: { count: number; rows: Model<any, any>[] } = { count: 0, rows: [] };
        if (userId)
        {
            resultsSet = await (db.SimulatedConsciousness as ModelStatic<Model<any, any>>).findAndCountAll({ limit: limit, offset: (page - 1) * limit, where: { userId: userId } });
        }
        else
        {
            resultsSet = await (db.SimulatedConsciousness as ModelStatic<Model<any, any>>).findAndCountAll({ limit: limit, offset: (page - 1) * limit });
        }


        debugLog("PartialAPI: L:" + limit, "P:" + page, "U:" + (userId ?? "None"), "Count:" + resultsSet.count);
        return {totalCount: resultsSet.count, rows: resultsSet.rows}; // Return both count and rows for client-side pagination
    } catch (error) {
        console.error("Error fetching generative results:" + error + ". getting all instead");
        return await getAll();
        //throw new Error('Database operation failed');
    }
    
}

async function getAllForUser(userId: number) {
    debugLog("Querying the database for all SimulatedConsciousnesses where userId = " + userId + ", isCore, or isPublic, and where lastServerSync is not null.");
    var numUserId = parseInt(userId.toString(), 10);
    return await (db.SimulatedConsciousness as ModelStatic<Model<any, any>>).findAll({
        where: {
            [Op.or]: [
                { isCore: true },
                {
                    [Op.and]: [
                        { lastServerSync: { [Op.ne]: null } }, // Ensure lastServerSync is correctly typed as Date or includes null in your model
                        {
                            [Op.or]: [
                                { isPublic: true },
                                { userId: numUserId }
                            ]
                        }
                    ]
                }
            ]
        }
    });
    //return simulatedConsciousnesses.map(simulatedConsciousness => simulatedConsciousness.get({ plain: true }));
}

async function getById(id: string) {
    try 
    {
        return await (db.SimulatedConsciousness as ModelStatic<Model<any, any>>).findByPk(id);
    } 
    catch 
    {
        throw 'SimulatedConsciousness Not Found';
    }
}

async function create(params: any) {
    
    debugLog("Creating a new SimulatedConsciousness...");
    var simulatedConsciousness : SimulatedConsciousness | null = await (db.SimulatedConsciousness as ModelStatic<Model<any, any>>).findOne({ where: { name: params.name } }) as SimulatedConsciousness | null;
    if (simulatedConsciousness) 
    {
        throw 'Name "' + params.name + '" is already taken';
        /* UPSERT
        debugLog('Name "' + params.name + '" is already taken');
        simulatedConsciousness.id = params.id;
        simulatedConsciousness.name = params.name;
        simulatedConsciousness.description = params.description;
        simulatedConsciousness.assistantId = params.assistantId;
        simulatedConsciousness.userId = params.userId;
        simulatedConsciousness.personality = params.personality;
        simulatedConsciousness.isCore = params.isCore;
        simulatedConsciousness.isPublic = params.isPublic;
        simulatedConsciousness.lastServerSync = params.lastServerSync;
        await simulatedConsciousness.save();
        debugLog("SimulatedConsciousness Existed, so it was Updated instead.");
        return;
        */
    }

    await (db.SimulatedConsciousness as ModelStatic<Model<any, any>>).create(params);
    debugLog("SimulatedConsciousness Created");
}

async function update(id: string, params: any) {

    const aSimulatedConsciousness = await (db.SimulatedConsciousness as ModelStatic<Model<any, any>>).findByPk(id) as SimulatedConsciousness;

    // validate
    if (!aSimulatedConsciousness) 
    {
        throw 'SimulatedConsciousness not found';
    }
    
    if (aSimulatedConsciousness.name !== params.name && await (db.SimulatedConsciousness as ModelStatic<Model<any, any>>).findOne({ where: { name: params.name } })) {
        throw 'Name "' + params.name + '" is already taken';
    }


    // copy params properties to simulatedConsciousness
    Object.assign(aSimulatedConsciousness, params);

    await aSimulatedConsciousness.save();
}

async function _delete(id: string)
{
    const aSimulatedConsciousness = await (db.SimulatedConsciousness as ModelStatic<Model<any, any>>).findByPk(id);
    if (!aSimulatedConsciousness) 
    {
        throw 'SimulatedConsciousness not found';
    }

    // delete user
    await aSimulatedConsciousness.destroy();
}

