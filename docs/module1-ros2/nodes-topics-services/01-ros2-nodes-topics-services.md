---
title: ROS 2 Nodes, Topics, and Services
sidebar_position: 1
---

# ROS 2 Nodes, Topics, and Services

## Introduction

Robot Operating System 2 (ROS 2) is the next-generation framework for developing robotic applications. Unlike its predecessor, ROS 2 provides improved real-time capabilities, enhanced security, and better support for industrial applications. This chapter introduces the fundamental concepts of ROS 2 architecture: nodes, topics, and services, which form the backbone of robotic communication and coordination.

## Understanding ROS 2 Architecture

### Nodes

Nodes are the fundamental building blocks of ROS 2 applications. Each node is a process that performs computation, and multiple nodes work together to create complex robotic systems.

Key characteristics of nodes:
- **Modularity**: Each node performs a specific function
- **Communication**: Nodes communicate through topics, services, and actions
- **Lifecycle**: Nodes have defined lifecycle states (unconfigured, inactive, active, finalized)

```python
# Basic ROS 2 Node Structure
import rclpy
from rclpy.node import Node

class MinimalNode(Node):
    def __init__(self):
        super().__init__('minimal_node')
        self.get_logger().info('Minimal node created')

def main(args=None):
    rclpy.init(args=args)
    node = MinimalNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Topics and Publishers/Subscribers

Topics enable asynchronous, many-to-many communication between nodes using a publish-subscribe pattern. Publishers send messages to topics, while subscribers receive messages from topics.

```python
# Publisher Node Example
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class MinimalPublisher(Node):
    def __init__(self):
        super().__init__('minimal_publisher')
        self.publisher_ = self.create_publisher(String, 'topic', 10)
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = f'Hello World: {self.i}'
        self.publisher_.publish(msg)
        self.get_logger().info(f'Publishing: "{msg.data}"')
        self.i += 1

def main(args=None):
    rclpy.init(args=args)
    minimal_publisher = MinimalPublisher()
    rclpy.spin(minimal_publisher)
    minimal_publisher.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

```python
# Subscriber Node Example
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class MinimalSubscriber(Node):
    def __init__(self):
        super().__init__('minimal_subscriber')
        self.subscription = self.create_subscription(
            String,
            'topic',
            self.listener_callback,
            10)
        self.subscription  # prevent unused variable warning

    def listener_callback(self, msg):
        self.get_logger().info(f'I heard: "{msg.data}"')

def main(args=None):
    rclpy.init(args=args)
    minimal_subscriber = MinimalSubscriber()
    rclpy.spin(minimal_subscriber)
    minimal_subscriber.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Quality of Service (QoS) in ROS 2

QoS profiles allow fine-tuning of communication behavior to meet specific requirements:

```python
from rclpy.qos import QoSProfile, ReliabilityPolicy, DurabilityPolicy

# Example: Real-time critical data
qos_profile = QoSProfile(
    depth=10,
    reliability=ReliabilityPolicy.RELIABLE,
    durability=DurabilityPolicy.VOLATILE
)

publisher = node.create_publisher(String, 'critical_data', qos_profile)
```

### QoS Policies

| Policy | Options | Use Case |
|--------|---------|----------|
| Reliability | BEST_EFFORT, RELIABLE | Network reliability |
| Durability | VOLATILE, TRANSIENT_LOCAL | Message persistence |
| History | KEEP_LAST, KEEP_ALL | Message queue size |
| Deadline | Time-based | Message delivery timing |

## Services

Services provide synchronous, request-response communication between nodes. Unlike topics, services establish a direct connection between client and server.

```python
# Service Server Example
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class MinimalService(Node):
    def __init__(self):
        super().__init__('minimal_service')
        self.srv = self.create_service(AddTwoInts, 'add_two_ints', self.add_two_ints_callback)

    def add_two_ints_callback(self, request, response):
        response.sum = request.a + request.b
        self.get_logger().info(f'Incoming request\na: {request.a}, b: {request.b}')
        return response

def main(args=None):
    rclpy.init(args=args)
    minimal_service = MinimalService()
    rclpy.spin(minimal_service)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

```python
# Service Client Example
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class MinimalClient(Node):
    def __init__(self):
        super().__init__('minimal_client')
        self.cli = self.create_client(AddTwoInts, 'add_two_ints')
        while not self.cli.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Service not available, waiting again...')
        self.req = AddTwoInts.Request()

    def send_request(self, a, b):
        self.req.a = a
        self.req.b = b
        self.future = self.cli.call_async(self.req)
        rclpy.spin_until_future_complete(self, self.future)
        return self.future.result()

def main(args=None):
    rclpy.init(args=args)
    minimal_client = MinimalClient()
    response = minimal_client.send_request(1, 2)
    minimal_client.get_logger().info(f'Result of add_two_ints: {response.sum}')
    minimal_client.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Actions

Actions provide a more sophisticated communication pattern for long-running tasks with feedback and goal preemption capabilities.

```python
# Action Server Example
import rclpy
from rclpy.action import ActionServer
from rclpy.node import Node
from example_interfaces.action import Fibonacci

class FibonacciActionServer(Node):
    def __init__(self):
        super().__init__('fibonacci_action_server')
        self._action_server = ActionServer(
            self,
            Fibonacci,
            'fibonacci',
            self.execute_callback)

    def execute_callback(self, goal_handle):
        self.get_logger().info('Executing goal...')

        feedback_msg = Fibonacci.Feedback()
        feedback_msg.sequence = [0, 1]

        for i in range(1, goal_handle.request.order):
            if goal_handle.is_cancel_requested:
                goal_handle.canceled()
                self.get_logger().info('Goal canceled')
                return Fibonacci.Result()

            feedback_msg.sequence.append(
                feedback_msg.sequence[i] + feedback_msg.sequence[i-1])

            goal_handle.publish_feedback(feedback_msg)
            time.sleep(1)

        goal_handle.succeed()
        result = Fibonacci.Result()
        result.sequence = feedback_msg.sequence
        self.get_logger().info(f'Result: {result.sequence}')
        return result

def main(args=None):
    rclpy.init(args=args)
    fibonacci_action_server = FibonacciActionServer()
    rclpy.spin(fibonacci_action_server)
    fibonacci_action_server.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## ROS 2 Communication Architecture

### DDS Integration

ROS 2 uses Data Distribution Service (DDS) as its middleware, providing:

- **Discovery**: Automatic node discovery
- **Transport**: Reliable message delivery
- **Quality of Service**: Configurable communication behavior
- **Security**: Built-in security features

### Communication Patterns Summary

| Pattern | Type | Use Case | Example |
|---------|------|----------|---------|
| Topics | Publish-Subscribe | Sensor data, continuous streams | Camera images, laser scans |
| Services | Request-Response | One-time queries | Map requests, calibration |
| Actions | Goal-Feedback-Result | Long-running tasks | Navigation, manipulation |

## Practical Implementation Example

Here's a complete example combining nodes, topics, and services for a simple robotic application:

```python
# robot_controller.py
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from geometry_msgs.msg import Twist
from example_interfaces.srv import Trigger

class RobotController(Node):
    def __init__(self):
        super().__init__('robot_controller')

        # Publisher for robot velocity commands
        self.cmd_vel_publisher = self.create_publisher(Twist, 'cmd_vel', 10)

        # Subscriber for sensor data
        self.sensor_subscriber = self.create_subscription(
            String, 'sensor_data', self.sensor_callback, 10)

        # Service for emergency stop
        self.emergency_stop_service = self.create_service(
            Trigger, 'emergency_stop', self.emergency_stop_callback)

        # Timer for periodic control updates
        self.timer = self.create_timer(0.1, self.control_loop)

        self.get_logger().info('Robot controller initialized')

    def sensor_callback(self, msg):
        self.get_logger().info(f'Received sensor data: {msg.data}')
        # Process sensor data and update control state

    def emergency_stop_callback(self, request, response):
        self.get_logger().info('Emergency stop activated!')
        # Stop robot movement
        stop_msg = Twist()
        self.cmd_vel_publisher.publish(stop_msg)
        response.success = True
        response.message = 'Robot stopped'
        return response

    def control_loop(self):
        # Implement control logic here
        cmd_msg = Twist()
        cmd_msg.linear.x = 0.5  # Move forward at 0.5 m/s
        cmd_msg.angular.z = 0.0  # No rotation
        self.cmd_vel_publisher.publish(cmd_msg)

def main(args=None):
    rclpy.init(args=args)
    robot_controller = RobotController()
    rclpy.spin(robot_controller)
    robot_controller.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Node Lifecycle Management

ROS 2 provides a lifecycle for nodes to manage complex initialization, activation, and deactivation:

```python
from rclpy.lifecycle import LifecycleNode
from rclpy.lifecycle import TransitionCallbackReturn

class LifecycleController(LifecycleNode):
    def __init__(self):
        super().__init__('lifecycle_controller')
        self.get_logger().info('Lifecycle controller created')

    def on_configure(self, state):
        self.get_logger().info('Configuring lifecycle controller')
        return TransitionCallbackReturn.SUCCESS

    def on_activate(self, state):
        self.get_logger().info('Activating lifecycle controller')
        return TransitionCallbackReturn.SUCCESS

    def on_deactivate(self, state):
        self.get_logger().info('Deactivating lifecycle controller')
        return TransitionCallbackReturn.SUCCESS

    def on_cleanup(self, state):
        self.get_logger().info('Cleaning up lifecycle controller')
        return TransitionCallbackReturn.SUCCESS
```

## Parameter Management

ROS 2 provides a unified parameter system for configuration:

```python
class ParameterNode(Node):
    def __init__(self):
        super().__init__('parameter_node')

        # Declare parameters with default values
        self.declare_parameter('robot_name', 'my_robot')
        self.declare_parameter('max_velocity', 1.0)
        self.declare_parameter('safety_distance', 0.5)

        # Access parameters
        self.robot_name = self.get_parameter('robot_name').value
        self.max_velocity = self.get_parameter('max_velocity').value
        self.safety_distance = self.get_parameter('safety_distance').value

        # Callback for parameter changes
        self.add_on_set_parameters_callback(self.parameter_callback)

    def parameter_callback(self, params):
        for param in params:
            self.get_logger().info(f'Parameter {param.name} changed to {param.value}')
        return SetParametersResult(successful=True)
```

## Best Practices

### Design Principles

1. **Single Responsibility**: Each node should have a single, well-defined purpose
2. **Loose Coupling**: Minimize dependencies between nodes
3. **High Cohesion**: Group related functionality within nodes
4. **Appropriate Communication**: Choose the right communication pattern for the use case

### Performance Considerations

- Use appropriate QoS settings for your application requirements
- Minimize message size for high-frequency topics
- Implement proper error handling and recovery
- Use efficient data structures and algorithms

### Security Considerations

- Enable ROS 2 security features when deploying in production
- Use appropriate authentication and encryption
- Validate all incoming data from other nodes
- Implement proper access controls

## Troubleshooting Common Issues

### Topic Connection Issues

```bash
# Check active topics
ros2 topic list

# Check topic types
ros2 topic list -t

# Echo topic data
ros2 topic echo /topic_name std_msgs/msg/String
```

### Node Discovery Issues

```bash
# Check active nodes
ros2 node list

# Check node information
ros2 node info /node_name
```

### Service Communication Issues

```bash
# Check available services
ros2 service list

# Test service call
ros2 service call /service_name example_interfaces/srv/AddTwoInts "{a: 1, b: 2}"
```

## Summary

ROS 2 provides a robust framework for developing complex robotic applications through its node-based architecture and communication patterns. Understanding nodes, topics, services, and actions is fundamental to building effective robotic systems. The choice of communication pattern should align with the specific requirements of your application, considering factors like real-time constraints, reliability needs, and system architecture.

## Further Reading

- "Programming Robots with ROS" by Morgan Quigley, Brian Gerkey, and William Smart
- "Effective Robotics Programming with ROS" by Anil Mahtani, Luis Sánchez Crespo, and Enrique Fernandez
- ROS 2 Documentation: https://docs.ros.org/en/rolling/
