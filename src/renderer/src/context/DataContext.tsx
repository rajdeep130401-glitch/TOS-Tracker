/**
 * Shared cross-project data layer. Loads projects / statuses / all tasks / all
 * timesheets / project-member links ONCE (via the single-call /api/all/* and
 * /api/statuses endpoints) and caches them, so features read from here instead of
 * each running their own `projects.map(getByProject)` loop (~22 files did before).
 *
 * Opt-in: features call useData(); anything not yet migrated keeps working.
 * Real-time events invalidate only the affected slice.
 */
import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { Project, ProjectStatus } from '../types'
import { useApp } from './AppContext'

type Row = Record<string, unknown>
interface ProjectMemberLink { id: number; project_id: number; member_id: number }

interface DataValue {
  projects: Project[]
  statuses: ProjectStatus[]
  statusMap: Record<number, string>
  tasks: Row[]
  timesheets: Row[]
  qc: Row[]
  projectMembers: ProjectMemberLink[]
  loading: boolean
  refreshProjects: () => Promise<void>
  refreshStatuses: () => Promise<void>
  refreshTasks: () => Promise<void>
  refreshTimesheets: () => Promise<void>
  refreshQc: () => Promise<void>
  refreshProjectMembers: () => Promise<void>
  refreshAll: () => Promise<void>
  tasksByProject: (projectId: number) => Row[]
  timesheetsByProject: (projectId: number) => Row[]
  qcByProject: (projectId: number) => Row[]
  memberIdsForProject: (projectId: number) => number[]
}

const DataContext = createContext<DataValue | null>(null)

export function useData(): DataValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { authMode, authUser } = useApp()
  const [projects, setProjects] = useState<Project[]>([])
  const [statuses, setStatuses] = useState<ProjectStatus[]>([])
  const [tasks, setTasks] = useState<Row[]>([])
  const [timesheets, setTimesheets] = useState<Row[]>([])
  const [qc, setQc] = useState<Row[]>([])
  const [projectMembers, setProjectMembers] = useState<ProjectMemberLink[]>([])
  const [loading, setLoading] = useState(true)

  const refreshProjects = useCallback(async () => {
    const res = await window.api.projects.getAll()
    if (res.ok) setProjects(res.data as Project[])
  }, [])
  const refreshStatuses = useCallback(async () => {
    const res = await window.api.projects.statuses()
    if (res.ok) setStatuses(res.data as ProjectStatus[])
  }, [])
  const refreshTasks = useCallback(async () => {
    const res = await window.api.all.tasks()
    if (res.ok) setTasks(res.data as Row[])
  }, [])
  const refreshTimesheets = useCallback(async () => {
    const res = await window.api.all.timesheets()
    // Pending manual entries (IT/Discussion/catch-up awaiting Team-Lead approval)
    // must not reflect anywhere until approved — exclude them from the shared layer.
    if (res.ok) setTimesheets((res.data as Row[]).filter((t) => !t.pending))
  }, [])
  const refreshQc = useCallback(async () => {
    const res = await window.api.all.qc()
    if (res.ok) setQc(res.data as Row[])
  }, [])
  const refreshProjectMembers = useCallback(async () => {
    const res = await window.api.projectMembers.all()
    if (res.ok) setProjectMembers(res.data as ProjectMemberLink[])
  }, [])

  const refreshAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([refreshProjects(), refreshStatuses(), refreshTasks(), refreshTimesheets(), refreshQc(), refreshProjectMembers()])
    setLoading(false)
  }, [refreshProjects, refreshStatuses, refreshTasks, refreshTimesheets, refreshQc, refreshProjectMembers])

  // Load once authenticated (mirrors AppContext's gating).
  useEffect(() => {
    if (authMode === 'local' || authUser) refreshAll()
  }, [authMode, authUser, refreshAll])

  // Real-time: refresh only the slice an event touches.
  useEffect(() => {
    const unsub = window.api.realtime.subscribe((evt) => {
      if (evt.entity === 'project') { refreshProjects(); refreshStatuses() }
      else if (evt.entity === 'status') refreshStatuses()
      else if (evt.entity === 'projectMember') refreshProjectMembers()
      else if (evt.entity === 'item') {
        if (evt.type === 'task') refreshTasks()
        else if (evt.type === 'timesheet') refreshTimesheets()
        else if (evt.type === 'qc') refreshQc()
      }
    })
    return unsub
  }, [refreshProjects, refreshStatuses, refreshProjectMembers, refreshTasks, refreshTimesheets, refreshQc])

  const statusMap = useMemo(() => {
    const m: Record<number, string> = {}
    statuses.forEach((s) => { if (s.overall) m[s.project_id] = s.overall })
    return m
  }, [statuses])

  const tasksByProject = useCallback((pid: number) => tasks.filter((t) => Number(t.project_id) === pid), [tasks])
  const timesheetsByProject = useCallback((pid: number) => timesheets.filter((t) => Number(t.project_id) === pid), [timesheets])
  const qcByProject = useCallback((pid: number) => qc.filter((q) => Number(q.project_id) === pid), [qc])
  const memberIdsForProject = useCallback(
    (pid: number) => projectMembers.filter((l) => l.project_id === pid).map((l) => l.member_id),
    [projectMembers]
  )

  const value: DataValue = {
    projects, statuses, statusMap, tasks, timesheets, qc, projectMembers, loading,
    refreshProjects, refreshStatuses, refreshTasks, refreshTimesheets, refreshQc, refreshProjectMembers, refreshAll,
    tasksByProject, timesheetsByProject, qcByProject, memberIdsForProject
  }
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
