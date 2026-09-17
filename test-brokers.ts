import { fetchBrokersForeignFlowSummary } from './api/_lib/sectorsMarket.js';
import dotenv from 'dotenv';
dotenv.config();
async function run() {
    const res = await fetchBrokersForeignFlowSummary('2026-09-15');
    console.log(res);
}
run();
