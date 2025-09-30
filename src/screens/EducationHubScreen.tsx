import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Heart, Shield, Battery, Lightbulb, Search, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { EducationCard } from '@/types';
import { educationData } from '@/data/placeholderData';

interface EducationHubScreenProps {
  onNavigate?: (path: string) => void;
}

const EducationHubScreen: React.FC<EducationHubScreenProps> = ({ onNavigate }) => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredCards, setFilteredCards] = useState<EducationCard[]>(educationData);

  const categories = [
    { id: 'all', name: 'All Topics', icon: BookOpen, color: 'bg-red-600' },
    { id: 'burnout', name: 'Burnout', icon: Battery, color: 'bg-orange-600' },
    { id: 'confidence', name: 'Confidence', icon: Shield, color: 'bg-blue-600' },
    { id: 'recovery', name: 'Recovery', icon: Heart, color: 'bg-green-600' },
    { id: 'injury', name: 'Injury', icon: Brain, color: 'bg-purple-600' },
    { id: 'anxiety', name: 'Anxiety', icon: Brain, color: 'bg-yellow-600' },
    { id: 'myths', name: 'Myths', icon: Lightbulb, color: 'bg-pink-600' },
  ];

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      if (onNavigate) {
        onNavigate('/login');
      } else {
        router.push('/login');
      }
      return;
    }
  }, [user, authLoading, router, onNavigate]);

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

  const handleCardClick = (cardId: string) => {
    if (onNavigate) {
      onNavigate(`/education/${cardId}`);
    } else {
      router.push(`/education/${cardId}`);
    }
  };

  const getCategoryData = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[0];
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Education Hub</h1>
        <p className="text-gray-400">Strengthen your mental game with expert knowledge</p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative mb-8"
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search topics, articles, and resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
        />
      </motion.div>

      {/* Category Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8"
      >
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex flex-col items-center space-y-2 p-4 rounded-lg font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? `${category.color} text-white shadow-lg scale-105`
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <IconComponent className="w-6 h-6" />
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          );
        })}
      </motion.div>

      {/* Featured Articles */}
      {selectedCategory === 'all' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Featured Articles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {educationData.slice(0, 2).map((card, index) => {
              const categoryData = getCategoryData(card.category);
              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-red-500 cursor-pointer transition-all duration-200 hover:transform hover:scale-105 group"
                >
                  <div className={`h-3 ${categoryData.color}`}></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${categoryData.color}`}>
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{card.readTime} min</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-red-400 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-gray-400 mb-4 line-clamp-3">{card.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {card.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Articles Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {selectedCategory === 'all' ? 'All Articles' : `${getCategoryData(selectedCategory).name} Articles`}
          </h2>
          <span className="text-gray-400">{filteredCards.length} articles</span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card, index) => {
            const categoryData = getCategoryData(card.category);
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleCardClick(card.id)}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-red-500 cursor-pointer transition-all duration-200 hover:transform hover:scale-105 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${categoryData.color}`}>
                    <categoryData.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{card.readTime} min</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-red-400 transition-colors">
                  {card.title}
                </h3>
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

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 capitalize">
                    {categoryData.name}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                </div>
              </motion.div>
            );
          })}
        </div>
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
          <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Show All Articles
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default EducationHubScreen;
