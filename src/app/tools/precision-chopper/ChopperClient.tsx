"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Upload, Download, Scissors, Maximize, RefreshCw } from "lucide-react";
import ToolLayout from "@/components/ui/ToolLayout";

type Point = { x: number; y: number };
type Rect = { x: number; y: number; width: number; height: number };

export default function ChopperClient() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [originalName, setOriginalName] = useState<string>("image.png");
  const [resizePercent, setResizePercent] = useState<number>(100);
  const [crop, setCrop] = useState<Rect>({ x: 0, y: 0, width: 0, height: 0 });
  const [dragInfo, setDragInfo] = useState<{ type: string; startPos: Point; startCrop: Rect } | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          setCrop({ x: 0, y: 0, width: img.width, height: img.height });
          setResizePercent(100);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const drawCanvas = useCallback(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newWidth = Math.max(1, (crop.width * resizePercent) / 100);
    const newHeight = Math.max(1, (crop.height * resizePercent) / 100);

    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      newWidth,
      newHeight
    );
  }, [image, crop, resizePercent]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const getMousePos = useCallback((e: React.MouseEvent | MouseEvent): Point => {
    if (!imageRef.current || !image) return { x: 0, y: 0 };
    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = image.width / rect.width;
    const scaleY = image.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, [image]);

  const handleMouseDown = (e: React.MouseEvent, type: string) => {
    e.stopPropagation();
    if (!image) return;
    setDragInfo({
      type,
      startPos: getMousePos(e),
      startCrop: { ...crop },
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragInfo || !image) return;
      const currentPos = getMousePos(e);
      const dx = currentPos.x - dragInfo.startPos.x;
      const dy = currentPos.y - dragInfo.startPos.y;
      
      const newCrop = { ...dragInfo.startCrop };

      if (dragInfo.type === "move") {
        newCrop.x = Math.max(0, Math.min(image.width - newCrop.width, newCrop.x + dx));
        newCrop.y = Math.max(0, Math.min(image.height - newCrop.height, newCrop.y + dy));
      } else {
        if (dragInfo.type.includes("top")) {
          const delta = Math.min(dy, dragInfo.startCrop.height - 10);
          newCrop.y = Math.max(0, dragInfo.startCrop.y + delta);
          newCrop.height = dragInfo.startCrop.height - (newCrop.y - dragInfo.startCrop.y);
        }
        if (dragInfo.type.includes("bottom")) {
          newCrop.height = Math.max(10, Math.min(image.height - newCrop.y, dragInfo.startCrop.height + dy));
        }
        if (dragInfo.type.includes("left")) {
          const delta = Math.min(dx, dragInfo.startCrop.width - 10);
          newCrop.x = Math.max(0, dragInfo.startCrop.x + delta);
          newCrop.width = dragInfo.startCrop.width - (newCrop.x - dragInfo.startCrop.x);
        }
        if (dragInfo.type.includes("right")) {
          newCrop.width = Math.max(10, Math.min(image.width - newCrop.x, dragInfo.startCrop.width + dx));
        }
      }
      setCrop(newCrop);
    };

    const handleMouseUp = () => setDragInfo(null);

    if (dragInfo) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragInfo, image, getMousePos]);

  const download = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    const name = originalName.replace(/\.[^/.]+$/, "");
    link.download = `${name}-martie-edit.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const reset = () => {
    if (image) {
      setCrop({ x: 0, y: 0, width: image.width, height: image.height });
      setResizePercent(100);
    }
  };

  const handles = [
    "top-left", "top-right", "bottom-left", "bottom-right",
    "top", "bottom", "left", "right"
  ];

  return (
    <ToolLayout toolId="precision-chopper">
      <div className="max-w-6xl mx-auto w-full p-6 flex flex-col md:flex-row gap-8">
        <div className="flex-1 flex flex-col gap-4">
          {!image ? (
            <div className="flex-1 border-4 border-dashed border-brand-grey/20 rounded-xl flex flex-col items-center justify-center p-12 bg-brand-white">
              <Upload className="w-16 h-16 text-brand-red mb-4" />
              <h2 className="text-2xl mb-2 font-heading">Feed me an image.</h2>
              <p className="text-brand-grey mb-6 font-ui">PNGs keep their transparency. JPGs stay JPGs.</p>
              <label className="btn btn-primary btn-lg cursor-pointer">
                <span>Select File</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
              </label>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-4">
              <div className="relative bg-brand-charcoal/5 rounded-xl overflow-hidden flex items-center justify-center min-h-[400px] p-8 border border-brand-grey/10">
                <div className="relative select-none inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    ref={imageRef}
                    src={image.src} 
                    alt="Original" 
                    className="max-h-[70vh] w-auto block"
                    draggable={false}
                  />
                  
                  {/* Dimmed Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute bg-black/40" style={{ top: 0, left: 0, right: 0, height: `${(crop.y / image.height) * 100}%` }} />
                    <div className="absolute bg-black/40" style={{ bottom: 0, left: 0, right: 0, height: `${((image.height - (crop.y + crop.height)) / image.height) * 100}%` }} />
                    <div className="absolute bg-black/40" style={{ top: `${(crop.y / image.height) * 100}%`, bottom: `${((image.height - (crop.y + crop.height)) / image.height) * 100}%`, left: 0, width: `${(crop.x / image.width) * 100}%` }} />
                    <div className="absolute bg-black/40" style={{ top: `${(crop.y / image.height) * 100}%`, bottom: `${((image.height - (crop.y + crop.height)) / image.height) * 100}%`, right: 0, width: `${((image.width - (crop.x + crop.width)) / image.width) * 100}%` }} />
                  </div>

                  {/* Crop Box */}
                  <div 
                    className="absolute border-2 border-brand-red cursor-move"
                    onMouseDown={(e) => handleMouseDown(e, "move")}
                    style={{
                      left: `${(crop.x / image.width) * 100}%`,
                      top: `${(crop.y / image.height) * 100}%`,
                      width: `${(crop.width / image.width) * 100}%`,
                      height: `${(crop.height / image.height) * 100}%`,
                    }}
                  >
                    <div className="absolute -top-6 left-0 bg-brand-red text-white text-[10px] px-1 font-ui whitespace-nowrap">
                      {Math.round(crop.width)} x {Math.round(crop.height)}
                    </div>

                    {handles.map(type => (
                      <div
                        key={type}
                        onMouseDown={(e) => handleMouseDown(e, type)}
                        className={`absolute w-3 h-3 bg-brand-red border border-white rounded-full 
                          ${type === "top" ? "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize" : ""}
                          ${type === "bottom" ? "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize" : ""}
                          ${type === "left" ? "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-ew-resize" : ""}
                          ${type === "right" ? "right-0 top-1/2 -translate-y-1/2 translate-x-1/2 cursor-ew-resize" : ""}
                          ${type === "top-left" ? "top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize" : ""}
                          ${type === "top-right" ? "top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize" : ""}
                          ${type === "bottom-left" ? "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize" : ""}
                          ${type === "bottom-right" ? "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize" : ""}
                        `}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-brand-grey italic font-ui">
                Grab the corners to refine the chop. Drag the box to move it.
              </p>
            </div>
          )}
        </div>

        <div className="w-full md:w-80 flex flex-col gap-6">
          <div className="card">
            <h3 className="flex items-center gap-2 mb-4 border-b border-brand-grey/10 pb-2 font-ui font-bold">
              <Maximize className="w-5 h-5" /> Resize
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between font-ui text-sm mb-2">
                  <span>Percentage</span>
                  <span className="text-brand-red font-bold">{resizePercent}%</span>
                </div>
                <input 
                  type="range" min="10" max="200" value={resizePercent} 
                  onChange={(e) => setResizePercent(parseInt(e.target.value))}
                  className="w-full accent-brand-red h-2 bg-brand-grey/20 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {image && (
                <div className="bg-brand-peach/50 p-3 rounded font-ui text-xs space-y-2 border border-brand-charcoal/5">
                  <div className="flex justify-between">
                    <span className="text-brand-grey font-bold">Output:</span>
                    <span className="font-bold">{Math.round((crop.width * resizePercent) / 100)} x {Math.round((crop.height * resizePercent) / 100)} px</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-grey">Source:</span>
                    <span>{image.width} x {image.height} px</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="flex items-center gap-2 mb-4 border-b border-brand-grey/10 pb-2 font-ui font-bold">
              <Scissors className="w-5 h-5" /> Actions
            </h3>
            
            <div className="flex flex-col gap-3">
              <button onClick={download} disabled={!image} className="btn btn-primary w-full flex items-center justify-center gap-2 py-3 text-base">
                <Download className="w-5 h-5" /> Download PNG
              </button>
              <button onClick={reset} disabled={!image} className="btn btn-secondary w-full flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" /> Full Reset
              </button>
              <label className="btn btn-ghost w-full flex items-center justify-center gap-2 cursor-pointer border border-brand-grey/20">
                <Upload className="w-4 h-4" /> New Image
                <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
              </label>
            </div>
          </div>

          <div className="card-peach p-4 text-xs italic text-brand-charcoal/70 border border-brand-red/10 rounded-sm">
            &quot;Martie says: Corners are for grabbing. Just like a proper trash can lid.&quot;
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </ToolLayout>
  );
}
