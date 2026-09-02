import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Check, 
  ExternalLink, 
  Clock, 
  FileText, 
  Building2, 
  AlertCircle 
} from 'lucide-react';

export default function StepCard({ 
  step, 
  isCompleted = false, 
  onToggleComplete 
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={`step-card ${isCompleted ? 'completed' : ''}`}>
      <div className="step-header" onClick={() => setExpanded(!expanded)}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="step-number">Step {step.order}</span>
            {step.estimatedTime && (
              <span className="tag tag-accent" style={{ fontSize: '0.7rem' }}>
                <Clock size={11} /> {step.estimatedTime}
              </span>
            )}
            {isCompleted && (
              <span className="tag tag-success" style={{ fontSize: '0.7rem' }}>
                <Check size={11} /> Completed
              </span>
            )}
          </div>
          <h3 className="step-title">{step.title}</h3>
          <p className="step-description">{step.description}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn-icon sm btn-ghost"
            aria-label={expanded ? "Collapse step" : "Expand step"}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="step-details animate-fade-in">
          {/* Actionable details list */}
          {step.details && step.details.length > 0 && (
            <ul>
              {step.details.map((detail, idx) => (
                <li key={idx}>{detail}</li>
              ))}
            </ul>
          )}

          {/* Authority to contact */}
          {step.authority && (
            <div style={{ marginTop: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--text-sm)' }}>
              <Building2 size={16} style={{ color: 'var(--accent)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Filing Authority:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{step.authority}</strong>
            </div>
          )}

          {/* Documents needed */}
          {step.documentsNeeded && step.documentsNeeded.length > 0 && (
            <div className="step-documents">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <FileText size={15} style={{ color: 'var(--warning)' }} />
                Required Documents / Information:
              </h4>
              <ul style={{ marginTop: '0.35rem' }}>
                {step.documentsNeeded.map((doc, dIdx) => (
                  <li key={dIdx} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Official Portal Links */}
          {step.links && step.links.length > 0 && (
            <div className="step-links">
              {step.links.map((link, lIdx) => (
                <a
                  key={lIdx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="step-link"
                >
                  <span>{link.label}</span>
                  <ExternalLink size={13} />
                </a>
              ))}
            </div>
          )}

          {/* Explicit Step Disclaimer (Required by PRD) */}
          <div className="step-disclaimer">
            <AlertCircle size={12} style={{ color: 'var(--text-tertiary)' }} />
            <span>{step.disclaimer || "General information, not legal advice"}</span>
          </div>

          {/* Checkbox action to mark complete */}
          <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--border)' }}>
            <label className="checkbox-wrapper">
              <div 
                className={`checkbox ${isCompleted ? 'checked' : ''}`}
                onClick={() => onToggleComplete && onToggleComplete(step.id)}
              >
                {isCompleted && <Check size={14} color="#0A0C10" strokeWidth={3} />}
              </div>
              <span className="checkbox-label" onClick={() => onToggleComplete && onToggleComplete(step.id)}>
                {isCompleted ? "Marked as completed" : "Mark step as completed"}
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
