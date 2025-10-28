"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  Database,
  Factory,
  Server,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle2,
  Timer,
  LineChart,
  Building2,
  Play,
  Award,
  Eye,
  Cog
} from "lucide-react"

interface SystemMetrics {
  systemHealth: number
  apiStatus: 'online' | 'offline'
  uptime: number
  environment: string
  timestamp: string
  activeConnections?: number
  totalRequests?: number
  responseTime?: number
  stats?: {
    totalOrders: number
    activeProduction: number
    qualityScore: number
    efficiency: number
  }
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  type: string
  size: number
  life: number
  maxLife: number
}

interface AssemblyLine {
  id: number
  x: number
  progress: number
  speed: number
  active: boolean
}

interface ConveyorItem {
  id: number
  x: number
  y: number
  type: string
  rotation: number
  speed: number
}

interface RoboticArm {
  id: number
  x: number
  y: number
  angle: number
  phase: number
  speed: number
  active: boolean
  targetAngle: number
}

interface ProductionStage {
  id: number
  x: number
  progress: number
  active: boolean
  efficiency: number
  temperature: number
}

export default function HomePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const [assemblyLines, setAssemblyLines] = useState<AssemblyLine[]>([])
  const [conveyorItems, setConveyorItems] = useState<ConveyorItem[]>([])
  const [roboticArms, setRoboticArms] = useState<RoboticArm[]>([])
  const [productionStages, setProductionStages] = useState<ProductionStage[]>([])

  // Initialize manufacturing animations
  useEffect(() => {
    // Enhanced particles with manufacturing theme
    const initialParticles = Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
      y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      type: ['spark', 'dust', 'energy', 'steam', 'weld'][Math.floor(Math.random() * 5)],
      size: Math.random() * 4 + 1,
      life: Math.random() * 100 + 50,
      maxLife: Math.random() * 100 + 50,
    }))
    setParticles(initialParticles)

    // Assembly line animations
    const initialAssemblyLines = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: (i * 180) + 80,
      progress: 0,
      speed: 0.015 + Math.random() * 0.025,
      active: Math.random() > 0.2,
    }))
    setAssemblyLines(initialAssemblyLines)

    // Conveyor belt items
    const initialConveyorItems = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: (i * 120) + 30,
      y: 400 + (i % 3) * 15 - 15,
      type: ['gear', 'product', 'component', 'assembly'][Math.floor(Math.random() * 4)],
      rotation: 0,
      speed: 1.5 + Math.random() * 1,
    }))
    setConveyorItems(initialConveyorItems)

    // Robotic arms
    const initialRoboticArms = Array.from({ length: 4 }, (_, i) => ({
      id: i,
      x: 250 + (i * 220),
      y: 180 + (i % 2) * 40,
      angle: 0,
      phase: i * 0.7,
      speed: 0.015 + Math.random() * 0.025,
      active: Math.random() > 0.15,
      targetAngle: 0,
    }))
    setRoboticArms(initialRoboticArms)

    // Production stages
    const initialProductionStages = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: 120 + (i * 100),
      progress: 0,
      active: Math.random() > 0.25,
      efficiency: 0.7 + Math.random() * 0.3,
      temperature: Math.random() * 100,
    }))
    setProductionStages(initialProductionStages)

    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => {
        const newLife = particle.life - 1;
        if (newLife <= 0) {
          // Respawn particle
          return {
            ...particle,
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
            vx: (Math.random() - 0.5) * 1.2,
            vy: (Math.random() - 0.5) * 1.2,
            life: particle.maxLife,
            size: Math.random() * 4 + 1,
          };
        }
        return {
          ...particle,
          x: (particle.x + particle.vx + (typeof window !== 'undefined' ? window.innerWidth : 1920)) % (typeof window !== 'undefined' ? window.innerWidth : 1920),
          y: (particle.y + particle.vy + (typeof window !== 'undefined' ? window.innerHeight : 1080)) % (typeof window !== 'undefined' ? window.innerHeight : 1080),
          life: newLife,
          size: particle.size * (0.95 + (newLife / particle.maxLife) * 0.1),
        };
      }))

      // Update assembly lines with more realistic movement
      setAssemblyLines(prev => prev.map(line => ({
        ...line,
        progress: (line.progress + (line.active ? line.speed : line.speed * 0.3)) % 1,
        active: line.active || Math.random() > 0.98,
      })))

      // Update conveyor belt with rotation and varied speeds
      setConveyorItems(prev => prev.map((item, index) => ({
        ...item,
        x: (item.x + item.speed) % (typeof window !== 'undefined' ? window.innerWidth + 150 : 2070),
        rotation: item.rotation + (item.speed * 2),
        speed: item.speed * (0.98 + Math.sin(Date.now() * 0.001 + index) * 0.04),
      })))

      // Update robotic arms with more complex movements
      setRoboticArms(prev => prev.map(arm => {
        const time = Date.now() * 0.001;
        const baseAngle = Math.sin(time + arm.phase) * 35;
        const secondaryAngle = Math.cos(time * 0.7 + arm.phase) * 15;
        const newAngle = baseAngle + secondaryAngle;

        return {
          ...arm,
          angle: arm.active ? newAngle : arm.angle * 0.95,
          active: arm.active || Math.random() > 0.995,
          targetAngle: newAngle,
        };
      }))

      // Update production stages with realistic fluctuations
      setProductionStages(prev => prev.map(stage => {
        const fluctuation = (Math.sin(Date.now() * 0.002 + stage.id) + 1) * 0.1;
        const newProgress = stage.active ?
          Math.min(1, stage.progress + (stage.efficiency * 0.015 + fluctuation * 0.005)) :
          Math.max(0, stage.progress - 0.005);

        return {
          ...stage,
          progress: newProgress % 1,
          active: stage.active || Math.random() > 0.992,
          efficiency: 0.7 + Math.sin(Date.now() * 0.001 + stage.id * 0.5) * 0.15 + Math.random() * 0.1,
          temperature: stage.active ?
            Math.min(100, stage.temperature + (Math.random() - 0.3) * 2) :
            Math.max(0, stage.temperature - 0.5),
        };
      }))
    }, 40)

    return () => clearInterval(interval)
  }, [])

  // Fetch system metrics from backend
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [healthResponse, metricsResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/metrics`)
        ])

        if (healthResponse.ok && metricsResponse.ok) {
          const healthData = await healthResponse.json()
          const metricsData = await metricsResponse.json()

          setMetrics({
            systemHealth: metricsData.data.systemHealth,
            apiStatus: 'online',
            uptime: healthData.uptime,
            environment: healthData.environment,
            timestamp: healthData.timestamp,
            activeConnections: metricsData.data.activeConnections,
            totalRequests: metricsData.data.totalRequests,
            responseTime: metricsData.data.responseTime,
            stats: metricsData.data.stats
          })
        } else {
          throw new Error('API not accessible')
        }
      } catch (error) {
        setMetrics({
          systemHealth: 0,
          apiStatus: 'offline',
          uptime: 0,
          environment: 'unknown',
          timestamp: new Date().toISOString()
        })
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 3000) // Update every 3 seconds for real-time feel
    return () => clearInterval(interval)
  }, [])

  // Auto-redirect authenticated users
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [router, user, isLoading])

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard")
    } else {
      router.push("/auth/login")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--manufacturing-primary))] via-[hsl(var(--manufacturing-secondary))] to-[hsl(var(--manufacturing-surface))] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[hsl(var(--manufacturing-secondary))]/30 border-t-[hsl(var(--manufacturing-accent))] mx-auto"></div>
            <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 border-4 border-[hsl(var(--manufacturing-accent))]/20 mx-auto"></div>
          </div>
          <p className="mt-6 text-white/80 text-lg font-medium">Initializing ProdEase...</p>
          <div className="mt-2 flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-[hsl(var(--manufacturing-accent))] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-[hsl(var(--manufacturing-secondary))] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-[hsl(var(--manufacturing-primary))] rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--manufacturing-primary))] via-[hsl(var(--manufacturing-secondary))] to-[hsl(var(--manufacturing-surface))] relative overflow-hidden">
      {/* Enhanced Manufacturing Particle Background */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => {
          const getParticleColor = (type: string) => {
            switch (type) {
              case 'spark': return 'bg-yellow-300/60';
              case 'dust': return 'bg-gray-400/40';
              case 'energy': return 'bg-blue-400/50';
              case 'steam': return 'bg-white/30';
              case 'weld': return 'bg-orange-400/70';
              default: return 'bg-white/20';
            }
          };

          const getParticleIcon = (type: string) => {
            switch (type) {
              case 'spark': return '✨';
              case 'dust': return '·';
              case 'energy': return '⚡';
              case 'steam': return '💨';
              case 'weld': return '🔥';
              default: return '·';
            }
          };

          const getParticleAnimation = (type: string) => {
            switch (type) {
              case 'spark': return 'animate-welding-spark';
              case 'steam': return 'animate-steam-effect';
              case 'energy': return 'animate-particle-float';
              default: return 'animate-pulse';
            }
          };

          return (
            <div
              key={particle.id}
              className={`absolute ${getParticleColor(particle.type)} rounded-full ${getParticleAnimation(particle.type)} flex items-center justify-center text-xs`}
              style={{
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                width: `${particle.size * 2}px`,
                height: `${particle.size * 2}px`,
                transform: 'translate(-50%, -50%)',
                animationDelay: `${Math.random() * 2}s`,
                fontSize: `${particle.size * 1.5}px`,
                opacity: particle.life / particle.maxLife,
              }}
            >
              {getParticleIcon(particle.type)}
            </div>
          );
        })}
      </div>

      {/* Manufacturing Process Animation - Center Stage */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Main Conveyor Belt - Center */}
        <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2">
          <div className="relative">
            {/* Conveyor belt track - More visible */}
            <div className="h-4 bg-gradient-to-r from-gray-700/40 via-gray-500/60 to-gray-700/40 border-y-2 border-gray-400/40 mx-8 animate-belt-shake">
              {/* Moving belt pattern - More prominent */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--manufacturing-accent))]/20 to-transparent animate-conveyor-continuous"
                style={{
                  backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(255,255,255,0.1) 15px, rgba(255,255,255,0.1) 30px)',
                  height: '100%',
                }}
              />
            </div>

            {/* Conveyor items - More visible and larger */}
            {conveyorItems.map((item) => {
              const getItemIcon = (type: string) => {
                switch (type) {
                  case 'gear': return '⚙️';
                  case 'product': return '📦';
                  case 'component': return '🔧';
                  case 'assembly': return '🔩';
                  default: return '📦';
                }
              };

              const getItemAnimation = (type: string) => {
                switch (type) {
                  case 'gear': return 'animate-gear-rotation';
                  case 'assembly': return 'animate-assembly-spark';
                  default: return 'animate-conveyor-bounce';
                }
              };

              return (
                <div
                  key={item.id}
                  className={`absolute top-1/2 transform -translate-y-1/2 text-2xl ${getItemAnimation(item.type)}`}
                  style={{
                    left: `${item.x}px`,
                    transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                    animationDelay: `${item.id * 0.2}s`,
                    animationDuration: item.type === 'gear' ? '2s' : '1s',
                  }}
                >
                  {getItemIcon(item.type)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Robotic Arms - More visible and prominent */}
        <div className="absolute inset-0 pointer-events-none">
          {roboticArms.map((arm) => (
            <div key={arm.id} className="absolute" style={{ left: `${arm.x}px`, top: `${arm.y}px` }}>
              {/* Robotic arm base - Larger and more visible */}
              <div className={`relative w-6 h-6 bg-[hsl(var(--manufacturing-secondary))] rounded-full shadow-xl border-2 border-[hsl(var(--manufacturing-accent))]/50 ${arm.active ? 'animate-efficiency-pulse' : ''}`}>
                {/* Arm segment 1 - Thicker */}
                <div
                  className="absolute w-16 h-2 bg-gradient-to-r from-[hsl(var(--manufacturing-secondary))] via-[hsl(var(--manufacturing-accent))] to-[hsl(var(--manufacturing-primary))] origin-left shadow-lg"
                  style={{
                    top: '3px',
                    left: '3px',
                    transform: `rotate(${arm.angle}deg)`,
                    transformOrigin: '0 0',
                    borderRadius: '2px',
                  }}
                />
                {/* Arm segment 2 - Thicker */}
                <div
                  className="absolute w-12 h-1.5 bg-gradient-to-r from-[hsl(var(--manufacturing-accent))] via-[hsl(var(--manufacturing-primary))] to-[hsl(var(--manufacturing-secondary))] origin-left shadow-md"
                  style={{
                    top: '3px',
                    left: '65px',
                    transform: `rotate(${-arm.angle * 0.7}deg)`,
                    transformOrigin: '0 0',
                    borderRadius: '2px',
                  }}
                />
                {/* Gripper - Larger */}
                <div
                  className={`absolute w-3 h-3 bg-[hsl(var(--manufacturing-accent))] rounded-full animate-pulse border border-[hsl(var(--manufacturing-primary))] ${arm.active ? 'animate-robotic-complex' : ''}`}
                  style={{
                    top: '1px',
                    left: '125px',
                    transform: `rotate(${arm.angle}deg)`,
                    boxShadow: arm.active ? '0 0 15px rgba(var(--manufacturing-accent), 0.8)' : '0 0 10px rgba(var(--manufacturing-accent), 0.5)',
                  }}
                />
                {/* Enhanced welding sparks - Only when active */}
                {arm.active && (
                  <>
                    <div
                      className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-welding-spark"
                      style={{
                        top: '-4px',
                        left: '125px',
                        animationDelay: `${arm.id * 0.3}s`,
                      }}
                    />
                    <div
                      className="absolute w-1 h-1 bg-orange-400 rounded-full animate-ping"
                      style={{
                        top: '-2px',
                        left: '127px',
                        animationDelay: `${arm.id * 0.3 + 0.1}s`,
                      }}
                    />
                    <div
                      className="absolute w-1 h-1 bg-red-400 rounded-full animate-assembly-spark"
                      style={{
                        top: '-6px',
                        left: '123px',
                        animationDelay: `${arm.id * 0.3 + 0.2}s`,
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Assembly Stations - More visible */}
        <div className="absolute bottom-1/3 left-0 right-0 pointer-events-none">
          <div className="flex justify-center space-x-12">
            {assemblyLines.map((line) => (
              <div key={line.id} className="relative">
                {/* Assembly station base */}
                <div className="w-20 h-8 bg-gradient-to-t from-[hsl(var(--manufacturing-secondary))]/60 to-[hsl(var(--manufacturing-primary))]/30 rounded-lg border-2 border-[hsl(var(--manufacturing-secondary))]/50 relative">
                  {/* Moving assembly point - Larger and more visible */}
                  <div
                    className="absolute top-1/2 w-4 h-4 bg-[hsl(var(--manufacturing-accent))] rounded-full shadow-xl animate-assembly-pulse border-2 border-white/50"
                    style={{
                      left: `${line.progress * 100}%`,
                      transform: 'translate(-50%, -50%)',
                      animationDelay: `${line.id * 0.5}s`,
                      boxShadow: '0 0 15px rgba(var(--manufacturing-accent), 0.8)',
                    }}
                  />
                  {/* Enhanced assembly sparks */}
                  <div
                    className="absolute top-1/2 w-2 h-2 bg-yellow-300 rounded-full animate-welding-spark"
                    style={{
                      left: `${line.progress * 100}%`,
                      transform: 'translate(-50%, -50%) translateY(-8px)',
                      animationDelay: `${line.id * 0.5 + 0.2}s`,
                    }}
                  />
                  <div
                    className="absolute top-1/2 w-1 h-1 bg-orange-400 rounded-full animate-ping"
                    style={{
                      left: `${line.progress * 100}%`,
                      transform: 'translate(-50%, -50%) translateY(-6px)',
                      animationDelay: `${line.id * 0.5 + 0.1}s`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Production Flow Indicators - Side panels */}
        <div className="absolute left-8 top-1/3 bottom-1/3 pointer-events-none">
          <div className="space-y-6">
            {productionStages.slice(0, 3).map((stage) => (
              <div key={stage.id} className="relative">
                {/* Production stage - Larger and more visible */}
                <div className="w-12 h-16 bg-gradient-to-r from-[hsl(var(--manufacturing-secondary))]/50 to-[hsl(var(--manufacturing-primary))]/30 rounded-lg border border-[hsl(var(--manufacturing-secondary))]/40 relative">
                  {/* Active indicator - More prominent */}
                  {stage.active && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white"></div>
                  )}

                  {/* Progress indicator - More visible */}
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-[hsl(var(--manufacturing-muted))]/40 rounded-b-lg overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-b-lg ${stage.active ? 'animate-production-realistic' : ''}`}
                      style={{
                        width: stage.active ? `${stage.progress * 100}%` : '0%',
                        background: stage.active
                          ? 'linear-gradient(90deg, rgba(var(--manufacturing-accent), 0.8), rgba(var(--manufacturing-secondary), 0.6))'
                          : 'linear-gradient(90deg, rgba(var(--manufacturing-accent), 0.3), rgba(var(--manufacturing-secondary), 0.2))'
                      }}
                    />
                  </div>

                  {/* Processing animation - Larger */}
                  {stage.active && (
                    <div className="absolute inset-2 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-[hsl(var(--manufacturing-accent))]/60 border-t-[hsl(var(--manufacturing-accent))] rounded-full animate-spin"></div>
                    </div>
                  )}

                  {/* Stage number - More visible */}
                  <div className="absolute top-1 left-1 w-5 h-5 bg-[hsl(var(--manufacturing-surface))] rounded-full flex items-center justify-center border border-[hsl(var(--manufacturing-accent))]/50">
                    <span className="text-sm font-bold text-[hsl(var(--manufacturing-accent))]">
                      {stage.id + 1}
                    </span>
                  </div>

                  {/* Enhanced steam effects */}
                  {stage.active && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3">
                      <div className="w-2 h-6 bg-gradient-to-t from-transparent via-white/40 to-white/60 rounded-full animate-steam-effect"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side production stages */}
        <div className="absolute right-8 top-1/3 bottom-1/3 pointer-events-none">
          <div className="space-y-6">
            {productionStages.slice(3, 6).map((stage) => (
              <div key={stage.id} className="relative">
                {/* Production stage - Mirror of left side */}
                <div className="w-12 h-16 bg-gradient-to-l from-[hsl(var(--manufacturing-secondary))]/50 to-[hsl(var(--manufacturing-primary))]/30 rounded-lg border border-[hsl(var(--manufacturing-secondary))]/40 relative">
                  {/* Active indicator */}
                  {stage.active && (
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white"></div>
                  )}

                  {/* Progress indicator */}
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-[hsl(var(--manufacturing-muted))]/40 rounded-b-lg overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-b-lg ${stage.active ? 'animate-production-realistic' : ''}`}
                      style={{
                        width: stage.active ? `${stage.progress * 100}%` : '0%',
                        background: stage.active
                          ? 'linear-gradient(90deg, rgba(var(--manufacturing-accent), 0.8), rgba(var(--manufacturing-secondary), 0.6))'
                          : 'linear-gradient(90deg, rgba(var(--manufacturing-accent), 0.3), rgba(var(--manufacturing-secondary), 0.2))'
                      }}
                    />
                  </div>

                  {/* Processing animation */}
                  {stage.active && (
                    <div className="absolute inset-2 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-[hsl(var(--manufacturing-accent))]/60 border-t-[hsl(var(--manufacturing-accent))] rounded-full animate-spin"></div>
                    </div>
                  )}

                  {/* Stage number */}
                  <div className="absolute top-1 right-1 w-5 h-5 bg-[hsl(var(--manufacturing-surface))] rounded-full flex items-center justify-center border border-[hsl(var(--manufacturing-accent))]/50">
                    <span className="text-sm font-bold text-[hsl(var(--manufacturing-accent))]">
                      {stage.id + 1}
                    </span>
                  </div>

                  {/* Steam effects */}
                  {stage.active && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3">
                      <div className="w-2 h-6 bg-gradient-to-t from-transparent via-white/40 to-white/60 rounded-full animate-steam-effect"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animated Gears Background */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-20 left-20 w-16 h-16 border-4 border-[hsl(var(--manufacturing-accent))]/20 rounded-full animate-spin" style={{ animationDuration: '20s' }}>
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-[hsl(var(--manufacturing-accent))] rounded-full transform -translate-x-1/2"></div>
        </div>
        <div className="absolute top-40 right-32 w-12 h-12 border-4 border-[hsl(var(--manufacturing-secondary))]/20 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
          <div className="absolute top-0 left-1/2 w-1 h-1 bg-[hsl(var(--manufacturing-secondary))] rounded-full transform -translate-x-1/2"></div>
        </div>
        <div className="absolute bottom-32 left-1/3 w-20 h-20 border-4 border-[hsl(var(--manufacturing-primary))]/20 rounded-full animate-spin" style={{ animationDuration: '25s' }}>
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-[hsl(var(--manufacturing-primary))] rounded-full transform -translate-x-1/2"></div>
        </div>
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1LCAyNTUsIDEwMCwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Factory className="h-8 w-8 text-blue-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">ProdEase</h1>
                <p className="text-xs text-blue-300">Manufacturing Intelligence</p>
              </div>
            </div>

            {/* System Status */}
            {metrics && (
              <div className="flex items-center space-x-4">
                <Badge
                  variant={metrics.apiStatus === 'online' ? 'default' : 'destructive'}
                  className={`animate-pulse transition-all duration-300 ${
                    metrics.apiStatus === 'online'
                      ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    metrics.apiStatus === 'online' ? 'bg-green-400' : 'bg-red-400'
                  } animate-pulse`}></div>
                  {metrics.apiStatus.toUpperCase()}
                </Badge>
                <div className="text-sm text-white/60 flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-green-400" />
                  <span>Health: <span className="text-green-400 font-mono">{metrics.systemHealth}%</span></span>
                </div>
                <div className="text-xs text-white/40 font-mono">
                  {metrics.activeConnections} active
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-140px)]">

            {/* Left Column - Hero Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 hover:bg-orange-500/20 transition-all duration-300 cursor-pointer group">
                  <Factory className="h-4 w-4 text-orange-400 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="text-orange-300 text-sm font-medium">Smart Manufacturing Platform</span>
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                </div>

                <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Transform Your
                  <br />
                  <span className="bg-gradient-to-r from-orange-400 via-red-400 to-orange-600 bg-clip-text text-transparent">
                    Production Floor
                  </span>
                </h2>

                <p className="text-xl text-white/70 leading-relaxed max-w-lg">
                  Streamline operations, boost productivity, and ensure quality with intelligent manufacturing management.
                  From shop floor to top floor, ProdEase connects every aspect of your production process.
                </p>

                {/* Key Benefits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">35% Efficiency Boost</p>
                      <p className="text-white/60 text-xs">Average improvement</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Timer className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">50% Faster Setup</p>
                      <p className="text-white/60 text-xs">Reduced downtime</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Shield className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">99.9% Uptime</p>
                      <p className="text-white/60 text-xs">Reliable operations</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                      <Award className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Zero Defects</p>
                      <p className="text-white/60 text-xs">Quality assurance</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium px-8 py-3 rounded-lg shadow-lg shadow-orange-500/25 transition-all duration-300 hover:shadow-orange-500/40 hover:shadow-2xl hover:-translate-y-0.5 border-0 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <Play className="h-5 w-5 mr-2 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  <span className="relative z-10">{user ? 'Go to Dashboard' : 'Start Free Trial'}</span>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/20 text-white hover:bg-white/5 hover:border-white/40 px-8 py-3 rounded-lg transition-all duration-300"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Eye className="h-5 w-5 mr-2" />
                  See How It Works
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/5 hover:border-yellow-500/40 px-8 py-3 rounded-lg transition-all duration-300"
                  onClick={async () => {
                    try {
                      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/setup`, { method: 'POST' });
                      const data = await response.json();
                      if (data.success) {
                        alert('✅ Test data created! You can now login with:\nAdmin: admin@prodease.com / Admin@123\nOperator: operator@prodease.com / Test@123');
                      } else {
                        alert('❌ Setup failed: ' + data.message);
                      }
                    } catch (error) {
                      alert('❌ Setup failed: ' + error);
                    }
                  }}
                >
                  <Database className="h-5 w-5 mr-2" />
                  Setup Demo
                </Button>
              </div>

            </div>

            {/* Right Column - Manufacturing Features */}
            <div className="space-y-6">
              <div id="features" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="bg-black/20 border-white/10 backdrop-blur-sm hover:bg-black/30 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                        <LineChart className="h-5 w-5 text-green-400" />
                      </div>
                      <span className="text-white font-medium">Real-time Monitoring</span>
                    </div>
                    <p className="text-white/60 text-sm">Track production metrics and KPIs in real-time</p>
                  </CardContent>
                </Card>

                <Card className="bg-black/20 border-white/10 backdrop-blur-sm hover:bg-black/30 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                        <Cog className="h-5 w-5 text-blue-400" />
                      </div>
                      <span className="text-white font-medium">Predictive Maintenance</span>
                    </div>
                    <p className="text-white/60 text-sm">Prevent downtime with AI-powered maintenance alerts</p>
                  </CardContent>
                </Card>

                <Card className="bg-black/20 border-white/10 backdrop-blur-sm hover:bg-black/30 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                        <Shield className="h-5 w-5 text-purple-400" />
                      </div>
                      <span className="text-white font-medium">Quality Assurance</span>
                    </div>
                    <p className="text-white/60 text-sm">Automated quality control and defect detection</p>
                  </CardContent>
                </Card>

                <Card className="bg-black/20 border-white/10 backdrop-blur-sm hover:bg-black/30 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors">
                        <Building2 className="h-5 w-5 text-orange-400" />
                      </div>
                      <span className="text-white font-medium">Multi-Plant Support</span>
                    </div>
                    <p className="text-white/60 text-sm">Manage multiple facilities from a single dashboard</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>



        {/* Footer */}
        <footer className="border-t border-white/10 backdrop-blur-sm bg-black/20">
          <div className="container mx-auto px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center space-x-6">
                <p className="text-white/60 text-sm">
                  © 2025 ProdEase. Manufacturing Intelligence Platform.
                </p>
                {metrics && (
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <CheckCircle2 className="h-3 w-3 text-green-400" />
                      <span className="text-green-400">All Systems Operational</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-blue-400" />
                      <span className="text-white/60">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                <div className="flex items-center space-x-2 text-white/60 text-sm">
                  <Server className="h-4 w-4" />
                  <span>API: </span>
                  <span className={metrics?.apiStatus === 'online' ? 'text-green-400' : 'text-red-400'}>
                    {metrics?.apiStatus || 'checking...'}
                  </span>
                </div>
                <Badge variant="outline" className="border-white/20 text-white/60 text-xs">
                  v2.1.0
                </Badge>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
