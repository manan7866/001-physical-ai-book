---
title: Content Personalization Demo
sidebar_position: 999
---

# Content Personalization Demo

This page demonstrates the advanced personalization features available to logged-in users.

## How It Works

When you're logged in, you'll see a personalization button at the top of each chapter. Click it to adapt the content to your skill level and preferences.

import PersonalizeContent from '../src/components/MDX/PersonalizeContent';

<PersonalizeContent>

## Example Technical Content

The Robot Operating System (ROS) is a flexible framework for writing robot software. It's a collection of tools, libraries, and conventions that aim to simplify the task of creating complex and robust robot behavior across a wide variety of robot platforms.

ROS provides hardware abstraction, device drivers, libraries, visualizers, message-passing, package management, and more. ROS is released under the BSD license, a permissive free software license.

### Key Concepts

- **Nodes**: A node is an executable that uses ROS to communicate with other nodes.
- **Messages**: ROS data type used when subscribing or publishing to a topic.
- **Topics**: Nodes can publish messages to a topic as well as subscribe to a topic to receive messages.
- **Services**: ROS services provide a request/reply communication pattern.
- **Parameters**: Values stored on the parameter server.

### Advanced Features

The Navigation Stack provides a complete system for taking a ROS-enabled robot from a state of knowing only its own position to moving around in the world without colliding with obstacles. The stack provides a map server, global and local planners, and the AMCL localization package for tracking the robot's location.

The Perception Stack provides packages for sensing the world around the robot, including stereo vision, laser processing, point clouds, and calibration. These packages provide the foundation for higher-level capabilities like mapping and navigation.

</PersonalizeContent>

## Benefits

- **Adaptive Complexity**: Content adjusts based on your technical level
- **Preferred Style**: Matches your preferred explanation style
- **Language Support**: Available in your preferred language
- **ROS Experience**: Tailored to your ROS background

Sign in to see the personalization in action!