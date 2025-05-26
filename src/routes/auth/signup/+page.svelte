<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Icon from '$lib/components/ui/Icons.svelte';

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let isLoading = $state(false);
  let error = $state('');
  let acceptTerms = $state(false);

  // Check if this is a demo signup
  let isDemo = $state(false);
  
  $effect(() => {
    if ($page.url.searchParams.get('demo') === 'true') {
      isDemo = true;
    }
  });

  async function handleSignup(event: Event) {
    event.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      error = 'Please fill in all fields';
      return;
    }

    if (password !== confirmPassword) {
      error = 'Passwords do not match';
      return;
    }

    if (password.length < 8) {
      error = 'Password must be at least 8 characters long';
      return;
    }

    if (!acceptTerms) {
      error = 'Please accept the terms and conditions';
      return;
    }

    isLoading = true;
    error = '';

    try {
      // Simulate signup - replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any valid input
      localStorage.setItem('cogniZapAuth', 'true');
      localStorage.setItem('cogniZapUser', JSON.stringify({ name, email }));
      
      if (isDemo) {
        goto('/dashboard?demo=true');
      } else {
        goto('/dashboard');
      }
    } catch (err) {
      error = 'Signup failed. Please try again.';
    } finally {
      isLoading = false;
    }
  }

  function navigateToLogin() {
    goto('/auth/login');
  }

  function navigateHome() {
    goto('/');
  }
</script>

<svelte:head>
  <title>Sign Up - CogniZap</title>
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
        <h1 class="text-2xl font-bold">
          {isDemo ? 'Try CogniZap Demo' : 'Create your account'}
        </h1>
        <p class="text-muted-foreground">
          {isDemo ? 'Experience AI-powered learning with a demo account' : 'Start your AI-powered learning journey today'}
        </p>
      </div>
    </div>

    <!-- Signup Form -->
    <Card class="p-6 space-y-6">
      <form onsubmit={handleSignup} class="space-y-4">
        
        {#if error}
          <div class="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        {/if}

        <Input
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          bind:value={name}
          required
        />

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
          placeholder="Create a password (min. 8 characters)"
          bind:value={password}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          bind:value={confirmPassword}
          required
        />

        <div class="space-y-3">
          <label class="flex items-start gap-3 text-sm">
            <input 
              type="checkbox" 
              bind:checked={acceptTerms}
              class="rounded mt-0.5" 
              required
            />
            <span class="text-muted-foreground leading-relaxed">
              I agree to the 
              <button type="button" class="text-primary hover:underline">Terms of Service</button>
              and 
              <button type="button" class="text-primary hover:underline">Privacy Policy</button>
            </span>
          </label>
        </div>

        <Button 
          type="submit" 
          class="w-full" 
          disabled={isLoading}
        >
          {#if isLoading}
            <Icon name="loader" size={16} className="mr-2 animate-spin" />
            Creating account...
          {:else}
            <Icon name="user-plus" size={16} className="mr-2" />
            {isDemo ? 'Start Demo' : 'Create Account'}
          {/if}
        </Button>
      </form>

      {#if !isDemo}
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
      {/if}
    </Card>

    <!-- Login Link -->
    <div class="text-center text-sm">
      <span class="text-muted-foreground">Already have an account? </span>
      <button onclick={navigateToLogin} class="text-primary hover:underline font-medium">
        Sign in
      </button>
    </div>
  </div>
</div> 