// src/components/workspaces/DocumentTranslation/DocumentTranslation.jsx
import React, { useState, useRef } from 'react';
import Button from '../../shared/Button';
import GlassPanel from '../../shared/GlassPanel';
import { useClipboard } from '../../../hooks/useClipboard';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { useKeyboardShortcuts } from '../../../hooks/useKeyboardShortcuts';
import { exportAsText, exportAsJSON } from '../../../utils/exportUtils';
import { translateText, detectLanguage } from '../../../utils/apiUtils';

const LANGUAGES = ['Auto-Detect','English','Spanish','French','German','Japanese',
  'Chinese','Arabic','Portuguese','Russian','Korean','Italian','Turkish','Dutch','Polish'];

export default function DocumentTranslation() {
  const [sourceText, setSourceText] = useState(
    'The linguistic architect stands at the intersection of technology and human expression. Our mission is to bridge cultures through precision translation.'
  );
  const [translatedText, setTranslatedText]   = useState('');
  const [sourceLanguage, setSourceLanguage]   = useState('English');
  const [targetLanguage, setTargetLanguage]   = useState('Spanish');
  const [isTranslating, setIsTranslating]     = useState(false);
  const [isDragging, setIsDragging]           = useState(false);
  const [statusMsg, setStatusMsg]             = useState('');
  const [detectedLang, setDetectedLang]       = useState('');
  const { copied, copyToClipboard }           = useClipboard();
  const [history, setHistory]     = useLocalStorage('translationHistory', []);
  const [favorites, setFavorites] = useLocalStorage('docFavorites', []);
  const fileInputRef = useRef(null);

  useKeyboardShortcuts([
    { key:'Enter', ctrlKey:true,  callback: handleTranslate },
    { key:'c', ctrlKey:true, shiftKey:true, callback: () => translatedText && copyToClipboard(translatedText) },
    { key:'s', ctrlKey:true,  callback: handleSave },
    { key:'e', ctrlKey:true,  callback: handleExport },
  ]);

  async function handleTranslate() {
    if (!sourceText.trim() || isTranslating) return;
    setIsTranslating(true);
    setStatusMsg('');
    try {
      // Auto-detect language if needed
      if (sourceLanguage === 'Auto-Detect') {
        const det = await detectLanguage(sourceText);
        if (det.language !== 'Unknown') setDetectedLang(det.language);
      }
      const result = await translateText(sourceText, sourceLanguage, targetLanguage);
      setTranslatedText(result);
      setStatusMsg('');
    } catch(err) {
      setStatusMsg('Translation failed. Check your connection and try again.');
    } finally {
      setIsTranslating(false);
    }
  }

  function handleSave() {
    if (!translatedText) return;
    const item = {
      id: Date.now(), source: sourceText, translated: translatedText,
      sourceLanguage, targetLanguage, timestamp: new Date().toLocaleString(),
    };
    setHistory(prev => [item, ...prev.slice(0,19)]);
    setStatusMsg('Saved to history!');
    setTimeout(() => setStatusMsg(''), 2000);
  }

  function handleExport() {
    if (!translatedText) return;
    const ts = new Date().toISOString().slice(0,10);
    exportAsJSON({ source:sourceText, translated:translatedText, sourceLanguage, targetLanguage, timestamp:ts },
      `translation_${ts}.json`);
  }

  function handleExportText() {
    if (!translatedText) return;
    const ts = new Date().toISOString().slice(0,10);
    exportAsText(translatedText, `translation_${ts}.txt`);
  }

  function swapLanguages() {
    if (sourceLanguage === 'Auto-Detect') return;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    if (translatedText) { setSourceText(translatedText); setTranslatedText(sourceText); }
  }

  function handleToggleFavorite() {
    const alreadySaved = favorites.find(f => f.source === sourceText);
    if (alreadySaved) {
      setFavorites(favorites.filter(f => f.source !== sourceText));
    } else {
      setFavorites([{ id:Date.now(), source:sourceText, translated:translatedText, sourceLanguage, targetLanguage }, ...favorites]);
    }
  }

  function handleClearSource() { setSourceText(''); setTranslatedText(''); setDetectedLang(''); }

  function handleLoadFromHistory(item) {
    setSourceText(item.source);
    setTranslatedText(item.translated);
    setSourceLanguage(item.sourceLanguage);
    setTargetLanguage(item.targetLanguage);
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setSourceText(ev.target.result || ''); setTranslatedText(''); };
    reader.readAsText(file);
    e.target.value = '';
  }

  function onDragOver(e) { e.preventDefault(); setIsDragging(true); }
  function onDragLeave(e) { e.preventDefault(); setIsDragging(false); }
  function onDrop(e) {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) { const r = new FileReader(); r.onload = ev => { setSourceText(ev.target.result||''); setTranslatedText(''); }; r.readAsText(file); }
  }

  const isFavorited = favorites.some(f => f.source === sourceText);
  const wordCount   = sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary" style={{fontSize:'20px',fontVariationSettings:"'FILL' 1"}}>description</span>
          </div>
          <h1 className="font-headline text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface leading-none">
            Document <span className="gradient-text-primary">Architect</span>
          </h1>
        </div>
        <p className="text-on-surface-variant text-base pl-1">Transform documents with linguistic precision. Supports PDF, DOCX, TXT.</p>
      </div>

      {/* Status / Error bar */}
      {statusMsg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${statusMsg.includes('failed') ? 'bg-error/10 text-error border border-error/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
          {statusMsg}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-5">

          {/* Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            className={`relative rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer border-2 border-dashed transition-all duration-300 group overflow-hidden h-40 ${isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-outline-variant/25 bg-surface-container hover:border-primary/40 hover:bg-surface-container-high'}`}
          >
            <div className="flex flex-col items-center gap-3 text-center relative z-10">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDragging ? 'bg-primary/20 scale-110' : 'bg-surface-bright group-hover:scale-105'}`}>
                <span className={`material-symbols-outlined transition-colors ${isDragging ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'}`} style={{fontSize:'24px',fontVariationSettings:"'FILL' 1"}}>upload_file</span>
              </div>
              <div>
                <p className="font-semibold text-on-surface text-sm">Drop file here or click to browse</p>
                <p className="text-on-surface-variant text-xs mt-0.5">Supports TXT, DOC, DOCX, PDF</p>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept=".txt,.doc,.docx,.pdf" onChange={handleFileUpload} className="hidden" />
          </div>

          {/* Text Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Source {detectedLang && <span className="text-primary ml-1">· {detectedLang}</span>}</span>
                <span className="text-[10px] text-on-surface-variant">{sourceText.length} chars · {wordCount} words</span>
              </div>
              <div className="relative">
                <textarea
                  className="w-full h-52 bg-surface-container rounded-2xl p-5 text-on-surface font-body text-sm border border-outline-variant/15 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none transition-all placeholder:text-on-surface-variant/30 custom-scrollbar"
                  placeholder="Paste your text here or drag a file above..."
                  value={sourceText}
                  onChange={e => { setSourceText(e.target.value); setTranslatedText(''); }}
                />
                {sourceText && (
                  <button onClick={handleClearSource} className="absolute top-3 right-3 p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-all">
                    <span className="material-symbols-outlined" style={{fontSize:'16px'}}>close</span>
                  </button>
                )}
              </div>
            </div>

            {/* Translation Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Translation</span>
                {translatedText && (
                  <button onClick={() => copyToClipboard(translatedText)} className="text-[10px] text-on-surface-variant hover:text-primary transition-colors font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{fontSize:'13px'}}>content_copy</span>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                )}
              </div>
              <div className="w-full h-52 bg-surface-container-high rounded-2xl p-5 text-on-surface font-body text-sm border border-primary/10 overflow-y-auto custom-scrollbar relative">
                {isTranslating ? (
                  <div className="flex items-center gap-3 h-full justify-center">
                    <div className="flex gap-1.5">
                      {[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{animationDelay:`${i*150}ms`}}></span>)}
                    </div>
                    <span className="text-on-surface-variant text-xs">Translating...</span>
                  </div>
                ) : translatedText ? (
                  <p className="leading-relaxed">{translatedText}</p>
                ) : (
                  <p className="text-on-surface-variant/40 italic text-center mt-8">Translation will appear here...</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2.5">
            <Button variant="filled" onClick={handleTranslate} disabled={isTranslating || !sourceText.trim()} className="flex-1 min-w-[120px]">
              <span className="material-symbols-outlined" style={{fontSize:'16px',fontVariationSettings:"'FILL' 1"}}>translate</span>
              {isTranslating ? 'Translating...' : 'Translate'}
            </Button>
            <Button variant="outlined" onClick={handleSave} disabled={!translatedText}>
              <span className="material-symbols-outlined" style={{fontSize:'16px'}}>bookmark</span>
              Save
            </Button>
            <Button variant="outlined" onClick={handleExport} disabled={!translatedText}>
              <span className="material-symbols-outlined" style={{fontSize:'16px'}}>download</span>
              JSON
            </Button>
            <Button variant="outlined" onClick={handleExportText} disabled={!translatedText}>
              <span className="material-symbols-outlined" style={{fontSize:'16px'}}>text_snippet</span>
              TXT
            </Button>
            <button
              onClick={handleToggleFavorite}
              disabled={!sourceText.trim()}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${isFavorited ? 'bg-tertiary/15 text-tertiary border border-tertiary/20' : 'bg-surface-container text-on-surface-variant hover:bg-surface-bright'}`}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <span className="material-symbols-outlined" style={{fontSize:'18px',fontVariationSettings:isFavorited?"'FILL' 1":"'FILL' 0"}}>star</span>
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-4">

          {/* Language Selector */}
          <GlassPanel variant="elevated" className="rounded-2xl p-5 space-y-4">
            <h3 className="text-on-surface font-headline font-bold text-base">Language Pair</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">From</label>
                <select value={sourceLanguage} onChange={e => setSourceLanguage(e.target.value)}
                  className="w-full bg-surface-container p-3 rounded-xl border border-outline-variant/15 focus:border-primary/40 focus:outline-none text-on-surface text-sm">
                  {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex justify-center">
                <button onClick={swapLanguages} title="Swap languages"
                  className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/25 hover:shadow-primary/40 active:rotate-180 transition-all duration-500">
                  <span className="material-symbols-outlined text-on-primary-fixed" style={{fontSize:'16px',fontVariationSettings:"'FILL' 1"}}>swap_vert</span>
                </button>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">To</label>
                <select value={targetLanguage} onChange={e => setTargetLanguage(e.target.value)}
                  className="w-full bg-surface-container p-3 rounded-xl border border-outline-variant/15 focus:border-primary/40 focus:outline-none text-on-surface text-sm">
                  {LANGUAGES.filter(l => l !== 'Auto-Detect').map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="pt-2 border-t border-outline-variant/10 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 shrink-0"></span>
              <span className="text-[10px] text-on-surface-variant">Google Translate · Free API</span>
            </div>
          </GlassPanel>

          {/* History */}
          <GlassPanel variant="default" className="rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headline font-bold text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{fontSize:'18px',fontVariationSettings:"'FILL' 1"}}>history</span>
                Recent
              </h3>
              {history.length > 0 && (
                <button onClick={() => setHistory([])} className="text-[10px] text-on-surface-variant hover:text-error transition-colors font-bold">Clear</button>
              )}
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {history.slice(0,6).map((item,idx) => (
                <button key={idx} onClick={() => handleLoadFromHistory(item)}
                  className="w-full text-left p-3 rounded-xl bg-surface-container hover:bg-surface-bright transition-all group">
                  <p className="text-xs font-semibold text-on-surface truncate group-hover:text-primary transition-colors">{item.source.substring(0,32)}...</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] text-on-surface-variant">{item.sourceLanguage}</span>
                    <span className="material-symbols-outlined text-on-surface-variant/50" style={{fontSize:'10px'}}>arrow_forward</span>
                    <span className="text-[10px] text-on-surface-variant">{item.targetLanguage}</span>
                  </div>
                </button>
              ))}
              {history.length === 0 && <p className="text-xs text-on-surface-variant/50 text-center py-3 italic">No history yet — translate something!</p>}
            </div>
          </GlassPanel>

          {/* Favorites */}
          {favorites.length > 0 && (
            <GlassPanel variant="default" className="rounded-2xl p-5">
              <h3 className="font-headline font-bold text-sm mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary" style={{fontSize:'18px',fontVariationSettings:"'FILL' 1"}}>star</span>
                Favorites
              </h3>
              <div className="space-y-2">
                {favorites.slice(0,3).map((item,idx) => (
                  <button key={idx} onClick={() => handleLoadFromHistory(item)}
                    className="w-full text-left p-3 rounded-xl bg-surface-container hover:bg-surface-bright transition-all">
                    <p className="text-xs font-semibold text-on-surface truncate">{item.source.substring(0,30)}...</p>
                  </button>
                ))}
              </div>
            </GlassPanel>
          )}

          {/* Keyboard shortcuts */}
          <div className="bg-surface-container rounded-2xl p-4 border border-outline-variant/10 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Shortcuts</p>
            {[
              { keys: 'Ctrl+Enter',   action: 'Translate' },
              { keys: 'Ctrl+S',       action: 'Save to history' },
              { keys: 'Ctrl+E',       action: 'Export JSON' },
              { keys: 'Ctrl+Shift+C', action: 'Copy result' },
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
