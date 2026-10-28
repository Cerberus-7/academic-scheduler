import { Fragment } from 'react'
import { Box, Paper, Typography, Tooltip } from '@mui/material'
import { DAYS, SLOT_LABELS, TimetableAllocationOut } from '../types'

const WARM_CELL_PALETTE = [
  '#7A4B3A', // Warm terracotta
  '#3E5948', // Forest sage
  '#7C5D2C', // Ochre umber
  '#59495E', // Warm muted plum
  '#3E5766', // Deep slate
  '#80444C', // Dusty wine
  '#514943', // Warm slate charcoal
  '#635544', // Walnut bronze
]

function colorFor(key: number) {
  return WARM_CELL_PALETTE[key % WARM_CELL_PALETTE.length]
}

export default function TimetableGrid({
  allocations,
  labelField = 'course',
}: {
  allocations: TimetableAllocationOut[]
  labelField?: 'course' | 'resource' | 'faculty'
}) {
  const grid: Record<string, TimetableAllocationOut[]> = {}
  for (const a of allocations) {
    for (let offset = 0; offset < a.duration_hours; offset++) {
      const key = `${a.day_of_week}-${a.start_slot_index + offset}`
      grid[key] = grid[key] || []
      if (offset === 0) grid[key].push(a)
    }
  }

  return (
    <Paper variant="outlined" sx={{ overflowX: 'auto', p: 1.5 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: `90px repeat(${DAYS.length}, 1fr)`, minWidth: 920 }}>
        <Box />
        {DAYS.map((d) => (
          <Box
            key={d}
            sx={{
              p: 1.25,
              fontWeight: 600,
              fontSize: '0.875rem',
              textAlign: 'center',
              borderBottom: '2px solid',
              borderColor: 'divider',
              color: 'text.secondary',
            }}
          >
            {d}
          </Box>
        ))}
        {SLOT_LABELS.map((label, slotIdx) => (
          <Fragment key={`row-${slotIdx}`}>
            <Box
              sx={{
                p: 1.25,
                fontSize: 12,
                fontWeight: 500,
                color: 'text.secondary',
                borderTop: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {label}
            </Box>
            {DAYS.map((_, dayIdx) => {
              const key = `${dayIdx}-${slotIdx}`
              const cellAllocs = grid[key] || []
              return (
                <Box
                  key={key}
                  sx={{
                    minHeight: 64,
                    p: 0.75,
                    borderTop: '1px solid',
                    borderLeft: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {cellAllocs.map((a) => {
                    const primary =
                      labelField === 'resource'
                        ? a.resource_code
                        : labelField === 'faculty'
                        ? a.faculty_name
                        : a.course_code
                    const secondary =
                      labelField === 'resource'
                        ? a.course_code
                        : labelField === 'faculty'
                        ? a.course_code
                        : a.resource_code
                    return (
                      <Tooltip
                        key={a.id}
                        title={`${a.course_name} • ${a.section_name} • ${a.faculty_name} • ${a.resource_name} (${a.status})`}
                      >
                        <Box
                          sx={{
                            bgcolor: colorFor(a.id),
                            color: '#FAF8F5',
                            borderRadius: 1,
                            p: 0.75,
                            mb: 0.5,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                            fontSize: 11,
                            lineHeight: 1.3,
                            cursor: 'default',
                            transition: 'opacity 0.15s ease',
                            '&:hover': { opacity: 0.92 },
                          }}
                        >
                          <Typography variant="caption" sx={{ display: 'block', fontWeight: 650 }}>
                            {primary}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', opacity: 0.85, fontSize: 10 }}>
                            {secondary}
                          </Typography>
                        </Box>
                      </Tooltip>
                    )
                  })}
                </Box>
              )
            })}
          </Fragment>
        ))}
      </Box>
    </Paper>
  )
}
