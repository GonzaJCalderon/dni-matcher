'use client'
import { useState } from 'react'
import { Container, Typography, TextField, Button, Paper, Alert, CircularProgress } from '@mui/material'

export default function BuscarAfiliado() {
  const [file, setFile] = useState<File | null>(null)
  const [dni, setDni] = useState('')
  const [resultado, setResultado] = useState<{ afiliado: boolean; detalle: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setFile(f)
  }

  const handleBuscar = async () => {
    if (!file || !dni.trim()) {
      setError('Debés subir el archivo y escribir un DNI')
      return
    }
    setLoading(true)
    setError(null)
    setResultado(null)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('dni', dni.trim())
    const res = await fetch('/api/match', { method: 'POST', body: formData })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) return setError(data.error || 'Error en el servidor')
    setResultado(data)
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={600}>🔍 Buscador de Afiliados</Typography>

      <Button variant="contained" component="label" sx={{ mt: 2 }}>
        📁 Subir Padrón
        <input hidden type="file" accept=".txt,.csv" onChange={handleFileChange} />
      </Button>

      <TextField
        label="Ingresá DNI"
        fullWidth
        value={dni}
        onChange={e => setDni(e.target.value)}
        sx={{ mt: 3 }}
      />

      <Button variant="outlined" onClick={handleBuscar} disabled={loading} sx={{ mt: 3 }}>
        {loading ? <CircularProgress size={20} /> : 'Buscar'}
      </Button>

      {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

      {resultado && (
        <Paper sx={{ mt: 3, p: 2 }}>
          {resultado.afiliado ? (
            <Alert severity="success">✅ {dni} está afiliado<br />{resultado.detalle}</Alert>
          ) : (
            <Alert severity="warning">❌ {dni} no figura en el padrón</Alert>
          )}
        </Paper>
      )}
    </Container>
  )
}
