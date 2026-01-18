"use client"

import { memo, useEffect, useRef } from "react"
import Image from "next/image"
import { X } from "lucide-react"

interface PlayerOverlayProps {
  isOpen: boolean
  onClose: () => void
  playerData: {
    id: number
    code: number
    firstName: string
    lastName: string
    webName: string
    photo: string
    position: string
    team: string
    status: "TRANSFERRED IN" | "TRANSFERRED OUT"
    currentGameweekPoints?: number
    previousGameweekPoints?: number
    totalPoints: number
    nowCost: number
    form: string
    weeksInTeam?: number
    pointsWhileInTeam?: number
  }
}

function PlayerOverlayComponent({ isOpen, onClose, playerData }: PlayerOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  // Close on backdrop click
  useEffect(() => {
    const handleBackdropClick = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleBackdropClick)
    }

    return () => {
      document.removeEventListener("mousedown", handleBackdropClick)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const playerImageUrl = `https://resources.premierleague.com/premierleague/photos/players/110x140/p${playerData.photo.replace('.jpg', '')}.png`
  const statusColor = playerData.status === "TRANSFERRED IN"
    ? "text-green-400 border-green-400 bg-green-900/20"
    : "text-red-400 border-red-400 bg-red-900/20"

  return (
    <>
      <style jsx>{`
        .double-border::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border: 1px solid #8b4513;
          pointer-events: none;
          z-index: 1;
        }
        .double-border::after {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          border: 1px solid #8b4513;
          opacity: 0.6;
          pointer-events: none;
          z-index: 1;
        }
        .jagged-top::before {
          content: '';
          position: absolute;
          top: -2px;
          left: 0;
          right: 0;
          height: 4px;
          background-image: linear-gradient(90deg,
            #8b4513 0px, #8b4513 4px,
            transparent 4px, transparent 6px,
            #8b4513 6px, #8b4513 8px,
            transparent 8px, transparent 10px);
          background-size: 10px 4px;
          background-repeat: repeat-x;
          z-index: 10;
        }
      `}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        ref={overlayRef}
        className="relative w-full max-w-md mx-4 bg-black border-2 border-[#8b4513] double-border jagged-top transform transition-all duration-300 ease-out"
        style={{
          background: 'linear-gradient(145deg, #0a0a0a 0%, #1a1a0a 50%, #0a0a0a 100%)',
        }}
      >
        {/* Header Section */}
        <div className="relative border-b border-[#8b4513]/50 p-4">
          {/* Grid Pattern Background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 153, 102, 0.8) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 153, 102, 0.8) 1px, transparent 1px)
              `,
              backgroundSize: '8px 8px'
            }}
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1 text-[#ff9966] hover:text-[#ffb380] transition-colors z-10"
          >
            <X size={20} />
          </button>

          {/* Status Badge */}
          <div className="flex justify-center mb-4">
            <div className={`px-4 py-1 border ${statusColor} bg-black/50 font-mono text-xs tracking-wider`}>
              STATUS: {playerData.status}
            </div>
          </div>

          {/* Player Image */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-28 h-36 border-2 border-[#8b4513] bg-black/30 flex items-center justify-center overflow-hidden relative">
                <Image
                  src={playerImageUrl}
                  alt={`${playerData.firstName} ${playerData.lastName}`}
                  width={112}
                  height={144}
                  className="w-full h-full object-cover"
                  style={{
                    filter: 'contrast(1.3) brightness(1.2) sepia(0.4) saturate(0.7) hue-rotate(20deg)',
                    imageRendering: 'pixelated' as const,
                    transform: 'scale(1.05)',
                  } as React.CSSProperties}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.parentElement!.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center text-[#ff9966] text-xs font-mono">
                        <div class="text-center">
                          <div class="text-lg">⚠</div>
                          <div>IMG</div>
                          <div>ERROR</div>
                        </div>
                      </div>
                    `
                  }}
                />
                {/* Additional pixelation overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `
                      repeating-linear-gradient(
                        0deg,
                        transparent 0px,
                        transparent 1px,
                        rgba(255, 191, 0, 0.1) 1px,
                        rgba(255, 191, 0, 0.1) 2px
                      ),
                      repeating-linear-gradient(
                        90deg,
                        transparent 0px,
                        transparent 1px,
                        rgba(255, 191, 0, 0.1) 1px,
                        rgba(255, 191, 0, 0.1) 2px
                      )
                    `,
                    mixBlendMode: 'overlay'
                  }}
                />
              </div>
              {/* Scanline Effect */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.3) 2px, rgba(0, 0, 0, 0.3) 4px)',
                }}
              />
            </div>
          </div>

          {/* Player Name */}
          <div className="text-center">
            <h2 className="text-[#ff9966] font-mono text-lg tracking-wide uppercase">
              {playerData.firstName}
            </h2>
            <h3 className="text-[#ffb380] font-mono text-xl tracking-wider uppercase font-bold">
              {playerData.lastName}
            </h3>
            <p className="text-[#cc7a52] font-mono text-sm tracking-wide mt-1">
              {playerData.webName} • {playerData.position} • {playerData.team}
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="p-4 space-y-4">
          {/* Performance Grid */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="border border-[#8b4513]/50 bg-black/30 p-3">
              <div className="text-[#ff9966] font-mono text-xs tracking-wider uppercase mb-1">
                CURRENT GW
              </div>
              <div className="text-green-400 font-mono text-2xl font-bold">
                {playerData.currentGameweekPoints ?? '--'}
              </div>
              <div className="text-[#cc7a52] font-mono text-xs">
                POINTS
              </div>
            </div>

            <div className="border border-[#8b4513]/50 bg-black/30 p-3">
              <div className="text-[#ff9966] font-mono text-xs tracking-wider uppercase mb-1">
                PREV GW
              </div>
              <div className="text-green-400 font-mono text-2xl font-bold">
                {playerData.previousGameweekPoints ?? '--'}
              </div>
              <div className="text-[#cc7a52] font-mono text-xs">
                POINTS
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="border border-[#8b4513]/30 bg-black/20 p-2">
              <div className="text-[#ff9966] font-mono text-xs tracking-wider uppercase">
                TOTAL
              </div>
              <div className="text-[#ffb380] font-mono text-lg font-bold">
                {playerData.totalPoints}
              </div>
            </div>

            <div className="border border-[#8b4513]/30 bg-black/20 p-2">
              <div className="text-[#ff9966] font-mono text-xs tracking-wider uppercase">
                COST
              </div>
              <div className="text-[#ffb380] font-mono text-lg font-bold">
                £{(playerData.nowCost / 10).toFixed(1)}m
              </div>
            </div>

            <div className="border border-[#8b4513]/30 bg-black/20 p-2">
              <div className="text-[#ff9966] font-mono text-xs tracking-wider uppercase">
                FORM
              </div>
              <div className="text-[#ffb380] font-mono text-lg font-bold">
                {playerData.form}
              </div>
            </div>
          </div>

          {/* Transferred Out Stats */}
          {playerData.status === "TRANSFERRED OUT" && (playerData.weeksInTeam || playerData.pointsWhileInTeam) && (
            <div className="border-t border-red-400/30 pt-4 mt-4">
              <div className="text-center mb-3">
                <div className="text-red-400 font-mono text-xs tracking-wider uppercase">
                  TIME IN TEAM
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {playerData.weeksInTeam && (
                  <div className="border border-red-400/30 bg-red-900/10 p-2">
                    <div className="text-red-400 font-mono text-xs tracking-wider uppercase">
                      WEEKS
                    </div>
                    <div className="text-red-300 font-mono text-lg font-bold">
                      {playerData.weeksInTeam}
                    </div>
                  </div>
                )}
                {playerData.pointsWhileInTeam !== undefined && (
                  <div className="border border-red-400/30 bg-red-900/10 p-2">
                    <div className="text-red-400 font-mono text-xs tracking-wider uppercase">
                      POINTS CONTRIBUTED
                    </div>
                    <div className="text-red-300 font-mono text-lg font-bold">
                      {playerData.pointsWhileInTeam}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Player ID Display */}
          <div className="border-t border-[#8b4513]/50 pt-3">
            <div className="text-center">
              <div className="text-[#cc7a52] font-mono text-xs tracking-wider uppercase">
                PLAYER ID: {playerData.id} • CODE: {playerData.code}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Border Effect */}
        <div className="h-1 bg-gradient-to-r from-[#8b4513] via-[#ff9966] to-[#8b4513]"></div>
      </div>
    </div>
    </>
  )
}

export const PlayerOverlay = memo(PlayerOverlayComponent)