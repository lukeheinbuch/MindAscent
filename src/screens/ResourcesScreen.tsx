import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Phone, ExternalLink, MapPin, Search, Heart, Brain, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Resource } from '@/types';
import { resourcesData } from '@/data/placeholderData';

interface ResourcesScreenProps {
  onNavigate?: (path: string) => void;
}

const ResourcesScreen: React.FC<ResourcesScreenProps> = ({ onNavigate }) => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredResources, setFilteredResources] = useState<Resource[]>(resourcesData);

  const resourceTypes = [
    { id: 'all', name: 'All Resources', icon: Heart, color: 'bg-red-600' },
    { id: 'hotline', name: 'Crisis Hotlines', icon: Phone, color: 'bg-red-600' },
    { id: 'website', name: 'Websites', icon: ExternalLink, color: 'bg-blue-600' },
    { id: 'clinic', name: 'Clinics', icon: MapPin, color: 'bg-green-600' },
    { id: 'app', name: 'Apps', icon: Brain, color: 'bg-purple-600' },
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

  const handleResourceClick = (resource: Resource) => {
    if (resource.type === 'hotline') {
      if (resource.contact && resource.contact.startsWith('Text')) {
        // For text-based services, show info
        alert(`${resource.title}: ${resource.contact}`);
      } else if (resource.contact) {
        window.location.href = `tel:${resource.contact}`;
      }
    } else if (resource.contact && resource.contact.startsWith('http')) {
      window.open(resource.contact, '_blank');
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'hotline':
        return Phone;
      case 'website':
        return ExternalLink;
      case 'clinic':
        return MapPin;
      case 'app':
        return Brain;
      default:
        return Heart;
    }
  };

  const getTypeColor = (type: string) => {
    const typeData = resourceTypes.find(rt => rt.id === type);
    return typeData?.color || 'bg-gray-600';
  };

  const getEmergencyResources = () => {
    return resourcesData.filter(resource => resource.isEmergency);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const emergencyResources = getEmergencyResources();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Resource Center</h1>
        <p className="text-gray-400">Find support when you need it most</p>
      </motion.div>

      {/* Emergency Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-red-900/30 border border-red-500 rounded-lg p-6 mb-8"
      >
        <div className="flex items-start space-x-4">
          <Phone className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-red-400 font-semibold text-lg mb-2">Crisis Support Available 24/7</h3>
            <p className="text-gray-300 mb-4">
              If you're in immediate danger or having thoughts of self-harm, reach out for help right now.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {emergencyResources.map((resource) => (
                <button
                  key={resource.id}
                  onClick={() => handleResourceClick(resource)}
                  className="flex items-center space-x-3 p-3 bg-red-800/50 rounded-lg hover:bg-red-800/70 transition-colors text-left"
                >
                  <Phone className="w-5 h-5 text-red-300 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">{resource.title}</p>
                    <p className="text-red-200 text-sm">{resource.contact}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative mb-8"
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search resources, services, and support..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
        />
      </motion.div>

      {/* Type Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
      >
        {resourceTypes.map((type) => {
          const IconComponent = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`flex flex-col items-center space-y-2 p-4 rounded-lg font-medium transition-all duration-200 ${
                selectedType === type.id
                  ? `${type.color} text-white shadow-lg scale-105`
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <IconComponent className="w-6 h-6" />
              <span className="text-sm font-medium">{type.name}</span>
            </button>
          );
        })}
      </motion.div>

      {/* Resources Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {selectedType === 'all' ? 'All Resources' : `${resourceTypes.find(rt => rt.id === selectedType)?.name || ''}`}
          </h2>
          <span className="text-gray-400">{filteredResources.length} resources</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {filteredResources.map((resource, index) => {
            const IconComponent = getResourceIcon(resource.type);
            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleResourceClick(resource)}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-red-500 cursor-pointer transition-all duration-200 hover:transform hover:scale-105 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${getTypeColor(resource.type)}`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {resource.availability === '24/7' && (
                      <span className="text-xs font-medium text-green-400 bg-green-900/30 px-2 py-1 rounded">
                        24/7
                      </span>
                    )}
                    {resource.isEmergency && (
                      <span className="text-xs font-medium text-red-400 bg-red-900/30 px-2 py-1 rounded">
                        Emergency
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-red-400 transition-colors">
                  {resource.title}
                </h3>
                <p className="text-gray-400 mb-4">{resource.description}</p>

                {resource.contact && resource.type === 'hotline' && (
                  <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-700 rounded-lg">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300 font-mono text-lg">{resource.contact}</span>
                  </div>
                )}

                {resource.location && (
                  <div className="flex items-center space-x-2 mb-4">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{resource.location}</span>
                  </div>
                )}

                {resource.availability && (
                  <div className="flex items-center space-x-2 mb-4">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{resource.availability}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-1 mb-4">
                  {resource.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {resource.tags.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                      +{resource.tags.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 capitalize">
                    {resource.type.replace('-', ' ')}
                  </span>
                  <div className="flex items-center space-x-2 text-gray-400 group-hover:text-red-400 transition-colors">
                    {resource.type === 'hotline' ? (
                      <span className="text-sm">Tap to call</span>
                    ) : (
                      <>
                        <span className="text-sm">Visit</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
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
          <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
            }}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Show All Resources
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ResourcesScreen;
