import React from 'react';

export type PaletteItem = {
  kind: 'single';
  gateType: string;
  label: string;
  params?: Record<string, unknown>;
};

const PALETTE: PaletteItem[] = [
  { kind: 'single', gateType: 'x', label: 'X' },
  { kind: 'single', gateType: 'y', label: 'Y' },
  { kind: 'single', gateType: 'z', label: 'Z' },
  { kind: 'single', gateType: 'h', label: 'H' },
  { kind: 'single', gateType: 's', label: 'S' },
  { kind: 'single', gateType: 't', label: 'T' },
  { kind: 'single', gateType: 'rx', label: 'Rx', params: { theta: 'pi/2' } },
  { kind: 'single', gateType: 'ry', label: 'Ry', params: { theta: 'pi/2' } },
  { kind: 'single', gateType: 'rz', label: 'Rz', params: { theta: 'pi/2' } },
];

const gateBoxStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid black',
  borderRadius: 6,
  background: 'white',
  fontWeight: 600,
  userSelect: 'none',
  boxSizing: 'border-box',
};

const GatePalette: React.FC = () => {
  return (
    <div
      style={{
        width: 220,
        padding: 12,
        borderRight: '1px solid #e5e7eb',
        background: '#fafafa',
        boxSizing: 'border-box',
        overflowY: 'auto',
        height: '100%',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 10 }}>Palette</div>
      <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 10 }}>
        Drag a gate onto the canvas.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {PALETTE.map((item, idx) => (
          <div
            key={`${item.kind}-${item.gateType}-${idx}`}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <div
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/qitbuilder-gate', JSON.stringify(item));
                e.dataTransfer.effectAllowed = 'move';
              }}
              title={item.kind === 'single' ? item.gateType.toUpperCase() : item.label}
              style={{
                ...gateBoxStyle,
                cursor: 'grab',
              }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GatePalette;
