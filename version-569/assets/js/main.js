(function(){
var toggle=document.querySelector('.menu-toggle');
var panel=document.querySelector('.mobile-panel');
if(toggle&&panel){toggle.addEventListener('click',function(){panel.classList.toggle('open')})}
var slides=[].slice.call(document.querySelectorAll('.hero-slide'));
var dots=[].slice.call(document.querySelectorAll('.hero-dot'));
if(slides.length){var idx=0;function show(n){idx=(n+slides.length)%slides.length;slides.forEach(function(s,i){s.classList.toggle('active',i===idx)});dots.forEach(function(d,i){d.classList.toggle('active',i===idx)})}dots.forEach(function(d,i){d.addEventListener('click',function(){show(i)})});setInterval(function(){show(idx+1)},5200)}
var queryInput=document.querySelector('.filter-input');
var selectInputs=[].slice.call(document.querySelectorAll('.filter-select'));
var cards=[].slice.call(document.querySelectorAll('.movie-card'));
var empty=document.querySelector('.search-empty');
function applyFilter(){if(!cards.length)return;var q=(queryInput&&queryInput.value||'').trim().toLowerCase();var filters={};selectInputs.forEach(function(s){filters[s.name]=s.value});var visible=0;cards.forEach(function(card){var text=(card.dataset.title+' '+card.dataset.tags+' '+card.dataset.year+' '+card.dataset.region+' '+card.dataset.type+' '+card.dataset.category).toLowerCase();var ok=!q||text.indexOf(q)>-1;if(ok&&filters.year){ok=card.dataset.year===filters.year}if(ok&&filters.region){ok=card.dataset.region.indexOf(filters.region)>-1}if(ok&&filters.type){ok=card.dataset.type.indexOf(filters.type)>-1}if(ok&&filters.category){ok=card.dataset.category===filters.category}card.style.display=ok?'':'none';if(ok)visible++});if(empty){empty.style.display=visible?'none':'block'}}
if(queryInput){queryInput.addEventListener('input',applyFilter)}selectInputs.forEach(function(s){s.addEventListener('change',applyFilter)});
var params=new URLSearchParams(location.search);var q=params.get('q');if(q&&queryInput){queryInput.value=q;applyFilter()}
})();