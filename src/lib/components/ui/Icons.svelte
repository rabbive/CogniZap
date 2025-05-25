<script lang="ts">
  export let name: string;
  export let size: number = 24;
  export let className: string = "";

  const icons: Record<string, string> = {
    brain: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>`,
    
    sparkles: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 12 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>`,
    
    upload: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5-5 5 5m-5-5v12"/>`,
    
    trending: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m3 17 6-6 4 4 8-8m-5-3h5v5"/>`,
    
    search: `<circle cx="11" cy="11" r="8" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35"/>`,
    
    bell: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M13.73 21a2 2 0 0 1-3.46 0"/>`,
    
    user: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/>`,
    
    moon: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`,
    
    sun: `<circle cx="12" cy="12" r="5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    
    menu: `<line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    
    x: `<line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    
    chevronDown: `<polyline points="6,9 12,15 18,9" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    
    chevronRight: `<polyline points="9,18 15,12 9,6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    
    check: `<polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    
    plus: `<line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    
    settings: `<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>`,
    
    activity: `<polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    
    clock: `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    
    globe: `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>`,
    
    star: `<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none"/>`,
    
    heart: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>`,
    
    bookmark: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>`,
    
    refresh: `<polyline points="23,4 23,10 17,10" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><polyline points="1,20 1,14 7,14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>`,
    
    zap: `<polygon points="13,2 3,14 12,14 11,22 21,10 12,10" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none"/>`
  };
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  class={className}
  {...$$restProps}
>
  {@html icons[name] || icons.x}
</svg> 