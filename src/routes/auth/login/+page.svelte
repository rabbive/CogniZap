<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Icon from '$lib/components/ui/Icons.svelte';
  import Checkbox from '$lib/components/ui/checkbox.svelte';

  let email = $state('');
  let password = $state('');
  let isLoading = $state(false);
  let error = $state('');
  let autoLoginEnabled = $state(false);

  onMount(() => {
    // Check for auto-login preference
    autoLoginEnabled = localStorage.getItem('cogniZapAutoLogin') === 'true';
    
    // If auto-login is enabled, automatically log in as test user
    if (autoLoginEnabled) {
      autoLogin();
    }
  });

  function autoLogin() {
    email = 'test@cognizap.com';
    password = 'testuser123';
    setTimeout(() => handleLogin(new Event('submit')), 500);
  }

  function handleAutoLoginChange(checked: boolean) {
    autoLoginEnabled = checked;
    localStorage.setItem('cogniZapAutoLogin', autoLoginEnabled.toString());
    
    if (autoLoginEnabled) {
      autoLogin();
    }
  }

  async function handleLogin(event: Event) {
    event.preventDefault();
    
    if (!email || !password) {
      error = 'Please fill in all fields';
      return;
    }

    isLoading = true;
    error = '';

    try {
      // Simulate login - replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any email/password
      localStorage.setItem('cogniZapAuth', 'true');
      
      // Store user data for test user
      const userData = {
        name: email === 'test@cognizap.com' ? 'Test User' : 'Demo User',
        email: email,
        id: 'test-user-' + Date.now()
      };
      localStorage.setItem('cogniZapUser', JSON.stringify(userData));
      
      goto('/dashboard');
    } catch (err) {
      error = 'Login failed. Please try again.';
    } finally {
      isLoading = false;
    }
  }

  function navigateToSignup() {
    goto('/auth/signup');
  }

  function navigateHome() {
    goto('/');
  }
</script>

<svelte:head>
  <title>Login - CogniZap</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
  <div class="w-full max-w-md space-y-6">
    
    <!-- Logo and Header -->
    <div class="text-center space-y-4">
      <button onclick={navigateHome} class="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
        <Icon name="zap" size={40} className="text-primary" />
        <span class="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          CogniZap
        </span>
      </button>
      <div class="space-y-2">
        <h1 class="text-2xl font-bold">Welcome back</h1>
        <p class="text-muted-foreground">Sign in to your account to continue learning</p>
      </div>
    </div>

    <!-- Login Form -->
    <Card class="p-6 space-y-6">
      <form onsubmit={handleLogin} class="space-y-4">
        
        {#if error}
          <div class="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        {/if}

        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          bind:value={email}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          bind:value={password}
          required
        />

        <div class="flex items-center justify-between text-sm">
          <label class="flex items-center gap-2 cursor-pointer">
            <Checkbox bind:checked={autoLoginEnabled} onCheckedChange={handleAutoLoginChange} />
            <span class="text-muted-foreground">Auto-login as test user</span>
          </label>
          <button type="button" class="text-primary hover:underline">
            Forgot password?
          </button>
        </div>

        <Button 
          type="submit" 
          class="w-full" 
          disabled={isLoading}
        >
          {#if isLoading}
            <Icon name="loader" size={16} className="mr-2 animate-spin" />
            Signing in...
          {:else}
            <Icon name="log-in" size={16} className="mr-2" />
            Sign In
          {/if}
        </Button>
      </form>

      <!-- Divider -->
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t"></div>
        </div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <!-- Social Login -->
      <div class="grid grid-cols-2 gap-3">
        <Button variant="outline" class="w-full">
          <Icon name="github" size={16} className="mr-2" />
          GitHub
        </Button>
        <Button variant="outline" class="w-full">
          <Icon name="mail" size={16} className="mr-2" />
          Google
        </Button>
      </div>
    </Card>

    <!-- Sign Up Link -->
    <div class="text-center text-sm">
      <span class="text-muted-foreground">Don't have an account? </span>
      <button onclick={navigateToSignup} class="text-primary hover:underline font-medium">
        Sign up
      </button>
    </div>
  </div>
</div> 