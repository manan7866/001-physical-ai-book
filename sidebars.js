// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'Physical AI & Humanoid Robotics'
    },
    {
      type: 'doc',
      id: 'getting-started',
      label: 'Getting Started'
    },
    {
      type: 'doc',
      id: 'course-schedule',
      label: 'Course Schedule (12 Weeks)'
    },
    {
      type: 'doc',
      id: 'preface',
      label: 'Preface'
    },
    {
      type: 'doc',
      id: 'toc',
      label: 'Table of Contents'
    },
    {
      type: 'doc',
      id: 'setup-guide',
      label: 'Setup Guide'
    },
    {
      type: 'category',
      label: 'Week 1: Foundations of Physical AI',
      items: [
        {
          type: 'doc',
          id: 'introduction/foundations/foundations-of-physical-ai',
          label: 'Foundations of Physical AI'
        },
        {
          type: 'doc',
          id: 'introduction/foundations/physical-ai-concepts',
          label: 'Physical AI Concepts'
        },
        {
          type: 'doc',
          id: 'introduction/foundations/ai-robotics-integration',
          label: 'AI-Robotics Integration'
        }
      ]
    },
    {
      type: 'category',
      label: 'Week 2: ROS 2 Fundamentals - Part 1',
      items: [
        {
          type: 'doc',
          id: 'module1-ros2/nodes-topics-services/ros2-nodes-topics-services',
          label: 'ROS 2 Nodes, Topics, and Services'
        },
        {
          type: 'doc',
          id: 'module1-ros2/urdf-modeling/urdf-modeling',
          label: 'URDF Modeling and Robot Description'
        }
      ]
    },
    {
      type: 'category',
      label: 'Week 3: ROS 2 Development - Part 2',
      items: [
        {
          type: 'doc',
          id: 'module1-ros2/rclpy-programming/programming-with-rclpy',
          label: 'Programming with rclpy'
        },
        {
          type: 'doc',
          id: 'module1-ros2/actions-workflows/actions-advanced-workflows',
          label: 'Actions and Advanced Workflows'
        }
      ]
    },
    {
      type: 'category',
      label: 'Week 4: Digital Twin Concepts & Simulation Fundamentals',
      items: [
        {
          type: 'doc',
          id: 'module2-digital-twin/digital-twin-concepts/digital-twin-concepts',
          label: 'Digital Twin Concepts'
        },
        {
          type: 'doc',
          id: 'module2-digital-twin/gazebo-simulation/gazebo-simulation-fundamentals',
          label: 'Gazebo Simulation Fundamentals'
        },
        {
          type: 'doc',
          id: 'module2-digital-twin/gazebo-simulation/advanced-gazebo-features',
          label: 'Advanced Gazebo Features'
        }
      ]
    },
    {
      type: 'category',
      label: 'Week 5: Physics Engines & Unity Integration',
      items: [
        {
          type: 'doc',
          id: 'module2-digital-twin/physics-engines/physics-engines',
          label: 'Physics Engines'
        },
        {
          type: 'doc',
          id: 'module2-digital-twin/unity-integration/unity-integration',
          label: 'Unity Integration'
        }
      ]
    },
    {
      type: 'category',
      label: 'Week 6: Isaac AI Platform Introduction',
      items: [
        {
          type: 'doc',
          id: 'module3-isaac/isaac-ros/isaac-ros',
          label: 'Isaac ROS'
        },
        {
          type: 'doc',
          id: 'module3-isaac/isaac-sim/isaac-sim-fundamentals',
          label: 'Isaac Sim Fundamentals'
        },
        {
          type: 'doc',
          id: 'module3-isaac/isaac-sim/advanced-isaac-sim-features',
          label: 'Advanced Isaac Sim Features'
        }
      ]
    },
    {
      type: 'category',
      label: 'Week 7: Perception Systems & VSLAM Navigation',
      items: [
        {
          type: 'doc',
          id: 'module3-isaac/perception-systems/perception-systems',
          label: 'Perception Systems'
        },
        {
          type: 'doc',
          id: 'module3-isaac/vslam-navigation/vslam-navigation',
          label: 'VSLAM Navigation'
        }
      ]
    },
    {
      type: 'category',
      label: 'Week 8: Vision-Language Models for Robotics',
      items: [
        {
          type: 'doc',
          id: 'module4-vla/vision-language-models/vision-language-models-robotics',
          label: 'Vision-Language Models for Robotics'
        },
        {
          type: 'doc',
          id: 'module4-vla/vision-language-models/practical-vla-implementation',
          label: 'Practical VLA Implementation'
        }
      ]
    },
    {
      type: 'category',
      label: 'Week 9: Action Planning & Multimodal Integration',
      items: [
        {
          type: 'doc',
          id: 'module4-vla/action-planning/action-planning',
          label: 'Action Planning'
        },
        {
          type: 'doc',
          id: 'module4-vla/multimodal-integration/multimodal-integration',
          label: 'Multimodal Integration'
        }
      ]
    },
    {
      type: 'category',
      label: 'Week 10: Conversational Robotics',
      items: [
        {
          type: 'doc',
          id: 'module4-vla/conversational-robotics/conversational-robotics',
          label: 'Conversational Robotics'
        }
      ]
    },
    {
      type: 'category',
      label: 'Week 11: Hardware & Infrastructure',
      items: [
        {
          type: 'doc',
          id: 'hardware/workstation-specifications/workstation-specifications',
          label: 'Workstation Specifications'
        },
        {
          type: 'doc',
          id: 'hardware/cloud-lab-setup/cloud-lab-setup',
          label: 'Cloud Lab Setup'
        },
        {
          type: 'doc',
          id: 'hardware/embedded-systems/embedded-systems',
          label: 'Embedded Systems'
        },
        {
          type: 'doc',
          id: 'hardware/sensors-platforms/sensors-platforms',
          label: 'Sensors and Platforms'
        }
      ]
    },
    {
      type: 'category',
      label: 'Week 12: Capstone Project',
      items: [
        {
          type: 'doc',
          id: 'capstone/project-specification/capstone-project-specification',
          label: 'Capstone Project Specification'
        },
        {
          type: 'doc',
          id: 'capstone/project-specification/capstone-specification-framework',
          label: 'Project Specification Framework'
        },
        {
          type: 'doc',
          id: 'capstone/implementation-guide/implementation-guide',
          label: 'Implementation Guide'
        },
        {
          type: 'doc',
          id: 'capstone/evaluation-criteria/evaluation-criteria',
          label: 'Evaluation Criteria'
        },
        {
          type: 'doc',
          id: 'capstone/deployment-strategies/deployment-strategies',
          label: 'Deployment Strategies'
        }
      ]
    },
    {
      type: 'doc',
      id: 'contributing',
      label: 'Contribution Guidelines'
    },
    {
      type: 'doc',
      id: 'faq',
      label: 'Frequently Asked Questions'
    },
    {
      type: 'doc',
      id: 'troubleshooting',
      label: 'Troubleshooting Guide'
    },
    {
      type: 'doc',
      id: 'personalization-demo',
      label: 'Content Personalization Demo'
    },
    {
      type: 'doc',
      id: 'glossary/glossary',
      label: 'Glossary of Terms'
    },
    {
      type: 'doc',
      id: 'templates/chapter-template',
      label: 'Chapter Template'
    },
    {
      type: 'category',
      label: 'Resources',
      items: [
        {
          type: 'doc',
          id: 'examples/index',
          label: 'Code Examples'
        },
        {
          type: 'doc',
          id: 'tutorials/index',
          label: 'Video Tutorials'
        },
        {
          type: 'doc',
          id: 'community/index',
          label: 'Community Forum'
        }
      ]
    },
    {
      type: 'category',
      label: 'Demos & Simulations',
      items: [
        {
          type: 'doc',
          id: 'demos/walking-simulation',
          label: 'Walking Gait Control'
        },
        {
          type: 'doc',
          id: 'demos/manipulation',
          label: 'Object Manipulation'
        },
        {
          type: 'doc',
          id: 'demos/hri',
          label: 'Human-Robot Interaction'
        }
      ]
    }
  ],
};

module.exports = sidebars;