'use strict';
const $=id=>document.getElementById(id);
const form=$('qrForm'),canvas=$('qrCanvas'),status=$('qrStatus'),png=$('qrPng'),svg=$('qrSvg');
let generated=null;
function clearCode(){generated=null;canvas.hidden=true;$('qrPlaceholder').hidden=false;png.disabled=svg.disabled=true;}
function luminance(hex){const v=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));return .2126*v[0]+.7152*v[1]+.0722*v[2];}
function generate(){clearCode();status.textContent='';try{
const raw=$('qrUrl').value.trim();const url=new URL(raw);if(!['https:','http:'].includes(url.protocol)||url.username||url.password||raw.length>500)throw Error('Enter a public HTTP or HTTPS URL, without login credentials, up to 500 characters.');
const color=$('qrColor').value;if(!/^#[0-9a-f]{6}$/i.test(color)||1.05/(luminance(color)+.05)<4.5)throw Error('Choose a darker code color for reliable contrast.');
if(typeof qrcode!=='function')throw Error('QR library unavailable. Check your connection and reload.');
const qr=qrcode(0,'M');qr.addData(url.href);qr.make();
const n=qr.getModuleCount(),size=Number($('qrSize').value);if(![512,1024,2048].includes(size))throw Error('Invalid download size.');
const scale=Math.floor(size/(n+8)),offset=Math.floor((size-n*scale)/2);
canvas.width=canvas.height=size;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,size,size);ctx.fillStyle=color;
let path='';for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(qr.isDark(y,x)){ctx.fillRect(offset+x*scale,offset+y*scale,scale,scale);path+='M'+(x+4)+' '+(y+4)+'h1v1h-1z';}
generated={svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+(n+8)+' '+(n+8)+'" shape-rendering="crispEdges"><path fill="#fff" d="M0 0h'+(n+8)+'v'+(n+8)+'H0z"/><path fill="'+color+'" d="'+path+'"/></svg>'};
canvas.hidden=false;$('qrPlaceholder').hidden=true;png.disabled=svg.disabled=false;status.textContent='QR code ready. Scan-test it before use.';
}catch(e){status.textContent=e.message||'Unable to generate code.';}}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
form.addEventListener('submit',e=>{e.preventDefault();generate();});
form.addEventListener('input',()=>{if(generated){clearCode();status.textContent='Generate a new code to apply your changes.';}});
form.addEventListener('reset',()=>{clearCode();status.textContent='';});
png.addEventListener('click',()=>{if(generated)canvas.toBlob(blob=>{if(blob)download(blob,'12one-qr-code.png');else status.textContent='Unable to export PNG.';},'image/png');});
svg.addEventListener('click',()=>{if(generated)download(new Blob([generated.svg],{type:'image/svg+xml'}),'12one-qr-code.svg');});