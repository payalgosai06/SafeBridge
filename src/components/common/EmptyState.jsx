import React from 'react';
import { FolderOpen } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = FolderOpen, 
  title = "Nothing here yet", 
  description = "No items found in this section.",
  action = null 
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={44} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-text">{description}</p>
      {action && (
        <div style={{ marginTop: 'var(--space-md)' }}>
          {action}
        </div>
      )}
    </div>
  );
}
