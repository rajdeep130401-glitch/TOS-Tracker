import Icon from './Icon'
import { Feature } from '../App'

interface Props {
  show: boolean
  onCloseMenu: () => void
  sectionOpen: (k: string) => boolean
  toggleSection: (k: string) => void
  isAdmin: boolean
  isLead: boolean
  isCompanyAdmin: boolean
  setFeature: (f: Feature | null) => void
  exportAllData: () => void
  fsModals: boolean
  setFsModals: (fn: (v: boolean) => boolean) => void
  theme: 'dark' | 'light'
  setTheme: (fn: (t: 'dark' | 'light') => 'dark' | 'light') => void
}

// The Workspace drawer: collapsible menu sections for navigating to feature
// windows. Lives in its own component purely to keep App.tsx under the file
// size limit — behavior/markup is unchanged from its previous inline form.
export default function WorkspaceDrawer({
  show, onCloseMenu, sectionOpen, toggleSection, isAdmin, isLead, isCompanyAdmin,
  setFeature, exportAllData, fsModals, setFsModals, theme, setTheme
}: Props) {
  if (!show) return null
  return (
    <>
      <div className="drawer-backdrop" onClick={onCloseMenu} />
      <aside className="workspace-drawer" role="dialog" aria-label="Workspace">
        <div className="drawer-head">
          <h3>Workspace</h3>
          <button className="btn-icon" onClick={onCloseMenu}><Icon name="close" size={18} /></button>
        </div>
        <div className="drawer-body">
          <button className={`menu-section${sectionOpen('my') ? ' open' : ''}`} onClick={() => toggleSection('my')}>
            <Icon name="chevronDown" size={14} className="menu-chevron" /> My Workspace
          </button>
          {sectionOpen('my') && (
            <div className="menu-items">
              <button className="menu-item" onClick={() => { setFeature('myAlloc'); onCloseMenu() }}><Icon name="calendar" /> My allocation</button>
            </div>
          )}

          <button className={`menu-section${sectionOpen('people') ? ' open' : ''}`} onClick={() => toggleSection('people')}>
            <Icon name="chevronDown" size={14} className="menu-chevron" /> People &amp; Organization
          </button>
          {sectionOpen('people') && (
            <div className="menu-items">
              <button className="menu-item" onClick={() => { setFeature('org'); onCloseMenu() }}><Icon name="building" /> Organization tree</button>
              <button className="menu-item" onClick={() => { setFeature('members'); onCloseMenu() }}><Icon name="users" /> Members</button>
              <button className="menu-item" onClick={() => { setFeature('talent'); onCloseMenu() }}><Icon name="brain" /> Talent</button>
            </div>
          )}

          {isAdmin && (
            <>
              <button className={`menu-section${sectionOpen('planning') ? ' open' : ''}`} onClick={() => toggleSection('planning')}>
                <Icon name="chevronDown" size={14} className="menu-chevron" /> Projects &amp; Planning
              </button>
              {sectionOpen('planning') && (
                <div className="menu-items">
                  <button className="menu-item" onClick={() => { setFeature('alloc'); onCloseMenu() }}><Icon name="calendar" /> Allocation</button>
                  {isLead && <button className="menu-item" onClick={() => { setFeature('approvals'); onCloseMenu() }}><Icon name="checkCircle" /> Approvals</button>}
                  {isLead && <button className="menu-item" onClick={() => { setFeature('exec'); onCloseMenu() }}><Icon name="target" /> Overall Health</button>}
                </div>
              )}
            </>
          )}

          <button className={`menu-section${sectionOpen('sales') ? ' open' : ''}`} onClick={() => toggleSection('sales')}>
            <Icon name="chevronDown" size={14} className="menu-chevron" /> Sales &amp; Clients
          </button>
          {sectionOpen('sales') && (
            <div className="menu-items">
              {isLead && <button className="menu-item" onClick={() => { setFeature('quote'); onCloseMenu() }}><Icon name="quote" /> Quote a project</button>}
              <button className="menu-item" onClick={() => { setFeature('clients'); onCloseMenu() }}><Icon name="building" /> Clients &amp; dashboard</button>
            </div>
          )}

          <button className={`menu-section${sectionOpen('data') ? ' open' : ''}`} onClick={() => toggleSection('data')}>
            <Icon name="chevronDown" size={14} className="menu-chevron" /> Data &amp; Settings
          </button>
          {sectionOpen('data') && (
            <div className="menu-items">
              <button className="menu-item" onClick={() => { exportAllData(); onCloseMenu() }}><Icon name="download" /> Export all data (CSV)</button>
              {isAdmin && <button className="menu-item" onClick={() => { setFeature('recycleBin'); onCloseMenu() }}><Icon name="trash" /> Recycle bin</button>}
              {isCompanyAdmin && <button className="menu-item" onClick={() => { setFeature('settings'); onCloseMenu() }}><Icon name="settings" /> Settings</button>}
              <button className="menu-item" onClick={() => setFsModals((v) => !v)}>
                <Icon name="grid" /> {fsModals ? '✓ Full-page windows' : 'Full-page windows'}
              </button>
              <button className="menu-item" onClick={() => { setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }}>
                <Icon name={theme === 'dark' ? 'sun' : 'moon'} /> {theme === 'dark' ? 'Light theme' : 'Dark theme'}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
