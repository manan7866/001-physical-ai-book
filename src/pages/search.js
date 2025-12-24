import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useLocation } from '@docusaurus/router';
import { parseQueryParameter } from '@docusaurus/theme-common';

const SearchPage = () => {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get('q') || '';
    setQuery(searchQuery);

    if (searchQuery) {
      performSearch(searchQuery);
    }
  }, [location.search]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Get all docs from the site's documentation structure
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
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.url.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Sort results by relevance (titles matching query come first)
      const sortedResults = filteredResults.sort((a, b) => {
        const aMatchesTitle = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 2 : 0;
        const bMatchesTitle = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 2 : 0;
        const aMatchesContent = a.content.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0;
        const bMatchesContent = b.content.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0;

        return (bMatchesTitle + bMatchesContent) - (aMatchesTitle + aMatchesContent);
      });

      setResults(sortedResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <Layout title="Search Results" description="Search results for your query">
      <div style={{
        padding: '2rem 0',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        <div style={{
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <h1>Search Results</h1>
          <form onSubmit={handleSearch} style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '1rem'
          }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your search query..."
              style={{
                padding: '10px 15px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                width: '100%',
                maxWidth: '500px'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Search
            </button>
          </form>
        </div>

        {isLoading ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem'
          }}>
            <div style={{
              display: 'inline-block',
              width: '30px',
              height: '30px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #8b5cf6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ marginTop: '1rem' }}>Searching...</p>
          </div>
        ) : (
          <div>
            {query && (
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Found {results.length} results for "{query}"
              </p>
            )}

            {results.length > 0 ? (
              <div>
                {results.map((result, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: '1.5rem',
                      padding: '1rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: '#fff'
                    }}
                  >
                    <h3 style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '18px'
                    }}>
                      <a
                        href={result.url}
                        style={{
                          color: '#1d4ed8',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                      >
                        {result.title}
                      </a>
                    </h3>
                    <p style={{
                      margin: '0.5rem 0',
                      color: '#6b7280',
                      lineHeight: '1.5'
                    }}>
                      {result.content.substring(0, 150)}...
                    </p>
                    <div style={{
                      fontSize: '14px',
                      color: '#9ca3af',
                      marginTop: '0.5rem'
                    }}>
                      {result.url}
                    </div>
                  </div>
                ))}
              </div>
            ) : query ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#666'
              }}>
                <p>No results found for "{query}"</p>
                <p style={{ marginTop: '1rem' }}>Try different keywords or check your spelling.</p>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#666'
              }}>
                <p>Enter a search query above to search the book content.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Layout>
  );
};

export default SearchPage;