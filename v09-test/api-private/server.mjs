/* AIA — API privée de génération, Node.js 20+, sans dépendance.
 * Secrets requis côté serveur : OPENAI_API_KEY et AIA_ACCESS_TOKEN.
 * Ne pas exposer ces secrets dans GitHub Pages. Déploiement NON effectué.
 */
import {createServer} from 'node:http';
const port=Number(process.env.PORT||3000);
const origin='https://jma-system.github.io';
const key=process.env.OPENAI_API_KEY;
const access=process.env.AIA_ACCESS_TOKEN;
const recent=new Map();
function reply(res,status,data){
 res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':origin,'Vary':'Origin','Cache-Control':'no-store'});
 res.end(JSON.stringify(data));
}
createServer(async(req,res)=>{
 if(req.url==='/health'&&req.method==='GET')return reply(res,200,{status:key&&access?'ready':'missing-secrets'});
 if(req.url!=='/generate'||!['POST','OPTIONS'].includes(req.method))return reply(res,404,{error:'Not found'});
 if(req.headers.origin!==origin)return reply(res,403,{error:'Origine non autorisée'});
 if(req.method==='OPTIONS'){
  res.writeHead(204,{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, X-AIA-Access','Access-Control-Max-Age':'600','Vary':'Origin'});
  return res.end();
 }
 if(!key||!access)return reply(res,503,{error:'Moteur non configuré'});
 if(!req.headers['x-aia-access']||req.headers['x-aia-access']!==access)return reply(res,401,{error:'Accès refusé'});
 const ip=req.socket.remoteAddress||'unknown';
 if(Date.now()-(recent.get(ip)||0)<45000)return reply(res,429,{error:'Patiente avant une nouvelle demande'});
 let data='';
 try{
  for await(const part of req){
   data+=part.toString();
   if(Buffer.byteLength(data)>24000)return reply(res,413,{error:'Texte trop long'});
  }
  const input=JSON.parse(data);
  const subject=String(input.subject||'').trim().slice(0,180);
  const publication=['CVM','TG'].includes(input.publication)?input.publication:'TG';
  const format=['Tract','Fiche','Étude'].includes(input.format)?input.format:'Fiche';
  const sourceText=String(input.sourceText||'').trim().slice(0,18000);
  if(!subject)return reply(res,400,{error:'Sujet obligatoire'});
  if(!sourceText)return reply(res,422,{error:'Ajoute un extrait de la publication pour produire un résumé fidèle'});
  recent.set(ip,Date.now());
  const instructions='Rédige en français /HUMAN naturel, personnel et fluide, pour une étude individuelle. Respecte les textes fournis, ne crée aucune citation ou référence biblique imaginaire. Ne prétends jamais avoir consulté JW.org. Pour une Tour de Garde, termine par 3 à 4 questions de révision et leurs réponses. Retourne seulement la fiche.';
  const response=await fetch('https://api.openai.com/v1/chat/completions',{
   method:'POST',headers:{'Authorization':'Bearer '+key,'Content-Type':'application/json'},
   body:JSON.stringify({model:'gpt-5.4-mini',messages:[
    {role:'system',content:instructions},
    {role:'user',content:JSON.stringify({publication,format,subject,date:String(input.date||''),sourceText})}
   ],max_completion_tokens:2300}),
   signal:AbortSignal.timeout(55000)
  });
  const json=await response.json();
  if(!response.ok)return reply(res,502,{error:'Service IA indisponible ('+response.status+')'});
  const answer=json.choices?.[0]?.message?.content;
  if(typeof answer!=='string'||!answer.trim())return reply(res,502,{error:'Réponse IA vide'});
  return reply(res,200,{text:answer,model:'gpt-5.4-mini'});
 }catch(e){return reply(res,500,{error:'Impossible de préparer la fiche'});}
}).listen(port,'0.0.0.0');
