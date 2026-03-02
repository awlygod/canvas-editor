import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const Toolbar = ({ 
  selectedTool, 
  onToolChange, 
  onAddRectangle,
  onAddCircle,
  onAddText,
  onEnablePen,
  onSave, 
  onDelete,
  onClear,
  onExport,
  onColorPicker
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const tools = [
    { id: 'select', label: 'Select', icon: '', onClick: () => { onToolChange('select'); } },
    { id: 'rectangle', label: 'Rectangle', icon: '', onClick: onAddRectangle },
    { id: 'circle', label: 'Circle', icon: '', onClick: onAddCircle },
    { id: 'text', label: 'Text', icon: '', onClick: onAddText },
    { id: 'pen', label: 'Pen', icon: '', onClick: onEnablePen }
  ];

  // Get initials from display name or email
  const getInitials = (user) => {
    if (user?.displayName) {
      return user.displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() ?? '?';
  };

  // Random but consistent color based on uid
  const getAvatarColor = (uid) => {
    const colors = ['#e63946', '#2a9d8f', '#e9c46a', '#457b9d', '#a8dadc', '#f4a261'];
    const index = uid ? uid.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const handleLogout = async () => {
    await authService.signOut();
    navigate('/auth');
  };

  return (
    <div style={{ 
      padding: '15px 20px', 
      borderBottom: '1px solid #333', 
      display: 'flex', 
      gap: '10px',
      alignItems: 'center',
      background: '#252525',
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={tool.onClick}
            style={{
              padding: '10px 20px',
              background: selectedTool === tool.id ? '#4a4a4a' : '#2a2a2a',
              color: selectedTool === tool.id ? '#ffffff' : '#b0b0b0',
              border: `1px solid ${selectedTool === tool.id ? '#666' : '#3a3a3a'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
              fontSize: '14px'
            }}
            onMouseOver={(e) => {
              if (selectedTool !== tool.id) {
                e.target.style.background = '#3a3a3a';
                e.target.style.color = '#ffffff';
              }
            }}
            onMouseOut={(e) => {
              if (selectedTool !== tool.id) {
                e.target.style.background = '#2a2a2a';
                e.target.style.color = '#b0b0b0';
              }
            }}
          >
            {tool.icon} {tool.label}
          </button>
        ))}
        
        <button
          onClick={onColorPicker}
          style={{
            padding: '10px 20px',
            background: '#2a2a2a',
            color: '#b0b0b0',
            border: '1px solid #3a3a3a',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s',
            fontSize: '14px'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#3a3a3a';
            e.target.style.color = '#ffffff';
          }}
          onMouseOut={(e) => {
            e.target.style.background = '#2a2a2a';
            e.target.style.color = '#b0b0b0';
          }}
        >
          🎨 Color
        </button>
      </div>
      
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={onSave} style={actionButtonStyle('#3c9651ff')}>Save</button>
        <button onClick={onDelete} style={actionButtonStyle('#ca3746ff')}>Delete</button>
        <button onClick={onClear} style={actionButtonStyle('#be9723ff')}>Clear</button>
        <button onClick={onExport} style={actionButtonStyle('#17a2b8')}>Export</button>

        {/* ── User Avatar ── */}
        {user && (
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setShowMenu(prev => !prev)}
              title={user.displayName || user.email}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: user.photoURL ? 'transparent' : getAvatarColor(user.uid),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                border: '2px solid #555',
                transition: 'border-color 0.2s',
                flexShrink: 0,
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = '#fff'}
              onMouseOut={e => e.currentTarget.style.borderColor = '#555'}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>
                  {getInitials(user)}
                </span>
              )}
            </div>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                {/* backdrop to close on outside click */}
                <div
                  onClick={() => setShowMenu(false)}
                  style={{
                    position: 'fixed', inset: 0, zIndex: 998
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '44px',
                  right: 0,
                  background: '#1e1e1e',
                  border: '1px solid #444',
                  borderRadius: '10px',
                  padding: '12px',
                  minWidth: '180px',
                  zIndex: 999,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}>
                  {/* User info */}
                  <div style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '2px' }}>
                    <div style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>
                      {user.displayName || 'User'}
                    </div>
                    <div style={{ color: '#888', fontSize: '11px', marginTop: '2px', wordBreak: 'break-all' }}>
                      {user.email}
                    </div>
                  </div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    style={{
                      background: 'transparent',
                      border: '1px solid #ca3746',
                      color: '#ca3746',
                      borderRadius: '6px',
                      padding: '7px 12px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.background = '#ca3746';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#ca3746';
                    }}
                  >
                    🚪 Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const actionButtonStyle = (bgColor) => ({
  padding: '10px 20px',
  background: bgColor,
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: '550',
  fontSize: '14px',
  transition: 'all 0.2s',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
});

export default Toolbar;