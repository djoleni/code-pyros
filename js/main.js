(function(){
  var glow=document.querySelector('.glow');
  if(glow&&matchMedia('(pointer:fine)').matches){
    addEventListener('pointermove',function(e){
      glow.style.setProperty('--x',e.clientX+'px');
      glow.style.setProperty('--y',e.clientY+'px');
    },{passive:true});
  }
  document.getElementById('y').textContent=new Date().getFullYear();

  if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
    document.documentElement.classList.add('js');
    var io=new IntersectionObserver(function(en){
      en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}});
    },{threshold:.12});
    document.querySelectorAll('.card,.cols article,.steps li').forEach(function(el){el.classList.add('reveal');io.observe(el);});
  }

  /* ---------- Filter projekata ---------- */
  var chips=document.querySelectorAll('.chip'),cards=document.querySelectorAll('.card');
  chips.forEach(function(ch){
    ch.addEventListener('click',function(){
      var f=ch.getAttribute('data-f');
      chips.forEach(function(c){var on=c===ch;c.classList.toggle('on',on);c.setAttribute('aria-pressed',on);});
      cards.forEach(function(card){
        var show=f==='sve'||card.getAttribute('data-cat')===f;
        card.hidden=!show;
        if(show)card.classList.add('in');
      });
    });
  });

  /* ---------- Aktivan link u navigaciji ---------- */
  if('IntersectionObserver' in window){
    var links={};
    document.querySelectorAll('.nav nav a[href^="#"]:not(.btn)').forEach(function(a){links[a.getAttribute('href').slice(1)]=a;});
    var so=new IntersectionObserver(function(en){
      en.forEach(function(x){
        if(x.isIntersecting){
          Object.keys(links).forEach(function(k){links[k].classList.toggle('act',k===x.target.id);});
        }
      });
    },{rootMargin:'-45% 0px -50% 0px'});
    Object.keys(links).concat('kontakt').forEach(function(k){var el=document.getElementById(k);if(el)so.observe(el);});
  }

  /* ---------- Kopiraj email ---------- */
  var copyBtn=document.getElementById('copy');
  if(copyBtn){
    copyBtn.addEventListener('click',function(){
      var mail=copyBtn.getAttribute('data-mail');
      var done=function(){copyBtn.textContent='Kopirano ✓';setTimeout(function(){copyBtn.textContent='Kopiraj';},1800);};
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(mail).then(done);}
      else{var t=document.createElement('textarea');t.value=mail;document.body.appendChild(t);t.select();try{document.execCommand('copy');done();}catch(e){}t.remove();}
    });
  }

  /* ---------- Forma: slanje u pozadini, bez napuštanja sajta ----------
     Poruke stižu na adresu iz FORM_ENDPOINT (FormSubmit servis).
     Prva poruka šalje aktivacioni mejl na tu adresu, treba ga potvrditi. */
     // var FORM_ENDPOINT = '6083bea37d5b5206be926ec01088387a'
  var FORM_ENDPOINT='https://formsubmit.co/ajax/djordjestevanovic8@gmail.com';
  var FALLBACK_MAIL='hello@codepyros.com';

  var form=document.getElementById('form'),
      note=form.querySelector('.note'),
      btn=form.querySelector('button[type=submit]'),
      done=document.getElementById('done'),
      again=document.getElementById('again'),
      opened=Date.now();

  function setNote(msg,err){note.textContent=msg;note.classList.toggle('err',!!err);}

  form.addEventListener('submit',function(e){
    e.preventDefault();
    var ok=true,first=null;
    form.querySelectorAll('[required]').forEach(function(f){
      var bad=!f.value.trim()||(f.type==='email'&&!/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('bad',bad);
      f.setAttribute('aria-invalid',bad);
      if(bad){ok=false;if(!first)first=f;}
    });
    if(!ok){setNote('Popunite sva polja i proverite email adresu.',true);first.focus();return;}
    if(form.elements._honey.value||Date.now()-opened<2000){return;} /* bot */

    var d=new FormData(form);
    d.delete('_honey');
    d.append('_subject','Upit sa sajta: '+d.get('ime'));
    d.append('_template','table');
    d.append('_captcha','false');

    btn.disabled=true;btn.classList.add('load');setNote('Šaljemo…',false);

    fetch(FORM_ENDPOINT,{method:'POST',headers:{'Accept':'application/json'},body:d})
      .then(function(r){return r.json().catch(function(){return {};}).then(function(j){return {ok:r.ok,j:j};});})
      .then(function(res){
        if(!res.ok||res.j.success==='false'||res.j.success===false)throw new Error(res.j.message||'fail');
        form.reset();setNote('',false);
        form.hidden=true;done.hidden=false;done.focus();
      })
      .catch(function(){
        setNote('Slanje nije uspelo. Pokušajte ponovo ili nam pišite na '+FALLBACK_MAIL+'.',true);
      })
      .then(function(){btn.disabled=false;btn.classList.remove('load');});
  });

  again.addEventListener('click',function(){
    done.hidden=true;form.hidden=false;opened=Date.now();
    form.querySelector('input').focus();
  });
})();
