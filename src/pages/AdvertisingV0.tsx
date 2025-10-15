import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, RefreshCw, Settings2, CheckCircle2, Pause } from "lucide-react";

export default function AdvertisingV0() {
  // Valores demo; luego se conectan a Meta/CRM.
  const totals = { gasto: 583450, conv: 0, ventas: 0, roas: 0, ctr: 3.05 };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-white border-b px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Administrador de anuncios</h1>
              <p className="text-sm text-gray-500 mt-1">Gestiona tus campañas publicitarias</p>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="last_30d">
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
              <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-2"/>Actualizar</Button>
              <Button variant="outline" size="sm"><Settings2 className="w-4 h-4 mr-2"/>Configurar</Button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-5 gap-4">
            <Card className="border-l-4 border-l-green-600"><CardContent className="p-4"><p className="text-xs text-gray-500 uppercase">GASTO TOTAL</p><p className="text-2xl font-bold mt-1">${totals.gasto.toLocaleString()}</p></CardContent></Card>
            <Card className="border-l-4 border-l-purple-500"><CardContent className="p-4"><p className="text-xs text-gray-500 uppercase">CONVERSACIONES</p><p className="text-2xl font-bold mt-1">{totals.conv}</p></CardContent></Card>
            <Card className="border-l-4 border-l-emerald-500"><CardContent className="p-4"><p className="text-xs text-gray-500 uppercase">VENTAS</p><p className="text-2xl font-bold mt-1">{totals.ventas}</p></CardContent></Card>
            <Card className="border-l-4 border-l-amber-500"><CardContent className="p-4"><p className="text-xs text-gray-500 uppercase">ROAS</p><p className="text-2xl font-bold mt-1">{totals.roas.toFixed(2)}x</p></CardContent></Card>
            <Card className="border-l-4 border-l-indigo-500"><CardContent className="p-4"><p className="text-xs text-gray-500 uppercase">CTR PROMEDIO</p><p className="text-2xl font-bold mt-1">{totals.ctr.toFixed(2)}%</p></CardContent></Card>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white border-b px-6 py-2">
          <div className="flex items-center justify-between mb-3">
            <div className="relative w-[420px]">
              <Input placeholder="Buscar por nombre, identificador o métricas" />
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="todos">
                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="activas">Activas</SelectItem>
                  <SelectItem value="pausadas">Pausadas</SelectItem>
                  <SelectItem value="finalizadas">Finalizadas</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">Editar</Button>
              <Button variant="outline" size="sm">Filtros</Button>
              <Button variant="outline" size="sm">Columnas</Button>
              <Button variant="outline" size="sm">Gráficos</Button>
              <Button variant="outline" size="sm">Exportar</Button>
            </div>
          </div>
        </div>

        {/* Tabla compacta con anchos fijos */}
        <div className="flex-1 bg-white overflow-auto">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[44px]"><input type="checkbox" className="rounded" /></TableHead>
                <TableHead className="w-[72px] text-center">Estado</TableHead>
                <TableHead className="w-[260px]">Campaña</TableHead>
                <TableHead className="w-[120px] text-center">Entrega</TableHead>
                <TableHead className="w-[80px] text-center">Rec.</TableHead>
                <TableHead className="w-[100px] text-right">Presup.</TableHead>
                <TableHead className="w-[100px] text-right">Gastado</TableHead>
                <TableHead className="w-[100px] text-right">Conv.</TableHead>
                <TableHead className="w-[100px] text-right">$/Conv.</TableHead>
                <TableHead className="w-[100px] text-right">Ventas</TableHead>
                <TableHead className="w-[100px] text-right">Ingresos</TableHead>
                <TableHead className="w-[100px] text-right">ROAS</TableHead>
                <TableHead className="w-[100px] text-right">CTR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><input type="checkbox" className="rounded" /></TableCell>
                <TableCell className="text-center">
                  <div className="inline-flex items-center justify-center w-full">
                    <div className="relative h-5 w-9 rounded-full bg-yellow-400"></div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm">ME</div>
                    <div className="min-w-0 max-w-[260px]">
                      <p className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis" title="Mensajes a WhatsApp del Mayor">Mensajes a WhatsApp del Mayor</p>
                      <p className="text-xs text-gray-500">ID: 120233445687010113 • GALLE 18K DETAL</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="default" className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1"/>Activa</Badge>
                </TableCell>
                <TableCell className="text-center">—</TableCell>
                <TableCell className="text-right">$0</TableCell>
                <TableCell className="text-right">$0</TableCell>
                <TableCell className="text-right">0</TableCell>
                <TableCell className="text-right">$0</TableCell>
                <TableCell className="text-right">0</TableCell>
                <TableCell className="text-right">$0</TableCell>
                <TableCell className="text-right"><span className="font-bold text-lg text-red-600">0.00x</span></TableCell>
                <TableCell className="text-right">0%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}

