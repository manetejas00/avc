import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../netlify/functions/administration.mts';

const request = (path: string, method = 'GET', body?: unknown, origin?: string) => new Request('https://site.example'+path, {method,headers:{'Content-Type':'application/json',...(origin?{Origin:origin}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});

test('anonymous callers cannot read consultation records or logs',async()=>{
  for(const path of ['/api/admin/submissions','/api/admin/sync-logs','/api/admin/check-auth']){
    const response=await handler(request(path));
    assert.equal(response.status,401);
    assert.equal(response.headers.get('cache-control'),'no-store');
  }
});
test('anonymous callers cannot update consultation status',async()=>{
  const response=await handler(request('/api/admin/submissions/1/status','POST',{status:'completed'}));
  assert.equal(response.status,401);
});
test('admin login rejects missing or invalid field types before contacting Identity',async()=>{
  for(const body of [{},{email:['invalid'],password:'password'},{email:'test@example.com',password:''}])assert.equal((await handler(request('/api/admin/login','POST',body))).status,400);
});
test('state-changing APIs reject cross-origin requests',async()=>{
  const response=await handler(request('/api/submit-form','POST',{name:'Test'},'https://another.example'));
  assert.equal(response.status,403);
});
test('consultation API rejects malformed bodies, oversized payloads and unsupported methods',async()=>{
  assert.equal((await handler(request('/api/submit-form'))).status,405);
  assert.equal((await handler(request('/api/submit-form','POST',{name:'Test'}))).status,400);
  assert.equal((await handler(request('/api/submit-form','POST',{message:'x'.repeat(33000)}))).status,413);
  assert.equal((await handler(request('/api/submit-form','DELETE'))).status,405);
  assert.equal((await handler(new Request('https://site.example/api/submit-form',{method:'POST',body:'{invalid'}))).status,400);
});
