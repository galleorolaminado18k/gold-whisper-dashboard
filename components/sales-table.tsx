"use client"

import { useState } from "react"
import { ImageIcon, Upload, FileText } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { InvoiceViewDialog } from "@/components/invoice-view-dialog"

interface Sale {
  id: string
  sale_id: string
  client_name: string
  sale_date: string
  products: any[]
  total: number
  status: string
  payment_method: string
  seller_name: string
  photo_evidence?: string
  photo_uploaded_at?: string // agregado campo para fecha de carga
  shipping_company?: string
  tracking_number?: string
  mipaquete_code?: string
  mipaquete_status?: string
  mipaquete_carrier?: string
  is_return: boolean
  paid_by_mipaquete?: boolean
  payment_date?: string
  invoice_number?: string // agregado campo para número de factura
}

interface SalesTableProps {
  sales: Sale[]
  onRefresh: () => void
  showPaymentCheckbox?: boolean
}

export function SalesTable({ sales, onRefresh, showPaymentCheckbox = false }: SalesTableProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [updatingPayment, setUpdatingPayment] = useState<string | null>(null)
  const [uploadingSale, setUploadingSale] = useState<string | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null)
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [loadingInvoice, setLoadingInvoice] = useState(false)

  const handlePaymentToggle = async (saleId: string, currentStatus: boolean) => {
    setUpdatingPayment(saleId)
    try {
      const response = await fetch(`/api/sales/${saleId}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paid: !currentStatus }),
      })

      if (response.ok) {
        onRefresh()
      }
    } catch (error) {
      console.error("[v0] Error updating payment status:", error)
    } finally {
      setUpdatingPayment(null)
    }
  }

  const handleImageUpload = async (saleId: string, file: File) => {
    setUploadingSale(saleId)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("saleId", saleId)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        onRefresh()
      }
    } catch (error) {
      console.error("[v0] Error uploading image:", error)
    } finally {
      setUploadingSale(null)
    }
  }

  const handleViewInvoice = async (invoiceNumber: string) => {
    setLoadingInvoice(true)
    try {
      const response = await fetch(`/api/invoices/${invoiceNumber}`)
      if (response.ok) {
        const result = await response.json()
        // La API retorna { data: invoice }, no directamente invoice
        const invoice = result.data || result
        console.log("[v0] Invoice loaded:", invoice)
        setSelectedInvoice(invoice)
        setInvoiceDialogOpen(true)
      } else {
        console.error("[v0] Error loading invoice: HTTP", response.status)
      }
    } catch (error) {
      console.error("[v0] Error loading invoice:", error)
    } finally {
      setLoadingInvoice(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const getStatusBadge = (sale: Sale) => {
    const normalizedStatus = sale.status.toLowerCase().trim()

    let displayText = ""
    let colorClasses = ""

    if (normalizedStatus === "pagado") {
      displayText = "Pagado"
      colorClasses = "bg-green-100 text-green-800 border border-green-300"
    } else if (normalizedStatus === "pendiente pago" || normalizedStatus === "pendiente") {
      displayText = "Pendiente Pago"
      colorClasses = "bg-orange-100 text-orange-800 border border-orange-300"
    } else if (normalizedStatus === "devolucion" || normalizedStatus === "devolución") {
      displayText = "Devolución"
      colorClasses = "bg-red-100 text-red-800 border border-red-300"
    } else {
      // Fallback para cualquier estado no reconocido
      displayText = "Pendiente Pago"
      colorClasses = "bg-orange-100 text-orange-800 border border-orange-300"
    }

    return (
      <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium whitespace-nowrap ${colorClasses}`}>
        {displayText}
      </span>
    )
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      efectivo: "Efectivo",
      transferencia: "Transferencia",
      contraentrega: "Contraentrega",
    }
    return labels[method] || method
  }

  const formatUploadDate = (dateString?: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, "0")
    const month = date.toLocaleDateString("es-CO", { month: "short" }).toUpperCase().replace(".", "")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {showPaymentCheckbox && (
                  <th className="px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                    Pagado
                  </th>
                )}
                <th className="px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                  ID
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                  Cliente
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                  Fecha
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                  Productos
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                  Total
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                  Estado
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                  Método Pago
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                  Transportadora
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                  Guía
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                  Evidencia
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                  Vendedor
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                  Factura
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                  {showPaymentCheckbox && (
                    <td className="px-2 py-2">
                      <Checkbox
                        checked={sale.paid_by_mipaquete || false}
                        onCheckedChange={() => handlePaymentToggle(sale.id, sale.paid_by_mipaquete || false)}
                        disabled={updatingPayment === sale.id}
                        className="border-gray-300 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                      />
                    </td>
                  )}
                  <td className="px-2 py-2 font-semibold text-gray-900">{sale.sale_id}</td>
                  <td className="px-2 py-2 text-gray-700">{sale.client_name}</td>
                  <td className="px-2 py-2 text-gray-500">{formatDate(sale.sale_date)}</td>
                  <td className="px-2 py-2 text-gray-700">
                    {sale.products[0]?.name || "N/A"}
                    {sale.products.length > 1 && (
                      <span className="ml-1 text-[10px] text-gray-400">(+{sale.products.length - 1})</span>
                    )}
                  </td>
                  <td className="px-2 py-2 font-semibold text-gray-900 whitespace-nowrap">
                    {formatCurrency(sale.total)}
                  </td>
                  <td className="px-2 py-2">{getStatusBadge(sale)}</td>
                  <td className="px-2 py-2 text-gray-700">{getPaymentMethodLabel(sale.payment_method)}</td>
                  <td className="px-2 py-2 text-gray-700">{sale.mipaquete_carrier || sale.shipping_company || "-"}</td>
                  <td className="px-2 py-2 text-gray-500 font-mono text-[10px]">
                    {sale.mipaquete_code || sale.tracking_number || "-"}
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex flex-col gap-1">
                      {sale.photo_evidence && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedImage(sale.photo_evidence!)}
                            className="flex items-center gap-1 text-amber-600 hover:text-amber-700 transition-colors"
                          >
                            <ImageIcon className="h-3.5 w-3.5" />
                            <span className="text-[11px]">Ver</span>
                          </button>
                          {sale.photo_uploaded_at && (
                            <span className="text-[10px] text-gray-500 font-medium">
                              {formatUploadDate(sale.photo_uploaded_at)}
                            </span>
                          )}
                        </div>
                      )}
                      <label className="flex items-center gap-1 text-gray-400 hover:text-amber-600 cursor-pointer transition-colors">
                        <Upload className="h-3.5 w-3.5" />
                        <span className="text-[11px]">
                          {uploadingSale === sale.id ? "..." : sale.photo_evidence ? "Reemplazar" : "Subir"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingSale === sale.id}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(sale.id, file)
                          }}
                        />
                      </label>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-gray-700">{sale.seller_name}</td>
                  <td className="px-2 py-2">
                    {sale.invoice_number ? (
                      <button
                        onClick={() => handleViewInvoice(sale.invoice_number!)}
                        disabled={loadingInvoice}
                        className="flex items-center gap-1 text-amber-600 hover:text-amber-700 transition-colors font-mono text-[11px] font-semibold"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span className="font-normal not-italic">Ver</span>
                        {sale.invoice_number}
                      </button>
                    ) : (
                      <span className="text-gray-400 text-[11px]">Sin factura</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInvoice && (
        <InvoiceViewDialog
          invoice={selectedInvoice}
          open={invoiceDialogOpen}
          onOpenChange={setInvoiceDialogOpen}
          onRefresh={onRefresh}
        />
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-4xl">
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Evidencia fotográfica"
              className="rounded-lg shadow-2xl"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-4 -right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-900 hover:bg-gray-100 shadow-lg font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  )
}
