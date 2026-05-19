
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Brain, Heart, ChevronRight, Share2 } from 'lucide-react';

export const ResourcesPage = () => {
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  const handleShare = async (e: React.MouseEvent, article: any) => {
    e.stopPropagation();
    const shareData = {
      title: article.title,
      text: article.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${article.title}\n${article.description}\n${window.location.href}`);
        alert('Article link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const categories = [
    {
      id: 'mental-health',
      title: 'Mental Resilience',
      icon: Brain,
      color: 'bg-brand-pink text-white',
      items: [
        {
          id: 'stress-mgmt',
          title: 'Managing Academic Stress',
          description: 'Practical techniques to handle study pressure and exam anxiety.',
          content: `
# Managing Academic Stress

Study pressure is real, but it doesn't have to control you.

## Immediate Techniques
- **Box Breathing**: Inhale for 4, hold for 4, exhale for 4, hold for 4.
- **5-4-3-2-1 Grounding**: Identify 5 things you see, 4 you feel, etc.

## Long-term Mastery
- **The POMODORO Technique**: Work for 25 mins, rest for 5.
- **Prioritize Sleep**: Your brain consolidates knowledge during REM sleep.
          `
        },
        {
          id: 'anxiety-relief',
          title: 'Anxiety Relief Strategies',
          description: 'Understanding and calming the nervous system when overwhelmed.',
          content: `
# Anxiety Relief Strategies

Anxiety is your body's attempt to protect you, but we can help it calm down.

## Mindfulness Exercises
- Practice non-judgmental awareness of your thoughts.
- Use progressive muscle relaxation (Tense and release muscles from toe to head).

## Routine Building
- Create a predictable morning routine to lower cortisol levels.
- Limit caffeine intake when feeling particularly anxious.
          `
        }
      ]
    },
    {
      id: 'balance',
      title: 'Life Balance',
      icon: Heart,
      color: 'bg-brand-teal text-white',
      items: [
        {
          id: 'social-wellbeing',
          title: 'Building Better Connections',
          description: 'Navigating student relationships and combating loneliness.',
          content: `
# Building Better Connections

Human connection is a fundamental pillar of wellness.

## Healthy Boundaries
- Learn to say "No" when your social battery is low.
- Communication is the key to resolving campus roommate conflicts.

## Overcoming Loneliness
- Join campus clubs that align with your genuine interests.
- Volunteer for campus events to meet like-minded peers.
          `
        },
        {
          id: 'digital-wellness',
          title: 'Digital Minimalism',
          description: 'How to manage screen time and academic distractions.',
          content: `
# Digital Minimalism

Your focus is your most valuable asset.

## Screen Time Tips
- Set "Do Not Disturb" schedules during study blocks.
- Use greyscale mode on your phone to make apps less addictive.
          `
        }
      ]
    }
  ];

  if (selectedArticle) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-3xl mx-auto pb-20"
      >
        <div className="flex items-center justify-between mb-10">
          <button 
            onClick={() => setSelectedArticle(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-sky-600 font-black uppercase text-[10px] tracking-widest transition-colors"
          >
            <ChevronRight size={14} className="rotate-180" /> Back to Vault
          </button>
          <button 
            onClick={(e) => handleShare(e, selectedArticle)}
            className="flex items-center gap-2 text-slate-400 hover:text-sky-600 font-black uppercase text-[10px] tracking-widest transition-colors"
          >
            <Share2 size={14} /> Share Article
          </button>
        </div>

        <div className="yandasm-card bg-white p-8 lg:p-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
          
          <div className="relative z-10 prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap font-medium text-slate-600 leading-relaxed">
              {selectedArticle.content.trim().split('\n').map((line: string, i: number) => {
                if (line.startsWith('# ')) return <h1 key={i} className="text-4xl font-black text-sky-950 uppercase tracking-tighter mb-8 mt-4 leading-none">{line.replace('# ', '')}</h1>;
                if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-black text-sky-900 uppercase tracking-tight mt-10 mb-4">{line.replace('## ', '')}</h2>;
                if (line.startsWith('- ')) return <li key={i} className="list-none flex gap-3 mb-2 ml-2"><div className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-2 shrink-0" /> <span className="text-slate-600 italic">{line.replace('- ', '')}</span></li>;
                if (line.trim() === '') return <div key={i} className="h-4" />;
                return <p key={i} className="mb-4">{line}</p>;
              })}
            </div>
          </div>
          
          <div className="mt-20 pt-10 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                   <Brain size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-400">Verified by</p>
                   <p className="text-xs font-black uppercase text-sky-950">Yandasm Wellness Team</p>
                </div>
             </div>
             <button 
              onClick={() => setSelectedArticle(null)}
              className="px-8 py-3 bg-slate-100 hover:bg-sky-600 hover:text-white text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
             >
                I'm Finished Reading
             </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto pb-20">
      <div className="mb-12 text-center md:text-left">
        <h2 className="text-3xl lg:text-4xl font-black text-sky-950 uppercase tracking-tighter">Wellness Vault</h2>
        <p className="text-slate-500 font-medium italic mt-1 text-sm lg:text-base">Curated academic and mental health resources for your success.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12">
        {categories.map((cat) => (
          <div key={cat.id} className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className={`w-10 h-10 ${cat.color} rounded-xl flex items-center justify-center shrink-0`}>
                <cat.icon size={20} />
              </div>
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">{cat.title}</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {cat.items.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedArticle(item)}
                  className="yandasm-card bg-white p-6 hover:border-sky-300 transition-all cursor-pointer group hover:shadow-xl hover:shadow-sky-950/5"
                >
                  <h4 className="font-black text-sky-950 uppercase text-[11px] mb-2 group-hover:text-sky-600">{item.title}</h4>
                  <p className="text-[11px] font-medium text-slate-400 leading-relaxed mb-4">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-[9px] font-black uppercase text-sky-600 tracking-widest">
                      Open Article <ChevronRight size={10} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <button 
                      onClick={(e) => handleShare(e, item)}
                      className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-sky-600 transition-colors"
                      title="Share Article"
                    >
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 text-center text-white overflow-hidden relative shadow-2xl shadow-slate-950/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <h3 className="text-xl lg:text-2xl font-black uppercase tracking-tighter mb-4">Request a Topic</h3>
        <p className="text-slate-400 text-xs lg:text-sm max-w-lg mx-auto leading-relaxed italic">
          Is there a specific wellness or academic topic you'd like to see covered in our repository? Let us know. Our experts are here to help.
        </p>
        <button className="mt-8 px-10 py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-50 transition-all shadow-xl active:scale-95">Submit Request</button>
      </div>
    </motion.div>
  );
};
