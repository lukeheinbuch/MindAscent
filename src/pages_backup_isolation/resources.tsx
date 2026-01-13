import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Phone, ExternalLink, Search, Filter, Heart, Brain, Shield } from 'lucide-react';
import Layout from '@/components/Layout';
import PageContainer from '@/components/PageContainer';
import { useAuth } from '@/contexts/AuthContext';
import { Resource } from '@/types';
import { resourcesData } from '@/data/placeholderData';
import { gamificationService } from '@/services/gamification';

const ResourcesPage: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredResources, setFilteredResources] = useState<Resource[]>(resourcesData);

  const resourceTypes = [
    { id: 'all', name: 'All Resources', icon: Heart },
    { id: 'hotline', name: 'Crisis Hotlines', icon: Phone },
    { id: 'website', name: 'Websites', icon: ExternalLink },
    { id: 'professional', name: 'Professionals', icon: Brain },
  ];

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    filterResources();
  }, [selectedType, searchQuery]);

  const filterResources = () => {
    let filtered = resourcesData;

    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    if (searchQuery) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredResources(filtered);
  };

  const handleResourceClick = async (resource: Resource) => {
    // Mark resource task as complete
    localStorage.setItem('resourceViewed', 'true');
    
    if (user?.id) {
      try {
        await gamificationService.recordResourceAccess(user.id, resource.id);
      } catch (e) {
        // swallow error
      }
    }

    if (resource.type === 'hotline') {
      if (resource.contact) {
        if (/^https?:\/\//i.test(resource.contact)) {
          window.open(resource.contact, '_blank');
        } else {
          window.location.href = `tel:${resource.contact}`;
        }
      }
      return;
    }
    if (resource.contact && /^https?:\/\//i.test(resource.contact)) {
      window.open(resource.contact, '_blank');
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'hotline':
        return Phone;
      case 'website':
        return ExternalLink;
      case 'professional':
        return Brain;
      default:
        return Heart;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hotline':
        return 'bg-red-600';
      case 'website':
        return 'bg-blue-600';
      case 'professional':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
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
    <Layout title="Resources">
      <PageContainer
        title="Resources"
        titleNode={<h1 className="text-3xl font-bold tracking-tight text-white">Resource <span className="bg-gradient-to-r from-red-500 via-red-400 to-red-600 bg-clip-text text-transparent">Center</span></h1>}
        subtitle="Find support when you need it most"
      >

        {/* Emergency Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-8"
        >
          <div className="flex items-center space-x-3">
            <Phone className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <h3 className="text-red-400 font-semibold">Crisis Support</h3>
              <p className="text-gray-300 text-sm">
                If you're in immediate danger or having thoughts of self-harm, call 988 (Suicide & Crisis Lifeline) or your local emergency services.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search resources, services, and support..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap gap-2">
            {resourceTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedType === type.id
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{type.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Resources Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-2 gap-5 md:gap-6"
        >
          {filteredResources.map((resource, index) => {
            const IconComponent = getResourceIcon(resource.type);
            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.03 } }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -8, transition: { duration: 0.08 } }}
                onClick={() => handleResourceClick(resource)}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-red-500 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${getTypeColor(resource.type)}`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  {resource.availability === '24/7' && (
                    <span className="text-xs font-medium text-green-400 bg-green-900/30 px-2 py-1 rounded">
                      24/7
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-semibold text-white mb-2">{resource.title}</h3>
                <p className="text-gray-400 mb-4 text-sm">{resource.description}</p>

                {resource.contact && resource.type === 'hotline' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-200 font-semibold tracking-wide">{resource.contact}</span>
                  </div>
                )}

                {resource.location && (
                  <div className="flex items-center space-x-2 mb-4">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{resource.location}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-1 mb-4">
                  {resource.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 capitalize">
                    {resource.type.replace('-', ' ')}
                  </span>
                  {resource.type === 'hotline' ? (
                    <span className="text-sm text-red-400">Tap to call</span>
                  ) : (
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* No Results */}
        {filteredResources.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No resources found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </motion.div>
        )}
      </PageContainer>
    </Layout>
  );
};

export default ResourcesPage;
