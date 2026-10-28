/* AIA — Worker IA d'essai. Sans extraction automatique des articles JW.org.
   Configurer une liaison Workers AI nommée AI dans le tableau de bord Cloudflare.
   Garder le forfait Workers Free. Ce prototype public doit être réservé à un essai limité. */
const ORIGIN = 'https://jma-system.github.io';
const MODEL = '@cf/google/gemma-4-26b-a4b-it';
const headers = {'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin','Cache-Control':'no-store'};
function json(body,status=200){return new Response(JSON.stringify(body),{status,headers:{...headers,'Content-Type':'application/json; charset=utf-8'}})}
export default {
 async fetch(request,env){
  const origin=request.headers.get('Origin');
  if(origin!==ORIGIN)return json({error:'Origine non autorisée.'},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(request.method!=='POST')return json({error:'POST requis.'},405);
  if(new URL(request.url).pathname!=='/generate')return json({error:'Route inconnue.'},404);
  if(!env.AI)return json({error:'Liaison Workers AI absente.'},503);
  const length=Number(request.headers.get('content-length')||0);
  if(length>12000)return json({error:'Requête trop volumineuse.'},413);
  let input;
  try{input=await request.json()}catch{return json({error:'JSON incorrect.'},400)}
  const {publication,format,subject,date,sourceText}=input||{};
  if(!['CVM','TG'].includes(publication)||!['Tract','Fiche','Étude'].includes(format)||typeof subject!=='string'||!subject.trim()||subject.length>200||typeof date!=='string'||date.length>20||typeof sourceText!=='string'||sourceText.length>6500)return json({error:'Paramètres invalides.'},400);
  const shape={Tract:'Court, facile à utiliser oralement, avec introduction et conclusion.',Fiche:'Synthèse claire, rubriques courtes et points essentiels.',Étude:'Analyse approfondie structurée, avec questions de réflexion.'}[format];
  const instructions=[
   'Tu prépares en français une aide personnelle à l’étude biblique.',
   'N’affirme jamais avoir consulté une source externe : aucun accès web n’est fourni.',
   'Ne fabrique aucune citation biblique, référence, numéro de paragraphe ou information attribuée à JW.org ou WOL.',
   'Si aucun extrait de source n’est fourni, indique explicitement que c’est une trame de préparation à compléter après vérification de la publication officielle.',
   'Si un extrait est fourni, utilise uniquement cet extrait pour toute affirmation présentée comme issue de la publication.',
   'Reste factuel, naturel et respectueux, sans reproduire longuement une publication.',
   'Rédige seulement le contenu de la fiche, sans instructions techniques.'
  ].join(' ');
  try{
   const answer=await env.AI.run(MODEL,{messages:[{role:'system',content:instructions},{role:'user',content:`Publication : ${publication}\nFormat : ${format}\nDate : ${date}\nSujet : ${subject.trim()}\nConsigne de forme : ${shape}\nExtrait fourni par l'utilisateur (peut être vide) :\n${sourceText.trim()||'[Aucun extrait fourni]'}`}],max_tokens:1250,chat_template_kwargs:{enable_thinking:false}},{rejectIfBusy:true});
   const content=typeof answer?.response==='string'?answer.response:answer?.choices?.[0]?.message?.content;
   if(!content||typeof content!=='string')return json({error:'Réponse IA absente.'},502);
   return json({text:content.slice(0,12000),model:MODEL,sourceProvided:!!sourceText.trim()});
  }catch(e){return json({error:'Génération indisponible ou quota gratuit atteint. Réessaie plus tard.'},503)}
 }
};
