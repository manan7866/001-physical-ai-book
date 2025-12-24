import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useHistory } from '@docusaurus/router';
import { useSearchPage } from '@docusaurus/theme-common/internal';
import {useDocsPreferredVersion} from '@docusaurus/theme-common/internal';

const SearchBar = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const resultsRef = useRef([]);
  const location = useLocation();
  const history = useHistory();

  // Focus the input when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        onClose && onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          // Navigate to the selected result
          window.location.href = searchResults[selectedIndex].url;
        } else if (query.trim()) {
          // If no selection, redirect to search results page
          window.location.href = `/search?q=${encodeURIComponent(query)}`;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, query, searchResults, selectedIndex]);

  // Function to search through book content
  const searchBookContent = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);

    try {
      // Search through the book content
      const searchResults = await performBookSearch(searchQuery);
      setSearchResults(searchResults);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load and search through actual book content
  const performBookSearch = async (query) => {
    // In a real implementation, you would fetch from an actual search API or search index
    // For now, we'll create a more comprehensive mock based on the actual book structure

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Get all docs from the site's documentation structure
    // This would normally come from a search index or API
    const allDocs = [
      { title: 'Introduction to Physical AI', url: '/docs/introduction/', content: 'Foundations of Physical AI and Humanoid Robotics, core concepts, physical intelligence, embodied cognition, sensorimotor learning' },
      { title: 'Physical AI Foundations', url: '/docs/introduction/', content: 'Understanding physical intelligence, embodied cognition, sensorimotor learning, robot perception, control theory, dynamics' },
      { title: 'ROS 2 Basics', url: '/docs/module1-ros2/', content: 'Robot Operating System 2, nodes, topics, services, actions, launch files, packages, workspaces, message passing, distributed systems' },
      { title: 'ROS 2 Development', url: '/docs/module1-ros2/', content: 'Advanced ROS 2 concepts, custom messages, parameters, lifecycle nodes, composition, client libraries, build systems, testing' },
      { title: 'Digital Twin Concepts', url: '/docs/module2-digital-twin/', content: 'Digital twin technology, simulation environments, physics engines, Gazebo, Isaac Sim, 3D modeling, real-time simulation, virtual testing' },
      { title: 'Simulation Environments', url: '/docs/module2-digital-twin/', content: 'Physics simulation, environment modeling, sensor simulation, realistic robot simulation, collision detection, rendering, performance optimization' },
      { title: 'Isaac Platform Overview', url: '/docs/module3-isaac/', content: 'NVIDIA Isaac platform, Isaac Sim, Isaac ROS, robotics applications, AI integration, perception pipelines, manipulation frameworks' },
      { title: 'Vision-Language-Action Systems', url: '/docs/module4-vla/', content: 'Vision-language-action models, multimodal learning, embodied AI, perception-action loops, neural networks, transformer architectures' },
      { title: 'Hardware Overview', url: '/docs/hardware/', content: 'Humanoid robot hardware, actuators, sensors, control systems, mechanical design, electronics, power systems, safety mechanisms' },
      { title: 'Tutorials', url: '/docs/tutorials/', content: 'Getting started tutorials, basic examples, robot control, basic navigation, development workflows, debugging techniques, best practices' },
      { title: 'ROS 2 Examples', url: '/docs/examples/', content: 'Practical ROS 2 examples, code snippets, best practices, common patterns, debugging, performance optimization, integration techniques' },
      { title: 'Demo Projects', url: '/docs/demos/', content: 'Complete demo projects, sample applications, integration examples, practical implementations, real-world scenarios, problem-solving approaches' },
      { title: 'Capstone Project', url: '/docs/capstone/', content: 'Comprehensive capstone project, end-to-end implementation, advanced concepts, system integration, project management, deployment strategies' },
      { title: 'Control Systems', url: '/docs/hardware/', content: 'Robot control systems, PID controllers, trajectory planning, motion control, feedback systems, stability analysis, real-time control' },
      { title: 'Sensor Integration', url: '/docs/hardware/', content: 'Sensor fusion, IMU, cameras, LIDAR, proprioceptive sensors, data processing, calibration, filtering, sensor networks' },
      { title: 'Machine Learning for Robotics', url: '/docs/module4-vla/', content: 'Deep learning for robotics, reinforcement learning, imitation learning, neural networks, training pipelines, data collection, model deployment' },
      { title: 'Navigation and Path Planning', url: '/docs/module1-ros2/', content: 'Robot navigation, path planning, obstacle avoidance, SLAM, localization, mapping, route optimization, dynamic environments' },
      { title: 'Manipulation and Grasping', url: '/docs/module3-isaac/', content: 'Robotic manipulation, grasping algorithms, dexterous manipulation, hand-eye coordination, force control, tactile sensing, grasp planning' },
      { title: 'AI Planning and Decision Making', url: '/docs/module4-vla/', content: 'AI planning algorithms, decision trees, state machines, behavior trees, task planning, motion planning, hierarchical planning' },
      { title: 'Computer Vision for Robotics', url: '/docs/module4-vla/', content: 'Computer vision techniques, object detection, tracking, segmentation, feature extraction, stereo vision, depth estimation, visual SLAM' },
      { title: 'Robot Safety and Ethics', url: '/docs/introduction/', content: 'Robot safety protocols, ethical considerations, safety mechanisms, risk assessment, fail-safe systems, human-robot interaction safety' },
    ];

    const filteredResults = allDocs.filter(doc =>
      doc.title.toLowerCase().includes(query.toLowerCase()) ||
      doc.content.toLowerCase().includes(query.toLowerCase()) ||
      doc.url.toLowerCase().includes(query.toLowerCase())
    );

    // Sort results by relevance (titles matching query come first)
    const sortedResults = filteredResults.sort((a, b) => {
      const aMatchesTitle = a.title.toLowerCase().includes(query.toLowerCase()) ? 2 : 0;
      const bMatchesTitle = b.title.toLowerCase().includes(query.toLowerCase()) ? 2 : 0;
      const aMatchesContent = a.content.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
      const bMatchesContent = b.content.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;

      return (bMatchesTitle + bMatchesContent) - (aMatchesTitle + aMatchesContent);
    });

    return sortedResults.slice(0, 10); // Return top 10 results
  };

  // Handle input changes with search delay
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query) {
        searchBookContent(query);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Scroll to selected item when index changes
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current[selectedIndex]) {
      resultsRef.current[selectedIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="search-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      zIndex: 1000,
      paddingTop: '15vh'
    }}>
      <div className="search-modal" style={{
        width: '90%',
        maxWidth: '700px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            flex: 1,
            position: 'relative'
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  placeholder="Search documentation..."
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    fontSize: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    outline: 'none',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    paddingRight: '40px'
                  }}
                  autoFocus
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setSearchResults([]);
                    }}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      fontSize: '18px',
                      cursor: 'pointer',
                      color: '#9ca3af'
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
              <button
                type="submit"
                style={{
                  marginLeft: '10px',
                  padding: '0 20px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Search
              </button>
            </form>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              onClose && onClose();
            }}
            style={{
              marginLeft: '15px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>

        {/* Search results */}
        <div style={{
          maxHeight: '60vh',
          overflowY: 'auto'
        }}>
          {isLoading ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <div style={{
                display: 'inline-block',
                width: '20px',
                height: '20px',
                border: '2px solid #e5e7eb',
                borderTop: '2px solid #8b5cf6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ marginTop: '10px' }}>Searching...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  ref={el => resultsRef.current[index] = el}
                  onClick={() => {
                    // Navigate to the result URL directly
                    // If it doesn't exist, the user will see a 404 which is expected behavior
                    window.location.href = result.url;
                  }}
                  style={{
                    padding: '15px 20px',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    backgroundColor: selectedIndex === index ? '#f3f4f6' : 'white',
                    transition: 'background-color 0.1s'
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <h3 style={{
                    margin: '0 0 5px 0',
                    color: '#1f2937',
                    fontSize: '16px',
                    fontWeight: selectedIndex === index ? '600' : '500'
                  }}>
                    {result.title}
                  </h3>
                  <p style={{
                    margin: '0',
                    color: '#6b7280',
                    fontSize: '14px',
                    lineHeight: '1.4'
                  }}>
                    {result.content.substring(0, 120)}...
                  </p>
                  <div style={{
                    marginTop: '5px',
                    fontSize: '12px',
                    color: '#9ca3af'
                  }}>
                    {result.url}
                  </div>
                </div>
              ))}
            </div>
          ) : query ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#9ca3af'
            }}>
              <p>Type your search query above to search the book content</p>
              <div style={{ marginTop: '20px', fontSize: '14px' }}>
                <div style={{
                  display: 'inline-flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <kbd style={{
                      display: 'inline-block',
                      padding: '2px 6px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db',
                      fontSize: '12px'
                    }}>↑↓</kbd> Navigate
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <kbd style={{
                      display: 'inline-block',
                      padding: '2px 6px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db',
                      fontSize: '12px'
                    }}>Enter</kbd> Select
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <kbd style={{
                      display: 'inline-block',
                      padding: '2px 6px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db',
                      fontSize: '12px'
                    }}>Esc</kbd> Close
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SearchBar;