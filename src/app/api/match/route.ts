import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const dni = (formData.get('dni') as string)?.trim()

    if (!file || !dni) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const decoder = new TextDecoder('utf-8')
    const text = decoder.decode(arrayBuffer)
    let rows: string[][] = []

    if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
      // 📘 Excel: leemos todas las hojas
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 }) as string[][]
      rows = jsonData.filter(r => r.some(Boolean))
    } else {
      // 🧾 TXT o CSV: convertimos líneas separadas por coma o tab
      const lines = text.split(/\r?\n/).filter(Boolean)
      rows = lines.map(line => line.split(/[,\t;]+/))
    }

    // 🕵️ Intentamos detectar columna DNI automáticamente
    const headers = rows[0].map(h => h.toString().toLowerCase().trim())
    let dniIndex = headers.findIndex(h =>
      ['dni', 'documento', 'nrodocumento', 'numero documento', 'número de documento'].includes(h)
    )

    // Si no hay encabezado o no se encontró, buscamos en todas las columnas
    const dataRows = dniIndex !== -1 ? rows.slice(1) : rows

    const foundRow = dataRows.find(r =>
      r.some(c => c.toString().replace(/\D/g, '') === dni.replace(/\D/g, ''))
    )

    return NextResponse.json({
      dni,
      afiliado: !!foundRow,
      detalle: foundRow ? foundRow.join(' | ') : 'No encontrado'
    })
  } catch (error) {
    console.error('Error procesando archivo:', error)
    return NextResponse.json({ error: 'Error procesando archivo' }, { status: 500 })
  }
}

export async function GET() {
  return new Response('✅ API Matcher funcionando correctamente (usa POST para buscar).', { status: 200 })
}
