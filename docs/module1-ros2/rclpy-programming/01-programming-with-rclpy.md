---
title: Programming with rclpy
sidebar_position: 1
---

# Programming with rclpy

## Introduction

rclpy is the Python client library for ROS 2, providing a Pythonic interface to the ROS 2 middleware. It enables developers to create ROS 2 nodes, publish and subscribe to topics, provide and call services, and work with actions using Python. This chapter covers the fundamentals of rclpy programming, from basic node creation to advanced features like parameter management and lifecycle nodes.

## Getting Started with rclpy

### Basic Node Structure

Every ROS 2 Python node follows a standard structure:

```python
import rclpy
from rclpy.node import Node

class MyNode(Node):
    def __init__(self):
        # Initialize the node with a name
        super().__init__('my_node_name')
        self.get_logger().info('Node initialized')

def main(args=None):
    # Initialize ROS 2
    rclpy.init(args=args)

    # Create the node
    my_node = MyNode()

    # Keep the node running
    rclpy.spin(my_node)

    # Cleanup
    my_node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Setting Up Your Environment

Before writing rclpy nodes, ensure your ROS 2 environment is properly set up:

```bash
# Source the ROS 2 setup script
source /opt/ros/humble/setup.bash  # Replace 'humble' with your ROS 2 distribution

# Create a Python package
ros2 pkg create --build-type ament_python my_robot_package
```

## Publishers and Subscribers

### Creating Publishers

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class MinimalPublisher(Node):
    def __init__(self):
        super().__init__('minimal_publisher')

        # Create a publisher
        self.publisher_ = self.create_publisher(String, 'topic', 10)

        # Create a timer to publish messages periodically
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

### Creating Subscribers

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class MinimalSubscriber(Node):
    def __init__(self):
        super().__init__('minimal_subscriber')

        # Create a subscription
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

## Services

### Service Server

```python
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class MinimalService(Node):
    def __init__(self):
        super().__init__('minimal_service')

        # Create a service
        self.srv = self.create_service(
            AddTwoInts,
            'add_two_ints',
            self.add_two_ints_callback)

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

### Service Client

```python
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts
import sys

class MinimalClient(Node):
    def __init__(self):
        super().__init__('minimal_client')

        # Create a client
        self.cli = self.create_client(AddTwoInts, 'add_two_ints')

        # Wait for service to be available
        while not self.cli.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Service not available, waiting again...')

        self.req = AddTwoInts.Request()

    def send_request(self, a, b):
        self.req.a = a
        self.req.b = b
        self.future = self.cli.call_async(self.req)
        return self.future

def main(args=None):
    rclpy.init(args=args)
    minimal_client = MinimalClient()

    # Send request based on command line arguments
    if len(sys.argv) != 3:
        minimal_client.get_logger().info('Usage: ros2 run my_package client_member_function a b')
        sys.exit(1)

    future = minimal_client.send_request(int(sys.argv[1]), int(sys.argv[2]))

    # Wait for response
    rclpy.spin_until_future_complete(minimal_client, future)
    response = future.result()

    minimal_client.get_logger().info(f'Result of add_two_ints: {response.sum}')
    minimal_client.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Actions

### Action Server

```python
import rclpy
from rclpy.action import ActionServer
from rclpy.node import Node
from example_interfaces.action import Fibonacci
import time

class FibonacciActionServer(Node):
    def __init__(self):
        super().__init__('fibonacci_action_server')

        # Create an action server
        self._action_server = ActionServer(
            self,
            Fibonacci,
            'fibonacci',
            self.execute_callback)

    def execute_callback(self, goal_handle):
        self.get_logger().info('Executing goal...')

        # Initialize feedback
        feedback_msg = Fibonacci.Feedback()
        feedback_msg.sequence = [0, 1]

        # Execute the goal
        for i in range(1, goal_handle.request.order):
            # Check if the goal has been canceled
            if goal_handle.is_cancel_requested:
                goal_handle.canceled()
                self.get_logger().info('Goal canceled')
                return Fibonacci.Result()

            # Update feedback
            feedback_msg.sequence.append(
                feedback_msg.sequence[i] + feedback_msg.sequence[i-1])

            # Publish feedback
            goal_handle.publish_feedback(feedback_msg)
            time.sleep(1)

        # Complete the goal
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

### Action Client

```python
import rclpy
from rclpy.action import ActionClient
from rclpy.node import Node
from example_interfaces.action import Fibonacci

class FibonacciActionClient(Node):
    def __init__(self):
        super().__init__('fibonacci_action_client')

        # Create an action client
        self._action_client = ActionClient(
            self,
            Fibonacci,
            'fibonacci')

    def send_goal(self, order):
        # Wait for the action server to be available
        self._action_client.wait_for_server()

        # Create a goal
        goal_msg = Fibonacci.Goal()
        goal_msg.order = order

        # Send the goal
        self._send_goal_future = self._action_client.send_goal_async(
            goal_msg,
            feedback_callback=self.feedback_callback)

        self._send_goal_future.add_done_callback(self.goal_response_callback)

    def goal_response_callback(self, future):
        goal_handle = future.result()
        if not goal_handle.accepted:
            self.get_logger().info('Goal rejected')
            return

        self.get_logger().info('Goal accepted')

        self._get_result_future = goal_handle.get_result_async()
        self._get_result_future.add_done_callback(self.get_result_callback)

    def feedback_callback(self, feedback_msg):
        feedback = feedback_msg.feedback
        self.get_logger().info(f'Received feedback: {feedback.sequence}')

    def get_result_callback(self, future):
        result = future.result().result
        self.get_logger().info(f'Result: {result.sequence}')
        rclpy.shutdown()

def main(args=None):
    rclpy.init(args=args)
    action_client = FibonacciActionClient()

    # Send a goal
    action_client.send_goal(10)

    rclpy.spin(action_client)

if __name__ == '__main__':
    main()
```

## Parameter Management

### Declaring and Using Parameters

```python
import rclpy
from rclpy.node import Node
from rclpy.parameter import Parameter
from rclpy.qos import qos_profile_system_default

class ParameterNode(Node):
    def __init__(self):
        super().__init__('parameter_node')

        # Declare parameters with default values
        self.declare_parameter('robot_name', 'my_robot')
        self.declare_parameter('max_velocity', 1.0)
        self.declare_parameter('safety_distance', 0.5)
        self.declare_parameter('debug_mode', False)

        # Access parameter values
        self.robot_name = self.get_parameter('robot_name').value
        self.max_velocity = self.get_parameter('max_velocity').value
        self.safety_distance = self.get_parameter('safety_distance').value
        self.debug_mode = self.get_parameter('debug_mode').value

        self.get_logger().info(f'Robot name: {self.robot_name}')
        self.get_logger().info(f'Max velocity: {self.max_velocity}')

        # Add callback for parameter changes
        self.add_on_set_parameters_callback(self.parameter_callback)

    def parameter_callback(self, parameters):
        """Callback for parameter changes"""
        for param in parameters:
            self.get_logger().info(f'Parameter {param.name} changed to {param.value}')

            # Update local variables when parameters change
            if param.name == 'max_velocity':
                self.max_velocity = param.value
            elif param.name == 'safety_distance':
                self.safety_distance = param.value
            elif param.name == 'debug_mode':
                self.debug_mode = param.value

        return rclpy.node.SetParametersResult(successful=True)

def main(args=None):
    rclpy.init(args=args)
    param_node = ParameterNode()
    rclpy.spin(param_node)
    param_node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Quality of Service (QoS) Settings

### QoS Profiles

```python
from rclpy.qos import QoSProfile, ReliabilityPolicy, DurabilityPolicy, HistoryPolicy

class QoSNode(Node):
    def __init__(self):
        super().__init__('qos_node')

        # Create different QoS profiles for different use cases

        # Reliable profile for critical data
        reliable_qos = QoSProfile(
            depth=10,
            reliability=ReliabilityPolicy.RELIABLE,
            durability=DurabilityPolicy.VOLATILE,
            history=HistoryPolicy.KEEP_LAST
        )

        # Best effort profile for high-frequency data
        best_effort_qos = QoSProfile(
            depth=5,
            reliability=ReliabilityPolicy.BEST_EFFORT,
            durability=DurabilityPolicy.VOLATILE,
            history=HistoryPolicy.KEEP_LAST
        )

        # Create publishers with different QoS
        self.critical_pub = self.create_publisher(String, 'critical_data', reliable_qos)
        self.sensor_pub = self.create_publisher(String, 'sensor_data', best_effort_qos)

def main(args=None):
    rclpy.init(args=args)
    qos_node = QoSNode()
    rclpy.spin(qos_node)
    qos_node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Timers and Callbacks

### Using Timers

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import Float64

class TimerNode(Node):
    def __init__(self):
        super().__init__('timer_node')

        # Create a publisher
        self.publisher = self.create_publisher(Float64, 'timer_data', 10)

        # Create a timer that calls the callback every 0.1 seconds
        self.timer = self.create_timer(0.1, self.timer_callback)
        self.count = 0

    def timer_callback(self):
        msg = Float64()
        msg.data = float(self.count)
        self.publisher.publish(msg)
        self.count += 1
        self.get_logger().info(f'Published: {msg.data}')

def main(args=None):
    rclpy.init(args=args)
    timer_node = TimerNode()
    rclpy.spin(timer_node)
    timer_node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Lifecycle Nodes

### Creating Lifecycle Nodes

```python
import rclpy
from rclpy.lifecycle import LifecycleNode
from rclpy.lifecycle import TransitionCallbackReturn
from rclpy.qos import qos_profile_system_default

class LifecycleTestNode(LifecycleNode):
    def __init__(self):
        super().__init__('lifecycle_test_node')
        self.get_logger().info('Lifecycle node created')

    def on_configure(self, state):
        """Called when the node is configured"""
        self.get_logger().info('Configuring lifecycle node')

        # Create publishers, subscribers, services, etc. here
        self.pub = self.create_publisher(String, 'lifecycle_chatter', qos_profile_system_default)
        self.timer = self.create_timer(1.0, self.timer_callback)

        return TransitionCallbackReturn.SUCCESS

    def on_activate(self, state):
        """Called when the node is activated"""
        self.get_logger().info('Activating lifecycle node')

        # Activate publishers and timers
        self.pub.activate()
        self.timer.reset()

        return TransitionCallbackReturn.SUCCESS

    def on_deactivate(self, state):
        """Called when the node is deactivated"""
        self.get_logger().info('Deactivating lifecycle node')

        # Deactivate publishers and timers
        self.pub.deactivate()
        self.timer.cancel()

        return TransitionCallbackReturn.SUCCESS

    def on_cleanup(self, state):
        """Called when the node is cleaned up"""
        self.get_logger().info('Cleaning up lifecycle node')

        # Destroy publishers, subscribers, services, etc. here
        self.destroy_publisher(self.pub)
        self.destroy_timer(self.timer)

        return TransitionCallbackReturn.SUCCESS

    def timer_callback(self):
        msg = String()
        msg.data = 'Lifecycle node is active'
        self.pub.publish(msg)

def main(args=None):
    rclpy.init(args=args)
    lifecycle_node = LifecycleTestNode()
    rclpy.spin(lifecycle_node)
    lifecycle_node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Advanced Topics

### Custom Message Types

First, create a custom message file (e.g., `MyCustomMessage.msg`):
```
# CustomRobot.msg
string robot_name
float64[] joint_positions
int32 robot_id
bool is_active
```

Then use it in your node:
```python
from my_robot_msgs.msg import MyCustomMessage  # Assuming you have a custom message package

class CustomMessageNode(Node):
    def __init__(self):
        super().__init__('custom_message_node')
        self.publisher = self.create_publisher(MyCustomMessage, 'custom_topic', 10)

    def publish_custom_message(self, name, positions, robot_id, active):
        msg = MyCustomMessage()
        msg.robot_name = name
        msg.joint_positions = positions
        msg.robot_id = robot_id
        msg.is_active = active
        self.publisher.publish(msg)
```

### TF2 Transformations

```python
import rclpy
from rclpy.node import Node
from tf2_ros import TransformBroadcaster
from geometry_msgs.msg import TransformStamped

class TransformNode(Node):
    def __init__(self):
        super().__init__('transform_node')

        # Create transform broadcaster
        self.tf_broadcaster = TransformBroadcaster(self)

        # Create a timer to broadcast transforms
        self.timer = self.create_timer(0.1, self.broadcast_transform)

    def broadcast_transform(self):
        t = TransformStamped()

        # Read message contents
        t.header.stamp = self.get_clock().now().to_msg()
        t.header.frame_id = 'world'
        t.child_frame_id = 'robot_base'

        # Define transform (x, y, z, qx, qy, qz, qw)
        t.transform.translation.x = 0.0
        t.transform.translation.y = 0.0
        t.transform.translation.z = 0.0
        t.transform.rotation.x = 0.0
        t.transform.rotation.y = 0.0
        t.transform.rotation.z = 0.0
        t.transform.rotation.w = 1.0

        # Send the transformation
        self.tf_broadcaster.sendTransform(t)

def main(args=None):
    rclpy.init(args=args)
    transform_node = TransformNode()
    rclpy.spin(transform_node)
    transform_node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Error Handling and Best Practices

### Exception Handling

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
import traceback

class RobustNode(Node):
    def __init__(self):
        super().__init__('robust_node')
        self.publisher = self.create_publisher(String, 'robust_topic', 10)
        self.timer = self.create_timer(0.1, self.robust_timer_callback)

    def robust_timer_callback(self):
        try:
            # Your processing logic here
            msg = String()
            msg.data = 'Processing data safely'
            self.publisher.publish(msg)
        except Exception as e:
            self.get_logger().error(f'Error in timer callback: {e}')
            self.get_logger().error(f'Traceback: {traceback.format_exc()}')
            # Handle the error appropriately

def main(args=None):
    rclpy.init(args=args)
    robust_node = RobustNode()
    rclpy.spin(robust_node)
    robust_node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Resource Management

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class ResourceManagedNode(Node):
    def __init__(self):
        super().__init__('resource_managed_node')

        # Initialize resources
        self.publisher = self.create_publisher(String, 'resource_topic', 10)
        self.subscriber = self.create_subscription(
            String, 'input_topic', self.input_callback, 10)
        self.timer = self.create_timer(1.0, self.process_data)

        # Resource management variables
        self.data_buffer = []
        self.max_buffer_size = 100

    def input_callback(self, msg):
        # Manage buffer size
        if len(self.data_buffer) >= self.max_buffer_size:
            self.data_buffer.pop(0)  # Remove oldest item
        self.data_buffer.append(msg.data)

    def process_data(self):
        if self.data_buffer:
            # Process data from buffer
            latest_data = self.data_buffer[-1]
            processed_msg = String()
            processed_msg.data = f'Processed: {latest_data}'
            self.publisher.publish(processed_msg)

    def destroy_node(self):
        # Clean up resources
        if hasattr(self, 'timer') and self.timer is not None:
            self.timer.destroy()
        if hasattr(self, 'publisher') and self.publisher is not None:
            self.publisher.destroy()
        if hasattr(self, 'subscriber') and self.subscriber is not None:
            self.subscriber.destroy()

        super().destroy_node()

def main(args=None):
    rclpy.init(args=args)
    resource_node = ResourceManagedNode()
    rclpy.spin(resource_node)
    resource_node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Debugging and Testing

### Logging Best Practices

```python
import rclpy
from rclpy.node import Node

class LoggingNode(Node):
    def __init__(self):
        super().__init__('logging_node')

        # Use different log levels appropriately
        self.get_logger().debug('Debug information for developers')
        self.get_logger().info('Normal operation information')
        self.get_logger().warn('Warning about potential issues')
        self.get_logger().error('Error that needs attention')
        self.get_logger().fatal('Fatal error that stops execution')

        self.timer = self.create_timer(1.0, self.detailed_logging)

    def detailed_logging(self):
        # Include relevant information in logs
        count = getattr(self, 'count', 0)
        self.get_logger().info(f'Processing cycle {count}', throttle_duration_sec=1.0)
        self.count = count + 1

def main(args=None):
    rclpy.init(args=args)
    logging_node = LoggingNode()
    rclpy.spin(logging_node)
    logging_node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Package Structure and Setup

### setup.py for Python Packages

```python
from setuptools import setup
import os
from glob import glob

package_name = 'my_robot_package'

setup(
    name=package_name,
    version='0.0.0',
    packages=[package_name],
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
        # Include launch files
        (os.path.join('share', package_name, 'launch'), glob('launch/*.py')),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='Your Name',
    maintainer_email='your.email@example.com',
    description='A simple robot package',
    license='Apache License 2.0',
    tests_require=['pytest'],
    entry_points={
        'console_scripts': [
            'my_node = my_robot_package.my_node:main',
            'another_node = my_robot_package.another_node:main',
        ],
    },
)
```

## Summary

rclpy provides a comprehensive Python interface to ROS 2 functionality, enabling the creation of sophisticated robotic applications. From basic publishing and subscribing to advanced features like actions, parameters, and lifecycle management, rclpy offers the tools needed to build robust robotic systems. Understanding these concepts is crucial for developing humanoid robots and other complex robotic applications that require sophisticated control and coordination.

## Further Reading

- ROS 2 Python Developer Guide: https://docs.ros.org/en/rolling/Tutorials/Beginner-Client-Libraries/Writing-A-Simple-Py-Node.html
- rclpy API Documentation: https://docs.ros2.org/latest/api/rclpy/
- "Programming Robots with ROS" by Quigley, Gerkey, and Smart
