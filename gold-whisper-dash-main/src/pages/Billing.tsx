import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
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
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Eye,
  Printer,
  MoreVertical,
} from "lucide-react";

interface Invoice {
  id: string;
  numero: string;
  cliente: string;
  fecha: string;
  vencimiento: string;
  subtotal: number;
  iva: number;
  total: number;
  estado: "pagada" | "pendiente" | "vencida" | "cancelada";
  metodoPago?: string;
}

const mockInvoices: Invoice[] = [
  {
    id: "1",
    numero: "FAC-2025-001",
    cliente: "María González",
    fecha: "2025-01-08",
    vencimiento: "2025-01-15",
    subtotal: 240000,
    iva: 45600,
    total: 285600,
    estado: "pagada",
    metodoPago: "Transferencia"
  },
  {
    id: "2",
    numero: "FAC-2025-002",
    cliente: "Carlos Rodríguez",
    fecha: "2025-01-08",
    vencimiento: "2025-01-22",
    subtotal: 105000,
    iva: 19950,
    total: 124950,
    estado: "pendiente"
  },
  {
    id: "3",
    numero: "FAC-2025-003",
    cliente: "Laura Martínez",
    fecha: "2025-01-07",
    vencimiento: "2025-01-14",
    subtotal: 378000,
    iva: 71820,
    total: 449820,
    estado: "pagada",
    metodoPago: "Tarjeta"
  },
  {
    id: "4",
    numero: "FAC-2025-004",
    cliente: "Pedro Sánchez",
    fecha: "2025-01-05",
    vencimiento: "2025-01-07",
    subtotal: 150000,
    iva: 28500,
    total: 178500,
    estado: "vencida"
  },
];

const Billing = () => {
  const [invoices] = useState<Invoice[]>(mockInvoices);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const facturasFiltradas = invoices.filter(invoice => {
    const coincideBusqueda = invoice.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
                             invoice.numero.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === "todos" || invoice.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  const totales = {
    facturas: invoices.length,
    pagadas: invoices.filter(i => i.estado === "pagada").length,
    pendientes: invoices.filter(i => i.estado === "pendiente").length,
    vencidas: invoices.filter(i => i.estado === "vencida").length,
    totalPagado: invoices.filter(i => i.estado === "pagada").reduce((acc, i) => acc + i.total, 0),
    totalPendiente: invoices.filter(i => i.estado === "pendiente" || i.estado === "vencida").reduce((acc, i) => acc + i.total, 0),
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Facturación</h1>
              <p className="text-sm text-gray-500 mt-1">Gestiona facturas y pagos</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Nueva Factura
              </Button>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 uppercase font-medium">Total Facturas</p>
                <p className="text-2xl font-bold mt-1">{totales.facturas}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totales.pagadas} pagadas
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 uppercase font-medium">Total Pagado</p>
                <p className="text-2xl font-bold mt-1">${totales.totalPagado.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {totales.pagadas} facturas
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 uppercase font-medium">Por Cobrar</p>
                <p className="text-2xl font-bold mt-1">${totales.totalPendiente.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totales.pendientes} pendientes
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 uppercase font-medium">Vencidas</p>
                <p className="text-2xl font-bold mt-1">{totales.vencidas}</p>
                <p className="text-xs text-red-600 mt-1">
                  Requieren atención
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
                placeholder="Buscar por cliente o número de factura..."
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
                <SelectItem value="pagada">Pagadas</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="vencida">Vencidas</SelectItem>
                <SelectItem value="cancelada">Canceladas</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Más filtros
            </Button>
          </div>
        </div>

        {/* Tabla de Facturas */}
        <div className="flex-1 overflow-auto bg-white p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha Emisión</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">IVA (19%)</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Método Pago</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facturasFiltradas.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.numero}</TableCell>
                  <TableCell>{invoice.cliente}</TableCell>
                  <TableCell>
                    {new Date(invoice.fecha).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.vencimiento).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    ${invoice.subtotal.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-gray-600">
                    ${invoice.iva.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${invoice.total.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {invoice.estado === "pagada" && (
                      <Badge className="bg-green-500">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Pagada
                      </Badge>
                    )}
                    {invoice.estado === "pendiente" && (
                      <Badge className="bg-yellow-500">
                        <Clock className="w-3 h-3 mr-1" />
                        Pendiente
                      </Badge>
                    )}
                    {invoice.estado === "vencida" && (
                      <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Vencida
                      </Badge>
                    )}
                    {invoice.estado === "cancelada" && (
                      <Badge variant="secondary">Cancelada</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {invoice.metodoPago || <span className="text-gray-400">—</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" title="Ver factura">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Imprimir">
                        <Printer className="w-4 h-4" />
                      </Button>
                      {invoice.estado === "pendiente" && (
                        <Button variant="ghost" size="sm" title="Enviar recordatorio">
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {facturasFiltradas.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-700 font-medium mb-2">No se encontraron facturas</p>
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
              Mostrando <span className="font-semibold">{facturasFiltradas.length}</span> de <span className="font-semibold">{invoices.length}</span> facturas
            </p>
            <div className="flex items-center gap-6 text-gray-700">
              <div>
                <span className="text-gray-500">Total Pagado: </span>
                <span className="font-bold text-green-600">${totales.totalPagado.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Por Cobrar: </span>
                <span className="font-bold text-yellow-600">${totales.totalPendiente.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Billing;
