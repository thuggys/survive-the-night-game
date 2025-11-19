import React, { useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Sword, Hand, Zap, Package, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";

interface MobileControlsProps {
  gameClient: any;
}

export function MobileControls({ gameClient }: MobileControlsProps) {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Handle joystick touch
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updateJoystickPosition(e.touches[0]);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      updateJoystickPosition(e.touches[0]);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setJoystickPos({ x: 0, y: 0 });
    if (gameClient?.inputManager) {
      gameClient.inputManager.setJoystickInput(0, 0);
    }
  };

  const updateJoystickPosition = (touch: React.Touch) => {
    if (!joystickRef.current || !gameClient?.inputManager) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate distance from center
    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;

    // Clamp to radius
    const radius = rect.width / 2;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > radius) {
      const angle = Math.atan2(dy, dx);
      dx = Math.cos(angle) * radius;
      dy = Math.sin(angle) * radius;
    }

    setJoystickPos({ x: dx, y: dy });

    // Normalize inputs for game client (-1 to 1)
    // We add a small deadzone
    const deadzone = 10;
    const inputX = Math.abs(dx) < deadzone ? 0 : dx / radius;
    const inputY = Math.abs(dy) < deadzone ? 0 : dy / radius;

    // Game expects normalized direction or raw values.
    // Based on keyboard input (-1, 0, 1), we might want to threshold or send analog.
    // The server/client physics seems to handle vectors.

    // For now, let's threshold it to emulate WASD if needed, or send float if supported.
    // Looking at input.ts, it seems dx/dy are used in vector calculations, so floats should be fine.
    // However, `updateDirection` uses these values.

    gameClient.inputManager.setJoystickInput(inputX, inputY);
  };

  const handleActionStart = (action: "fire" | "interact" | "sprint" | "drop") => {
    if (gameClient?.inputManager) {
      gameClient.inputManager.setButtonInput(action, true);
    }
  };

  const handleActionEnd = (action: "fire" | "interact" | "sprint" | "drop") => {
    if (gameClient?.inputManager) {
      gameClient.inputManager.setButtonInput(action, false);
    }
  };

  const cycleInventory = (dir: 1 | -1) => {
    if (gameClient?.inputManager) {
        gameClient.inputManager.cycleInventory(dir);
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex flex-col justify-end pb-8 px-8 select-none">
      {/* Only show on touch devices ideally, but for now show always or rely on parent */}

      <div className="flex justify-between items-end">
        {/* Joystick */}
        <div
          ref={joystickRef}
          className="relative w-32 h-32 bg-black/30 rounded-full backdrop-blur-sm border border-white/20 pointer-events-auto touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="absolute w-12 h-12 bg-white/50 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))`
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-4 pointer-events-auto">

          {/* Drop */}
          <Button
            variant="ghost"
            size="icon"
            className="w-16 h-16 rounded-full bg-red-500/50 hover:bg-red-500/70 text-white backdrop-blur-sm"
            onTouchStart={() => handleActionStart("drop")}
            onTouchEnd={() => handleActionEnd("drop")}
          >
            <Trash2 size={24} />
          </Button>

           {/* Interact */}
           <Button
            variant="ghost"
            size="icon"
            className="w-16 h-16 rounded-full bg-yellow-500/50 hover:bg-yellow-500/70 text-white backdrop-blur-sm"
            onTouchStart={() => handleActionStart("interact")}
            onTouchEnd={() => handleActionEnd("interact")}
          >
            <Hand size={24} />
          </Button>

          {/* Sprint */}
          <Button
            variant="ghost"
            size="icon"
            className="w-16 h-16 rounded-full bg-blue-500/50 hover:bg-blue-500/70 text-white backdrop-blur-sm"
            onTouchStart={() => handleActionStart("sprint")}
            onTouchEnd={() => handleActionEnd("sprint")}
          >
            <Zap size={24} />
          </Button>

           {/* Prev Item */}
           <Button
            variant="ghost"
            size="icon"
            className="w-16 h-16 rounded-full bg-gray-500/50 hover:bg-gray-500/70 text-white backdrop-blur-sm"
            onClick={() => cycleInventory(-1)}
          >
            <ArrowLeft size={24} />
          </Button>

          {/* Attack (Fire) - Main action */}
          <Button
            variant="ghost"
            size="icon"
            className="w-20 h-20 col-span-1 rounded-full bg-red-600/60 hover:bg-red-600/80 text-white backdrop-blur-sm flex items-center justify-center"
            onTouchStart={() => handleActionStart("fire")}
            onTouchEnd={() => handleActionEnd("fire")}
          >
            <Sword size={32} />
          </Button>

          {/* Next Item */}
           <Button
            variant="ghost"
            size="icon"
            className="w-16 h-16 rounded-full bg-gray-500/50 hover:bg-gray-500/70 text-white backdrop-blur-sm"
            onClick={() => cycleInventory(1)}
          >
            <ArrowRight size={24} />
          </Button>

        </div>
      </div>
    </div>
  );
}
