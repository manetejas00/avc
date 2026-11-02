export function validateSubmission(body) {
  const fields=['name','email','phone','interest','message'];
  if(!body||fields.some(key=>body[key]!==undefined&&typeof body[key]!=='string'))return {error:'Form fields must be text.'};
  const value=Object.fromEntries(fields.map(key=>[key,(body[key]||'').trim()]));
  const {name,email,phone,interest,message}=value;
  if(!name||!email||!phone)return {error:'Name, email, and phone are required.'};
  if(name.length>120||email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email)||!/^\+?[\d\s()-]{7,25}$/.test(phone)||phone.replace(/\D/g,'').length<7||interest.length>150||message.length>5000)return {error:'Enter a valid name, email and phone; message limit is 5000 characters.'};
  return {value:{name,email,phone,interest,message}};
}
