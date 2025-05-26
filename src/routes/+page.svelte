<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/badge.svelte';
  import Icon from '$lib/components/ui/Icons.svelte';

  let features = [
    {
      icon: "trending",
      title: "Real-Time Trending Topics",
      description: "Generate content from the latest trending topics and current events worldwide",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      icon: "lightbulb",
      title: "AI Research Assistant",
      description: "Multi-perspective analysis with academic, industry, news, and social insights",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    },
    {
      icon: "activity",
      title: "Live Data Learning",
      description: "Real-time market data, weather, sports, and economic insights for learning",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950"
    },
    {
      icon: "globe",
      title: "Global Events Tracker",
      description: "Stay updated with worldwide events and their educational context",
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950"
    },
    {
      icon: "search",
      title: "Science Breakthrough Monitor",
      description: "Latest research findings and scientific discoveries from around the world",
      color: "text-cyan-500",
      bgColor: "bg-cyan-50 dark:bg-cyan-950"
    },
    {
      icon: "star",
      title: "Learning Competitions",
      description: "Competitive learning with real-time leaderboards and challenges",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-950"
    }
  ];

  let stats = [
    { label: "Active Learners", value: "50K+", icon: "users" },
    { label: "Cards Generated", value: "2M+", icon: "bookmark" },
    { label: "Topics Covered", value: "10K+", icon: "graduation-cap" },
    { label: "Success Rate", value: "94%", icon: "activity" }
  ];

  let howItWorks = [
    {
      step: "1",
      title: "Choose Your Topic",
      description: "Select from trending topics, upload documents, or enter any subject you want to learn",
      icon: "search"
    },
    {
      step: "2", 
      title: "AI Generates Content",
      description: "Our AI creates personalized flashcards and quizzes using real-time data and fact-checking",
      icon: "zap"
    },
    {
      step: "3",
      title: "Learn & Track Progress",
      description: "Study with interactive content and track your learning progress with detailed analytics",
      icon: "trending-up"
    }
  ];

  function navigateToLogin() {
    goto('/auth/login');
  }

  function navigateToSignup() {
    goto('/auth/signup');
  }

  function startDemo() {
    goto('/auth/signup?demo=true');
  }
</script>

<svelte:head>
  <title>CogniZap - AI-Powered Learning with Real-Time Content</title>
  <meta name="description" content="Generate intelligent flashcards and quizzes from trending topics, current events, and real-time data. Learn smarter with AI-powered education." />
</svelte:head>

<!-- Navigation -->
<nav class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div class="container mx-auto px-4 h-16 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <Icon name="zap" size={32} className="text-primary" />
      <span class="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
        CogniZap
      </span>
    </div>
    
    <!-- Desktop Navigation Links -->
    <div class="hidden md:flex items-center gap-6">
      <a href="#features" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        Features
      </a>
      <a href="#how-it-works" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        How It Works
      </a>
      <a href="#pricing" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        Pricing
      </a>
    </div>
    
    <div class="flex items-center gap-4">
      <Button variant="ghost" onclick={navigateToLogin}>
        <Icon name="log-in" size={16} className="mr-2" />
        Login
      </Button>
      <Button onclick={navigateToSignup}>
        <Icon name="user-plus" size={16} className="mr-2" />
        Get Started
      </Button>
    </div>
  </div>
</nav>

<div class="min-h-screen bg-background">
  
  <!-- Hero Section -->
  <section class="relative py-20 lg:py-32 overflow-hidden">
    <div class="container mx-auto px-4 text-center">
      <div class="max-w-4xl mx-auto space-y-8">
        <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent leading-tight">
          Learn Smarter with
          <span class="block">Real-Time AI</span>
        </h1>
        
        <p class="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Generate intelligent flashcards and quizzes from trending topics, current events, 
          and real-time data. Stay ahead with AI-powered learning that adapts to the world around you.
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Button size="lg" onclick={startDemo} class="text-lg px-8 py-6">
            <Icon name="zap" size={20} className="mr-2" />
            Start Learning Free
          </Button>
          <Button variant="outline" size="lg" class="text-lg px-8 py-6">
            <Icon name="play" size={20} className="mr-2" />
            Watch Demo
          </Button>
        </div>
      </div>
    </div>
    
    <!-- Background decoration -->
    <div class="absolute inset-0 -z-10 overflow-hidden">
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-3xl opacity-20"></div>
    </div>
  </section>

  <!-- Stats Section -->
  <section class="py-16 bg-muted/30">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
        {#each stats as stat}
          <div class="text-center space-y-3">
            <div class="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name={stat.icon} size={28} className="text-primary" />
            </div>
            <div class="text-3xl md:text-4xl font-bold">{stat.value}</div>
            <div class="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- How It Works Section -->
  <section id="how-it-works" class="py-20">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">How CogniZap Works</h2>
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
          Three simple steps to transform any topic into engaging, personalized learning content
        </p>
      </div>
      
      <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {#each howItWorks as step}
          <div class="text-center space-y-4">
            <div class="relative">
              <div class="w-20 h-20 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                {step.step}
              </div>
              <div class="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <Icon name={step.icon} size={20} className="text-secondary" />
              </div>
            </div>
            <h3 class="text-xl font-semibold">{step.title}</h3>
            <p class="text-muted-foreground leading-relaxed">{step.description}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section id="features" class="py-20 bg-muted/30">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">Powerful Learning Tools</h2>
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
          Everything you need to create, study, and master any subject with AI-powered insights
        </p>
      </div>
      
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {#each features as feature}
          <Card class="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <div class="space-y-4">
              <div class="w-12 h-12 rounded-lg {feature.bgColor} flex items-center justify-center">
                <Icon name={feature.icon} size={24} className={feature.color} />
              </div>
              <h3 class="text-xl font-semibold">{feature.title}</h3>
              <p class="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          </Card>
        {/each}
      </div>
    </div>
  </section>

  <!-- Pricing Section -->
  <section id="pricing" class="py-20 bg-muted/30">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">Choose Your Learning Plan</h2>
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
          Start free and upgrade as you grow. All plans include AI-powered content generation.
        </p>
      </div>
      
      <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <!-- Free Plan -->
        <Card class="p-8 text-center border-2 hover:border-primary/20 transition-colors">
          <div class="space-y-6">
            <div>
              <h3 class="text-2xl font-bold">Free</h3>
              <div class="text-4xl font-bold mt-2">$0</div>
              <p class="text-muted-foreground">per month</p>
            </div>
            <ul class="space-y-3 text-left">
              <li class="flex items-center gap-2">
                <Icon name="check" size={16} className="text-green-500" />
                <span class="text-sm">10 flashcards per day</span>
              </li>
              <li class="flex items-center gap-2">
                <Icon name="check" size={16} className="text-green-500" />
                <span class="text-sm">Basic AI content generation</span>
              </li>
              <li class="flex items-center gap-2">
                <Icon name="check" size={16} className="text-green-500" />
                <span class="text-sm">Access to trending topics</span>
              </li>
            </ul>
            <Button variant="outline" class="w-full" onclick={startDemo}>
              Start Free
            </Button>
          </div>
        </Card>

        <!-- Pro Plan -->
        <Card class="p-8 text-center border-2 border-primary bg-primary/5 relative">
          <Badge class="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
          <div class="space-y-6">
            <div>
              <h3 class="text-2xl font-bold">Pro</h3>
              <div class="text-4xl font-bold mt-2">$19</div>
              <p class="text-muted-foreground">per month</p>
            </div>
            <ul class="space-y-3 text-left">
              <li class="flex items-center gap-2">
                <Icon name="check" size={16} className="text-green-500" />
                <span class="text-sm">Unlimited flashcards</span>
              </li>
              <li class="flex items-center gap-2">
                <Icon name="check" size={16} className="text-green-500" />
                <span class="text-sm">Advanced AI features</span>
              </li>
              <li class="flex items-center gap-2">
                <Icon name="check" size={16} className="text-green-500" />
                <span class="text-sm">All specialized tools</span>
              </li>
              <li class="flex items-center gap-2">
                <Icon name="check" size={16} className="text-green-500" />
                <span class="text-sm">Priority support</span>
              </li>
            </ul>
            <Button class="w-full" onclick={navigateToSignup}>
              Get Pro
            </Button>
          </div>
        </Card>

        <!-- Enterprise Plan -->
        <Card class="p-8 text-center border-2 hover:border-primary/20 transition-colors">
          <div class="space-y-6">
            <div>
              <h3 class="text-2xl font-bold">Enterprise</h3>
              <div class="text-4xl font-bold mt-2">$99</div>
              <p class="text-muted-foreground">per month</p>
            </div>
            <ul class="space-y-3 text-left">
              <li class="flex items-center gap-2">
                <Icon name="check" size={16} className="text-green-500" />
                <span class="text-sm">Everything in Pro</span>
              </li>
              <li class="flex items-center gap-2">
                <Icon name="check" size={16} className="text-green-500" />
                <span class="text-sm">Team collaboration</span>
              </li>
              <li class="flex items-center gap-2">
                <Icon name="check" size={16} className="text-green-500" />
                <span class="text-sm">Custom integrations</span>
              </li>
              <li class="flex items-center gap-2">
                <Icon name="check" size={16} className="text-green-500" />
                <span class="text-sm">Dedicated support</span>
              </li>
            </ul>
            <Button variant="outline" class="w-full">
              Contact Sales
            </Button>
          </div>
        </Card>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="py-20">
    <div class="container mx-auto px-4 text-center">
      <div class="max-w-3xl mx-auto space-y-8">
        <h2 class="text-3xl md:text-4xl font-bold">Ready to Transform Your Learning?</h2>
        <p class="text-xl text-muted-foreground">
          Join thousands of learners who are already using CogniZap to stay ahead with real-time, AI-powered education.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" onclick={navigateToSignup} class="text-lg px-8 py-6">
            <Icon name="rocket" size={20} className="mr-2" />
            Start Learning Today
          </Button>
          <Button variant="outline" size="lg" onclick={navigateToLogin} class="text-lg px-8 py-6">
            <Icon name="user" size={20} className="mr-2" />
            Already have an account?
          </Button>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="border-t bg-muted/30 py-12">
    <div class="container mx-auto px-4">
      <div class="grid md:grid-cols-4 gap-8">
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <Icon name="zap" size={24} className="text-primary" />
            <span class="text-xl font-bold">CogniZap</span>
          </div>
          <p class="text-sm text-muted-foreground">
            AI-powered learning platform that adapts to the world around you.
          </p>
        </div>
        
        <div class="space-y-4">
          <h4 class="font-semibold">Product</h4>
          <div class="space-y-2 text-sm text-muted-foreground">
            <div>Features</div>
            <div>Pricing</div>
            <div>API</div>
          </div>
        </div>
        
        <div class="space-y-4">
          <h4 class="font-semibold">Company</h4>
          <div class="space-y-2 text-sm text-muted-foreground">
            <div>About</div>
            <div>Blog</div>
            <div>Careers</div>
          </div>
        </div>
        
        <div class="space-y-4">
          <h4 class="font-semibold">Support</h4>
          <div class="space-y-2 text-sm text-muted-foreground">
            <div>Help Center</div>
            <div>Contact</div>
            <div>Privacy</div>
          </div>
        </div>
      </div>
      
      <div class="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
        © 2024 CogniZap. All rights reserved.
      </div>
    </div>
  </footer>
</div>

<style>
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  .animate-fade-in {
    animation: fade-in 0.8s ease-out;
  }
  
  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
</style>
