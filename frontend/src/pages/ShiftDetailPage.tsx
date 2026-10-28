import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Box, Typography, Paper, Stack, Button, TextField, List, ListItem, ListItemText,
  Divider, Alert, RadioGroup, FormControlLabel, Radio, MenuItem, Grid,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import { api, getErrorMessage } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import StatusChip from '../components/StatusChip'
import { DAYS, SLOT_LABELS } from '../types'

export default function ShiftDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const qc = useQueryClient()
  const [message, setMessage] = useState('')
  const [selectedAlt, setSelectedAlt] = useState<number | ''>('')
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [proposeMode, setProposeMode] = useState(false)
  const [newAlt, setNewAlt] = useState({ resource_id: '', day_of_week: 0, start_slot_index: 0, duration_hours: 1 })

  const { data: shift } = useQuery({ queryKey: ['shift', id], queryFn: () => api.get(`/shift-requests/${id}`).then(r => r.data) })
  const { data: discussion = [] } = useQuery({
    queryKey: ['discussion', id], queryFn: () => api.get(`/shift-requests/${id}/discussion`).then(r => r.data),
    refetchInterval: 4000,
  })
  const { data: resources = [] } = useQuery({ queryKey: ['resources-all'], queryFn: () => api.get('/resources').then(r => r.data) })

  const sendMessage = useMutation({
    mutationFn: () => api.post(`/shift-requests/${id}/discussion`, { message }),
    onSuccess: () => { setMessage(''); qc.invalidateQueries({ queryKey: ['discussion', id] }); qc.invalidateQueries({ queryKey: ['shift', id] }) },
  })

  const takeAction = useMutation({
    mutationFn: (payload: any) => api.post(`/shift-requests/${id}/action`, payload),
    onSuccess: () => { setError(''); qc.invalidateQueries({ queryKey: ['shift', id] }); qc.invalidateQueries({ queryKey: ['shift-requests'] }) },
    onError: (e) => setError(getErrorMessage(e)),
  })

  if (!shift) return <Typography color="text.secondary">Loading details…</Typography>

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2.5 }}>
        <Typography variant="h4">Shift Request #{shift.id}</Typography>
        <StatusChip status={shift.status} />
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={650}>Overview</Typography>
            <Stack spacing={1} sx={{ mt: 1.5 }}>
              <Typography variant="body2">
                <strong>Reason:</strong> <span style={{ textTransform: 'capitalize' }}>{shift.reason_code.replace(/_/g, ' ')}</span> — {shift.reason_text}
              </Typography>
              <Typography variant="body2"><strong>Base Priority:</strong> {shift.base_priority}</Typography>
              <Typography variant="body2"><strong>Original Allocation ID:</strong> #{shift.original_allocation_id}</Typography>
              <Typography variant="body2"><strong>Deadline:</strong> {shift.decision_deadline ? new Date(shift.decision_deadline).toLocaleString() : '—'}</Typography>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={650} sx={{ mb: 1.5 }}>
              Proposed Alternatives (CP-SAT Validated)
            </Typography>
            {shift.alternatives.length === 0 && (
              <Typography color="text.secondary" variant="body2">No alternatives proposed yet.</Typography>
            )}
            <RadioGroup value={selectedAlt} onChange={(e) => setSelectedAlt(Number(e.target.value))}>
              {shift.alternatives.map((a: any) => {
                const r = resources.find((x: any) => x.id === a.resource_id)
                return (
                  <Paper
                    key={a.id}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      mb: 1.5,
                      borderColor: a.is_cp_sat_valid ? 'success.main' : 'divider',
                      bgcolor: a.is_cp_sat_valid ? 'background.paper' : 'action.hover',
                    }}
                  >
                    <FormControlLabel
                      disabled={!a.is_cp_sat_valid}
                      value={a.id}
                      control={<Radio size="small" />}
                      label={
                        <Box sx={{ ml: 0.5 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {r ? `${r.name} (${r.code})` : a.resource_id} • {DAYS[a.day_of_week]} at {SLOT_LABELS[a.start_slot_index]} ({a.duration_hours}h)
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.25 }}>
                            {a.is_cp_sat_valid ? (
                              <CheckCircleOutlineIcon sx={{ fontSize: 15, color: 'success.main' }} />
                            ) : (
                              <HighlightOffIcon sx={{ fontSize: 15, color: 'error.main' }} />
                            )}
                            <Typography
                              variant="caption"
                              sx={{ color: a.is_cp_sat_valid ? 'success.main' : 'error.main', fontWeight: 500 }}
                            >
                              {a.validation_message}
                            </Typography>
                          </Stack>
                        </Box>
                      }
                    />
                  </Paper>
                )
              })}
            </RadioGroup>

            {(user?.id === shift.affected_faculty_id || user?.role === 'admin') && (
              <Stack spacing={1.5} sx={{ mt: 2.5 }}>
                <TextField
                  label="Decision note (optional)"
                  size="small"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  fullWidth
                />
                <Stack direction="row" spacing={1.5} flexWrap="wrap">
                  <Button
                    variant="contained"
                    color="secondary"
                    disabled={!selectedAlt}
                    onClick={() => takeAction.mutate({ action: 'approve', alternative_id: selectedAlt, comment })}
                  >
                    Approve Selected
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => takeAction.mutate({ action: 'reject', comment })}
                  >
                    Reject Shift
                  </Button>
                  <Button variant="text" onClick={() => setProposeMode(!proposeMode)}>
                    {proposeMode ? 'Cancel Custom Proposal' : 'Propose Alternate Slot'}
                  </Button>
                </Stack>

                {proposeMode && (
                  <Paper variant="outlined" sx={{ p: 2, mt: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>Propose Different Slot</Typography>
                    <Stack spacing={1.5}>
                      <TextField
                        select
                        label="Room or Lab"
                        size="small"
                        value={newAlt.resource_id}
                        onChange={(e) => setNewAlt({ ...newAlt, resource_id: e.target.value })}
                      >
                        {resources.map((r: any) => (
                          <MenuItem key={r.id} value={r.id}>{r.name} ({r.code})</MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        select
                        label="Day of Week"
                        size="small"
                        value={newAlt.day_of_week}
                        onChange={(e) => setNewAlt({ ...newAlt, day_of_week: Number(e.target.value) })}
                      >
                        {DAYS.map((d, i) => <MenuItem key={d} value={i}>{d}</MenuItem>)}
                      </TextField>
                      <TextField
                        select
                        label="Start Time"
                        size="small"
                        value={newAlt.start_slot_index}
                        onChange={(e) => setNewAlt({ ...newAlt, start_slot_index: Number(e.target.value) })}
                      >
                        {SLOT_LABELS.map((l, i) => <MenuItem key={l} value={i}>{l}</MenuItem>)}
                      </TextField>
                      <TextField
                        label="Duration (hours)"
                        size="small"
                        type="number"
                        value={newAlt.duration_hours}
                        onChange={(e) => setNewAlt({ ...newAlt, duration_hours: Number(e.target.value) })}
                      />
                      <Button
                        variant="contained"
                        onClick={() =>
                          takeAction.mutate({
                            action: 'propose_alternative',
                            new_alternative: {
                              resource_id: Number(newAlt.resource_id),
                              day_of_week: newAlt.day_of_week,
                              start_slot_index: newAlt.start_slot_index,
                              duration_hours: newAlt.duration_hours,
                            },
                            comment,
                          })
                        }
                      >
                        Validate with Solver
                      </Button>
                    </Stack>
                  </Paper>
                )}
              </Stack>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: 500 }}>
            <Typography variant="subtitle1" fontWeight={650} sx={{ mb: 1.5 }}>
              Discussion Thread
            </Typography>
            <List sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
              {discussion.map((m: any) => (
                <ListItem key={m.id} alignItems="flex-start" disableGutters sx={{ py: 1 }}>
                  <ListItemText
                    primary={<Typography variant="body2" fontWeight={650}>{m.sender_name}</Typography>}
                    secondary={
                      <>
                        <Typography variant="body2" color="text.primary" sx={{ my: 0.5 }}>{m.message}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(m.created_at).toLocaleString()}</Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
              {discussion.length === 0 && (
                <Typography color="text.secondary" variant="body2">No messages recorded yet.</Typography>
              )}
            </List>
            <Divider sx={{ my: 1.5 }} />
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type your message…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && message.trim()) {
                    e.preventDefault()
                    sendMessage.mutate()
                  }
                }}
              />
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                disabled={!message.trim()}
                onClick={() => message.trim() && sendMessage.mutate()}
              >
                Send
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
