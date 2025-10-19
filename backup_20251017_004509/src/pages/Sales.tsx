import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  Eye,
  Edit,
  MoreVertical,
} from "lucide-react";

interface Sale {
  id: string;
  cliente: string;
  fecha: string;
  productos: string[];
  cantidad: number;
  total: number;
  estado: "completada" | "pendiente" | "cancelada";
  metodoPago: string;
  vendedor: string;
}

const mockSales: Sale[] = [
  {
    id: "VT-001",
    cliente: "María González",
    fecha: "2025-01-08",
    productos: ["Balín de Oro 18k", "Cadena"],
    cantidad: 2,
    total: 285000,
    estado: "completada",
    metodoPago: "Transferencia",
    vendedor: "Juan Pérez"
  },
  {
    id: "VT-002",
    cliente: "Carlos Rodríguez",
    fecha: "2025-01-08",
    productos: ["Anillo de Plata"],
    cantidad: 1,
    total: 125000,
    estado: "pendiente",
    metodoPago: "Efectivo",
    vendedor: "Ana López"
  },
  {
    id: "VT-003",
    cliente: "Laura Martínez",
    fecha: "2025-01-07",
    productos: ["Balín Premium", "Aretes"],
    cantidad: 3,
    total: 450000,
    estado: "completada",
    metodoPago: "Tarjeta",
    vendedor: "Juan Pérez"
  },
];

const Sales = () => {
  const [sales] = useState<Sale[]>(mockSales);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const salesFiltradas = sales.filter(sale => {
    const coincideBusqueda = sale.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
                             sale.id.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === "todos" || sale.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  const totales = {
    ventas: sales.length,
    completadas: sales.filter(s => s.estado === "completada").length,
    pendientes: sales.filter(s => s.estado === "pendiente").length,
    ingresos: sales.filter(s => s.estado === "completada").reduce((acc, s) => acc + s.total, 0),
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
              <p className="text-sm text-gray-500 mt-1">Gestiona y visualiza todas las ventas</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button size="sm">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Nueva Venta
              </Button>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 uppercase font-medium">Total Ventas</p>
                <p className="text-2xl font-bold mt-1">{totales.ventas}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +15% vs mes anterior
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 uppercase font-medium">Ingresos</p>
                <p className="text-2xl font-bold mt-1">${totales.ingresos.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totales.completadas} completadas
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 uppercase font-medium">Pendientes</p>
                <p className="text-2xl font-bold mt-1">{totales.pendientes}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Por confirmar
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 uppercase font-medium">Ticket Promedio</p>
                <p className="text-2xl font-bold mt-1">
                  ${totales.completadas > 0 ? Math.round(totales.ingresos / totales.completadas).toLocaleString() : 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Por venta
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-gray-50 border-b px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por cliente o ID..."
                className="pl-10"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="completada">Completadas</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="cancelada">Canceladas</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Más filtros
            </Button>
          </div>
        </div>

        {/* Tabla de Ventas */}
        <div className="flex-1 overflow-auto bg-white p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Método Pago</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesFiltradas.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.id}</TableCell>
                  <TableCell>{sale.cliente}</TableCell>
                  <TableCell>
                    {new Date(sale.fecha).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {sale.productos.join(", ")}
                      <span className="text-gray-500 ml-2">({sale.cantidad})</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${sale.total.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {sale.estado === "completada" && (
                      <Badge className="bg-green-500">Completada</Badge>
                    )}
                    {sale.estado === "pendiente" && (
                      <Badge className="bg-yellow-500">Pendiente</Badge>
                    )}
                    {sale.estado === "cancelada" && (
                      <Badge variant="destructive">Cancelada</Badge>
                    )}
                  </TableCell>
                  <TableCell>{sale.metodoPago}</TableCell>
                  <TableCell>{sale.vendedor}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {salesFiltradas.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-700 font-medium mb-2">No se encontraron ventas</p>
              <p className="text-gray-500 text-sm">
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t px-6 py-3">
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-600">
              Mostrando <span className="font-semibold">{salesFiltradas.length}</span> de <span className="font-semibold">{sales.length}</span> ventas
            </p>
            <div className="flex items-center gap-6 text-gray-700">
              <div>
                <span className="text-gray-500">Total: </span>
                <span className="font-bold">${totales.ingresos.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Sales;
