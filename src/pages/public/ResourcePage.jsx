import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Compass, Layers, PenTool, Users } from 'lucide-react';

const resourceContent = {
  'why-techverse': {
    eyebrow: 'Our philosophy',
    title: 'Why TechVerse?',
    description:
      'TechVerse gives curious builders a focused place to discover practical ideas, share hard-won lessons, and grow alongside a thoughtful technology community.',
    icon: Compass,
    sections: [
      {
        title: 'A publication for builders',
        text: 'Read clear, experience-led writing about software, architecture, and the ideas shaping the digital world.',
        icon: Layers
      },
      {
        title: 'Knowledge worth sharing',
        text: 'Turn your projects, experiments, and lessons into useful articles that help another developer move forward.',
        icon: PenTool
      },
      {
        title: 'A community that learns together',
        text: 'Follow authors, save the pieces you want to revisit, and join conversations with people who care about technology.',
        icon: Users
      }
    ]
  },
  'how-it-works': {
    eyebrow: 'The TechVerse experience',
    title: 'How It Works',
    description:
      'Find your next idea in three simple steps: explore the archive, learn from the community, and publish what you discover.',
    icon: Layers,
    sections: [
      {
        title: '1. Explore',
        text: 'Browse the latest articles, trending posts, and categories to find perspectives that match your interests.',
        icon: Compass
      },
      {
        title: '2. Engage',
        text: 'Save useful articles, follow authors, and take part in the conversations around the topics you care about.',
        icon: Users
      },
      {
        title: '3. Create',
        text: 'When you are ready, write and publish your own post with the TechVerse editor.',
        icon: PenTool
      }
    ]
  }
};

const ResourcePage = () => {
  const { resource } = useParams();
  const content = resourceContent[resource] || resourceContent['why-techverse'];
  const ResourceIcon = content.icon;

  return (
    <div className="pt-28 pb-20 min-h-screen bg-techverse-eggshell">
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-techverse-olive/25 text-techverse-green mb-6">
          <ResourceIcon size={28} />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-techverse-olive mb-4">
          {content.eyebrow}
        </p>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-techverse-green mb-6">
          {content.title}
        </h1>
        <p className="text-lg sm:text-xl leading-relaxed text-techverse-green/75 max-w-2xl mx-auto">
          {content.description}
        </p>
      </header>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {content.sections.map(({ title, text, icon: Icon }) => (
          <article key={title} className="bg-white rounded-3xl p-7 shadow-sm border border-techverse-green/10">
            <div className="w-11 h-11 rounded-xl bg-techverse-green text-techverse-eggshell flex items-center justify-center mb-5">
              <Icon size={21} />
            </div>
            <h2 className="text-xl font-black text-techverse-green mb-3">{title}</h2>
            <p className="text-sm leading-7 text-techverse-green/70">{text}</p>
            <CheckCircle2 size={18} className="text-techverse-olive mt-6" />
          </article>
        ))}
      </section>

      <div className="text-center mt-14">
        <Link to="/explore" className="btn-primary">
          Explore Blogs <ArrowRight size={18} className="ml-2" />
        </Link>
      </div>
    </div>
  );
};

export default ResourcePage;
