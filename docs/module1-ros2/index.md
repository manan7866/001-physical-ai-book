---
sidebar_position: 3
title: ROS2 Fundamentals
---

# ROS2 Fundamentals for Humanoid Robotics

This module introduces the Robot Operating System 2 (ROS2), a flexible framework for writing robot software. ROS2 provides libraries and tools to help software developers create robot applications, making it essential for humanoid robotics development.

## Overview

ROS2 (Robot Operating System 2) is a collection of software libraries and tools that help you build robot applications. It provides hardware abstraction, device drivers, libraries, visualizers, message-passing, package management, and more.

In the context of humanoid robotics, ROS2 serves as the communication backbone that allows different components of the robot to work together seamlessly.

## Learning Objectives

By the end of this module, you will:

- Understand the core concepts and architecture of ROS2
- Learn how to create and manage ROS2 packages
- Master the communication patterns used in ROS2 (topics, services, actions)
- Understand how ROS2 is applied specifically to humanoid robotics
- Know how to debug and monitor ROS2 systems
- Be familiar with ROS2 tools for visualization and analysis

## Key Concepts

### Nodes
Nodes are processes that perform computation. In a humanoid robot, nodes might include:
- Perception nodes (processing sensor data)
- Control nodes (managing joint movements)
- Planning nodes (path planning and motion planning)
- Behavior nodes (higher-level decision making)

### Topics
Topics are used for one-way communication between nodes using a publish/subscribe model. Common topics in humanoid robots include:
- Sensor data streams (IMU, cameras, LIDAR)
- Joint states and commands
- Robot state information

### Services
Services provide a request/reply communication pattern. Common services include:
- Robot calibration
- Parameter configuration
- Emergency stop commands

### Actions
Actions are used for long-running tasks with feedback and goal management, such as:
- Navigation goals
- Complex manipulation tasks
- Walking pattern generation

## ROS2 in Humanoid Robotics

ROS2 is particularly well-suited for humanoid robotics due to:

- **Modularity**: Different aspects of humanoid control can be separated into different nodes
- **Flexibility**: Easy to swap out components and test different algorithms
- **Community**: Large community and existing packages for common humanoid robotics tasks
- **Simulation**: Excellent integration with simulation environments like Gazebo

## Architecture

ROS2 uses a DDS (Data Distribution Service) based architecture that provides:

- **Decentralized communication**: No central master as in ROS1
- **Real-time capabilities**: Better support for real-time systems
- **Security**: Built-in security features for sensitive applications
- **Cross-platform**: Runs on various operating systems and hardware platforms

## Essential Tools

### Command Line Tools
- `ros2 run`: Run a node
- `ros2 launch`: Launch multiple nodes at once
- `ros2 topic`: Interact with topics
- `ros2 service`: Interact with services
- `ros2 action`: Interact with actions
- `ros2 param`: Manage parameters

### Visualization Tools
- RViz2: 3D visualization tool for robot data
- rqt: Graphical user interface toolkit
- PlotJuggler: Time series data visualization

## Package Structure

A typical ROS2 package for humanoid robotics includes:

```
robot_name/
├── CMakeLists.txt
├── package.xml
├── launch/
│   ├── robot.launch.py
│   └── simulation.launch.py
├── config/
│   ├── controllers.yaml
│   └── robot_params.yaml
├── src/
│   ├── controllers/
│   ├── perception/
│   └── behaviors/
├── include/
└── test/
```

## Common ROS2 Packages for Humanoid Robotics

- **ros2_control**: Hardware abstraction and controller interface
- **moveit2**: Motion planning framework
- **navigation2**: Navigation stack
- **robot_state_publisher**: Publishes robot state information
- **joint_state_publisher**: Publishes joint state information

## Next Steps

After mastering these fundamentals, explore:

- [Programming with RCLPY](./rclpy-programming/01-programming-with-rclpy.md)
- [URDF Modeling](./urdf-modeling/01-urdf-modeling.md)
- [Nodes, Topics and Services](./nodes-topics-services/01-ros2-nodes-topics-services.md)
- [Actions and Advanced Workflows](./actions-workflows/01-actions-advanced-workflows.md)