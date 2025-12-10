# Contribution Guidelines

## How to Contribute to the Physical AI & Humanoid Robotics Book

Thank you for your interest in improving this comprehensive guide to humanoid robotics! This document outlines the process for contributing to the book content and code examples.

### Code of Conduct

By participating in this project, you agree to abide by our community standards:
- Be respectful and inclusive
- Provide constructive feedback
- Focus on technical accuracy
- Maintain professional discourse

### Ways to Contribute

#### 1. Content Improvements
- Fix typos and grammatical errors
- Clarify explanations and examples
- Add missing information
- Improve code examples
- Update outdated content

#### 2. Technical Contributions
- Fix broken code examples
- Add new code samples
- Improve simulation configurations
- Enhance documentation with diagrams
- Add testing procedures

#### 3. Structural Enhancements
- Propose new chapters or sections
- Organize existing content better
- Add cross-references
- Improve navigation structure

### Getting Started

#### 1. Fork the Repository
1. Navigate to the Physical AI & Humanoid Robotics book repository
2. Click the "Fork" button in the top-right corner
3. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/humanoid-robotics-book.git
cd humanoid-robotics-book
```

#### 2. Set Up Your Environment
Follow the [Setup Guide](./setup-guide.md) to configure your development environment.

#### 3. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

Use descriptive branch names:
- `feature/add-advanced-control-chapter`
- `fix/typo-in-ros2-basics`
- `enhancement/improve-gazebo-section`

### Content Standards

#### 1. Writing Style
- Use clear, concise language
- Write in active voice when possible
- Define technical terms when first introduced
- Maintain consistent terminology
- Include practical examples with code

#### 2. Markdown Format
- Use proper heading hierarchy (#, ##, ###)
- Include alt text for images
- Use numbered lists for sequential steps
- Use bullet points for non-sequential items
- Format code blocks with appropriate language tags

#### 3. Code Examples
- Ensure all code compiles and runs
- Include comments explaining complex sections
- Follow ROS 2 and Python style guides
- Test code in the documented environment
- Include error handling where appropriate

### Documentation Structure

#### File Naming Convention
```
docs/moduleX-topic/subfolder/NN-short-descriptive-title.md
```

Where:
- `NN` is a two-digit number indicating order (01, 02, etc.)
- `short-descriptive-title` uses hyphens to separate words
- `subfolder` corresponds to the main topic area

#### Document Template
Each document should include:
- Clear title with H1 header
- Brief introduction explaining the document's purpose
- Main content with appropriate headings
- Practical examples and code snippets
- Summary or conclusion
- Links to related topics

### Development Workflow

#### 1. Make Changes
- Focus on a single topic per pull request
- Write clear, descriptive commit messages
- Follow the conventional commit format:
  ```
  feat: add new chapter on advanced control
  fix: correct typo in ROS2 services section
  docs: update installation instructions
  ```

#### 2. Test Your Changes
- Verify all code examples work as documented
- Check that links work correctly
- Ensure the documentation builds properly
- Test in the target environment

#### 3. Commit and Push
```bash
git add .
git commit -m "feat: add chapter on advanced humanoid control"
git push origin feature/your-feature-name
```

#### 4. Create Pull Request
- Navigate to the original repository
- Click "New Pull Request"
- Select your branch
- Fill out the PR template:
  - Describe the changes made
  - Explain the motivation
  - List any dependencies
  - Mention related issues

### Review Process

#### What We Look For
- Technical accuracy
- Clarity and readability
- Consistency with existing content
- Proper formatting and structure
- Working code examples

#### Review Timeline
- Initial response: Within 48 hours
- Review completion: Within 1 week
- Merge after approval: Within 2 days

#### Common Feedback Areas
- Technical accuracy verification
- Clarity improvements
- Formatting consistency
- Code example validation

### Reporting Issues

#### Bug Reports
Include:
- Environment details (OS, ROS version, etc.)
- Steps to reproduce
- Expected vs. actual behavior
- Relevant error messages

#### Feature Requests
Describe:
- The problem being solved
- Proposed solution
- Benefits to users
- Implementation approach (if known)

### Style Guide

#### Technical Terms
- Capitalize ROS, ROS 2, Gazebo, Isaac Sim consistently
- Use proper capitalization for software names
- Define acronyms when first used

#### Code Formatting
- Python: Follow PEP 8 guidelines
- C++: Follow ROS 2 style guide
- Use consistent indentation (4 spaces)
- Limit line length to 80 characters when possible

#### Images and Diagrams
- Use descriptive alt text
- Place images in appropriate folders
- Optimize file sizes
- Include captions when necessary

### Community

#### Questions
For questions about contributing:
- Open an issue in the repository
- Join our community forums (when available)
- Email the maintainers

#### Recognition
Contributors will be recognized in:
- Release notes
- Contributors list
- Acknowledgment sections

### Getting Help

If you need assistance:
1. Check existing documentation
2. Search past issues and PRs
3. Open a new issue with your question
4. Contact maintainers directly if needed

Thank you for contributing to the Physical AI & Humanoid Robotics book! Your efforts help improve this resource for the entire robotics community.