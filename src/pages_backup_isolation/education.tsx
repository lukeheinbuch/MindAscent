import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Heart, Shield, Battery, Lightbulb, Search, Filter } from 'lucide-react';
import Layout from '@/components/Layout';
import PageContainer from '@/components/PageContainer';
import { useAuth } from '@/contexts/AuthContext';
import { EducationCard } from '@/types';
import { educationData } from '@/data/placeholderData';
import { gamificationService } from '@/services/gamification';

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    'burnout': 'bg-orange-600',
    'confidence': 'bg-blue-600',
    'recovery': 'bg-green-600',
    'mental-training': 'bg-purple-600',
    'focus': 'bg-indigo-600',
    'stress-management': 'bg-yellow-600',
  };
  return colors[category] || 'bg-red-600';
};

const EducationPage: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredCards, setFilteredCards] = useState<EducationCard[]>(educationData);

  const categories = [
    { id: 'all', name: 'All Topics', icon: BookOpen },
    { id: 'burnout', name: 'Burnout', icon: Battery },
    { id: 'confidence', name: 'Confidence', icon: Shield },
    { id: 'recovery', name: 'Recovery', icon: Heart },
    { id: 'injury', name: 'Injury', icon: Brain },
    { id: 'anxiety', name: 'Anxiety', icon: Brain },
    { id: 'myths', name: 'Myths', icon: Lightbulb },
  ];

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    filterCards();
  }, [selectedCategory, searchQuery]);

  const filterCards = () => {
    let filtered = educationData;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(card => card.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(card =>
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredCards(filtered);
  };

  const handleCardClick = async (card: EducationCard) => {
    try {
      if (user?.id) {
        await gamificationService.recordEducationAccess(user.id, card.id);
      }
    } catch (e) {
      // swallow
    } finally {
      if (card.url) {
        window.open(card.url, '_blank');
      } else {
        router.push(`/education/${card.id}`);
      }
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Education">
      <PageContainer
        title="Education"
        titleNode={<h1 className="text-3xl font-bold tracking-tight text-white">Education <span className="bg-gradient-to-r from-red-500 via-red-400 to-red-600 bg-clip-text text-transparent">Hub</span></h1>}
        subtitle="Strengthen your mental game with expert knowledge"
      >

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search topics, articles, and resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Education Cards Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
        >
          {filteredCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleCardClick(card)}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-red-500 cursor-pointer transition-all duration-200 hover:transform hover:scale-105"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${getCategoryColor(card.category)}`}>
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-red-400 bg-red-900/30 px-2 py-1 rounded">
                  {card.readTime} min read
                </span>
              </div>

              <h3 className="text-xl font-semibold text-white mb-2">{card.title}</h3>
              <p className="text-gray-400 mb-4 text-sm line-clamp-3">{card.description}</p>

              <div className="flex flex-wrap gap-1 mb-4">
                {card.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {card.tags.length > 3 && (
                  <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                    +{card.tags.length - 3} more
                  </span>
                )}
              </div>

              <div className="text-sm text-gray-500">
                Category: {categories.find(cat => cat.id === card.category)?.name || card.category}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* No Results */}
        {filteredCards.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No articles found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </motion.div>
        )}
      </PageContainer>
    </Layout>
  );
};

export default EducationPage;
