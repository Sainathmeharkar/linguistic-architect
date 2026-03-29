// src/components/workspaces/CameraTranslation/CameraTranslation.jsx
import React, { useState, useRef } from 'react';
import Button from '../../shared/Button';
import GlassPanel from '../../shared/GlassPanel';
import { useClipboard } from '../../../hooks/useClipboard';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { useKeyboardShortcuts } from '../../../hooks/useKeyboardShortcuts';
import { exportAsJSON, exportAsText } from '../../../utils/exportUtils';
import { translateText, extractTextFromImage, detectLanguage } from '../../../utils/apiUtils';

const CONTEXT_MODES = [
  { label:'Signage',     icon:'signpost' },
  { label:'Handwriting', icon:'draw' },
  { label:'Documents',   icon:'description' },
  { label:'Menus',       icon:'restaurant_menu' },
];
const LANGUAGES = ['Auto-Detect','English','Spanish','French','German','Japanese',
  'Chinese','Arabic','Portuguese','Russian','Korean','Italian','Turkish'];

export default function CameraTranslation() {
  const [sourceLanguage, setSourceLanguage]   = useState('Auto-Detect');
  const [targetLanguage, setTargetLanguage]   = useState('English');
  const [contextMode, setContextMode]         = useState('Signage');
  const [detectedText, setDetectedText]       = useState('アーキテクト');
  const [translatedText, setTranslatedText]   = useState('Architect');
  const [detectedLang, setDetectedLang]       = useState('Japanese');
  const [isOCRing, setIsOCRing]               = useState(false);
  const [isTranslating, setIsTranslating]     = useState(false);
  const [statusMsg, setStatusMsg]             = useState('');
  const [previewUrl, setPreviewUrl]           = useState(null);
  const [isLive, setIsLive]                   = useState(true);
  const { copied, copyToClipboard }           = useClipboard();
  const [history, setHistory]     = useLocalStorage('cameraHistory', []);
  const [favorites, setFavorites] = useLocalStorage('cameraFavorites', []);
  const fileInputRef = useRef(null);

  useKeyboardShortcuts([
    { key:'c', ctrlKey:true, shiftKey:true, callback: () => translatedText && copyToClipboard(translatedText) },
    { key:'e', ctrlKey:true, callback: handleExport },
  ]);

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    // Show preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setIsOCRing(true);
    setStatusMsg('Reading text from image (Tesseract.js)...');
    setDetectedText('');
    setTranslatedText('');
    setDetectedLang('');

    const ocrResult = await extractTextFromImage(file);
    if (!ocrResult.success || !ocrResult.text) {
      setStatusMsg('⚠ OCR failed or no text found. Try a clearer image.');
      setIsOCRing(false);
      return;
    }

    const extracted = ocrResult.text;
    setDetectedText(extracted);
    setStatusMsg(`OCR complete — ${extracted.length} characters extracted. Translating...`);
    setIsOCRing(false);

    // Auto-detect language
    if (sourceLanguage === 'Auto-Detect') {
      const det = await detectLanguage(extracted);
      if (det.language !== 'Unknown') setDetectedLang(det.language);
    }

    // Auto-translate extracted text
    await runTranslation(extracted, sourceLanguage, targetLanguage);
  }

  async function handleTextFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = async ev => {
      const text = ev.target?.result || '';
      setDetectedText(text);
      setPreviewUrl(null);
      setStatusMsg('Text loaded. Translating...');
      await runTranslation(text, sourceLanguage, targetLanguage);
    };
    reader.readAsText(file);
  }

  async function runTranslation(text, src, tgt) {
    if (!text?.trim()) return;
    setIsTranslating(true);
    try {
      const result = await translateText(text, src, tgt);
      setTranslatedText(result);
      // Save to history
      setHistory(prev => [{
        detected: text, translated: result,
        source: src, target: tgt,
        timestamp: new Date().toLocaleString(),
      }, ...prev.slice(0,19)]);
      setStatusMsg('');
    } catch {
      setStatusMsg('⚠ Translation failed. Check your connection.');
    } finally {
      setIsTranslating(false);
    }
  }

  async function handleManualTranslate() {
    if (!detectedText.trim()) {
      setStatusMsg('⚠ No text to translate. Upload an image or enter text below.');
      return;
    }
    await runTranslation(detectedText, sourceLanguage, targetLanguage);
  }

  function handleDragOver(e) { e.preventDefault(); }
  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.type.startsWith('image/')) {
      // simulate input change
      const dt = new DataTransfer(); dt.items.add(file);
      fileInputRef.current.files = dt.files;
      handleImageUpload({ target: fileInputRef.current, files: dt.files });
    }
  }

  function handleExport() {
    const ts = new Date().toISOString().slice(0,10);
    exportAsJSON({ detected:detectedText, translated:translatedText, sourceLanguage, targetLanguage, timestamp:ts },
      `camera_${ts}.json`);
  }

  function handleExportText() {
    const ts = new Date().toISOString().slice(0,10);
    exportAsText(`Original:\n${detectedText}\n\nTranslation:\n${translatedText}`, `camera_${ts}.txt`);
  }

  function handleToggleFavorite() {
    if (favorites.some(f => f.detected===detectedText)) {
      setFavorites(favorites.filter(f => f.detected!==detectedText));
    } else {
      setFavorites([...favorites, { detected:detectedText, translated:translatedText, timestamp:new Date().toISOString() }]);
    }
  }

  function handleLoadHistory(item) {
    setDetectedText(item.detected);
    setTranslatedText(item.translated);
    setSourceLanguage(item.source);
    setTargetLanguage(item.target);
    setPreviewUrl(null);
    setStatusMsg('Loaded from history');
    setTimeout(() => setStatusMsg(''), 2000);
  }

  function handleClear() {
    setDetectedText(''); setTranslatedText(''); setPreviewUrl(null);
    setDetectedLang(''); setStatusMsg('');
  }

  const isFavorited = favorites.some(f => f.detected===detectedText);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-tertiary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-tertiary" style={{fontSize:'20px',fontVariationSettings:"'FILL' 1"}}>camera_alt</span>
          </div>
          <h1 className="font-headline text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface leading-none">
            Visual <span className="text-tertiary">Intelligence</span>
          </h1>
        </div>
        <p className="text-on-surface-variant text-base pl-1">
          Upload an image → OCR extracts the text → it's auto-translated. Powered by OCR.space + MyMemory APIs.
        </p>
      </div>

      {/* Status bar */}
      {statusMsg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${statusMsg.includes('⚠') ? 'bg-error/10 text-error border border-error/20' : 'bg-surface-container text-on-surface-variant border border-outline-variant/20'}`}>
          {isOCRing || isTranslating ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin"></span>
              {statusMsg}
            </span>
          ) : statusMsg}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-wrap gap-2.5">
        <Button variant="filled" onClick={() => fileInputRef.current?.click()} disabled={isOCRing}>
          <span className="material-symbols-outlined" style={{fontSize:'16px',fontVariationSettings:"'FILL' 1"}}>add_photo_alternate</span>
          {isOCRing ? 'Running OCR...' : 'Upload Image (OCR)'}
        </Button>
        <Button variant="secondary" onClick={handleManualTranslate} disabled={isTranslating || !detectedText}>
          <span className="material-symbols-outlined" style={{fontSize:'16px',fontVariationSettings:"'FILL' 1"}}>translate</span>
          {isTranslating ? 'Translating...' : 'Translate'}
        </Button>
        <Button variant="outlined" onClick={() => copyToClipboard(translatedText)} disabled={!translatedText}>
          <span className="material-symbols-outlined" style={{fontSize:'16px'}}>content_copy</span>
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        <Button variant="outlined" onClick={handleExport} disabled={!translatedText}>
          <span className="material-symbols-outlined" style={{fontSize:'16px'}}>download</span>
          JSON
        </Button>
        <Button variant="outlined" onClick={handleExportText} disabled={!translatedText}>
          <span className="material-symbols-outlined" style={{fontSize:'16px'}}>text_snippet</span>
          TXT
        </Button>
        <Button variant="outlined" onClick={handleClear} disabled={!detectedText && !previewUrl}>
          <span className="material-symbols-outlined" style={{fontSize:'16px'}}>delete_sweep</span>
          Clear
        </Button>
        <button onClick={handleToggleFavorite} disabled={!detectedText}
          className={`px-4 py-2.5 rounded-xl text-sm transition-all active:scale-95 disabled:opacity-40 ${isFavorited?'bg-tertiary/15 text-tertiary border border-tertiary/20':'bg-surface-container text-on-surface-variant hover:bg-surface-bright'}`}>
          <span className="material-symbols-outlined" style={{fontSize:'18px',fontVariationSettings:isFavorited?"'FILL' 1":"'FILL' 0"}}>star</span>
        </button>
        {/* Hidden file input — accepts images */}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left — Viewer + Text panels */}
        <div className="col-span-12 lg:col-span-8 space-y-5">

          {/* Image preview / live feed */}
          <div
            className="relative aspect-video bg-surface-container rounded-3xl overflow-hidden shadow-2xl shadow-black/40 group cursor-pointer"
            onDragOver={handleDragOver} onDrop={handleDrop}
            onClick={() => !previewUrl && fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Uploaded" className="w-full h-full object-contain bg-black" />
            ) : (
              <>
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.02]"
                  style={{backgroundImage:`url('https://lh3.googleusercontent.com/aida-public/AB6AXuCEo1zfylO7Zc5U1aniIRPSdIMKusuCz-nhMiTMg19g_zNzz6QYdZmx73mTN2oToeLMW3BfOeaPU1_umFg4T5Ue6stlOqicYI578R89KmWewMpK_SG5my13ptz4VfveRmMYLR5Xv7O4Q3BOoKxL7khCVZqWXDtfikXswt8pb4DoemJROalWhtdra0ZNUYMdPSHGUaZ13zQ5ihFAPS--Xu4pUZuwxZvWCmI2KXbt81WOnQlCRVLI4JQltnW0BzPzh3YST9QRlxsLkq2B')`}} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />
                {/* Scan line */}
                <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-scan blur-sm pointer-events-none" />
                {/* AR Overlays */}
                <div className="absolute top-[18%] left-[12%] space-y-2 pointer-events-none">
                  <div className="glass-panel px-3 py-2 rounded-xl border border-white/10">
                    <p className="text-[9px] uppercase tracking-widest text-primary font-bold mb-0.5">Japanese · Auto</p>
                    <p className="text-xl font-headline font-bold text-white">{detectedText||'アーキテクト'}</p>
                  </div>
                  <div className="bg-gradient-to-r from-primary to-secondary px-3 py-2 rounded-xl shadow-lg shadow-primary/30">
                    <p className="text-base font-headline font-bold text-on-primary-fixed">{translatedText||'Architect'}</p>
                  </div>
                </div>
                {/* Click hint */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="glass-panel px-5 py-3 rounded-2xl border border-white/10 text-center">
                    <span className="material-symbols-outlined text-on-surface text-2xl" style={{fontVariationSettings:"'FILL' 1"}}>add_photo_alternate</span>
                    <p className="text-xs font-bold text-on-surface mt-1">Click or drop an image</p>
                  </div>
                </div>
              </>
            )}

            {/* Top bar */}
            <div className="absolute top-5 left-5 right-5 flex justify-between items-center pointer-events-none">
              <div className="glass-panel px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                <span className={`w-2 h-2 rounded-full ${isOCRing ? 'bg-yellow-400 animate-pulse' : 'bg-red-500 animate-pulse'}`}></span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-white">
                  {isOCRing ? 'OCR Running' : 'Live'}
                </span>
              </div>
              {previewUrl && (
                <button className="pointer-events-auto glass-panel w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"
                  onClick={e => { e.stopPropagation(); handleClear(); }}>
                  <span className="material-symbols-outlined text-white" style={{fontSize:'16px'}}>close</span>
                </button>
              )}
            </div>
          </div>

          {/* OCR result + translation text panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Detected text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                  Detected Text {detectedLang && <span className="text-tertiary ml-1">· {detectedLang}</span>}
                </span>
                <span className="text-[10px] text-on-surface-variant">{detectedText.length} chars</span>
              </div>
              <textarea
                className="w-full h-40 bg-surface-container rounded-2xl p-4 text-on-surface font-body text-sm border border-outline-variant/15 focus:border-tertiary/40 focus:outline-none focus:ring-1 focus:ring-tertiary/20 resize-none placeholder:text-on-surface-variant/30 custom-scrollbar"
                placeholder="OCR-extracted text will appear here (or type manually)..."
                value={detectedText}
                onChange={e => { setDetectedText(e.target.value); setTranslatedText(''); }}
              />
            </div>
            {/* Translation */}
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
              <div className="w-full h-40 bg-surface-container-high rounded-2xl p-4 text-on-surface font-body text-sm border border-primary/10 overflow-y-auto custom-scrollbar">
                {isTranslating ? (
                  <div className="flex items-center gap-2 justify-center h-full">
                    {[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{animationDelay:`${i*150}ms`}}></span>)}
                    <span className="text-xs text-on-surface-variant ml-2">Translating...</span>
                  </div>
                ) : translatedText ? (
                  <p className="leading-relaxed">{translatedText}</p>
                ) : (
                  <p className="text-on-surface-variant/40 italic text-center mt-8 text-xs">Translation will appear here after OCR...</p>
                )}
              </div>
            </div>
          </div>

          {/* Drop zone */}
          <div onDragOver={handleDragOver} onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="bg-surface-container-low border-2 border-dashed border-outline-variant/25 rounded-2xl p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-surface-container transition-all group">
            <div className="flex flex-col items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-surface-container flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary" style={{fontSize:'22px',fontVariationSettings:"'FILL' 1"}}>cloud_upload</span>
              </div>
              <div>
                <p className="font-semibold text-on-surface text-sm">Drop an image here or click to browse</p>
                <p className="text-on-surface-variant text-xs mt-0.5">OCR will extract text automatically</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {['PNG','JPG','WEBP','PDF','MAX 5MB'].map(t => (
                  <span key={t} className="px-2.5 py-1 rounded-full bg-surface-variant text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right — Controls */}
        <div className="col-span-12 lg:col-span-4 space-y-4">

          {/* Language Architecture */}
          <GlassPanel variant="elevated" className="rounded-2xl p-5 space-y-4">
            <h3 className="text-on-surface font-headline font-bold text-base">Language Architecture</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Source Detection</label>
                <select value={sourceLanguage} onChange={e => setSourceLanguage(e.target.value)}
                  className="w-full bg-surface-container p-3 rounded-xl border border-outline-variant/15 focus:border-primary/40 focus:outline-none text-on-surface text-sm">
                  {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex justify-center">
                <button onClick={() => { setSourceLanguage(targetLanguage); setTargetLanguage(sourceLanguage==='Auto-Detect'?'English':sourceLanguage); }}
                  className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/25 active:rotate-180 transition-all duration-500 hover:shadow-primary/40">
                  <span className="material-symbols-outlined text-on-primary-fixed" style={{fontSize:'16px',fontVariationSettings:"'FILL' 1"}}>swap_vert</span>
                </button>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Target Output</label>
                <select value={targetLanguage} onChange={e => setTargetLanguage(e.target.value)}
                  className="w-full bg-surface-container p-3 rounded-xl border border-outline-variant/15 focus:border-primary/40 focus:outline-none text-on-surface text-sm">
                  {LANGUAGES.filter(l => l!=='Auto-Detect').map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* Context Engine */}
            <div className="pt-3 border-t border-outline-variant/10 space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Context Mode</label>
              <div className="grid grid-cols-2 gap-2">
                {CONTEXT_MODES.map(m => (
                  <button key={m.label} onClick={() => setContextMode(m.label)}
                    className={`p-3 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1.5 ${contextMode===m.label?'bg-surface-bright text-on-surface border border-primary/20 shadow-sm':'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
                    <span className="material-symbols-outlined" style={{fontSize:'18px',fontVariationSettings:contextMode===m.label?"'FILL' 1":"'FILL' 0"}}>{m.icon}</span>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-outline-variant/10 text-[10px] text-on-surface-variant">
              OCR: OCR.space API · Translation: MyMemory API
            </div>
          </GlassPanel>

          {/* History */}
          <GlassPanel variant="default" className="rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{fontSize:'18px',fontVariationSettings:"'FILL' 1"}}>history</span>
                Recent Captures
              </h4>
              {history.length > 0 && (
                <button onClick={() => setHistory([])} className="text-[10px] text-on-surface-variant hover:text-error transition-colors font-bold">Clear</button>
              )}
            </div>
            <div className="space-y-2 max-h-44 overflow-y-auto custom-scrollbar">
              {history.slice(0,5).map((item, idx) => (
                <button key={idx} onClick={() => handleLoadHistory(item)}
                  className="w-full text-left p-3 rounded-xl bg-surface-container hover:bg-surface-bright transition-all group">
                  <p className="text-xs font-semibold text-on-surface truncate group-hover:text-primary transition-colors">{item.detected.substring(0,28)}...</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] text-on-surface-variant">{item.source}</span>
                    <span className="material-symbols-outlined text-on-surface-variant/50" style={{fontSize:'10px'}}>arrow_forward</span>
                    <span className="text-[10px] text-on-surface-variant">{item.target}</span>
                  </div>
                </button>
              ))}
              {history.length === 0 && <p className="text-xs text-on-surface-variant/50 text-center py-3 italic">No captures yet — upload an image!</p>}
            </div>
          </GlassPanel>

          {/* API Status */}
          <GlassPanel variant="default" className="rounded-2xl p-4">
            <p className="text-xs font-bold text-on-surface mb-3">API Status</p>
            <div className="space-y-2">
              {[
                { name: 'Tesseract.js (OCR)',    sub: 'In-browser · no limit',  ok: true },
                { name: 'Google Translate',       sub: 'Free · 5k chars/call',   ok: true },
              ].map(s => (
                <div key={s.name} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-container">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${s.ok ? 'bg-green-400' : 'bg-error'}`}></span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-on-surface truncate">{s.name}</p>
                    <p className="text-[10px] text-on-surface-variant">{s.sub}</p>
                  </div>
                  <span className={`text-[10px] font-bold shrink-0 ${s.ok ? 'text-green-400' : 'text-error'}`}>
                    {s.ok ? 'Free' : 'Down'}
                  </span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
