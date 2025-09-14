import React, { useState } from 'react';
import {
  getApiMiscellaneous,
  getApiMiscellaneousById,
  postApiMiscellaneous,
  putApiMiscellaneousById,
  deleteApiMiscellaneousById,
  postApiMiscellaneousSearch
} from '../api/sdk.gen';
import { client as pricingnewClient } from '../api';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';

const pretty = (data: any) => JSON.stringify(data, null, 2);

const SupportBackdoor: React.FC = () => {
  // States for inputs and results
  const [id, setId] = useState('');
  const [payload, setPayload] = useState('{}');
  const [searchPayload, setSearchPayload] = useState('{}');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handlers for each endpoint
  const handleGetAll = async () => {
    setLoading(true); setError(null);
    try {
      const res = await getApiMiscellaneous({ client: pricingnewClient });
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetById = async () => {
    setLoading(true); setError(null);
    try {
      const res = await getApiMiscellaneousById({ client: pricingnewClient, id });
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    setLoading(true); setError(null);
    try {
      const data = JSON.parse(payload);
      const res = await postApiMiscellaneous({ client: pricingnewClient, data });
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePut = async () => {
    setLoading(true); setError(null);
    try {
      const data = JSON.parse(payload);
      const res = await putApiMiscellaneousById({ client: pricingnewClient, id, data });
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true); setError(null);
    try {
      const res = await deleteApiMiscellaneousById({ client: pricingnewClient, id });
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true); setError(null);
    try {
      const data = JSON.parse(searchPayload);
      const res = await postApiMiscellaneousSearch({ client: pricingnewClient, data });
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 800, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>Support Backdoor – Test Endpoints Miscellaneous</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">GET /api/Miscellaneous</Typography>
        <Button onClick={handleGetAll} disabled={loading} variant="contained">Test GET ALL</Button>
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">GET /api/Miscellaneous/:id</Typography>
        <TextField label="ID" value={id} onChange={e => setId(e.target.value)} size="small" sx={{ mr: 2 }} />
        <Button onClick={handleGetById} disabled={loading || !id} variant="contained">Test GET BY ID</Button>
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">POST /api/Miscellaneous</Typography>
        <TextField label="Payload (JSON)" value={payload} onChange={e => setPayload(e.target.value)} size="small" fullWidth multiline minRows={2} sx={{ mb: 1 }} />
        <Button onClick={handlePost} disabled={loading} variant="contained">Test CREATE</Button>
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">PUT /api/Miscellaneous/:id</Typography>
        <TextField label="ID" value={id} onChange={e => setId(e.target.value)} size="small" sx={{ mr: 2 }} />
        <TextField label="Payload (JSON)" value={payload} onChange={e => setPayload(e.target.value)} size="small" fullWidth multiline minRows={2} sx={{ mb: 1 }} />
        <Button onClick={handlePut} disabled={loading || !id} variant="contained">Test UPDATE</Button>
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">DELETE /api/Miscellaneous/:id</Typography>
        <TextField label="ID" value={id} onChange={e => setId(e.target.value)} size="small" sx={{ mr: 2 }} />
        <Button onClick={handleDelete} disabled={loading || !id} variant="contained" color="error">Test DELETE</Button>
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">POST /api/Miscellaneous/Search</Typography>
        <TextField label="Search Payload (JSON)" value={searchPayload} onChange={e => setSearchPayload(e.target.value)} size="small" fullWidth multiline minRows={2} sx={{ mb: 1 }} />
        <Button onClick={handleSearch} disabled={loading} variant="contained">Test SEARCH</Button>
      </Paper>
      <Paper sx={{ p: 2, mb: 2, background: '#f5f5f5' }}>
        <Typography variant="h6">Résultat</Typography>
        {loading && <Typography color="info.main">Chargement...</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        {result && <pre style={{ maxHeight: 300, overflow: 'auto', background: '#222', color: '#fff', padding: 8 }}>{pretty(result)}</pre>}
      </Paper>
    </Box>
  );
};

export default SupportBackdoor; 