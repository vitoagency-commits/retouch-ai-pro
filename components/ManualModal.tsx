
import React from 'react';
import { jsPDF } from "jspdf";
import { RETOUCH_ACTIONS } from '../constants';

interface ManualModalProps {
  onClose: () => void;
}

const ManualModal: React.FC<ManualModalProps> = ({ onClose }) => {

  const generatePDF = () => {
    const doc = new jsPDF();
    const lineHeight = 7;
    let y = 20;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;
    const maxLineWidth = pageWidth - (margin * 2);

    // Helper for adding text
    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      
      const lines = doc.splitTextToSize(text, maxLineWidth);
      
      if (y + (lines.length * lineHeight) > doc.internal.pageSize.height - margin) {
        doc.addPage();
        y = 20;
      }
      
      doc.text(lines, margin, y);
      y += (lines.length * lineHeight);
    };

    const addSpace = (amount: number = 5) => { y += amount; };

    // TITLE
    addText("RetouchAI Pro - Manuale Operativo Ufficiale", 18, true);
    addSpace(10);
    addText("Versione 4.5 - Apex Neural Engine", 12, false);
    addSpace(10);
    doc.line(margin, y, pageWidth - margin, y);
    addSpace(10);

    // SECTIONS
    const sections = [
      {
        title: "1. Filosofia & Visione",
        content: "RetouchAI Pro ridefinisce il concetto di editing. Non ci limitiamo ad applicare filtri distruttivi; il nostro agente neurale emula fedelmente le tecniche di Dodge & Burn e Separazione delle Frequenze utilizzate nei migliori studi di post-produzione al mondo."
      },
      {
        title: "2. Sicurezza & Architettura Full-Stack",
        content: "La versione PRO adotta un'architettura Full-Stack professionale. Tutte le chiamate AI vengono gestite da un server sicuro. La tua identità e le tue chiavi di accesso sono invisibili all'esterno, garantendo una protezione di livello enterprise."
      },
      {
        title: "3. Formati Supportati & RAW",
        content: "Supportiamo JPEG, PNG, WEBP, HEIC (Apple) e formati RAW (.ARW, .CR2, .NEF, .DNG). Nota: Su Mac/PC i RAW dipendono dal browser. Su iPad/iPhone la conversione è nativa e automatica."
      },
      {
        title: "4. Flusso di Lavoro (Smart Workflow)",
        content: "La sequenza corretta è matematica: 1. Heal (Pulizia) -> 2. D&B (Micro-contrasto) -> 3. Tone (Colore) -> 4. Volumes (3D). Il tasto 'Smart Workflow' esegue tutto questo in un click."
      },
      {
        title: "5. Dettaglio Strumenti (Tools)",
        content: RETOUCH_ACTIONS.map(a => `- ${a.label}: ${a.description}`).join('\n') + "\n- Generative Remove (Aggiornato): Ora ottimizzato per la rimozione di testi, loghi e filigrane complesse."
      },
      {
        title: "6. Gestione Livelli (Layers) & Watermark",
        content: "La versione PRO introduce un sistema di livelli non distruttivo. Testi e filigrane vengono creati come oggetti indipendenti. Puoi spostarli, ridimensionarli o eliminarli dal pannello 'Livelli' senza alterare i pixel della foto originale."
      },
      {
        title: "7. Guida Interfaccia: Header (In Alto)",
        content: "- Slider / Hold / Side: Cambia la modalità di visualizzazione prima/dopo. 'Side' affianca le due versioni.\n- System Ready / GPU Accelerated: Indicatori di stato del motore neurale e accelerazione hardware.\n- IT/EN Toggle: Cambia la lingua dell'interfaccia istantaneamente.\n- Importa: Carica una o più foto (supporto Batch)."
      },
      {
        title: "7. Guida Interfaccia: Sidebar (Strumenti)",
        content: "- Presets Tab: Flussi di lavoro editoriali completi (es. Vogue Cover) che combinano più azioni AI.\n- Sync Settings: Sincronizza le impostazioni della foto corrente su tutto il batch caricato.\n- Batch Process: Elabora automaticamente tutte le immagini in coda con l'azione selezionata.\n- Auto Masking (Icona Scudo): Se attivo, l'AI seleziona automaticamente solo la pelle/soggetto."
      },
      {
        title: "8. Color Grading Professionale",
        content: "- Istogramma Live: Monitora in tempo reale la distribuzione di Luci, Ombre e canali RGB.\n- Curve di Viraggio (Tone Curves): Controllo chirurgico su RGB, Rosso, Verde e Blu tramite punti di controllo.\n- HSL & Split Toning: Regolazione fine di Tonalità, Saturazione e Luminanza per ogni singolo colore.\n- Auto Adjust: Algoritmo intelligente per il bilanciamento automatico di esposizione e contrasto."
      },
      {
        title: "9. Persistenza & Salvataggio Progetto",
        content: "- Project Persistence (IndexedDB): Il tuo lavoro viene salvato automaticamente ogni 30 secondi nella memoria locale del dispositivo. Anche se chiudi il browser, ritroverai tutto al riavvio.\n- Carica Ultimo: Ripristina istantaneamente l'ultima sessione di lavoro con un solo click.\n- Esporta/Importa Sessione (.apex): Permette di scaricare l'intero stato del lavoro (foto, ritocchi, testi) in un file esterno. Ideale per liberare spazio sul dispositivo salvando su Pendrive o HD esterni."
      },
      {
        title: "10. Esportazione & Metadata",
        content: "- Esporta: Configura formato (JPG/PNG/WebP), qualità e preservazione metadati EXIF.\n- Metadata Panel (Icona Info): Visualizza dati tecnici dell'immagine e log dell'elaborazione neurale."
      }
    ];

    sections.forEach(s => {
      addText(s.title, 14, true);
      addSpace(2);
      addText(s.content, 10, false);
      addSpace(8);
    });

    // FOOTER
    y = doc.internal.pageSize.height - 10;
    doc.setFontSize(8);
    doc.text("RetouchAI Pro - Generated PDF", margin, y);

    doc.save("RetouchAI_Pro_Manuale.pdf");
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-8">
      <div className="bg-white text-slate-900 w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-fade-in">
        
        {/* Header - PDF Style */}
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-widest">RetouchAI <span className="text-indigo-400">PRO</span></h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Manuale Operativo Ufficiale v4.5</p>
          </div>
          <div className="flex gap-3">
            <button onClick={generatePDF} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2">
                <i className="fas fa-file-pdf"></i> Scarica PDF
            </button>
            <button onClick={onClose} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all">
                <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Content - Scrollable Paper */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar bg-[#f8f9fa]">
          <div className="max-w-4xl mx-auto space-y-12">

            {/* Section 0: Catchy Introduction */}
            <section className="border-b border-slate-200 pb-10 text-center">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tighter uppercase">
                L'Eccellenza del Ritocco <br/>
                <span className="text-indigo-600">Incontra l'Intelligenza Artificiale.</span>
              </h1>
              <div className="space-y-6">
                <p className="text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed font-medium">
                  "Benvenuti nell'era del fotoritocco intelligente. RetouchAI PRO non è solo uno strumento, è il vostro assistente neurale personale, progettato per elevare ogni scatto alla perfezione editoriale con la precisione di un chirurgo e l'occhio di un artista."
                </p>
                <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed italic text-sm">
                  Abbiamo fuso la potenza del calcolo neurale di ultima generazione con i flussi di lavoro più rigorosi della fotografia high-end. Dimenticate le ore perse in compiti ripetitivi: con RetouchAI PRO, la tecnologia lavora per voi, permettendovi di concentrarvi esclusivamente sulla vostra visione creativa.
                </p>
              </div>
            </section>

            {/* Section 1: Introduction */}
            <section className="border-b border-slate-200 pb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">1. Filosofia & Visione</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                RetouchAI Pro ridefinisce il concetto di editing. Non ci limitiamo ad applicare filtri distruttivi; il nostro <strong>agente neurale</strong> emula fedelmente le tecniche di <em>Dodge & Burn</em> e <em>Separazione delle Frequenze</em> utilizzate nei migliori studi di post-produzione al mondo. Il risultato? Una pelle perfetta che mantiene ogni singolo poro e dettaglio materico, senza mai apparire artificiale.
              </p>
            </section>

            {/* Section 1.5: Full-Stack Security - NEW SECTION */}
            <section className="border-b border-slate-200 pb-8 bg-slate-50 -mx-8 px-8 py-8 rounded-2xl">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <i className="fas fa-shield-alt text-indigo-600"></i>
                Sicurezza & Architettura Full-Stack
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4 text-sm">
                La versione PRO adotta un'architettura <strong>Full-Stack professionale</strong>. A differenza delle app amatoriali, RetouchAI PRO non espone mai le chiavi API nel browser.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest mb-2">Protezione Totale</h3>
                  <p className="text-[11px] text-slate-500">Tutte le chiamate AI vengono gestite da un server sicuro. La tua identità e le tue chiavi di accesso sono invisibili all'esterno, garantendo una protezione di livello enterprise.</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest mb-2">Privacy dei Dati</h3>
                  <p className="text-[11px] text-slate-500">Le immagini vengono elaborate in memoria volatile e non vengono mai archiviate permanentemente sui nostri server, rispettando i più alti standard di privacy professionale.</p>
                </div>
              </div>
            </section>

            {/* Section 2: Formats */}
            <section className="border-b border-slate-200 pb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Formati Supportati</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {['JPEG / JPG', 'PNG (Lossless)', 'WEBP (Web)', 'HEIC (Apple)', 'RAW (BETA)'].map((fmt, i) => (
                  <div key={i} className={`p-4 rounded-xl border flex items-center gap-3 ${fmt.includes('RAW') ? 'bg-yellow-50 border-yellow-200 shadow-yellow-100' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs ${fmt.includes('RAW') ? 'bg-yellow-400 text-black' : 'bg-slate-100 text-slate-500'}`}>
                        {fmt.includes('RAW') ? 'RAW' : 'IMG'}
                    </div>
                    <span className="font-bold text-sm text-slate-700">{fmt}</span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-100 p-4 rounded-xl text-xs text-slate-600 space-y-2">
                <p><strong>Supporto RAW (.ARW, .CR2, .NEF, .DNG):</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                    <li><strong>iPad / iPhone:</strong> Supporto nativo. iOS converte automaticamente il RAW in alta definizione.</li>
                    <li><strong>Mac / PC:</strong> Supporto sperimentale tramite browser.</li>
                </ul>
              </div>
            </section>

            {/* Section 3: Smart Workflow */}
            <section className="border-b border-slate-200 pb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">3. Flusso "Smart Workflow"</h2>
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <i className="fas fa-magic text-indigo-600 text-xl"></i>
                  <h3 className="font-bold text-indigo-900">Il tasto magico</h3>
                </div>
                <p className="text-sm text-indigo-800 mb-4">
                  Non sai da dove iniziare? Clicca <strong>Smart Workflow</strong>. L'AI eseguirà questa sequenza esatta:
                </p>
                <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 bg-white p-3 rounded-lg border border-indigo-100">
                    <span className="font-bold">HEAL</span>
                    <i className="fas fa-arrow-right text-slate-300"></i>
                    <span className="font-bold">DODGE&BURN</span>
                    <i className="fas fa-arrow-right text-slate-300"></i>
                    <span className="font-bold">SKIN TONE</span>
                    <i className="fas fa-arrow-right text-slate-300"></i>
                    <span className="font-bold">VOLUMES</span>
                </div>
              </div>
            </section>

            {/* Section 4: Tools Detail */}
            <section className="border-b border-slate-200 pb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">4. Dettaglio Strumenti (Tools)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {RETOUCH_ACTIONS.map((action, idx) => (
                  <div key={idx} className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-slate-900 text-indigo-400 rounded-xl flex items-center justify-center text-xl shrink-0">
                      {action.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{action.label}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{action.description}</p>
                      {action.id === 'GENERATIVE_REMOVE' && (
                        <p className="text-[10px] text-indigo-600 font-bold mt-1">PRO: Ottimizzato per rimozione testi e loghi.</p>
                      )}
                      {action.category && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-widest">
                          {action.category}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 4.5: Layers System - NEW SECTION */}
            <section className="border-b border-slate-200 pb-8 bg-indigo-900 text-white -mx-8 px-8 py-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <i className="fas fa-layer-group"></i>
                Gestione Livelli (Layers)
              </h2>
              <p className="text-indigo-200 leading-relaxed mb-4 text-sm">
                RetouchAI PRO adotta ora un sistema di <strong>Livelli non distruttivi</strong> per testi e filigrane.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                  <h3 className="font-bold text-white text-xs uppercase tracking-widest mb-2">Editing Dinamico</h3>
                  <p className="text-[11px] text-indigo-100">Puoi spostare, ruotare o cambiare il colore di un testo in qualsiasi momento. Il livello non viene "fuso" con la foto finché non decidi di esportarla.</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                  <h3 className="font-bold text-white text-xs uppercase tracking-widest mb-2">Rimozione Rapida</h3>
                  <p className="text-[11px] text-indigo-100">Per eliminare una filigrana aggiunta con l'app, basta cliccare sull'icona del cestino nel pannello Livelli. Non è necessario usare il pennello correttivo.</p>
                </div>
              </div>
            </section>

            {/* Section 6: UI Breakdown - NEW DETAILED SECTION */}
            <section className="border-b border-slate-200 pb-8">
               <h2 className="text-2xl font-bold text-slate-900 mb-6">5. Guida Interfaccia & Comandi (Dettagliata)</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* HEADER */}
                  <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">A. Header (Barra Superiore)</h3>
                    <ul className="space-y-4">
                        <li className="flex gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-600 shrink-0"><i className="fas fa-columns"></i></div>
                            <div>
                                <strong className="text-sm text-slate-900 block">Slider / Hold / Side</strong>
                                <p className="text-xs text-slate-500">Cambia come vedi il Prima/Dopo. <em>Slider</em> crea una linea scorrevole. <em>Hold</em> mostra l'originale tenendo premuto. <em>Side</em> affianca le due versioni per un confronto professionale.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-8 h-8 bg-emerald-100 rounded flex items-center justify-center text-emerald-600 shrink-0"><i className="fas fa-circle text-[8px]"></i></div>
                            <div>
                                <strong className="text-sm text-slate-900 block">System Ready / GPU Accelerated</strong>
                                <p className="text-xs text-slate-500">Indicatori di stato del motore neurale. Il punto verde indica che l'AI è pronta. L'icona microchip conferma che l'app sta usando la potenza della tua scheda video per il rendering.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-600 shrink-0 font-black text-[10px]">IT</div>
                            <div>
                                <strong className="text-sm text-slate-900 block">Language Toggle</strong>
                                <p className="text-xs text-slate-500">Cambia istantaneamente la lingua dell'interfaccia tra Italiano e Inglese per un uso internazionale.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-600 shrink-0"><i className="fas fa-plus"></i></div>
                            <div>
                                <strong className="text-sm text-slate-900 block">Importa</strong>
                                <p className="text-xs text-slate-500">Apre la selezione file. Puoi selezionare 50+ foto insieme.</p>
                            </div>
                        </li>
                    </ul>
                  </div>

                  {/* SIDEBAR TOOLS */}
                  <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">B. Sidebar (Strumenti)</h3>
                    <ul className="space-y-4">
                        <li className="flex gap-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center text-indigo-600 shrink-0"><i className="fas fa-magic"></i></div>
                            <div>
                                <strong className="text-sm text-slate-900 block">Presets Tab (New)</strong>
                                <p className="text-xs text-slate-500">Flussi di lavoro editoriali completi (es. Vogue Cover) che combinano più azioni AI e color grading in un unico passaggio.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-600 shrink-0"><i className="fas fa-sync-alt"></i></div>
                            <div>
                                <strong className="text-sm text-slate-900 block">Sync Settings</strong>
                                <p className="text-xs text-slate-500">Copia le impostazioni di grading e le azioni della foto corrente su tutte le altre immagini caricate nel batch.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-600 shrink-0"><i className="fas fa-layer-group"></i></div>
                            <div>
                                <strong className="text-sm text-slate-900 block">Batch Process</strong>
                                <p className="text-xs text-slate-500">Avvia l'elaborazione automatica di tutte le immagini in coda utilizzando l'azione o il preset selezionato.</p>
                            </div>
                        </li>
                         <li className="flex gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-600 shrink-0"><i className="fas fa-sun"></i></div>
                            <div>
                                <strong className="text-sm text-slate-900 block">Shadow Recovery Slider</strong>
                                <p className="text-xs text-slate-500">Regola la potenza del recupero ombre. Al 100% l'AI cercherà di schiarire anche le zone più scure e profonde.</p>
                            </div>
                        </li>
                         <li className="flex gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-600 shrink-0"><i className="fas fa-highlighter"></i></div>
                            <div>
                                <strong className="text-sm text-slate-900 block">Enhance &gt; Sharpen</strong>
                                <p className="text-xs text-slate-500">Nuova funzione per recuperare foto sfuocate o mosse. Usa l'AI per ricostruire i dettagli, non solo contrasto.</p>
                            </div>
                        </li>
                    </ul>
                  </div>

                  {/* EXPORT & METADATA */}
                  <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">C. Esportazione & Info</h3>
                    <ul className="space-y-4">
                        <li className="flex gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-600 shrink-0"><i className="fas fa-download"></i></div>
                            <div>
                                <strong className="text-sm text-slate-900 block">Esporta (Configurabile)</strong>
                                <p className="text-xs text-slate-500">Permette di scegliere il formato (JPG, PNG, WebP), la qualità e se mantenere i metadati EXIF originali.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-600 shrink-0"><i className="fas fa-info-circle"></i></div>
                            <div>
                                <strong className="text-sm text-slate-900 block">Metadata Panel</strong>
                                <p className="text-xs text-slate-500">Mostra i dettagli tecnici del file e il log delle operazioni AI effettuate sull'immagine.</p>
                            </div>
                        </li>
                    </ul>
                  </div>

                  {/* COLOR GRADING TOOLS */}
                  <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">D. Color Grading (Elite Tools)</h3>
                    <ul className="space-y-4">
                        <li className="flex gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-600 shrink-0"><i className="fas fa-chart-area"></i></div>
                            <div>
                                <strong className="text-sm text-slate-900 block">Istogramma Live</strong>
                                <p className="text-xs text-slate-500">Visualizza in tempo reale la distribuzione tonale. Essenziale per evitare clipping nelle luci o ombre troppo chiuse.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-600 shrink-0"><i className="fas fa-bezier-curve"></i></div>
                            <div>
                                <strong className="text-sm text-slate-900 block">Curve di Viraggio</strong>
                                <p className="text-xs text-slate-500">Controllo granulare su RGB e canali singoli. Doppio click per aggiungere punti, tasto destro per rimuoverli.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-600 shrink-0"><i className="fas fa-palette"></i></div>
                            <div>
                                <strong className="text-sm text-slate-900 block">HSL & Split Toning</strong>
                                <p className="text-xs text-slate-500">Regola selettivamente i colori. Perfetto per uniformare l'incarnato o creare atmosfere cromatiche uniche.</p>
                            </div>
                        </li>
                    </ul>
                  </div>

                  {/* PERSISTENCE */}
                  <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">F. Persistenza & Sicurezza</h3>
                    <ul className="space-y-4">
                        <li className="flex gap-3">
                            <div className="w-8 h-8 bg-emerald-100 rounded flex items-center justify-center text-emerald-600 shrink-0"><i className="fas fa-save"></i></div>
                            <div>
                                <strong className="text-sm text-slate-900 block">Auto-Save (IndexedDB)</strong>
                                <p className="text-xs text-slate-500">L'app salva automaticamente lo stato del progetto ogni 30 secondi nella memoria locale del dispositivo. Nessun dato lascia il tuo Mac/iPad senza il tuo consenso.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-600 shrink-0"><i className="fas fa-history"></i></div>
                            <div>
                                <strong className="text-sm text-slate-900 block">Carica Ultimo Progetto</strong>
                                <p className="text-xs text-slate-500">Al riavvio dell'app, puoi ripristinare istantaneamente l'ultima sessione di lavoro, incluse tutte le foto caricate e i ritocchi effettuati.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600 shrink-0"><i className="fas fa-file-export"></i></div>
                            <div>
                                <strong className="text-sm text-slate-900 block">Esporta/Importa Sessione (.apex)</strong>
                                <p className="text-xs text-slate-500">Crea un file compresso contenente tutto il tuo progetto. Puoi salvarlo su una chiavetta USB o un HD esterno per non appesantire il Mac/iPad e riprenderlo quando vuoi.</p>
                            </div>
                        </li>
                    </ul>
                  </div>

                  {/* SHORTCUTS */}
                  <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">E. Scorciatoie da Tastiera</h3>
                    <ul className="space-y-4">
                        <li className="flex gap-3">
                            <div className="w-8 h-8 bg-slate-900 text-white rounded flex items-center justify-center text-[10px] font-black shrink-0">\</div>
                            <div>
                                <strong className="text-sm text-slate-900 block">Toggle Prima/Dopo</strong>
                                <p className="text-xs text-slate-500">Usa il tasto backslash per passare rapidamente dalla versione originale a quella ritoccata.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-8 h-8 bg-slate-900 text-white rounded flex items-center justify-center text-[10px] font-black shrink-0">ESC</div>
                            <div>
                                <strong className="text-sm text-slate-900 block">Chiudi / Annulla</strong>
                                <p className="text-xs text-slate-500">Chiude i pannelli aperti o annulla la modalità di campionamento colore/gomma.</p>
                            </div>
                        </li>
                    </ul>
                  </div>
               </div>
            </section>

            {/* Section 7: Troubleshooting */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Risoluzione Problemi</h2>
              <div className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <h3 className="font-bold text-orange-900 text-sm mb-1"><i className="fas fa-exclamation-triangle mr-2"></i>La foto è sfuocata?</h3>
                  <p className="text-orange-800 text-xs">Usa lo strumento <strong>Enhance &gt; Sharpen & Detail</strong>. L'AI ricostruirà i dettagli mancanti invece di aumentare solo il contrasto dei bordi.</p>
                </div>
              </div>
            </section>

          </div>
          
          <div className="mt-12 text-center border-t border-slate-200 pt-8">
            <p className="text-xs text-slate-400">RetouchAI Pro Manual © 2024 - Apex Neural Engine</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualModal;
