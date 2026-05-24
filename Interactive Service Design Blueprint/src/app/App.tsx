import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, Home } from "lucide-react";
import Blueprint from "../imports/Blueprint-2/Blueprint-11-624";
import { useState, useRef } from "react";

export default function App() {
  const [isPanning, setIsPanning] = useState(false);

  return (
    <div className="size-full bg-white">
      <TransformWrapper
        initialScale={0.12}
        minScale={0.05}
        maxScale={5}
        centerOnInit={true}
        limitToBounds={false}
        wheel={{ step: 0.1 }}
        doubleClick={{ disabled: false, mode: "zoomIn", step: 0.5 }}
        panning={{
          disabled: false,
          velocityDisabled: false,
          lockAxisX: false,
          lockAxisY: false,
        }}
        velocityAnimation={{
          sensitivity: 1,
          animationTime: 400,
        }}
        onPanningStart={() => setIsPanning(true)}
        onPanningStop={() => setIsPanning(false)}
      >
        {({ zoomIn, zoomOut, resetTransform, setTransform, state }) => {
          const viewportRef = useRef<HTMLDivElement | null>(null);
          const handleBoxClick = (event: React.MouseEvent<HTMLDivElement>) => {
            event.stopPropagation();

            const target = event.currentTarget as HTMLElement;
            const boxRect = target.getBoundingClientRect();

            // Find the blueprint root for fallback, but prefer the explicit viewportRef wrapper
            const blueprintRoot = target.closest('[data-name="blueprint"]') as HTMLElement | null;
            const wrapper = (viewportRef && viewportRef.current) ? viewportRef.current : (blueprintRoot?.parentElement as HTMLElement | null);

            // Use wrapper bounding rect if available, otherwise fall back to viewport
            const wrapperRect = wrapper ? wrapper.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };

            // Center of the box in screen coordinates
            const elementCenterX = boxRect.left + boxRect.width / 2;
            const elementCenterY = boxRect.top + boxRect.height / 2;

            // Compute element center relative to wrapper (screen coords)
            const relativeCenterX = elementCenterX - wrapperRect.left;
            const relativeCenterY = elementCenterY - wrapperRect.top;

            // Convert to content coordinates (unscaled) using current state (position + scale)
            const contentX = (relativeCenterX - state.positionX) / state.scale;
            const contentY = (relativeCenterY - state.positionY) / state.scale;

            // Desired target scale (clamped to TransformWrapper limits)
            const targetScale = Math.min(Math.max(1.2, 0.05), 5);

            // Compute new position so the content point maps to wrapper center at target scale
            const newPositionX = wrapperRect.width / 2 - contentX * targetScale;
            const newPositionY = wrapperRect.height / 2 - contentY * targetScale;

            setTransform(newPositionX, newPositionY, targetScale, 500);
          };

          return (
            <>
              {/* Control Panel */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                  onClick={() => zoomIn()}
                  className="bg-white hover:bg-gray-100 border border-gray-300 rounded-lg p-3 shadow-md transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="size-6" />
                </button>
                <button
                  onClick={() => zoomOut()}
                  className="bg-white hover:bg-gray-100 border border-gray-300 rounded-lg p-3 shadow-md transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="size-6" />
                </button>
                <button
                  onClick={() => {
                    // Blueprint dimensions (approximate based on content)
                    const blueprintWidth = 6400;
                    const blueprintHeight = 2400;
                    const scale = 0.12;

                    // Calculate viewport center
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;

                    // Calculate position to center the blueprint
                    const positionX = (viewportWidth - blueprintWidth * scale) / 2;
                    const positionY = (viewportHeight - blueprintHeight * scale) / 2;

                    setTransform(positionX, positionY, scale, 500);
                  }}
                  className="bg-white hover:bg-gray-100 border border-gray-300 rounded-lg p-3 shadow-md transition-colors"
                  title="Reset to Full View"
                >
                  <Home className="size-6" />
                </button>
              </div>

              {/* Instructions */}
              <div className="absolute top-4 left-4 z-10 bg-white border border-gray-300 rounded-lg px-4 py-3 shadow-md max-w-sm">
                <h3 className="font-semibold mb-1">Service Design Blueprint</h3>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• Scroll to zoom in/out</li>
                  <li>• Click and drag to pan</li>
                  <li>• Click a box to zoom to it</li>
                  <li>• Use home button to reset view</li>
                </ul>
              </div>

              {/* Blueprint Canvas */}
              <div ref={viewportRef} className="w-full h-full" style={{ cursor: isPanning ? "grabbing" : "grab", width: "100%", height: "100%" }}>
                <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
                  <div className="inline-block">
                    <Blueprint onBoxClick={handleBoxClick} />
                  </div>
                </TransformComponent>
              </div>
            </>
          );
        }}
      </TransformWrapper>
    </div>
  );
}