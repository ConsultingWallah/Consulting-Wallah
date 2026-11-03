/* Consulting Wallah — interaction layer: reveal, tilt, count-up, ticker, sortable tables, report filters, sparklines, progress bar */
(function(){
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches, FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
function $(s,c){return (c||document).querySelector(s)} function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))}
/* 1. scroll progress */
var pr=document.createElement('div');pr.className='fx-prog';document.body.appendChild(pr);
addEventListener('scroll',function(){var h=document.documentElement;pr.style.width=(100*h.scrollTop/(h.scrollHeight-h.clientHeight||1))+'%'},{passive:true});
/* 2. reveal */
var rev=$$('.card, .kpi, .stats > div, .grid > *, .cols > *, .dr > *, .rl > *, section h2, .chips, .tw, .req, .ctaband, .faq, .steps > *, .d');
if(!RM&&'IntersectionObserver' in window){rev.forEach(function(e,i){e.classList.add('fx-r');e.style.transitionDelay=((i%6)*60)+'ms'});
 var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{rootMargin:'0px 0px -8% 0px'});rev.forEach(function(e){io.observe(e)})}
/* 3. tilt + glow */
if(FINE&&!RM){$$('.card, .kpi, .rl > *, .d').forEach(function(c){c.classList.add('fx-tilt');
 c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;c.classList.add('on');c.style.setProperty('--mx',(x*100)+'%');c.style.setProperty('--my',(y*100)+'%');c.style.transform='perspective(900px) rotateX('+((.5-y)*6)+'deg) rotateY('+((x-.5)*8)+'deg) translateY(-4px)'});
 c.addEventListener('pointerleave',function(){c.classList.remove('on');c.style.transform=''})})}
/* 4. cursor dot */
if(FINE&&!RM){var cur=document.createElement('div');cur.className='fx-cur';document.body.appendChild(cur);var sx=0,sy=0,tx=0,ty=0,vis=false;
 addEventListener('pointermove',function(e){tx=e.clientX;ty=e.clientY;if(!vis){vis=true;cur.style.opacity=.9}var t=e.target.closest('a,button,.card,.kpi');cur.classList.toggle('big',!!t)},{passive:true});
 (function loop(){sx+=(tx-sx)*.22;sy+=(ty-sy)*.22;cur.style.left=sx+'px';cur.style.top=sy+'px';requestAnimationFrame(loop)})()}
/* 5. count-up on numbers */
function countUp(el){var t=el.textContent.trim(),m=t.match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/);if(!m)return;var pre=m[1],num=parseFloat(m[2].replace(/,/g,'')),post=m[3],dec=(m[2].split('.')[1]||'').length,comma=m[2].indexOf(',')>-1;if(!(num>0)||num>1e7)return;el.classList.add('fx-cnt');var t0=null;
 function f(ts){if(!t0)t0=ts;var p=Math.min(1,(ts-t0)/1100),e=1-Math.pow(1-p,3),v=num*e;var s=v.toFixed(dec);if(comma)s=Number(s).toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec});el.textContent=pre+s+post;if(p<1)requestAnimationFrame(f)}requestAnimationFrame(f)}
if(!RM&&'IntersectionObserver' in window){var nums=$$('.kpi b, .stats b, .stat b, .num, [data-count]');var io2=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){countUp(x.target);io2.unobserve(x.target)}})});nums.forEach(function(n){io2.observe(n)})}
/* 6. sortable tables */
$$('table').forEach(function(t){if(!t.tHead||t.tBodies.length!==1||t.tBodies[0].rows.length<3)return;t.classList.add('fx-sort');$$('th',t.tHead).forEach(function(th,i){th.addEventListener('click',function(){var asc=!th.classList.contains('asc');$$('th',t.tHead).forEach(function(x){x.classList.remove('asc','desc')});th.classList.add(asc?'asc':'desc');
 var rows=$$('tr',t.tBodies[0]);function val(r){var c=r.cells[i];if(!c)return '';var s=c.textContent.trim().replace(/[,₹$AED%]/g,'');var n=parseFloat(s);return isNaN(n)?s.toLowerCase():n}
 rows.sort(function(a,b){var x=val(a),y=val(b);if(typeof x==='number'&&typeof y==='number')return asc?x-y:y-x;if(typeof x==='number')return -1;if(typeof y==='number')return 1;return asc?(x<y?-1:x>y?1:0):(x>y?-1:x<y?1:0)});rows.forEach(function(r){t.tBodies[0].appendChild(r)})})})});
/* 7. reports index: search + category chips + sparklines */
var rl=$('.rl');if(rl&&location.pathname.indexOf('reports')>-1){var cards=$$('.card',rl.parentElement.parentElement);var cats={};cards.forEach(function(c){var g=c.closest('.rl');var h=g&&g.previousElementSibling&&g.previousElementSibling.tagName==='H2'?g.previousElementSibling:null;var k=h?h.textContent.replace(/\s*\(\d+\)\s*$/,'').trim():'';c.dataset.cat=k;cats[k]=(cats[k]||0)+1});
 var wrap=document.createElement('div');var q=document.createElement('input');q.className='fx-q';q.placeholder='Filter '+cards.length+' reports — market, country, product…';var chips=document.createElement('div');chips.className='fx-chips';
 var all=document.createElement('button');all.textContent='All ('+cards.length+')';all.className='on';chips.appendChild(all);Object.keys(cats).sort().forEach(function(k){if(!k)return;var b=document.createElement('button');b.textContent=k+' ('+cats[k]+')';b.dataset.k=k;chips.appendChild(b)});
 wrap.appendChild(q);wrap.appendChild(chips);var first=$('.rl',document)||rl;var host=$('section .wrap')||first.parentElement;host.insertBefore(wrap,host.querySelector('h2')||host.firstChild);
 var cat='';function apply(){var t=q.value.trim().toLowerCase();cards.forEach(function(c){var ok=(!cat||c.dataset.cat===cat)&&(!t||c.textContent.toLowerCase().indexOf(t)>-1);c.style.display=ok?'':'none'});$$('h2',host).forEach(function(h){var g=h.nextElementSibling;if(g&&g.classList.contains('rl')){var any=$$('.card',g).some(function(c){return c.style.display!=='none'});h.style.display=any?'':'none'}})}
 q.addEventListener('input',apply);chips.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;$$('button',chips).forEach(function(x){x.classList.remove('on')});b.classList.add('on');cat=b.dataset.k||'';apply()});
 /* sparkline from "USD x bn … USD y bn" numbers in card text */
 cards.forEach(function(c){var p=$('p',c);if(!p)return;var sp=(c.dataset.spark||'').split(',').map(parseFloat).filter(function(v){return v>0});if(sp.length<3)return;var pts=sp,n=sp.length;var mx=Math.max.apply(null,pts),mn=Math.min.apply(null,pts)*.85;var w=200,h=46;var d=pts.map(function(v,i){return (i?'L':'M')+(i*w/(n-1)).toFixed(1)+','+(h-4-(v-mn)/(mx-mn||1)*(h-8)).toFixed(1)}).join(' ');
  var s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 '+w+' '+h);s.setAttribute('class','fx-spark');s.setAttribute('preserveAspectRatio','none');s.innerHTML='<defs><linearGradient id="g'+Math.random().toString(36).slice(2,7)+'" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FF6B00" stop-opacity=".35"/><stop offset="1" stop-color="#FF6B00" stop-opacity="0"/></linearGradient></defs><path d="'+d+' L'+w+','+h+' L0,'+h+' Z" fill="url(#'+s.querySelector('linearGradient')?.id+')"/><path d="'+d+'" fill="none" stroke="#FF6B00" stroke-width="2.5" vector-effect="non-scaling-stroke" stroke-linecap="round"/><circle cx="'+w+'" cy="'+(h-4-(pts[n-1]-mn)/(mx-mn||1)*(h-8)).toFixed(1)+'" r="3.5" fill="#FF6B00"/>';
  var fill=s.querySelector('path');var lg=s.querySelector('linearGradient');fill.setAttribute('fill','url(#'+lg.id+')');p.parentNode.insertBefore(s,p)})}
/* 8. price bars on explorer tables (Unit AED column) */
$$('.dx table').forEach(function(t){var hs=$$('th',t).map(function(h){return h.textContent.trim()});var i=hs.indexOf('Unit AED');if(i<0)return;var cells=$$('tr',t.tBodies[0]).map(function(r){return r.cells[i]}).filter(Boolean);var mx=0;cells.forEach(function(c){var v=parseFloat(c.textContent.replace(/,/g,''));if(v>mx)mx=v});if(!mx)return;cells.forEach(function(c){var v=parseFloat(c.textContent.replace(/,/g,''));if(!(v>0))return;var b=document.createElement('i');b.className='fx-bar';b.style.width=Math.max(2,Math.round(60*v/mx))+'px';c.appendChild(b)})});
/* 9. hero orb */
var hero=$('header.hero, header.hero2');if(hero&&!RM){hero.style.position='relative';hero.style.overflow='hidden';var orb=document.createElement('div');orb.className='fx-hero-orb';hero.insertBefore(orb,hero.firstChild)}
/* 10. ticker (home only) */
var tk=$('#fx-ticker');if(tk){fetch('/data/ticker.json').then(function(r){return r.json()}).then(function(items){var html=items.map(function(x){return '<a href="'+x.u+'"><b>'+x.b+'</b>'+x.t+'</a>'}).join('');tk.innerHTML='<div class="tk">'+html+html+'</div>'}).catch(function(){})}
})();
