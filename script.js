(function(){
'use strict';
/* ---------- KONSTANTEN ----------
   Feste Werte für Formen, Schrift-/Papierfarben, Rahmen- und
   Fruchtauswahl. Von hier aus werden die Auswahl-Kacheln im
   Formular sowie das Etikett selbst gespeist. */
var NS='http://www.w3.org/2000/svg';
var MONTHS=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
var SHAPES={
  rect:{W:90,H:60,label:'Rechteck',sub:'90 × 60 mm'},
  round:{W:70,H:70,label:'Rund',sub:'Ø 70 mm'},
  oval:{W:90,H:60,label:'Oval',sub:'90 × 60 mm'}
};
var INKS={
  espresso:{name:'Espresso',ink:'#3B2A20',accent:'#A37A52'},
  graphit:{name:'Graphit',ink:'#2A2A2A',accent:'#8C8378'},
  beere:{name:'Beere',ink:'#55283A',accent:'#B06A78'},
  wald:{name:'Waldgrün',ink:'#2F3B2C',accent:'#7C8A63'}
};
var PAPERS={
  creme:{name:'Creme',c:'#F7F1E6'},
  weiss:{name:'Weiß',c:'#FFFFFF'},
  kraft:{name:'Kraft',c:'#E6D5BA'}
};
var FRAMES=[['klassisch','Klassisch'],['perlen','Perlen'],['blaetter','Ranke'],['bogen','Bogen'],['stich','Stich'],['kollage','Kollage'],['none','Ohne']];
var FRUITS=[['heidelbeere','Heidelbeeren'],['nektarine','Nektarine'],['pfirsich','Pfirsich'],['pflaume','Pflaume'],['erdbeere','Erdbeere'],['none','Ohne']];

function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
var st={name:'Erdbeer-Marmelade',sub:'Hausgemacht',zutaten:'Erdbeeren, Zucker, Zitronensaft',date:iso(new Date()),fmt:'long',shape:'rect',frame:'klassisch',fruit:'erdbeere',place:'top',ink:'espresso',paper:'creme',img:null,qty:null,cut:true};
var uidN=0;
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

/* ---------- GEOMETRIE ----------
   Hilfsfunktionen für die Etikettform: erzeugt den SVG-Pfad
   für Rechteck/Rund/Oval (shapePath) und tastet einen Pfad in
   gleichmäßigen Schritten ab (sample), damit Rahmenmuster wie
   Perlen oder Blätter gleichmäßig am Rand entlang verteilt
   werden können. */
function shapePath(shape,W,H,i){
  if(shape==='rect'){
    var r=3.2,x=i,y=i,x2=W-i,y2=H-i;
    return 'M'+(x+r)+' '+y+'H'+(x2-r)+'A'+r+' '+r+' 0 0 1 '+x2+' '+(y+r)+'V'+(y2-r)+'A'+r+' '+r+' 0 0 1 '+(x2-r)+' '+y2+'H'+(x+r)+'A'+r+' '+r+' 0 0 1 '+x+' '+(y2-r)+'V'+(y+r)+'A'+r+' '+r+' 0 0 1 '+(x+r)+' '+y+'Z';
  }
  var cx=W/2,cy=H/2,rx=W/2-i,ry=H/2-i;
  return 'M'+(cx-rx)+' '+cy+'A'+rx+' '+ry+' 0 1 1 '+(cx+rx)+' '+cy+'A'+rx+' '+ry+' 0 1 1 '+(cx-rx)+' '+cy+'Z';
}
function sample(d,step){
  var probe=document.getElementById('probe');
  var p=document.createElementNS(NS,'path');
  p.setAttribute('d',d);probe.appendChild(p);
  var len=p.getTotalLength(),n=Math.max(6,Math.round(len/step)),out=[];
  for(var k=0;k<n;k++){
    var l=k*len/n,a=p.getPointAtLength(l),b=p.getPointAtLength(l+.3);
    out.push({x:a.x,y:a.y,a:Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI});
  }
  probe.removeChild(p);
  return out;
}

/* ---------- FRÜCHTE (Koordinaten -50 … 50) ----------
   Liefert für jede Fruchtsorte fertiges SVG-Markup einer
   kleinen Illustration, zentriert um (0,0). Wird sowohl groß
   im Hintergrund als auch klein über dem Namen verwendet. */
function fruitSVG(id){
  var s='';
  if(id==='erdbeere'){
    s+='<path d="M0 44C-28 34-40 6-32-14-24-28 24-28 32-14 40 6 28 34 0 44Z" fill="#B24A3F"/>';
    [[-14,-6],[0,-12],[14,-6],[-20,8],[-6,4],[8,4],[20,8],[-12,20],[2,18],[14,20],[0,32]].forEach(function(p){s+='<ellipse cx="'+p[0]+'" cy="'+p[1]+'" rx="1.6" ry="2.5" fill="#F3DDAE"/>';});
    s+='<path d="M0-24L-16-34-8-22-14-14 0-20 14-14 8-22 16-34Z" fill="#6E7E4E"/><path d="M0-24V-40" stroke="#6E7E4E" stroke-width="4" stroke-linecap="round"/>';
  }else if(id==='heidelbeere'){
    s+='<circle cx="-15" cy="12" r="20" fill="#45507A"/><circle cx="17" cy="16" r="18" fill="#3B4670"/><circle cx="0" cy="-14" r="18" fill="#525E8E"/>';
    s+='<circle cx="-15" cy="4" r="4.2" fill="#2B3355"/><circle cx="17" cy="9" r="4" fill="#2B3355"/><circle cx="0" cy="-21" r="4" fill="#2B3355"/>';
    s+='<ellipse cx="-23" cy="14" rx="3" ry="6" fill="#fff" opacity=".22"/><ellipse cx="-7" cy="-12" rx="3" ry="5" fill="#fff" opacity=".22"/>';
    s+='<path d="M4-30C14-44 30-42 34-36 26-28 12-26 4-30Z" fill="#6E7E4E"/>';
  }else if(id==='nektarine'){
    s+='<circle cx="0" cy="6" r="36" fill="#D9583A"/><ellipse cx="-8" cy="16" rx="24" ry="24" fill="#EA9A3E" opacity=".6"/>';
    s+='<path d="M0-28C-7-10-7 14 0 42" stroke="#A93A28" stroke-width="2" fill="none" stroke-linecap="round"/>';
    s+='<ellipse cx="-17" cy="-6" rx="5" ry="10" fill="#fff" opacity=".3" transform="rotate(20 -17 -6)"/>';
    s+='<path d="M0-28C0-36 3-40 5-44" stroke="#6B4A34" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    s+='<path d="M4-36C14-48 30-44 34-38 26-30 12-30 4-36Z" fill="#6E7E4E"/>';
  }else if(id==='pfirsich'){
    s+='<path d="M0-26C-30-34-42 0-34 22C-28 40-8 46 0 42C8 46 28 40 34 22C42 0 30-34 0-26Z" fill="#F0B27C"/>';
    s+='<ellipse cx="14" cy="8" rx="20" ry="28" fill="#E8806A" opacity=".45"/>';
    s+='<path d="M0-26C-8-8-8 14 0 42" stroke="#D08A5A" stroke-width="2" fill="none" stroke-linecap="round"/>';
    s+='<ellipse cx="-18" cy="-2" rx="5" ry="10" fill="#fff" opacity=".3" transform="rotate(15 -18 -2)"/>';
    s+='<path d="M0-26C0-34 3-38 5-42" stroke="#6B4A34" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    s+='<path d="M4-34C14-46 30-42 34-36 26-28 12-28 4-34Z" fill="#6E7E4E"/>';
  }else if(id==='pflaume'){
    s+='<ellipse cx="0" cy="8" rx="31" ry="36" fill="#5B3A6B"/><ellipse cx="4" cy="12" rx="26" ry="30" fill="#8A78A8" opacity=".3"/>';
    s+='<path d="M0-26C-6-8-6 16 0 43" stroke="#3E2549" stroke-width="2" fill="none" stroke-linecap="round"/>';
    s+='<ellipse cx="-16" cy="-4" rx="4.5" ry="10" fill="#fff" opacity=".28" transform="rotate(15 -16 -4)"/>';
    s+='<path d="M0-28C0-36 3-40 5-44" stroke="#6B4A34" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    s+='<path d="M4-36C14-48 30-44 34-38 26-30 12-30 4-36Z" fill="#6E7E4E"/>';
  }
  return s;
}

/* ---------- RAHMEN ----------
   Zeichnet je nach gewähltem Rahmen-Typ (klassisch, Perlen,
   Ranke, Bogen, Stich, Kollage) das passende Muster entlang
   der Etikettkante, inklusive der leicht unregelmäßigen,
   Collagraphie-artigen Kante über einen SVG-Verzerrfilter. */
function frameStr(o,W,H,ink,accent,paper,rough){
  var P=function(i){return shapePath(o.shape,W,H,i);};
  var g=function(inner){return '<g filter="url(#'+rough+')" fill="none" stroke="'+ink+'">'+inner+'</g>';};
  var f2=function(n){return n.toFixed(2);};
  var pts,out;
  switch(o.frame){
    case 'klassisch':
      return g('<path d="'+P(2.6)+'" stroke-width=".55"/><path d="'+P(4.1)+'" stroke-width=".25"/>');
    case 'perlen':
      pts=sample(P(3.4),2.3);
      out=pts.map(function(p){return '<circle cx="'+f2(p.x)+'" cy="'+f2(p.y)+'" r=".6" fill="'+ink+'" stroke="none"/>';}).join('');
      return g(out+'<path d="'+P(5.4)+'" stroke-width=".25"/>');
    case 'blaetter':
      pts=sample(P(4.6),4.2);
      out=pts.map(function(p,i){var r=p.a+(i%2?1:-1)*38;return '<ellipse cx="'+f2(p.x)+'" cy="'+f2(p.y)+'" rx="1.9" ry=".75" transform="rotate('+f2(r)+' '+f2(p.x)+' '+f2(p.y)+')" fill="'+accent+'" stroke="none"/>';}).join('');
      return g('<path d="'+P(4.6)+'" stroke-width=".3"/>'+out+'<path d="'+P(2.8)+'" stroke-width=".2"/>');
    case 'bogen':
      pts=sample(P(2.7),3.2);
      out=pts.map(function(p){return '<circle cx="'+f2(p.x)+'" cy="'+f2(p.y)+'" r="1.7" stroke-width=".3"/>';}).join('');
      return g(out+'<path d="'+P(6.2)+'" stroke-width=".25"/>');
    case 'stich':
      return g('<path d="'+P(3)+'" stroke-width=".45" stroke-dasharray="1.6 1.1" stroke-linecap="round"/><path d="'+P(5)+'" stroke-width=".2"/>');
    case 'kollage':
      return g('<g transform="rotate(-1.6 '+W/2+' '+H/2+')"><path d="'+P(3)+'" fill="'+accent+'" fill-opacity=".3" stroke="none"/></g>'+
               '<g transform="rotate(1.2 '+W/2+' '+H/2+')"><path d="'+P(4.8)+'" fill="'+paper+'" fill-opacity=".88" stroke-width=".25"/></g>');
    default: return '';
  }
}

/* ---------- DATUM ----------
   Wandelt das Datum aus dem <input type=date> (ISO-Format)
   in die gewählte Anzeigeform um: ausgeschrieben oder kurz
   mit Punkten (TT.MM.JJJJ). */
function fmtDate(iso_,fmt){
  var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso_||'');
  if(!m) return '';
  if(fmt==='short') return m[3]+'.'+m[2]+'.'+m[1];
  return (+m[3])+'. '+MONTHS[+m[2]-1].toUpperCase()+' '+m[1];
}

/* ---------- ETIKETT ----------
   Setzt ein einzelnes Etikett vollständig zusammen: Papier-
   farbe, Kornstruktur, Rahmen, optionale Frucht, Zusatzzeile,
   Marmeladenname (mit automatischem Zeilenumbruch bei langen
   Namen), Zutatenzeile, Trennelement und Datum. labelSVG()
   verpackt das Ergebnis in ein eigenständiges <svg>. */
function labelInner(o,uid,opt){
  opt=opt||{};
  var S=SHAPES[o.shape],W=S.W,H=S.H,I=INKS[o.ink],ink=I.ink,acc=I.accent,paper=PAPERS[o.paper].c;
  var clip='c'+uid,rough='r'+uid,grain='g'+uid,med='m'+uid;
  var oval=o.shape!=='rect';
  var s='<defs><clipPath id="'+clip+'"><path d="'+shapePath(o.shape,W,H,0)+'"/></clipPath>'+
    '<filter id="'+rough+'" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale=".55"/></filter>'+
    '<filter id="'+grain+'"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="8"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .25  0 0 0 0 .15  .7 0 0 0 -.18"/></filter></defs>';
  s+='<g clip-path="url(#'+clip+')"><rect width="'+W+'" height="'+H+'" fill="'+paper+'"/>';
  if(!opt.frameOnly){
    s+='<rect width="'+W+'" height="'+H+'" filter="url(#'+grain+')" opacity=".5"/>';
    if(o.place==='bg'){
      if(o.fruit==='eigen'&&o.img) s+='<image href="'+o.img+'" x="0" y="0" width="'+W+'" height="'+H+'" preserveAspectRatio="xMidYMid slice" opacity=".22"/>';
      else if(o.fruit!=='none'&&o.fruit!=='eigen') s+='<g transform="translate('+W/2+' '+H/2+') scale('+(H*0.98/100)+')" opacity=".17">'+fruitSVG(o.fruit)+'</g>';
    }
  }
  s+='</g>';
  s+=frameStr(o,W,H,ink,acc,paper,rough);
  if(!opt.frameOnly){
    var hasFruit=(o.fruit==='eigen'?!!o.img:o.fruit!=='none');
    var hasTop=hasFruit&&o.place==='top';
    var subY=hasTop?H*.40:H*.31, nameY=hasTop?H*.545:H*.475, zutY=hasTop?H*.635:H*.575, divY=hasTop?H*.735:H*.685, dateY=hasTop?H*.84:H*.79;
    if(hasTop){
      var cx=W/2,cy=H*.215,d=H*.21;
      if(o.fruit==='eigen'){
        d=d*1.1;
        s+='<clipPath id="'+med+'"><circle cx="'+cx+'" cy="'+cy+'" r="'+d/2+'"/></clipPath><image href="'+o.img+'" x="'+(cx-d/2)+'" y="'+(cy-d/2)+'" width="'+d+'" height="'+d+'" preserveAspectRatio="xMidYMid slice" clip-path="url(#'+med+')"/><circle cx="'+cx+'" cy="'+cy+'" r="'+d/2+'" fill="none" stroke="'+ink+'" stroke-width=".3"/>';
      }else s+='<g transform="translate('+cx+' '+cy+') scale('+d/100+')">'+fruitSVG(o.fruit)+'</g>';
    }
    var sub=(o.sub||'').trim();
    if(sub) s+='<text x="'+W/2+'" y="'+subY+'" text-anchor="middle" font-family="Jost,Helvetica,Arial,sans-serif" font-weight="400" font-size="'+H*.04+'" letter-spacing=".45" fill="'+ink+'" fill-opacity=".8">'+esc(sub.toUpperCase())+'</text>';
    var name=(o.name||'').trim()||'Meine Marmelade';
    var lines=[name];
    if(name.length>15&&name.indexOf(' ')>-1){
      var mid=name.length/2,best=-1,bd=99;
      for(var i=0;i<name.length;i++){if(name[i]===' '&&Math.abs(i-mid)<bd){bd=Math.abs(i-mid);best=i;}}
      lines=[name.slice(0,best),name.slice(best+1)];
    }
    var maxW=W*(oval?.62:.74),longest=Math.max.apply(null,lines.map(function(l){return l.length;}));
    var fs=Math.min(H*(lines.length>1?.135:.17),maxW/(longest*.47));
    var y0=nameY+fs*.3-(lines.length-1)*fs*.5;
    lines.forEach(function(l,k){
      s+='<text x="'+W/2+'" y="'+(y0+k*fs*1.02).toFixed(2)+'" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-weight="500" font-size="'+fs.toFixed(2)+'" fill="'+ink+'">'+esc(l)+'</text>';
    });
    var zut=(o.zutaten||'').trim();
    if(zut){
      var zMaxW=W*(oval?.68:.8),zFs=Math.min(H*.032,zMaxW/(zut.length*.44));
      s+='<text x="'+W/2+'" y="'+zutY+'" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-style="italic" font-weight="400" font-size="'+zFs.toFixed(2)+'" fill="'+ink+'" fill-opacity=".72">'+esc(zut)+'</text>';
    }
    s+='<line x1="'+(W/2-7)+'" x2="'+(W/2+7)+'" y1="'+divY+'" y2="'+divY+'" stroke="'+acc+'" stroke-width=".3"/><circle cx="'+W/2+'" cy="'+divY+'" r=".9" fill="'+paper+'" stroke="'+acc+'" stroke-width=".3"/>';
    var dt=fmtDate(o.date,o.fmt);
    if(dt) s+='<text x="'+W/2+'" y="'+dateY+'" text-anchor="middle" font-family="Jost,Helvetica,Arial,sans-serif" font-weight="400" font-size="'+H*.05+'" letter-spacing=".25" fill="'+ink+'">'+esc(dt)+'</text>';
  }
  if(opt.cut) s+='<path d="'+shapePath(o.shape,W,H,.08)+'" fill="none" stroke="#8a8a8a" stroke-width=".18" stroke-dasharray=".8 .6"/>';
  return s;
}
function labelSVG(o,attrs,opt){
  var S=SHAPES[o.shape];
  return '<svg xmlns="'+NS+'" viewBox="0 0 '+S.W+' '+S.H+'" '+(attrs||'')+'>'+labelInner(o,++uidN,opt)+'</svg>';
}

/* ---------- HERO-GLAS ----------
   Baut die große Glas-Illustration im Kopfbereich der Seite
   inklusive Deckel und einem Beispiletikett darauf. */
function heroJar(){
  var o={name:'Erdbeer-Marmelade',sub:'Hausgemacht',date:st.date,fmt:'long',shape:'rect',frame:'blaetter',fruit:'erdbeere',place:'top',ink:'espresso',paper:'creme',img:null};
  var body='M62 84Q40 100 40 140V330Q40 378 90 378H210Q260 378 260 330V140Q260 100 238 84Z';
  var svg='<svg class="jar" viewBox="0 0 300 400" xmlns="'+NS+'">'+
   '<defs><clipPath id="jarclip"><path d="'+body+'"/></clipPath></defs>'+
   '<rect x="62" y="16" width="176" height="48" rx="8" fill="#6B4A34"/>'+
   '<g stroke="#4A3222" stroke-opacity=".5" stroke-width="2">'+[80,96,112,128,144,160,176,192,208,222].map(function(x){return '<line x1="'+x+'" x2="'+x+'" y1="22" y2="58"/>';}).join('')+'</g>'+
   '<rect x="70" y="64" width="160" height="16" rx="3" fill="#4A3222"/>'+
   '<path d="'+body+'" fill="#ffffff" fill-opacity=".45"/>'+
   '<g clip-path="url(#jarclip)"><rect x="30" y="118" width="240" height="270" fill="#8E2C3B" fill-opacity=".92"/><rect x="30" y="118" width="240" height="6" fill="#A13445"/></g>'+
   '<path d="'+body+'" fill="none" stroke="#4A3222" stroke-opacity=".4" stroke-width="2"/>'+
   '<rect x="54" y="128" width="9" height="190" rx="4.5" fill="#fff" opacity=".28"/>'+
   labelSVG(o,'x="50" y="188" width="200" height="133.3"')+
   '</svg>';
  document.getElementById('heroJar').innerHTML=svg;
}

/* ---------- BEDIENELEMENTE ----------
   Erzeugt alle Auswahl-Kacheln (Rahmen, Frucht, Position,
   Form, Schrift- und Papierfarbe) aus den Konstanten oben,
   hängt Klick-Handler an und verknüpft die Texteingabefelder
   (Name, Zusatzzeile, Zutaten, Datum) mit dem Zustand. Enthält
   außerdem den Bild-Upload für ein eigenes Fruchtfoto. */
var $=function(id){return document.getElementById(id);};
var groups={};
function makeChips(id,items,key,build){
  var box=$(id);groups[key]=[];
  items.forEach(function(it){
    var b=document.createElement('button');
    b.type='button';b.className='chip'+(build.cls?' '+build.cls:'');b.dataset.v=it[0];
    b.innerHTML=build.html(it);
    b.addEventListener('click',function(){
      st[key]=it[0];
      if(key==='shape') st.qty=null;
      render();
    });
    box.appendChild(b);groups[key].push(b);
  });
}
makeChips('frames',FRAMES,'frame',{html:function(it){return '<span class="th"></span><span>'+it[1]+'</span>';}});
makeChips('fruits',FRUITS,'fruit',{html:function(it){
  return '<span class="th">'+(it[0]==='none'?'<span style="font-size:.85rem;color:var(--muted)">–</span>':'<svg viewBox="-50 -50 100 100" width="52" height="52">'+fruitSVG(it[0])+'</svg>')+'</span><span>'+it[1]+'</span>';}});
makeChips('places',[['top','Oben über dem Namen'],['bg','Groß im Hintergrund']],'place',{cls:'text',html:function(it){return it[1];}});
makeChips('shapes',Object.keys(SHAPES).map(function(k){return [k,SHAPES[k].label];}),'shape',{html:function(it){return '<span class="th"></span><span>'+it[1]+' · '+SHAPES[it[0]].sub+'</span>';}});
makeChips('inks',Object.keys(INKS).map(function(k){return [k,INKS[k].name];}),'ink',{cls:'swatch',html:function(it){return '<i style="background:'+INKS[it[0]].ink+'"></i>'+it[1];}});
makeChips('papers',Object.keys(PAPERS).map(function(k){return [k,PAPERS[k].name];}),'paper',{cls:'swatch',html:function(it){return '<i style="background:'+PAPERS[it[0]].c+'"></i>'+it[1];}});

/* Upload-Chip */
(function(){
  var lab=document.createElement('label');lab.className='chip upload';
  lab.innerHTML='<span id="upTxt">Eigenes Bild wählen</span><input type="file" accept="image/*" id="fFile">';
  $('fruits').appendChild(lab);
  var mine=document.createElement('button');mine.type='button';mine.className='chip';mine.style.display='none';mine.id='ownChip';mine.dataset.v='eigen';
  mine.innerHTML='<span class="th" id="ownTh"></span><span>Mein Bild</span>';
  mine.addEventListener('click',function(){st.fruit='eigen';render();});
  $('fruits').insertBefore(mine,lab);groups.fruit.push(mine);
  $('fFile').addEventListener('change',function(e){
    var f=e.target.files&&e.target.files[0];if(!f) return;
    var r=new FileReader();
    r.onload=function(){
      var im=new Image();
      im.onload=function(){
        var sc=Math.min(1,700/Math.max(im.width,im.height)),c=document.createElement('canvas');
        c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);
        c.getContext('2d').drawImage(im,0,0,c.width,c.height);
        st.img=c.toDataURL('image/jpeg',.88);st.fruit='eigen';render();
      };
      im.onerror=function(){$('upTxt').textContent='Bild nicht lesbar';};
      im.src=r.result;
    };
    r.readAsDataURL(f);
  });
})();

$('fName').addEventListener('input',function(e){st.name=e.target.value;render();});
$('fSub').addEventListener('input',function(e){st.sub=e.target.value;render();});
$('fZutaten').addEventListener('input',function(e){st.zutaten=e.target.value;render();});
$('fDate').addEventListener('input',function(e){st.date=e.target.value;render();});
$('fFmt').addEventListener('change',function(e){st.fmt=e.target.value;render();});
$('fQty').addEventListener('input',function(e){var v=parseInt(e.target.value,10);st.qty=isNaN(v)?null:v;scheduleSheet();});
$('fCut').addEventListener('change',function(e){st.cut=e.target.checked;scheduleSheet();});
$('fDate').value=st.date;

/* Datumsformat-Beispiele aktualisieren */
function updateFmtOptions(){
  var o=$('fFmt').options;
  o[0].textContent=fmtDate(st.date,'long').replace(/^(\d+\.\s)(\S+)/,function(_,a,b){return a+b.charAt(0)+b.slice(1).toLowerCase();})||'28. September 2026';
  o[1].textContent=fmtDate(st.date,'short')||'28.09.2026';
}

/* ---------- DRUCKBOGEN ----------
   Berechnet, wie viele Etiketten auf ein A4-Blatt passen
   (geom), baut die Vorschau des Bogens für den Bildschirm
   (sheetHTML/scheduleSheet) sowie die tatsächliche Druck-
   ausgabe in #printRoot (buildPrint), die beim Klick auf
   'Drucken' bzw. automatisch vor dem Drucken gefüllt wird. */
function geom(){
  var S=SHAPES[st.shape],m=10,gap=4;
  var cols=Math.max(1,Math.floor((210-2*m+gap)/(S.W+gap))),rows=Math.max(1,Math.floor((297-2*m+gap)/(S.H+gap)));
  return {S:S,m:m,gap:gap,cols:cols,rows:rows,cap:cols*rows};
}
function sheetHTML(){
  var g=geom(),n=Math.max(1,Math.min(st.qty==null?g.cap:st.qty,g.cap)),out='';
  for(var i=0;i<n;i++) out+=labelSVG(st,'width="'+g.S.W+'mm" height="'+g.S.H+'mm" style="display:block"',{cut:st.cut});
  return '<div style="display:grid;grid-template-columns:repeat('+g.cols+','+g.S.W+'mm);gap:'+g.gap+'mm;justify-content:center;align-content:start;padding:'+g.m+'mm;width:210mm;height:297mm;background:#fff">'+out+'</div>';
}
var sheetTimer=null;
function scheduleSheet(){
  var g=geom(),q=$('fQty');
  q.max=g.cap;
  $('capNote').textContent='Ein Bogen fasst '+g.cap+' Etiketten.';
  if(st.qty==null) q.value=g.cap; else if(st.qty>g.cap) {st.qty=g.cap;q.value=g.cap;}
  clearTimeout(sheetTimer);
  sheetTimer=setTimeout(function(){$('sheetPreview').innerHTML=sheetHTML();},160);
}
function buildPrint(){$('printRoot').innerHTML=sheetHTML();}
$('btnPrint').addEventListener('click',function(){
  buildPrint();
  setTimeout(function(){try{window.print();}catch(e){alert('Der Druckdialog konnte nicht geöffnet werden. Öffne die Seite in einem eigenen Browser-Tab oder nutze Strg/Cmd + P.');}},80);
});
window.addEventListener('beforeprint',buildPrint);

/* ---------- RENDERN ----------
   Zentrale Update-Funktion: zeichnet die große Vorschau neu,
   aktualisiert die Mini-Vorschauen in den Auswahl-Kacheln,
   markiert die aktive Auswahl (aria-pressed) und stößt die
   Aktualisierung des Druckbogens an. Wird nach jeder Änderung
   im Formular aufgerufen. */
function render(){
  $('preview').innerHTML=labelSVG(st,'style="width:100%;height:auto;display:block" role="img" aria-label="Vorschau deines Etiketts"');
  $('sizeNote').textContent='Druckgröße: '+SHAPES[st.shape].sub;
  updateFmtOptions();
  Object.keys(groups).forEach(function(k){
    groups[k].forEach(function(b){b.setAttribute('aria-pressed',String(st[k]===b.dataset.v));});
  });
  groups.frame.forEach(function(b){
    b.querySelector('.th').innerHTML=labelSVG(Object.assign({},st,{frame:b.dataset.v,shape:'rect'}),'width="76" height="50.7"',{frameOnly:true});
  });
  groups.shape.forEach(function(b){
    var s=b.dataset.v,h=s==='round'?52:44;
    b.querySelector('.th').innerHTML=labelSVG(Object.assign({},st,{frame:'klassisch',shape:s}),'height="'+h+'" width="'+(h*SHAPES[s].W/SHAPES[s].H)+'"',{frameOnly:true});
  });
  var own=$('ownChip');
  if(st.img){own.style.display='';$('ownTh').innerHTML='<img alt="" src="'+st.img+'" style="width:52px;height:52px;object-fit:cover;border-radius:50%">';$('upTxt').textContent='Anderes Bild wählen';}
  scheduleSheet();
}

heroJar();
render();
})();