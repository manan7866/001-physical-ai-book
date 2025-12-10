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
      label: 'Introduction',
      items: [
        {
          type: 'doc',
          id: 'introduction/index',
          label: 'Introduction Overview'
        },
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
      label: 'Module 1: ROS 2',
      items: [
        {
          type: 'doc',
          id: 'module1-ros2/index',
          label: 'Module 1 Overview'
        },
        {
          type: 'doc',
          id: 'module1-ros2/nodes-topics-services/ros2-nodes-topics-services',
          label: 'ROS 2 Nodes, Topics, and Services'
        },
        {
          type: 'doc',
          id: 'module1-ros2/urdf-modeling/urdf-modeling',
          label: 'URDF Modeling and Robot Description'
        },
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
      label: 'Module 2: Digital Twin',
      items: [
        {
          type: 'doc',
          id: 'module2-digital-twin/index',
          label: 'Module 2 Overview'
        },
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
        },
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
      label: 'Module 3: Isaac AI Platform',
      items: [
        {
          type: 'doc',
          id: 'module3-isaac/index',
          label: 'Module 3 Overview'
        },
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
        },
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
      label: 'Module 4: Vision-Language-Action (VLA)',
      items: [
        {
          type: 'doc',
          id: 'module4-vla/index',
          label: 'Module 4 Overview'
        },
        {
          type: 'doc',
          id: 'module4-vla/vision-language-models/vision-language-models-robotics',
          label: 'Vision-Language Models for Robotics'
        },
        {
          type: 'doc',
          id: 'module4-vla/vision-language-models/practical-vla-implementation',
          label: 'Practical VLA Implementation'
        },
        {
          type: 'doc',
          id: 'module4-vla/action-planning/action-planning',
          label: 'Action Planning'
        },
        {
          type: 'doc',
          id: 'module4-vla/conversational-robotics/conversational-robotics',
          label: 'Conversational Robotics'
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
      label: 'Capstone Project',
      items: [
        {
          type: 'doc',
          id: 'capstone/index',
          label: 'Capstone Overview'
        },
        {
          type: 'doc',
          id: 'capstone/project-specification/capstone-project-specification',
          label: 'Capstone Project Specification (01)'
        },
        {
          type: 'doc',
          id: 'capstone/project-specification/capstone-specification-framework',
          label: 'Project Specification Framework (02)'
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
      type: 'category',
      label: 'Hardware & Infrastructure',
      items: [
        {
          type: 'doc',
          id: 'hardware/index',
          label: 'Hardware Overview'
        },
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
      id: 'glossary/glossary',
      label: 'Glossary of Terms'
    },
    {
      type: 'doc',
      id: 'templates/chapter-template',
      label: 'Chapter Template'
    }
  ],
};

module.exports = sidebars;