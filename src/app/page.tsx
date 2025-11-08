'use client'
import { useState } from 'react'
import {
  Container, Typography, TextField, Button, Paper, Alert,
  CircularProgress, Stack, Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material'

export default function BuscarAfiliado() {
  const [file, setFile] = useState<File | null>(null)
  const [dniList, setDniList] = useState('')
  const [resultados, setResultados] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setFile(f)
  }

  const handleBuscar = async () => {
    if (!file || !dniList.trim()) {
      setError('Debés subir el archivo y escribir al menos un DNI')
      return
    }

    setLoading(true)
    setError(null)
    setResultados([])

    const formData = new FormData()
    formData.append('file', file)

    // Separa los DNIs por coma o salto de línea
    const dnis = dniList.split(/[\n,]+/).map(d => d.trim()).filter(Boolean)

    const promises = dnis.map(async (dni) => {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('dni', dni)
      const res = await fetch('/api/match', { method: 'POST', body: fd })
      const data = await res.json()
      return { dni, ...data }
    })

    const results = await Promise.all(promises)
    setResultados(results)
    setLoading(false)
  }

  const handleClear = () => {
    setDniList('')
    setResultados([])
    setError(null)
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={600}>🔍 Buscador de Afiliados</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Subí el padrón (.txt o .csv), ingresá uno o varios DNIs y verificá si están afiliados.
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" mb={2}>
        <Button variant="contained" component="label">
          📁 Subir padrón
          <input hidden type="file" accept=".txt,.csv,.xls,.xlsx" onChange={handleFileChange} />

        </Button>
        <Button
          variant="outlined"
          onClick={handleBuscar}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Buscar'}
        </Button>
        <Button color="error" variant="outlined" onClick={handleClear}>
          🧹 Limpiar
        </Button>
      </Stack>

      <TextField
        label="DNIs (separados por coma o salto de línea)"
        multiline
        rows={3}
        fullWidth
        value={dniList}
        onChange={e => setDniList(e.target.value)}
        sx={{ mb: 2 }}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {resultados.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Resultados</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><b>DNI</b></TableCell>
                <TableCell><b>Estado</b></TableCell>
                <TableCell><b>Detalle</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resultados.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>{r.dni}</TableCell>
                  <TableCell>
                    {r.afiliado
                      ? <Alert severity="success" sx={{ py: 0 }}>Afiliado</Alert>
                      : <Alert severity="warning" sx={{ py: 0 }}>No afiliado</Alert>}
                  </TableCell>
                  <TableCell>{r.detalle}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  )
}
