// src/components/workspaces/GrammarCorrection/GrammarCorrection.jsx
import React, { useState, useRef } from 'react';
import Button from '../../shared/Button';
import GlassPanel from '../../shared/GlassPanel';
import { useClipboard } from '../../../hooks/useClipboard';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { useKeyboardShortcuts } from '../../../hooks/useKeyboardShortcuts';
import { exportAsJSON, exportAsText } from '../../../utils/exportUtils';
import { checkGrammar } from '../../../utils/apiUtils';

const TYPE_STYLE = {
  'Grammar Correction':    { dot:'bg-error',     badge:'bg-error/10 text-error',         icon:'error_outline' },
  'Precision Enhancement': { dot:'bg-secondary', badge:'bg-secondary/10 text-secondary', icon:'lightbulb' },
  'Terminology Sync':      { dot:'bg-tertiary',  badge:'bg-tertiary/10 text-tertiary',   icon:'sync_alt' },
};

const DEMO_TEXT = 'The Linguistic Architect platform is more then just a tool for translation. Its an environment where every word is weighing heavily on the final result, ensuring that your communication is perfectly alignment with your goals.';

export default function GrammarCorrection() {
  const [sourceText, setSourceText]       = useState(DEMO_TEXT);
  const [corrections, setCorrections]     = useState([]);
  const [refinedText, setRefinedText]     = useState('');
  const [isChecking, setIsChecking]       = useState(false);
  const [hasChecked, setHasChecked]       = useState(false);
  const [statusMsg, setStatusMsg]         = useState('');
  const [tone, setTone]                   = useState('Formal');
  const [acceptedIdx, setAcceptedIdx]     = useState({});
  const [ignoredIdx, setIgnoredIdx]       = useState({});
  const { copied, copyToClipboard }       = useClipboard();
  const [favorites, setFavorites]         = useLocalStorage('grammarFavorites', []);
  const fileInputRef = useRef(null);

  useKeyboardShortcuts([
    { key:'Enter', ctrlKey:true, callback: handleCheck },
    { key:'c', ctrlKey:true, shiftKey:true, callback: () => copyToClipboard(refinedText || sourceText) },
    { key:'e', ctrlKey:true, callback: handleExport },
  ]);

  async function handleCheck() {
    if (!sourceText.trim() || isChecking) return;
    setIsChecking(true);
    setStatusMsg('Checking with LanguageTool API...');
    setAcceptedIdx({}); setIgnoredIdx({});

    const result = await checkGrammar(sourceText, 'en-US');
    setIsChecking(false);
    setHasChecked(true);

    if (!result.success) {
      setStatusMsg('⚠ Grammar API unavailable. Check your connection and try again.');
      setCorrections([]);
      setRefinedText(sourceText);
      return;
    }

    if (result.matches.length === 0) {
      setStatusMsg('✓ No issues found — your text looks great!');
      setCorrections([]);
      setRefinedText(sourceText);
      return;
    }

    setStatusMsg(`Found ${result.matches.length} issue${result.matches.length>1?'s':''} to review.`);
    setCorrections(result.matches);

    // Build auto-refined text
    let refined = sourceText;
    let offset = 0;
    const sorted = [...result.matches].sort((a,b) => a.offset - b.offset);
    for (const m of sorted) {
      if (m.replacement) {
        refined = refined.slice(0, m.offset+offset) + m.replacement + refined.slice(m.offset+offset+m.length);
        offset += m.replacement.length - m.length;
      }
    }
    setRefinedText(refined);
  }

  function handleAccept(idx) {
    setAcceptedIdx(a => ({...a, [idx]:true}));
    // Apply this single replacement to sourceText immediately
    const m = corrections[idx];
    if (m?.replacement) {
      setSourceText(prev => prev.slice(0, m.offset) + m.replacement + prev.slice(m.offset + m.length));
    }
  }

  function handleAcceptAll() {
    const newIdx = {};
    corrections.forEach((_,i) => { newIdx[i] = true; });
    setAcceptedIdx(newIdx);
    setSourceText(refinedText);
    setStatusMsg('All corrections accepted!');
  }

  function handleExport() {
    const ts = new Date().toISOString().slice(0,10);
    exportAsJSON({ original:sourceText, refined:refinedText, tone, corrections, timestamp:ts },
      `grammar_${ts}.json`);
  }

  function handleExportText() {
    const ts = new Date().toISOString().slice(0,10);
    exportAsText(refinedText || sourceText, `refined_${ts}.txt`);
  }

  function handleClear() {
    setSourceText(''); setCorrections([]); setRefinedText('');
    setHasChecked(false); setStatusMsg(''); setAcceptedIdx({}); setIgnoredIdx({});
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setSourceText(ev.target?.result||''); setHasChecked(false); setCorrections([]); };
    reader.readAsText(file);
    e.target.value = '';
  }

  function onDragOver(e) { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.add('ring-2','ring-secondary'); }
  function onDragLeave(e) { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('ring-2','ring-secondary'); }
  function onDrop(e) {
    e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('ring-2','ring-secondary');
    const file = e.dataTransfer.files?.[0];
    if (file) { const r = new FileReader(); r.onload = ev => { setSourceText(ev.target?.result||''); setHasChecked(false); setCorrections([]); }; r.readAsText(file); }
  }

  function handleToggleFavorite() {
    if (favorites.some(f => f.text===sourceText)) {
      setFavorites(favorites.filter(f => f.text!==sourceText));
    } else {
      setFavorites([...favorites, { text:sourceText, tone, timestamp:new Date().toISOString() }]);
    }
  }

  const isFavorited    = favorites.some(f => f.text===sourceText);
  const pendingCount   = corrections.filter((_,i) => !acceptedIdx[i] && !ignoredIdx[i]).length;
  const readability    = hasChecked ? Math.max(40, 100 - corrections.length*8) : 94;
  const acceptedCount  = Object.values(acceptedIdx).filter(Boolean).length;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary" style={{fontSize:'20px',fontVariationSettings:"'FILL' 1"}}>spellcheck</span>
            </div>
            <h1 className="font-headline text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface leading-none">
              Refine <span className="text-secondary">Architecture</span>
            </h1>
          </div>
          <p className="text-on-surface-variant text-base pl-1">Live grammar checking via LanguageTool API. Accepts, refines, and exports corrections.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          {[{v:readability,l:'Readability',c:'text-primary'},{v:pendingCount,l:'Issues',c:'text-error'},{v:acceptedCount,l:'Accepted',c:'text-secondary'}]
            .map(s => (
            <div key={s.l} className="flex flex-col items-center justify-center px-5 py-3 rounded-2xl bg-surface-container border border-outline-variant/10 min-w-[70px]">
              <span className={`font-headline text-2xl font-black ${s.c}`}>{s.v}</span>
              <span className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold mt-0.5">{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status bar */}
      {statusMsg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${statusMsg.includes('⚠') ? 'bg-error/10 text-error border border-error/20' : statusMsg.includes('✓') ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-surface-container text-on-surface-variant border border-outline-variant/20'}`}>
          {statusMsg}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-wrap gap-2.5">
        <Button variant="filled" onClick={handleCheck} disabled={isChecking || !sourceText.trim()}>
          <span className="material-symbols-outlined" style={{fontSize:'16px',fontVariationSettings:"'FILL' 1"}}>{isChecking?'hourglass_empty':'check_circle'}</span>
          {isChecking ? 'Checking...' : 'Check Grammar'}
        </Button>
        {corrections.length > 0 && pendingCount > 0 && (
          <Button variant="secondary" onClick={handleAcceptAll}>
            <span className="material-symbols-outlined" style={{fontSize:'16px',fontVariationSettings:"'FILL' 1"}}>done_all</span>
            Accept All ({pendingCount})
          </Button>
        )}
        <Button variant="outlined" onClick={() => copyToClipboard(refinedText || sourceText)} disabled={!sourceText}>
          <span className="material-symbols-outlined" style={{fontSize:'16px'}}>content_copy</span>
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        <Button variant="outlined" onClick={handleExport} disabled={!hasChecked}>
          <span className="material-symbols-outlined" style={{fontSize:'16px'}}>download</span>
          JSON
        </Button>
        <Button variant="outlined" onClick={handleExportText} disabled={!sourceText}>
          <span className="material-symbols-outlined" style={{fontSize:'16px'}}>text_snippet</span>
          TXT
        </Button>
        <Button variant="outlined" onClick={() => fileInputRef.current?.click()}>
          <span className="material-symbols-outlined" style={{fontSize:'16px'}}>upload</span>
          Upload
        </Button>
        <Button variant="outlined" onClick={handleClear} disabled={!sourceText}>
          <span className="material-symbols-outlined" style={{fontSize:'16px'}}>delete_sweep</span>
          Clear
        </Button>
        <button onClick={handleToggleFavorite} disabled={!sourceText}
          className={`px-4 py-2.5 rounded-xl text-sm transition-all active:scale-95 disabled:opacity-40 ${isFavorited?'bg-tertiary/15 text-tertiary border border-tertiary/20':'bg-surface-container text-on-surface-variant hover:bg-surface-bright'}`}>
          <span className="material-symbols-outlined" style={{fontSize:'18px',fontVariationSettings:isFavorited?"'FILL' 1":"'FILL' 0"}}>star</span>
        </button>
        <input ref={fileInputRef} type="file" accept=".txt,.doc,.docx" onChange={handleFileUpload} className="hidden" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left — Editor + Output */}
        <div className="col-span-12 lg:col-span-8 space-y-5">

          {/* Tone tabs */}
          <div className="flex gap-2">
            {['Formal','Academic','Creative','Casual'].map(t => (
              <button key={t} onClick={() => setTone(t)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${tone===t?'bg-surface-bright text-on-surface shadow-sm':'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Source editor */}
          <div className="space-y-1.5">
            <div className="flex justify-between px-1">
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Source Material</span>
              <span className="text-[10px] text-on-surface-variant">{sourceText.length} chars</span>
            </div>
            <textarea
              className="w-full h-44 bg-surface-container rounded-2xl p-5 text-on-surface font-body text-sm border border-outline-variant/15 focus:border-secondary/40 focus:outline-none focus:ring-1 focus:ring-secondary/20 resize-none transition-all placeholder:text-on-surface-variant/30 custom-scrollbar"
              placeholder="Paste your text here for grammar analysis..."
              value={sourceText}
              onChange={e => { setSourceText(e.target.value); setHasChecked(false); setCorrections([]); }}
              onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            />
          </div>

          {/* Refined output */}
          {hasChecked && (
            <div className="space-y-1.5">
              <div className="flex justify-between px-1">
                <span className="text-[10px] uppercase tracking-widest text-secondary font-bold">Refined Output</span>
                <button onClick={() => copyToClipboard(refinedText||sourceText)}
                  className="text-[10px] text-on-surface-variant hover:text-secondary transition-colors font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{fontSize:'13px'}}>content_copy</span>
                  Copy Refined
                </button>
              </div>
              <div className="relative bg-surface-container-high rounded-2xl p-5 border border-secondary/10">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-secondary via-primary to-tertiary rounded-r-full"></div>
                <p className="text-on-surface font-body text-sm leading-relaxed pl-2">{refinedText || sourceText}</p>
              </div>
            </div>
          )}

          {/* Corrections list */}
          {corrections.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-headline font-bold text-sm text-on-surface px-1">
                Corrections ({corrections.length})
              </h3>
              {corrections.map((c, idx) => {
                const style = TYPE_STYLE[c.type] || TYPE_STYLE['Grammar Correction'];
                const isAcc = !!acceptedIdx[idx];
                const isIgn = !!ignoredIdx[idx];
                return (
                  <div key={idx} className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${isAcc?'opacity-50 bg-primary/5 border-primary/10':isIgn?'opacity-30 bg-surface-container/40 border-transparent':'bg-surface-container border-outline-variant/10 hover:border-outline-variant/25'}`}>
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${style.dot}`}></span>
                    <div className="flex-1 min-w-0">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mb-1.5 ${style.badge}`}>{c.type}</span>
                      <p className="text-sm font-semibold text-on-surface">{c.issue}</p>
                      {c.hint && <p className="text-xs text-on-surface-variant mt-0.5">{c.hint}</p>}
                      {c.replacement && (
                        <p className="text-xs text-primary mt-1 font-medium">
                          Suggestion: <span className="font-bold">"{c.replacement}"</span>
                        </p>
                      )}
                      {c.context && (
                        <p className="text-[10px] text-on-surface-variant/60 mt-1 italic truncate">…{c.context}…</p>
                      )}
                    </div>
                    {!isAcc && !isIgn && (
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleAccept(idx)}
                          className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-xl hover:bg-primary/20 transition-all">Accept</button>
                        <button onClick={() => setIgnoredIdx(i => ({...i,[idx]:true}))}
                          className="px-3 py-1.5 bg-surface-bright text-on-surface-variant text-xs font-bold rounded-xl hover:bg-surface-variant transition-all">Ignore</button>
                      </div>
                    )}
                    {isAcc && <span className="material-symbols-outlined text-primary shrink-0" style={{fontSize:'18px',fontVariationSettings:"'FILL' 1"}}>check_circle</span>}
                    {isIgn && <span className="material-symbols-outlined text-on-surface-variant shrink-0" style={{fontSize:'18px'}}>do_not_disturb_on</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right — Insights */}
        <div className="col-span-12 lg:col-span-4 space-y-4">

          <GlassPanel variant="elevated" className="rounded-2xl p-5 space-y-4">
            <h2 className="font-headline font-bold text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{fontSize:'18px',fontVariationSettings:"'FILL' 1"}}>architecture</span>
              Analysis
            </h2>
            {hasChecked ? (
              <div className="space-y-3">
                {Object.entries(
                  corrections.reduce((acc, c) => { acc[c.type] = (acc[c.type]||0)+1; return acc; }, {})
                ).map(([type, count]) => {
                  const style = TYPE_STYLE[type] || TYPE_STYLE['Grammar Correction'];
                  return (
                    <div key={type} className={`p-3.5 rounded-xl ${style.badge.split(' ')[0]}/10 flex items-center gap-3`}>
                      <span className={`material-symbols-outlined ${style.badge.split(' ')[1]}`} style={{fontSize:'16px'}}>{style.icon}</span>
                      <div className="flex-1">
                        <p className={`text-xs font-bold ${style.badge.split(' ')[1]}`}>{type}</p>
                        <p className="text-[11px] text-on-surface-variant">{count} issue{count>1?'s':''} found</p>
                      </div>
                      <span className={`text-sm font-black ${style.badge.split(' ')[1]}`}>{count}</span>
                    </div>
                  );
                })}
                {corrections.length === 0 && (
                  <div className="text-center py-4">
                    <span className="material-symbols-outlined text-primary text-4xl" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
                    <p className="text-sm font-bold text-on-surface mt-2">No issues found!</p>
                    <p className="text-xs text-on-surface-variant">Your text looks great.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-on-surface-variant/30 text-5xl">manage_search</span>
                <p className="text-xs text-on-surface-variant mt-2">Run grammar check to see analysis</p>
              </div>
            )}

            {/* Metrics */}
            <div className="pt-4 border-t border-outline-variant/10 space-y-3">
              {[{l:'Readability',v:readability,g:'from-primary to-secondary'},{l:'Tone Match',v:91,g:'from-secondary to-tertiary'}].map(m => (
                <div key={m.l}>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
                    <span className="text-on-surface-variant">{m.l}</span>
                    <span className="text-on-surface">{m.v}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-variant rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${m.g} rounded-full transition-all duration-700`} style={{width:`${m.v}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Style DNA */}
          <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary" style={{fontSize:'18px',fontVariationSettings:"'FILL' 1"}}>auto_awesome</span>
              </div>
              <div><p className="text-sm font-bold text-on-surface">Style DNA · {tone}</p><p className="text-xs text-on-surface-variant">Detected voice profile</p></div>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Authority','Editorial','Precise','Formal'].map(tag => (
                <span key={tag} className="px-2.5 py-1 rounded-full bg-surface-bright text-on-surface text-[10px] font-bold">{tag}</span>
              ))}
            </div>
          </div>

          {/* Keyboard shortcuts */}
          <div className="bg-surface-container rounded-2xl p-4 border border-outline-variant/10 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Shortcuts</p>
            {[
              { keys: 'Ctrl+Enter',   action: 'Check grammar' },
              { keys: 'Ctrl+Shift+C', action: 'Copy result' },
              { keys: 'Ctrl+E',       action: 'Export JSON' },
            ].map(s => (
              <div key={s.keys} className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">{s.action}</span>
                <kbd className="px-2 py-1 bg-surface-bright text-on-surface text-[10px] font-mono rounded-lg border border-outline-variant/20">{s.keys}</kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
