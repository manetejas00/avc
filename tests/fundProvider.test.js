import test from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';
import { MutualFundProvider } from '../services/providers/mutualFundProvider.js';
test('legacy fund API also uses calendar NAV dates and suppresses IDCW performance', async () => {
 const original=axios.get;
 const data={meta:{scheme_code:1,scheme_name:'Example Direct Growth'},data:[{date:'30-10-2026',nav:'120'},{date:'30-10-2025',nav:'100'},{date:'30-10-2023',nav:'80'}]};
 axios.get=async()=>({data});
 try { const provider=new MutualFundProvider();const result=await provider.getSchemeDetails('1');assert.equal(result.performance.return1Y,20);assert.equal(result.latestNavDate,'30-10-2026');assert.equal(result.performance.return5Y,null);data.meta.scheme_name='Example Direct IDCW';const idcw=await provider.getSchemeDetails('1');assert.equal(idcw.performance.return1Y,null); }
 finally{axios.get=original;}
});
