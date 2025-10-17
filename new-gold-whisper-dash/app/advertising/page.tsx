'use client';

// Página de Advertising migrada de la versión anterior
// Adaptada al framework de Next.js

import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Search,
  Edit,
  Download,
  BarChart3,
  Filter,
  Calendar,
  Settings2,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Pause,
  RefreshCw,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Folder,
  X
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Importaciones de servicio se implementarán más adelante
// Al terminar la migración de archivos de lib

export default function AdvertisingPage() {
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [datePreset, setDatePreset] = useState('last_30d');

  useEffect(() => {
    // Simulación de carga
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administrador de anuncios</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona tus campañas publicitarias</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select 
            value={datePreset} 
            onValueChange={(value) => setDatePreset(value)}
          >
            <SelectTrigger className="w-[200px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="yesterday">Ayer</SelectItem>
              <SelectItem value="last_7d">Últimos 7 días</SelectItem>
              <SelectItem value="last_30d">Últimos 30 días</SelectItem>
              <SelectItem value="this_month">Este mes</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1000);
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Estado de carga */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
          <p className="text-lg font-medium text-gray-700">Cargando campañas de publicidad...</p>
          <p className="text-sm text-gray-500 mt-2">Conectando con Meta Ads</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Módulo de publicidad en proceso de migración
          </p>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Esta página está siendo migrada desde la versión anterior. Estará completamente 
            funcional en la próxima actualización.
          </p>
          <Button className="mt-6">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar carga
          </Button>
        </div>
      )}
    </div>
  );
}