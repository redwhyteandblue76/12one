const FIELDS = ['name','email','phone','organization','organizationType','websiteType','pages','features','designStyle','budget','deadline','maintenance','details'];
const LIMITS = [120,200,40,150,80,80,30,2000,80,80,10,80,4000];
const HEADERS = ['Inquiry ID','Received UTC','Request ID'].concat(FIELDS, ['Consent','Notification']);
function setup() {
  const p=PropertiesService.getScriptProperties();
  const id=p.getProperty('SHEET_ID');
  if(!id) throw new Error('Set SHEET_ID in Script Properties first.');
  const book=SpreadsheetApp.openById(id);
  const sheet=book.getSheetByName('Inquiries')||book.insertSheet('Inquiries');
  if(sheet.getLastRow()===0){sheet.appendRow(HEADERS);sheet.setFrozenRows(1);}
  else if(JSON.stringify(sheet.getRange(1,1,1,HEADERS.length).getValues()[0])!==JSON.stringify(HEADERS))throw new Error('Existing header does not match.');
}
function json(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
function doGet(){return json({ok:false,message:'Use the website inquiry form.'});}
function safeCell(s){return /^[\s]*[=+\-@]/.test(s)?"'"+s:s;}
function doPost(e){
  let lock,locked=false;
  try{
    const raw=e&&e.postData&&e.postData.contents;
    if(!raw||raw.length>20000)return json({ok:false,message:'Invalid request.'});
    const d=JSON.parse(raw);
    if(!d||typeof d!=='object'||d.website||d.consent!=='on'||typeof d.requestId!=='string'||!/^[a-zA-Z0-9-]{12,80}$/.test(d.requestId))return json({ok:false,message:'Invalid request.'});
    const values=FIELDS.map((k,i)=>{const v=d[k]===undefined?'':d[k];if(typeof v!=='string'||v.length>LIMITS[i])throw new Error('Invalid field');return v.trim();});
    if(!values[0]||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[1]))return json({ok:false,message:'Name and valid email required.'});
    const props=PropertiesService.getScriptProperties();
    if(props.getProperty('ACCEPT_INQUIRIES')!=='true')return json({ok:false,message:'Inquiries are unavailable.'});
    lock=LockService.getScriptLock();locked=lock.tryLock(10000);if(!locked)return json({ok:false,message:'Please retry.'});
    const sheet=SpreadsheetApp.openById(props.getProperty('SHEET_ID')).getSheetByName('Inquiries');
    if(!sheet)throw new Error('Setup required');
    const last=sheet.getLastRow();
    if(last>1){const found=sheet.getRange(2,3,last-1,1).createTextFinder(d.requestId).matchEntireCell(true).findNext();if(found)return json({ok:true,id:sheet.getRange(found.getRow(),1).getDisplayValue()});}
    // Global per-minute cap and per-email cap; this is basic abuse mitigation, not CAPTCHA.
    const cache=CacheService.getScriptCache();
    const globalKey='minute:'+Math.floor(Date.now()/60000);
    const emailKey='email:'+Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,values[1].toLowerCase()));
    const globalCount=Number(cache.get(globalKey)||0),emailCount=Number(cache.get(emailKey)||0);
    if(globalCount>=20||emailCount>=4)return json({ok:false,message:'Too many requests. Try later.'});
    cache.put(globalKey,String(globalCount+1),120);cache.put(emailKey,String(emailCount+1),3600);
    const id='WD-'+Utilities.getUuid().slice(0,12).toUpperCase();
    sheet.appendRow([id,new Date().toISOString(),d.requestId].concat(values.map(safeCell),['Yes','Pending']));
    const row=sheet.getLastRow();SpreadsheetApp.flush();
    const recipient=props.getProperty('NOTIFY_EMAIL');
    try{if(recipient){MailApp.sendEmail(recipient,'New web design inquiry '+id,'A new inquiry is available in your private spreadsheet. Reference: '+id);sheet.getRange(row,HEADERS.length).setValue('Sent');}else{sheet.getRange(row,HEADERS.length).setValue('Not configured');}}catch(err){sheet.getRange(row,HEADERS.length).setValue('Failed — check sheet');}
    return json({ok:true,id:id});
  }catch(err){return json({ok:false,message:'Unable to process inquiry.'});}
  finally{if(locked)lock.releaseLock();}
}