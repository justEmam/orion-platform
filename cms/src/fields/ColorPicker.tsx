'use client'
/**
 * Custom color-picker field for the Payload admin. Shows a clickable swatch
 * (native OS color picker) next to a hex input — the client can pick a color
 * visually instead of typing a hex code, but power users can still type/paste
 * one. Stores a plain hex string, so nothing else in the app changes.
 */
import React from 'react'
import { useField } from '@payloadcms/ui'

export const ColorPicker: React.FC<{ path: string; field?: any; clientField?: any }> = ({
  path,
  field,
  clientField,
}) => {
  const { value, setValue } = useField<string>({ path })
  const hex = (value as string) || '#000000'
  // Payload v3 passes the field as `clientField` in client components.
  const label = clientField?.label || field?.label || path

  return (
    <div className="field-type" style={{ marginBottom: 20 }}>
      <label className="field-label" style={{ display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(hex) ? hex : '#000000'}
          // onInput fires continuously as you drag in the OS picker, so the
          // hex box + round swatch update live; onChange commits the final pick.
          onInput={(e) => setValue((e.target as HTMLInputElement).value)}
          onChange={(e) => setValue(e.target.value)}
          style={{
            width: 44,
            height: 36,
            padding: 0,
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 6,
            cursor: 'pointer',
            background: 'none',
          }}
          aria-label={`${label} color swatch`}
        />
        <input
          type="text"
          value={hex}
          onChange={(e) => setValue(e.target.value)}
          placeholder="#000000"
          style={{
            width: 120,
            fontFamily: 'monospace',
            padding: '8px 10px',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 6,
            background: 'var(--theme-input-bg)',
            color: 'var(--theme-text)',
          }}
        />
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: hex,
            border: '1px solid var(--theme-elevation-150)',
          }}
        />
      </div>
    </div>
  )
}

export default ColorPicker
