'use client';

import { useState } from 'react';
import type { DeviceSummary } from '@/lib/api';

interface DeviceLimitStepProps {
  devices: DeviceSummary[];
  loading: boolean;
  error: string | null;
  onSelectDevice: (deviceId: string) => void;
  onBack: () => void;
}

function formatLastActive(lastActiveAt: string | null): string {
  if (!lastActiveAt) return 'Last active unknown';

  const then = new Date(lastActiveAt).getTime();
  if (Number.isNaN(then)) return 'Last active unknown';

  const diffMinutes = Math.max(0, Math.floor((Date.now() - then) / 60000));
  if (diffMinutes < 1) return 'Active just now';
  if (diffMinutes < 60) return `Active ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Active ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `Active ${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  const diffMonths = Math.floor(diffDays / 30);
  return `Active ${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
}

function platformLabel(platform: string): string {
  switch (platform) {
    case 'laptop':
      return 'Computer';
    case 'phone':
      return 'Phone';
    case 'tablet':
      return 'Tablet';
    case 'tv':
      return 'TV';
    default:
      return 'Device';
  }
}

export function DeviceLimitStep({ devices, loading, error, onSelectDevice, onBack }: DeviceLimitStepProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const handleSelect = (device: DeviceSummary) => {
    const key = device.deviceId ?? device.id;
    setSelectedKey(key);
    onSelectDevice(key);
  };

  return (
    <>
      <div className="login-heading">
        <h1>You&apos;re signed in on too many devices</h1>
        <p>Choose a device to sign out so you can continue here.</p>
      </div>

      {error && <div className="login-error">{error}</div>}

      <div className="device-list">
        {devices.map((device) => {
          const key = device.deviceId ?? device.id;
          const isSigningOut = loading && selectedKey === key;

          return (
            <button
              key={key}
              type="button"
              className="device-card"
              onClick={() => handleSelect(device)}
              disabled={loading}
            >
              <div className="device-card-info">
                <span className="device-card-name">
                  {platformLabel(device.platform)} &middot; {device.deviceName}
                </span>
                <span className="device-card-meta">{formatLastActive(device.lastActiveAt)}</span>
              </div>
              <span className="device-card-action">{isSigningOut ? 'Signing out…' : 'Sign out'}</span>
            </button>
          );
        })}
      </div>

      <div className="login-links">
        <button type="button" className="btn-text" onClick={onBack} disabled={loading}>
          Use different email
        </button>
      </div>
    </>
  );
}
