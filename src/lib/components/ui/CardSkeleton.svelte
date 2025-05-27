<script lang="ts">
  import Skeleton from './skeleton.svelte';
</script>

<div class="bg-card rounded-lg border p-6 space-y-4">
  <div class="flex items-center space-x-3">
    <Skeleton width="40px" height="40px" class="rounded-full" />
    <div class="space-y-2 flex-1">
      <Skeleton width="60%" height="16px" />
      <Skeleton width="40%" height="12px" />
    </div>
  </div>
  <Skeleton width="100%" height="14px" />
  <Skeleton width="80%" height="14px" />
  <div class="flex gap-2 pt-2">
    <Skeleton width="80px" height="32px" class="rounded-md" />
    <Skeleton width="60px" height="32px" class="rounded-md" />
  </div>
</div> 