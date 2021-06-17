/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Exam } from '../models/exam';

@Info({ title: 'StudentContract', description: "Smart contract for students' channel" })
export class StudentContract extends Contract {
    @Transaction()
    public async CreateExam(ctx: Context, id: string, examiner: string, title: string, subject: string, date: string, duration: number, password: string, address: string, live: string = '1'): Promise<void> {
        const exam: Exam = {
            ID: id,
            Examiner: examiner,
            Title: title,
            Subject: subject,
            Date: date,
            Duration: duration,
            Password: password,
            Address: address,
            Live: live
        }
        if (ctx.clientIdentity.getMSPID() == 'ExaminersMSP') {
            await ctx.stub.putState(id, Buffer.from(JSON.stringify(exam)));
        } else {
            throw new Error('Only examiners are allowed to perform this action');
        }
    }

    @Transaction(false)
    @Returns('string')
    public async FetchExam(ctx: Context, id: string): Promise<string> {
        const exam = await ctx.stub.getState(id);
        if (!exam || exam.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return exam.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    @Transaction()
    public async UpdateExam(ctx: Context, id: string, examiner: string, title: string, subject: string, date: string, duration: number, password: string, address: string, live: string = '1'): Promise<void> {
        const exists = await this.ExamExists(ctx, id);
        if (!exists) {
            throw new Error(`The exam ${id} does not exist`);
        }

        if (ctx.clientIdentity.getID() == examiner) {
            const updatedExam: Exam = {
                ID: id,
                Examiner: examiner,
                Title: title,
                Subject: subject,
                Date: date,
                Duration: duration,
                Password: password,
                Address: address,
                Live: live
            }
            return ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedExam)));
        } else {
            throw new Error('You are not the examiner for this exam');
        }
    }

    @Transaction()
    public async CancelExam(ctx: Context, id: string): Promise<void> {
        const exists = await this.ExamExists(ctx, id);
        if (!exists) {
            throw new Error(`The exam ${id} does not exist`);
        }
        const examString: string = await this.FetchExam(ctx, id);
        const exam: Exam = JSON.parse(examString);
        await this.UpdateExam(ctx, id, exam.Examiner, exam.Title, exam.Subject, exam.Date, exam.Duration, exam.Password, exam.Address, '0');
    }

    // DeleteAsset deletes an given asset from the world state.
    @Transaction()
    public async DeleteExam(ctx: Context, id: string): Promise<void> {
        const exists = await this.ExamExists(ctx, id);
        if (!exists) {
            throw new Error(`The exam ${id} does not exist`);
        }
        const examString: string = await this.FetchExam(ctx, id);
        const exam: Exam = JSON.parse(examString);
        if (ctx.clientIdentity.getID() == exam.Examiner) {
            return ctx.stub.deleteState(id);
        } else {
            throw new Error('You are not the examiner for this exam');
        }
    }

    // AssetExists returns true when asset with given ID exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async ExamExists(ctx: Context, id: string): Promise<boolean> {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // GetAllAssets returns all assets found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllExams(ctx: Context): Promise<string> {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all exams in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ ID: result.value.key, Exam: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}
