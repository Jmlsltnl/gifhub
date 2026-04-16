export interface Category {
  id: string
  name: string
  slug: string
  description: string
  subcategories: Subcategory[]
}

export interface Subcategory {
  id: string
  name: string
  slug: string
  categoryId: string
}

export interface GifItem {
  id: string
  title: string
  slug: string
  url: string
  altText: string
  views: number
  likes: number
  categorySlug: string
  subcategorySlug: string
  tags: string[]
}

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Marketing',
    slug: 'marketing',
    description: 'GIFs for marketers, campaigns, and brand moments',
    subcategories: [
      { id: '1a', name: 'Campaign Launch', slug: 'campaign-launch', categoryId: '1' },
      { id: '1b', name: 'Social Media Wins', slug: 'social-media-wins', categoryId: '1' },
      { id: '1c', name: 'Brand Moments', slug: 'brand-moments', categoryId: '1' },
    ],
  },
  {
    id: '2',
    name: 'SaaS',
    slug: 'saas',
    description: 'Software-as-a-Service celebrations and struggles',
    subcategories: [
      { id: '2a', name: 'We Hit Our MRR Goal!', slug: 'mrr-goal', categoryId: '2' },
      { id: '2b', name: 'Churn Reactions', slug: 'churn-reactions', categoryId: '2' },
      { id: '2c', name: 'Product Hunt Launch', slug: 'product-hunt-launch', categoryId: '2' },
    ],
  },
  {
    id: '3',
    name: 'eCommerce',
    slug: 'ecommerce',
    description: 'Online retail wins, fails, and everything in between',
    subcategories: [
      { id: '3a', name: 'Black Friday Madness', slug: 'black-friday', categoryId: '3' },
      { id: '3b', name: 'Order Shipped!', slug: 'order-shipped', categoryId: '3' },
      { id: '3c', name: 'Cart Abandonment', slug: 'cart-abandonment', categoryId: '3' },
    ],
  },
  {
    id: '4',
    name: 'Fintech',
    slug: 'fintech',
    description: 'Financial technology reactions and milestones',
    subcategories: [
      { id: '4a', name: 'Funding Round', slug: 'funding-round', categoryId: '4' },
      { id: '4b', name: 'Market Reactions', slug: 'market-reactions', categoryId: '4' },
      { id: '4c', name: 'Compliance Vibes', slug: 'compliance-vibes', categoryId: '4' },
    ],
  },
  {
    id: '5',
    name: 'Human Resources',
    slug: 'human-resources',
    description: 'HR, recruiting, onboarding, and people ops',
    subcategories: [
      { id: '5a', name: 'New Hire Welcome', slug: 'new-hire-welcome', categoryId: '5' },
      { id: '5b', name: 'Performance Review', slug: 'performance-review', categoryId: '5' },
      { id: '5c', name: 'Team Building', slug: 'team-building', categoryId: '5' },
    ],
  },
  {
    id: '6',
    name: 'Product & Engineering',
    slug: 'product-engineering',
    description: 'Shipping features, debugging, and sprint rituals',
    subcategories: [
      { id: '6a', name: 'Feature Shipped!', slug: 'feature-shipped', categoryId: '6' },
      { id: '6b', name: 'Bug Found in Prod', slug: 'bug-in-prod', categoryId: '6' },
      { id: '6c', name: 'Sprint Retrospective', slug: 'sprint-retro', categoryId: '6' },
    ],
  },
  {
    id: '7',
    name: 'Internal Team Communication',
    slug: 'team-communication',
    description: 'Slack reactions, standup vibes, and remote work life',
    subcategories: [
      { id: '7a', name: 'Monday Morning', slug: 'monday-morning', categoryId: '7' },
      { id: '7b', name: 'Friday Vibes', slug: 'friday-vibes', categoryId: '7' },
      { id: '7c', name: 'Meeting Could\'ve Been an Email', slug: 'meeting-email', categoryId: '7' },
    ],
  },
]

export const mockGifs: GifItem[] = [
  {
    id: 'g1',
    title: 'When the campaign goes viral',
    slug: 'when-the-campaign-goes-viral',
    url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif',
    altText: 'Person celebrating excitedly at their desk after seeing viral campaign metrics',
    views: 12400,
    likes: 892,
    categorySlug: 'marketing',
    subcategorySlug: 'campaign-launch',
    tags: ['celebration', 'viral', 'marketing', 'excited', 'win'],
  },
  {
    id: 'g2',
    title: 'MRR just hit a new record',
    slug: 'mrr-just-hit-a-new-record',
    url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
    altText: 'Team high-fiving after reaching monthly recurring revenue milestone',
    views: 8700,
    likes: 654,
    categorySlug: 'saas',
    subcategorySlug: 'mrr-goal',
    tags: ['mrr', 'saas', 'milestone', 'highfive', 'revenue'],
  },
  {
    id: 'g3',
    title: 'Deploying to production on Friday',
    slug: 'deploying-to-production-on-friday',
    url: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
    altText: 'Nervous developer pushing code to production on a Friday afternoon',
    views: 23100,
    likes: 1820,
    categorySlug: 'product-engineering',
    subcategorySlug: 'feature-shipped',
    tags: ['deploy', 'friday', 'nervous', 'engineering', 'production'],
  },
  {
    id: 'g4',
    title: 'When the new hire joins the Slack channel',
    slug: 'when-the-new-hire-joins-slack',
    url: 'https://media.giphy.com/media/FQyQEYd0KlYQ/giphy.gif',
    altText: 'Excited welcome reaction for a new team member joining the company',
    views: 9300,
    likes: 712,
    categorySlug: 'human-resources',
    subcategorySlug: 'new-hire-welcome',
    tags: ['welcome', 'newhire', 'onboarding', 'slack', 'team'],
  },
  {
    id: 'g5',
    title: 'Black Friday traffic hitting the servers',
    slug: 'black-friday-traffic-hitting-servers',
    url: 'https://media.giphy.com/media/l4FGuhL4U2WSOlHLq/giphy.gif',
    altText: 'Overwhelmed server struggling under massive Black Friday ecommerce traffic',
    views: 15200,
    likes: 1100,
    categorySlug: 'ecommerce',
    subcategorySlug: 'black-friday',
    tags: ['blackfriday', 'traffic', 'servers', 'ecommerce', 'overload'],
  },
  {
    id: 'g6',
    title: 'Compliance audit is next week',
    slug: 'compliance-audit-is-next-week',
    url: 'https://media.giphy.com/media/l1J9EdzfOSgfyueLm/giphy.gif',
    altText: 'Stressed fintech professional preparing for an upcoming compliance audit',
    views: 6400,
    likes: 480,
    categorySlug: 'fintech',
    subcategorySlug: 'compliance-vibes',
    tags: ['compliance', 'audit', 'fintech', 'stress', 'regulation'],
  },
  {
    id: 'g7',
    title: 'That meeting could have been an email',
    slug: 'that-meeting-could-have-been-an-email',
    url: 'https://media.giphy.com/media/XreQmk7ETCak0/giphy.gif',
    altText: 'Frustrated employee in a meeting that should have been a quick email',
    views: 31800,
    likes: 2400,
    categorySlug: 'team-communication',
    subcategorySlug: 'meeting-email',
    tags: ['meeting', 'email', 'frustration', 'remote', 'office'],
  },
  {
    id: 'g8',
    title: 'When you find the bug at 2 AM',
    slug: 'when-you-find-the-bug-at-2am',
    url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
    altText: 'Developer having a eureka moment finding a critical bug late at night',
    views: 19700,
    likes: 1560,
    categorySlug: 'product-engineering',
    subcategorySlug: 'bug-in-prod',
    tags: ['bug', 'debugging', 'latenight', 'eureka', 'developer'],
  },
]
