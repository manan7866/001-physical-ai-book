// src/theme/MDXContent/index.js
// Custom MDXContent theme component that adds personalization to documentation

import React from 'react';
import MDXContent from '@theme-original/MDXContent';
import PersonalizeButton from '../../components/PersonalizeButton';

export default function MDXContentWrapper(props) {
  return (
    <PersonalizeButton>
      <MDXContent {...props} />
    </PersonalizeButton>
  );
}