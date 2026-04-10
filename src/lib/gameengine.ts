// Lightweight game engine for "find the character" interactions on pages 3-6
import { addNotification } from './stores/notification';

type Options = {
  container: HTMLElement;
  getStoryUid: () => string | null | undefined;
  getPageNumber?: () => number | null | undefined;
  isActive: () => boolean; // whether game should respond (pages 3-6)
  endpoint?: string; // override backend endpoint
  onHitIndex?: (hitIndex: number) => void; // 1..4; 0 means "not found"
};

let attached = false;
let clickHandler = null as null | ((ev: PointerEvent) => void);
const MARKER_FADE_OUT_MS = 220;

export function clearGameMarkers(container: HTMLElement) {
  const markers = container.querySelectorAll('.game-pointer-marker');
  markers.forEach((m) => m.remove());
}

function animateAndRemoveMarker(marker: HTMLElement) {
  marker.style.transition = `opacity ${MARKER_FADE_OUT_MS}ms ease, transform ${MARKER_FADE_OUT_MS}ms ease`;
  marker.style.opacity = '0';
  marker.style.transform = 'scale(0.75)';
  window.setTimeout(() => {
    marker.remove();
  }, MARKER_FADE_OUT_MS);
}

function showPersistentPointerMarker(img: HTMLImageElement, clientX: number, clientY: number) {
  const markerRadiusPx = 20;
  const marker = document.createElement('span');
  marker.className = 'game-pointer-marker';
  const imageContainer = (img.parentElement || img) as HTMLElement;
  // Prefer the full page image wrapper so the marker is shown on the whole story image view.
  const markerHost =
    (img.closest('.mobile-image-split') as HTMLElement | null) ||
    imageContainer;
  const containerRect = markerHost.getBoundingClientRect();

  // Ensure the marker is positioned relative to the image wrapper div.
  const computedPos = window.getComputedStyle(markerHost).position;
  if (!computedPos || computedPos === 'static') {
    markerHost.style.position = 'relative';
  }

  marker.style.position = 'absolute';
  // Position marker in the visible image wrapper (works for split 3rd-6th pages too).
  const rawLeft = clientX - containerRect.left - markerRadiusPx;
  const rawTop = clientY - containerRect.top - markerRadiusPx;
  const maxLeft = Math.max(0, containerRect.width - markerRadiusPx * 2);
  const maxTop = Math.max(0, containerRect.height - markerRadiusPx * 2);
  const clampedLeft = Math.max(0, Math.min(maxLeft, rawLeft));
  const clampedTop = Math.max(0, Math.min(maxTop, rawTop));
  marker.style.left = `${clampedLeft}px`;
  marker.style.top = `${clampedTop}px`;
  marker.style.width = `${markerRadiusPx * 2}px`;
  marker.style.height = `${markerRadiusPx * 2}px`;
  marker.style.borderRadius = '50%';
  marker.style.border = '3px solid #ef4444';
  marker.style.background = 'rgba(239, 68, 68, 0.18)';
  marker.style.pointerEvents = 'none';
  marker.style.boxSizing = 'border-box';
  marker.style.zIndex = '30';
  marker.style.opacity = '0';
  marker.style.transform = 'scale(0.75)';
  marker.style.transition = 'opacity 180ms ease, transform 180ms ease';

  markerHost.appendChild(marker);
  requestAnimationFrame(() => {
    marker.style.opacity = '1';
    marker.style.transform = 'scale(1)';
  });
  return marker;
}

export function attachGameEngine(opts: Options) {
  if (attached) return;
  const container = opts.container;
  const endpoint = 'https://image-edit-five.vercel.app/api/game/check-point';
  clearGameMarkers(container);

  clickHandler = async (ev: PointerEvent) => {
    try {
      // Ignore clicks that are part of a double-click
      if ((ev as any).detail && (ev as any).detail !== 1) return;

      if (!opts.isActive()) return;

      // Ensure target is an Element
      const rawTarget = ev.target;
      let img: HTMLImageElement | null = null;
      if (rawTarget && rawTarget instanceof Element) {
        img = rawTarget.closest('.scene-main-image') as HTMLImageElement | null;
      }

      // If click wasn't directly on an image, try to find image under pointer coordinates
      if (!img) {
        const images = container.querySelectorAll('img.scene-main-image');
        const cx = ev.clientX;
        const cy = ev.clientY;
        for (let i = 0; i < images.length; i++) {
          const ii = images[i] as HTMLImageElement;
          const r = ii.getBoundingClientRect();
          if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) {
            img = ii;
            break;
          }
        }

        // Fallback to first image in container (useful when clicking on container area)
        if (!img && images.length > 0) {
          img = images[0] as HTMLImageElement;
        }
      }

      if (!img || !(img instanceof HTMLImageElement)) return;
      const marker = showPersistentPointerMarker(img, ev.clientX, ev.clientY);

      const rect = img.getBoundingClientRect();
      const x = (ev.clientX - rect.left) / rect.width;
      const y = (ev.clientY - rect.top) / rect.height;

      // clamp
      const nx = Math.max(0, Math.min(1, x));
      const ny = Math.max(0, Math.min(1, y));

      console.log('Clicked at normalized coordinates:', nx, ny);

      const storyUid = opts.getStoryUid();
      const pageNumber = Number(opts.getPageNumber?.());
      if (!storyUid) {
        animateAndRemoveMarker(marker);
        addNotification({ type: 'warning', message: 'Story ID not available' });
        return;
      }
      if (!Number.isFinite(pageNumber) || pageNumber < 3 || pageNumber > 6) {
        animateAndRemoveMarker(marker);
        addNotification({ type: 'warning', message: 'Page number is invalid for character check' });
        return;
      }

      // Send to backend
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: storyUid, pageNumber, x: nx, y: ny })
      });

      if (!resp.ok) {
        animateAndRemoveMarker(marker);
        const txt = await resp.text().catch(() => 'Server error');
        addNotification({ type: 'error', message: `Error checking point: ${txt}` });
        return;
      }

      const data = await resp.json().catch(() => null);
      const hitRaw = data?.hit;

      let hitIndex = 0;
      if (typeof hitRaw === 'number' && Number.isFinite(hitRaw)) {
        hitIndex = hitRaw;
      } else if (typeof hitRaw === 'string') {
        const n = Number(hitRaw);
        if (Number.isFinite(n)) hitIndex = n;
      }

      if (hitIndex === 0) {
        animateAndRemoveMarker(marker);
        addNotification({ type: 'warning', message: 'Not found!' });
        return;
      }

      if (hitIndex >= 1 && hitIndex <= 4) {
        addNotification({ type: 'success', message: 'Found!' });
        opts.onHitIndex?.(hitIndex);
        return;
      }

      // Unknown response shape; treat as not found.
      animateAndRemoveMarker(marker);
      addNotification({ type: 'warning', message: 'Not found!' });
    } catch (err) {
      addNotification({ type: 'error', message: 'Unexpected error checking point' });
      console.error('gameengine click handler error', err);
    }
  };

  // Use pointerdown so pressing mouse button anywhere in image area triggers
  container.addEventListener('pointerdown', clickHandler as EventListener, { passive: true });
  attached = true;
}

export function detachGameEngine(container: HTMLElement) {
  if (!attached) return;
  if (clickHandler) container.removeEventListener('pointerdown', clickHandler as EventListener);
  clearGameMarkers(container);
  attached = false;
  clickHandler = null;
}

export default { attachGameEngine, detachGameEngine, clearGameMarkers };
