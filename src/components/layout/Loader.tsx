/**
 * Loader d'entrée signé (< 1,3 s) : une goutte tombe, touche la ligne d'eau,
 * l'onde s'ouvre et le mot BRUME apparaît. 100 % CSS : il ne dépend pas de
 * l'hydratation et ne bloque rien. Affiché une fois par session (script inline
 * dans le layout qui pose `data-seen` sur <html>).
 */
export function Loader() {
  return (
    <div className="brume-loader" aria-hidden="true">
      <svg viewBox="0 0 240 200" className="brume-loader__svg">
        <path className="brume-loader__drop" d="M120 20c7 9 12 16.5 12 22.6a12 12 0 1 1-24 0C108 36.5 113 29 120 20Z" />
        <line className="brume-loader__line" x1="30" y1="120" x2="210" y2="120" />
        <ellipse className="brume-loader__ring r1" cx="120" cy="120" rx="18" ry="4" />
        <ellipse className="brume-loader__ring r2" cx="120" cy="120" rx="18" ry="4" />
        <ellipse className="brume-loader__ring r3" cx="120" cy="120" rx="18" ry="4" />
      </svg>
      <span className="brume-loader__word">BRUME</span>
      <style>{`
        .brume-loader{position:fixed;inset:0;z-index:100;display:grid;place-items:center;align-content:center;gap:4px;background:var(--color-ecume);
          animation:bl-out .55s var(--ease-tide) 1.15s forwards;pointer-events:none}
        html[data-seen] .brume-loader{display:none}
        .brume-loader__svg{width:min(240px,60vw);overflow:visible}
        .brume-loader__drop{fill:var(--color-prune);transform-origin:120px 44px;animation:bl-drop .5s var(--ease-fall) forwards}
        .brume-loader__line{stroke:var(--color-prune);stroke-width:1;stroke-linecap:round;stroke-dasharray:180;stroke-dashoffset:180;animation:bl-line .45s var(--ease-veil) .05s forwards}
        .brume-loader__ring{fill:none;stroke:var(--color-argile);stroke-width:1.2;opacity:0;transform-box:fill-box;transform-origin:center}
        .r1{animation:bl-ring .8s var(--ease-veil) .48s forwards}.r2{animation:bl-ring .8s var(--ease-veil) .58s forwards}.r3{animation:bl-ring .8s var(--ease-veil) .68s forwards}
        .brume-loader__word{font-family:var(--font-display);font-weight:300;letter-spacing:.42em;padding-left:.42em;font-size:14px;color:var(--color-prune);opacity:0;transform:translateY(8px);animation:bl-word .5s var(--ease-veil) .62s forwards}
        @keyframes bl-drop{0%{transform:translateY(-30px) scaleY(1.1);opacity:0}15%{opacity:1}88%{transform:translateY(68px) scaleY(1.18)}100%{transform:translateY(76px) scale(.2,.05);opacity:0}}
        @keyframes bl-line{to{stroke-dashoffset:0}}
        @keyframes bl-ring{0%{opacity:.9;transform:scale(.3)}100%{opacity:0;transform:scale(4.2)}}
        @keyframes bl-word{to{opacity:1;transform:none}}
        @keyframes bl-out{to{opacity:0;visibility:hidden;clip-path:inset(0 0 100% 0 round 0 0 50% 50%)}}
        @media (prefers-reduced-motion:reduce){.brume-loader{animation:bl-out .3s linear .2s forwards}}
      `}</style>
    </div>
  );
}

/**
 * Script inline (avant le premier rendu) :
 * - marque la session pour ne montrer le loader qu'une fois ;
 * - sur l'accueil, on arrive toujours sur le hero : le navigateur ne restaure
 *   pas l'ancienne position et une ancre dans l'URL (ex. /#rituel) est retirée
 *   avant qu'il ne défile jusqu'à elle.
 */
export const loaderScript = `try{if(sessionStorage.getItem('brume-seen')){document.documentElement.setAttribute('data-seen','')}else{sessionStorage.setItem('brume-seen','1')}}catch(e){}try{if(location.pathname==='/'){if('scrollRestoration' in history)history.scrollRestoration='manual';if(location.hash)history.replaceState(history.state,'',location.pathname+location.search);window.scrollTo(0,0);addEventListener('load',function(){if(!location.hash)window.scrollTo(0,0)})}}catch(e){}`;
