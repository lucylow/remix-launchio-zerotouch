import React from 'react';
import { motion } from 'framer-motion';
import { PortData } from '../types/zerotouch';
import { AlertTriangle, Ship, CheckCircle, Navigation, ZoomIn, ZoomOut, Layers, Search, MapPin } from 'lucide-react';

interface PortMapProps {
  ports: PortData[];
}

const PortMap: React.FC<PortMapProps> = ({ ports }) => {
  const getPortStatusIcon = (status: string) => {
    switch (status) {
      case 'strike':
        return AlertTriangle;
      case 'congested':
        return Ship;
      case 'reroute':
        return Navigation;
      default:
        return CheckCircle;
    }
  };

  const getPortStatusColor = (status: string) => {
    switch (status) {
      case 'strike':
        return 'hsl(var(--destructive))';
      case 'congested':
        return 'hsl(var(--warning))';
      case 'reroute':
        return 'hsl(var(--info))';
      default:
        return 'hsl(var(--success))';
    }
  };

  // Convert lat/lng to SVG coordinates (simplified projection)
  const coordToSvg = (lat: number, lng: number) => {
    // Very simplified conversion for West Coast ports
    const x = ((lng + 130) / 20) * 100; // Normalize longitude
    const y = ((55 - lat) / 20) * 100;  // Normalize latitude (inverted)
    return { x: Math.max(10, Math.min(90, x)), y: Math.max(10, Math.min(90, y)) };
  };

  return (
    <div className="relative w-full h-80 bg-slate-100 dark:bg-slate-900 rounded-lg border overflow-hidden shadow-lg">
      {/* Google Maps-style background pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--border))" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Water areas (Google Maps style) */}
      <div className="absolute inset-0 bg-blue-100 dark:bg-blue-950/30">
        <svg className="w-full h-full">
          {/* Ocean/water areas */}
          <path
            d="M 0 60 Q 15 55 30 50 Q 45 45 60 40 Q 75 35 90 30 L 100 35 L 100 100 L 0 100 Z"
            fill="rgba(59, 130, 246, 0.15)"
            className="dark:fill-blue-900/20"
          />
          {/* Coastline */}
          <path
            d="M 0 60 Q 15 55 30 50 Q 45 45 60 40 Q 75 35 90 30 L 100 35"
            stroke="rgba(59, 130, 246, 0.4)"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>

      {/* Google Maps-style search bar */}
      <div className="absolute top-3 left-3 right-3 z-20">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 flex items-center px-3 py-2">
          <Search className="w-4 h-4 text-slate-500 mr-2" />
          <input 
            type="text" 
            placeholder="Search ports, locations..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-300 placeholder-slate-500"
          />
          <MapPin className="w-4 h-4 text-slate-500 ml-2" />
        </div>
      </div>

      {/* Google Maps-style controls */}
      <div className="absolute top-20 right-3 z-20 space-y-2">
        {/* Zoom controls */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <ZoomIn className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
          <div className="border-t border-slate-200 dark:border-slate-700"></div>
          <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <ZoomOut className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
        
        {/* Layers control */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <Layers className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* Port Markers - Google Maps pin style */}
      {ports.map((port, index) => {
        const position = coordToSvg(port.coordinates[0], port.coordinates[1]);
        const StatusIcon = getPortStatusIcon(port.status);
        const statusColor = getPortStatusColor(port.status);
        
        return (
          <motion.div
            key={port.code}
            className="absolute transform -translate-x-1/2 -translate-y-full group z-10"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.2 }}
          >
            {/* Google Maps-style pin */}
            <motion.div
              className="relative cursor-pointer"
              animate={port.status === 'strike' ? {
                scale: [1, 1.1, 1],
              } : {}}
              transition={{
                duration: 2,
                repeat: port.status === 'strike' ? Infinity : 0
              }}
            >
              {/* Pin body */}
              <div 
                className="w-8 h-10 rounded-t-full rounded-b-none relative shadow-lg"
                style={{ backgroundColor: statusColor }}
              >
                {/* Pin tip */}
                <div 
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
                  style={{ borderTopColor: statusColor }}
                ></div>
                
                {/* Icon inside pin */}
                <div className="absolute inset-0 flex items-center justify-center pb-2">
                  <StatusIcon className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Container count bubble */}
              <div className="absolute -top-2 -right-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 text-xs px-1.5 py-0.5 rounded-full font-medium text-slate-700 dark:text-slate-300 shadow-sm">
                {port.containers}
              </div>
            </motion.div>

            {/* Google Maps-style info window */}
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-4 text-sm min-w-max max-w-64">
                {/* Info window arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-slate-800"></div>
                
                <div className="font-semibold text-slate-900 dark:text-slate-100">{port.name}</div>
                <div className="text-slate-500 dark:text-slate-400 text-xs mb-2">{port.code}</div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Containers:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{port.containers}</span>
                  </div>
                  {port.congestionScore && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Congestion:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {Math.round(port.congestionScore * 100)}%
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Status:</span>
                    <span 
                      className="font-medium capitalize px-2 py-1 rounded-full text-xs"
                      style={{ 
                        backgroundColor: statusColor + '20',
                        color: statusColor 
                      }}
                    >
                      {port.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Shipping Routes */}
      {ports.some(p => p.status === 'strike') && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-5">
          {/* Animated shipping route */}
          <motion.path
            d={`M ${coordToSvg(33.7, -118.2).x}% ${coordToSvg(33.7, -118.2).y}% Q 40% 40% ${coordToSvg(37.8, -122.3).x}% ${coordToSvg(37.8, -122.3).y}%`}
            stroke="rgba(59, 130, 246, 0.8)"
            strokeWidth="3"
            fill="none"
            strokeDasharray="8 8"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, delay: 1 }}
          />
          
          {/* Animated ship */}
          <motion.circle
            r="4"
            fill="rgba(59, 130, 246, 1)"
            stroke="white"
            strokeWidth="2"
            initial={{ 
              cx: `${coordToSvg(33.7, -118.2).x}%`, 
              cy: `${coordToSvg(33.7, -118.2).y}%` 
            }}
            animate={{ 
              cx: `${coordToSvg(37.8, -122.3).x}%`, 
              cy: `${coordToSvg(37.8, -122.3).y}%` 
            }}
            transition={{ duration: 4, delay: 2, ease: 'easeInOut' }}
          />
        </svg>
      )}

      {/* Google Maps-style legend/status panel */}
      <div className="absolute bottom-3 left-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3 text-xs">
        <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Port Status</div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--success))' }}></div>
            <span className="text-slate-600 dark:text-slate-400">Normal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--destructive))' }}></div>
            <span className="text-slate-600 dark:text-slate-400">Strike</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--warning))' }}></div>
            <span className="text-slate-600 dark:text-slate-400">Congested</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--info))' }}></div>
            <span className="text-slate-600 dark:text-slate-400">Reroute</span>
          </div>
        </div>
      </div>

      {/* Google Maps attribution */}
      <div className="absolute bottom-3 right-3 text-xs text-slate-500 dark:text-slate-400">
        © ZeroTouch Port Intelligence
      </div>
    </div>
  );
};

export default PortMap;