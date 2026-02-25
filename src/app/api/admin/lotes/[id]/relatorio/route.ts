import { NextRequest, NextResponse } from 'next/server'
import { queryOne, queryMany } from '@/lib/db'
import ExcelJS from 'exceljs'

interface LoteData {
  id: string
  title: string
  status: string
  totalLivros: number
  soldLivros: number
  livroPrice: number
  prizeAmount: number
  createdAt: string
}

interface PurchaseRow {
  purchaseId: string
  livros: number
  amount: number
  descontoAplicado: number
  numbers: string
  status: string
  statusPago: boolean
  phone: string | null
  payment_id: string | null
  purchaseCreatedAt: string
  userName: string | null
  userCpf: string | null
  userEmail: string | null
  userPhone: string | null
  cupomCode: string | null
  vendedorName: string | null
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const user = await queryOne<{ id: string; isAdmin: boolean }>(
      `SELECT id, "isAdmin" FROM "user" WHERE id = $1`,
      [token]
    )
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id: loteId } = await params

    // Buscar dados do lote
    const lote = await queryOne<LoteData>(
      `SELECT id, title, status, "totalLivros", "soldLivros", "livroPrice", "prizeAmount", "createdAt"
       FROM lotes WHERE id = $1`,
      [loteId]
    )
    if (!lote) {
      return NextResponse.json({ error: 'Lote não encontrado' }, { status: 404 })
    }

    // Buscar todas as compras com dados do usuário e cupom
    const purchases = await queryMany<PurchaseRow>(
      `SELECT 
        l.id as "purchaseId",
        l.livros,
        l.amount,
        l."descontoAplicado",
        l.numbers,
        l.status,
        l."statusPago",
        l.phone,
        l.payment_id,
        l."createdAt" as "purchaseCreatedAt",
        u.name as "userName",
        u.cpf as "userCpf",
        u.email as "userEmail",
        u.phone as "userPhone",
        c.code as "cupomCode",
        v.name as "vendedorName"
       FROM livros l
       LEFT JOIN "user" u ON l."userId" = u.id
       LEFT JOIN cupom c ON l."cupomId" = c.id
       LEFT JOIN "user" v ON c."vendedorId" = v.id
       WHERE l."raffleId" = $1
       ORDER BY l."createdAt" ASC`,
      [loteId]
    )

    // Criar workbook Excel
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Tronco da Sorte'
    workbook.created = new Date()

    // ── Aba 1: Resumo do Lote ──
    const resumoSheet = workbook.addWorksheet('Resumo', {
      properties: { tabColor: { argb: 'FF2563EB' } },
    })

    resumoSheet.columns = [
      { header: 'Campo', key: 'campo', width: 25 },
      { header: 'Valor', key: 'valor', width: 40 },
    ]

    // Estilo do cabeçalho
    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
      },
    }

    resumoSheet.getRow(1).eachCell((cell) => {
      cell.style = headerStyle
    })
    resumoSheet.getRow(1).height = 28

    const confirmedPurchases = purchases.filter(p => p.status === 'confirmed')
    const pendingPurchases = purchases.filter(p => p.status === 'pending')
    const totalVendido = confirmedPurchases.reduce((sum, p) => sum + Number(p.amount), 0)
    const totalDescontos = confirmedPurchases.reduce((sum, p) => sum + Number(p.descontoAplicado || 0), 0)
    const totalLivrosVendidos = confirmedPurchases.reduce((sum, p) => sum + Number(p.livros), 0)
    const comprasComCupom = confirmedPurchases.filter(p => p.cupomCode).length

    const statusLabel: Record<string, string> = {
      open: 'Aberto',
      closed: 'Fechado',
      drawn: 'Sorteado',
    }

    const resumoData = [
      { campo: 'Lote', valor: lote.title },
      { campo: 'Status', valor: statusLabel[lote.status] || lote.status },
      { campo: 'Preço por Livro', valor: `R$ ${Number(lote.livroPrice).toFixed(2)}` },
      { campo: 'Prêmio', valor: `R$ ${Number(lote.prizeAmount).toFixed(2)}` },
      { campo: 'Total de Livros', valor: lote.totalLivros },
      { campo: 'Livros Vendidos (confirmados)', valor: totalLivrosVendidos },
      { campo: 'Livros Pendentes', valor: pendingPurchases.reduce((s, p) => s + Number(p.livros), 0) },
      { campo: 'Total Compras', valor: purchases.length },
      { campo: 'Compras Confirmadas', valor: confirmedPurchases.length },
      { campo: 'Compras Pendentes', valor: pendingPurchases.length },
      { campo: 'Faturamento Confirmado', valor: `R$ ${totalVendido.toFixed(2)}` },
      { campo: 'Descontos Aplicados', valor: `R$ ${totalDescontos.toFixed(2)}` },
      { campo: 'Faturamento Líquido', valor: `R$ ${(totalVendido - totalDescontos).toFixed(2)}` },
      { campo: 'Compras com Cupom', valor: comprasComCupom },
      { campo: 'Data de Criação', valor: new Date(lote.createdAt).toLocaleDateString('pt-BR') },
      { campo: 'Data do Relatório', valor: new Date().toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }) },
    ]

    resumoData.forEach((row) => {
      const r = resumoSheet.addRow(row)
      r.getCell(1).font = { bold: true }
    })

    // ── Aba 2: Vendas (cada compra) ──
    const vendasSheet = workbook.addWorksheet('Vendas', {
      properties: { tabColor: { argb: 'FF10B981' } },
    })

    vendasSheet.columns = [
      { header: '#', key: 'num', width: 5 },
      { header: 'Data', key: 'data', width: 18 },
      { header: 'Comprador', key: 'comprador', width: 30 },
      { header: 'CPF', key: 'cpf', width: 16 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Telefone', key: 'telefone', width: 18 },
      { header: 'Livros', key: 'livros', width: 10 },
      { header: 'Valor (R$)', key: 'valor', width: 14 },
      { header: 'Desconto (R$)', key: 'desconto', width: 14 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Pagamento (PIX)', key: 'paymentId', width: 22 },
      { header: 'Cupom', key: 'cupom', width: 14 },
      { header: 'Vendedor', key: 'vendedor', width: 20 },
      { header: 'Números', key: 'numeros', width: 80 },
    ]

    // Estilo do cabeçalho da aba de vendas
    const vendasHeaderStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
      },
    }

    vendasSheet.getRow(1).eachCell((cell) => {
      cell.style = vendasHeaderStyle
    })
    vendasSheet.getRow(1).height = 28

    vendasSheet.autoFilter = {
      from: 'A1',
      to: `N${purchases.length + 1}`,
    }

    purchases.forEach((p, index) => {
      const row = vendasSheet.addRow({
        num: index + 1,
        data: new Date(p.purchaseCreatedAt).toLocaleString('pt-BR'),
        comprador: p.userName || '(Anônimo)',
        cpf: p.userCpf || '-',
        email: p.userEmail || '-',
        telefone: p.userPhone || p.phone || '-',
        livros: p.livros,
        valor: Number(p.amount),
        desconto: Number(p.descontoAplicado || 0),
        status: p.status === 'confirmed' ? 'Confirmado' : 'Pendente',
        paymentId: p.payment_id || '-',
        cupom: p.cupomCode || '-',
        vendedor: p.vendedorName || '-',
        numeros: p.numbers || '-',
      })

      // Cor de fundo alternada
      if (index % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF0FDF4' },
          }
        })
      }

      // Status colorido
      const statusCell = row.getCell('status')
      if (p.status === 'confirmed') {
        statusCell.font = { bold: true, color: { argb: 'FF059669' } }
      } else {
        statusCell.font = { bold: true, color: { argb: 'FFDC2626' } }
      }

      row.getCell('valor').numFmt = '#,##0.00'
      row.getCell('desconto').numFmt = '#,##0.00'
    })

    // Linha de totais
    if (purchases.length > 0) {
      const lastRow = purchases.length + 2
      const totalsRow = vendasSheet.addRow({
        num: '',
        data: '',
        comprador: 'TOTAL',
        cpf: '',
        email: '',
        telefone: '',
        livros: { formula: `SUM(G2:G${lastRow - 1})` },
        valor: { formula: `SUM(H2:H${lastRow - 1})` },
        desconto: { formula: `SUM(I2:I${lastRow - 1})` },
        status: '',
        paymentId: '',
        cupom: '',
        vendedor: '',
        numeros: '',
      })
      totalsRow.font = { bold: true, size: 12 }
      totalsRow.getCell('valor').numFmt = '#,##0.00'
      totalsRow.getCell('desconto').numFmt = '#,##0.00'
    }

    // ── Aba 3: Clientes (só primeiro nome e números) ──
    const clientesSheet = workbook.addWorksheet('Clientes', {
      properties: { tabColor: { argb: 'FFF59E0B' } },
    })

    clientesSheet.columns = [
      { header: '#', key: 'num', width: 5 },
      { header: 'Cliente', key: 'cliente', width: 20 },
      { header: 'Números', key: 'numeros', width: 80 },
    ]

    const clientesHeaderStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
      },
    }

    clientesSheet.getRow(1).eachCell((cell) => {
      cell.style = clientesHeaderStyle
    })
    clientesSheet.getRow(1).height = 28

    clientesSheet.autoFilter = {
      from: 'A1',
      to: `C${confirmedPurchases.length + 1}`,
    }

    confirmedPurchases.forEach((p, index) => {
      const firstName = (p.userName || 'Anônimo').split(' ')[0]
      const row = clientesSheet.addRow({
        num: index + 1,
        cliente: firstName,
        numeros: p.numbers || '-',
      })

      if (index % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFBEB' },
          }
        })
      }
    })

    // Gerar buffer
    const buffer = await workbook.xlsx.writeBuffer()

    // Limpar nome do lote para uso no filename
    const safeName = lote.title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50)

    const date = new Date().toISOString().slice(0, 10)
    const filename = `relatorio-${safeName}-${date}.xlsx`

    return new NextResponse(buffer as ArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json({ error: 'Erro ao gerar relatório' }, { status: 500 })
  }
}
