export const categories = [
  { id: 'c1', name: 'Artificial Intelligence', slug: 'ai', description: 'Explore the latest in AI, machine learning, and neural networks.' },
  { id: 'c2', name: 'Cyber Security', slug: 'cyber-security', description: 'Protecting systems, networks, and programs from digital attacks.' },
  { id: 'c3', name: 'Programming', slug: 'programming', description: 'Coding tutorials, best practices, and software architecture.' },
  { id: 'c4', name: 'Web Development', slug: 'web-development', description: 'Frontend, backend, and everything in between for the modern web.' },
  { id: 'c5', name: 'Cloud Computing', slug: 'cloud', description: 'AWS, Azure, GCP, and cloud-native application development.' },
];

export const authors = [
  {
    id: 'a1',
    name: 'Sarah Chen',
    username: 'sarahchen',
    avatar: 'https://i.pravatar.cc/150?u=sarahchen',
    bio: 'Senior AI Researcher & Tech Writer. Exploring the intersection of human and artificial intelligence.',
    expertise: ['Artificial Intelligence', 'Machine Learning'],
    followers: 12500,
  },
  {
    id: 'a2',
    name: 'Marcus Johnson',
    username: 'marcusj',
    avatar: 'https://i.pravatar.cc/150?u=marcusj',
    bio: 'Lead Full Stack Developer. Passionate about scalable architecture and clean code.',
    expertise: ['Web Development', 'Programming'],
    followers: 8300,
  },
];

export const articles = [
  {
    id: 'art1',
    title: 'The Future of Large Language Models in Enterprise',
    slug: 'future-of-llms-enterprise',
    subtitle: 'How AI is reshaping corporate workflows and decision making',
    excerpt: 'Large Language Models are moving beyond chat interfaces into the core operations of major enterprises. We explore the architectural shifts and security considerations.',
    content: `
      <h2>The Shift to Enterprise AI</h2>
      <p>In recent years, the adoption of Large Language Models (LLMs) has accelerated...</p>
      <p>Companies are no longer just experimenting; they are integrating AI into their mission-critical systems.</p>
      <h3>Security First</h3>
      <p>Data privacy remains the biggest hurdle for enterprise AI adoption.</p>
    `,
    categoryId: 'c1',
    authorId: 'a1',
    publishedDate: '2026-08-15T10:00:00Z',
    readingTime: 8,
    views: 45200,
    likes: 1200,
    comments: 45,
    coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200&auto=format&fit=crop',
    status: 'published',
    tags: ['AI', 'Enterprise', 'LLM'],
  },
  {
    id: 'art2',
    title: 'Building Resilient Microservices with Go',
    slug: 'resilient-microservices-go',
    subtitle: 'A practical guide to fault-tolerant distributed systems',
    excerpt: 'Learn how to leverage Go\'s concurrency model and standard library to build microservices that can withstand network partitions and dependency failures.',
    content: `
      <h2>Why Go for Microservices?</h2>
      <p>Go's simplicity and robust standard library make it an excellent choice for distributed systems...</p>
      <h3>Handling Failures</h3>
      <p>We'll look at implementing circuit breakers and retry mechanisms.</p>
    `,
    categoryId: 'c3',
    authorId: 'a2',
    publishedDate: '2026-08-14T14:30:00Z',
    readingTime: 12,
    views: 28500,
    likes: 890,
    comments: 32,
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
    status: 'published',
    tags: ['Golang', 'Microservices', 'Architecture'],
  },
  {
    id: 'art3',
    title: 'Zero Trust Security in a Remote World',
    slug: 'zero-trust-remote-world',
    subtitle: 'Rethinking perimeter security for modern organizations',
    excerpt: 'With the shift to remote work, traditional network perimeters are obsolete. Zero Trust architecture assumes breach and verifies every request.',
    content: `
      <h2>The End of the Perimeter</h2>
      <p>You can no longer assume that internal network traffic is safe...</p>
    `,
    categoryId: 'c2',
    authorId: 'a1', // Just reusing author for mock data
    publishedDate: '2026-08-10T09:15:00Z',
    readingTime: 6,
    views: 15400,
    likes: 450,
    comments: 18,
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop',
    status: 'published',
    tags: ['Security', 'Zero Trust', 'Remote Work'],
  }
];

export const currentUser = {
  id: 'u1',
  name: 'Alex Developer',
  username: 'alexdev',
  email: 'alex@example.com',
  avatar: 'https://i.pravatar.cc/150?u=alexdev',
  role: 'admin',
  bookmarks: ['art2'],
};
