import { useQuery } from '@tanstack/react-query'
import { Grid, Typography, Paper, Box, useTheme } from '@mui/material'
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined'
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined'
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined'
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { api } from '../../api/client'
import KpiCard from '../../components/KpiCard'

export default function AdminDashboard() {
  const theme = useTheme()
  const { data: kpis } = useQuery({ queryKey: ['dashboard-kpis'], queryFn: () => api.get('/analytics/dashboard').then(r => r.data) })
  const { data: utilization } = useQuery({ queryKey: ['utilization'], queryFn: () => api.get('/analytics/utilization').then(r => r.data) })

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Administrator Dashboard</Typography>
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Active Timetable Allocations"
            value={kpis?.total_allocations ?? '—'}
            icon={<EventAvailableOutlinedIcon />}
            color="#416378" // Warm Slate Blue
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Pending Requests"
            value={kpis?.pending_schedule_requests ?? '—'}
            icon={<PendingActionsOutlinedIcon />}
            color="#A87028" // Warm Amber
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Pending Shift Approvals"
            value={kpis?.pending_shift_requests ?? '—'}
            icon={<SwapHorizOutlinedIcon />}
            color="#A35C38" // Terracotta
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Active Rooms / Labs"
            value={`${kpis?.active_resources ?? '—'} / ${kpis?.total_resources ?? '—'}`}
            icon={<MeetingRoomOutlinedIcon />}
            color="#486B52" // Soft Sage
          />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Resource Utilization (% of Weekly Available Slots)</Typography>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={utilization ?? []} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis dataKey="code" stroke={theme.palette.text.secondary} fontSize={12} />
            <YAxis unit="%" stroke={theme.palette.text.secondary} fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                borderColor: theme.palette.divider,
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Bar dataKey="utilization_percent" fill="#A35C38" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  )
}
