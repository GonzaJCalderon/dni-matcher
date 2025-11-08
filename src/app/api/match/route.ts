import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const dni = (formData.get('dni') as string)?.trim()

    if (!file || !dni) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split(/\r?\n/).filter(Boolean)

    const found = lines.find(line => line.includes(dni))

    return NextResponse.json({
      dni,
      afiliado: !!found,
      detalle: found || 'No encontrado'
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error procesando archivo' }, { status: 500 })
  }
}
