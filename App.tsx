import React, { useState, useEffect, useCallback, useRef } from 'react';
import { checkAndRequestApiKey, promptForApiKey, generateImage } from './services/geminiService';
import { ImageSize, AspectRatio, GeneratedImage, GenerationState } from './types';
import { Controls } from './components/Controls';
import { History } from './components/History';
import { Sparkles, Image as ImageIcon, Download, AlertCircle, Key, Loader2, X } from 'lucide-react';

export default function App() {
  // State
  const [apiKeyReady, setApiKeyReady] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  
  const [prompt, setPrompt] = useState<string>('');
  const [size, setSize] = useState<ImageSize>(ImageSize.Size1K);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Square);
  
  const [status, setStatus] = useState<GenerationState>({ isGenerating: false, error: null });
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  
  // Ref for the result section to scroll to
  const resultRef = useRef<HTMLDivElement>(null);

  // Initial Auth Check
  useEffect(() => {
    const init = async () => {
      try {
        const ready = await checkAndRequestApiKey();
        setApiKeyReady(ready);
      } catch (e) {
        console.error("Auth check failed", e);
      } finally {
        setCheckingAuth(false);
      }
    };
    init();
  }, []);

  // Handle Generate
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    // Auth double check
    if (!apiKeyReady) {
      const ready = await checkAndRequestApiKey();
      if (!ready) {
        await promptForApiKey();
        // Assume success after dialog interaction or rely on user to click generate again
        setApiKeyReady(true); 
        return;
      }
    }

    setStatus({ isGenerating: true, error: null });

    try {
      const base64Image = await generateImage({ prompt, size, aspectRatio });
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: base64Image,
        prompt,
        size,
        aspectRatio,
        timestamp: Date.now(),
      };

      setCurrentImage(newImage);
      setHistory(prev => [newImage, ...prev]);
      
      // Clear error if success
      setStatus({ isGenerating: false, error: null });

      // Scroll to result on mobile
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err: any) {
      if (err.message === "API_KEY_INVALID") {
         setApiKeyReady(false);
         setStatus({ isGenerating: false, error: "API Key session expired or invalid. Please select a key again." });
      } else {
        setStatus({ isGenerating: false, error: err.message || "Something went wrong." });
      }
    }
  };

  const handleKeySelection = async () => {
    await promptForApiKey();
    // Optimistically assume they selected a key
    setApiKeyReady(true);
    setStatus({ isGenerating: false, error: null }); // Clear any auth errors
  };

  const downloadImage = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `gemini-gen-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Auth Overlay
  if (checkingAuth) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-gray-100 pb-10 flex flex-col items-center">
      
      {/* Header */}
      <header className="w-full max-w-lg p-4 sticky top-0 bg-background/90 backdrop-blur-md z-30 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-400 rounded-lg flex items-center justify-center shadow-lg shadow-purple-900/50">
                <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Nano Banana Pro
            </h1>
        </div>
        {!apiKeyReady && (
            <button onClick={handleKeySelection} className="text-xs bg-surfaceHighlight hover:bg-surface border border-white/10 px-2 py-1 rounded text-red-400 flex items-center gap-1">
                <Key className="w-3 h-3" /> Connect Key
            </button>
        )}
      </header>

      {/* Main Content */}
      <main className="w-full max-w-lg p-4 flex flex-col gap-6">
        
        {/* API Key Blocker / Warning */}
        {!apiKeyReady && (
            <div className="bg-red-900/20 border border-red-900/50 rounded-xl p-6 text-center">
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                <h3 className="font-bold text-red-200 text-lg mb-2">Access Required</h3>
                <p className="text-sm text-red-200/70 mb-4">
                    Generating High-Quality (1K/2K/4K) images with Gemini 3 Pro requires a verified API Key from Google AI Studio.
                </p>
                <button 
                    onClick={handleKeySelection}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-full w-full transition-colors flex items-center justify-center gap-2"
                >
                    <Key className="w-4 h-4" /> Select API Key
                </button>
            </div>
        )}

        {/* Input Section */}
        <section className={`transition-opacity duration-300 ${!apiKeyReady ? 'opacity-50 pointer-events-none' : ''}`}>
             <div className="relative mb-6">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your imagination..."
                    className="w-full h-32 bg-surface border border-surfaceHighlight rounded-xl p-4 text-base focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none placeholder-gray-600 shadow-inner"
                    disabled={status.isGenerating}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-500 font-mono">
                    {prompt.length} chars
                </div>
             </div>

             <Controls 
                size={size} 
                setSize={setSize}
                aspectRatio={aspectRatio}
                setAspectRatio={setAspectRatio}
                disabled={status.isGenerating}
             />

             <button
                onClick={handleGenerate}
                disabled={status.isGenerating || !prompt.trim()}
                className={`
                    mt-6 w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-primary/20
                    ${status.isGenerating 
                        ? 'bg-surfaceHighlight text-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-primary to-purple-600 hover:from-primaryHover hover:to-purple-500 text-white transform active:scale-[0.98] transition-all'
                    }
                `}
             >
                {status.isGenerating ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Generating...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5" /> Generate Image
                    </>
                )}
             </button>
             
             {status.error && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg flex items-start gap-3 text-red-200 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-bold">Generation Failed</p>
                        <p className="opacity-80">{status.error}</p>
                        {status.error.includes("Key") && (
                            <button onClick={handleKeySelection} className="mt-2 text-xs underline">Select Key Again</button>
                        )}
                    </div>
                </div>
             )}
        </section>

        {/* Result Section */}
        {(currentImage || status.isGenerating) && (
             <div ref={resultRef} className="scroll-mt-24">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-primary" /> Result
                    </h2>
                    {currentImage && !status.isGenerating && (
                         <div className="flex gap-2">
                             <button 
                                onClick={() => downloadImage(currentImage.url)}
                                className="bg-surfaceHighlight hover:bg-surface border border-white/10 p-2 rounded-lg text-gray-300 hover:text-white transition-colors"
                                title="Download"
                             >
                                <Download className="w-5 h-5" />
                             </button>
                         </div>
                    )}
                </div>

                <div className="relative w-full rounded-2xl overflow-hidden bg-black/50 border border-surfaceHighlight min-h-[300px] flex items-center justify-center">
                    {status.isGenerating ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-primary font-mono text-sm animate-pulse">Dreaming pixels...</p>
                        </div>
                    ) : currentImage ? (
                        <div className="relative group w-full h-full">
                            <img 
                                src={currentImage.url} 
                                alt="Generated Result" 
                                className="w-full h-auto object-contain max-h-[70vh] mx-auto"
                            />
                        </div>
                    ) : null}
                    
                    {/* Background decoration for empty/loading state */}
                    {!currentImage && (
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                    )}
                </div>
                
                {currentImage && !status.isGenerating && (
                    <div className="mt-2 text-xs text-gray-500 font-mono text-center">
                        {currentImage.size} • {currentImage.aspectRatio}
                    </div>
                )}
             </div>
        )}

        <History images={history} onSelect={(img) => {
            setCurrentImage(img);
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }} />

      </main>
    </div>
  );
}