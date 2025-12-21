// src/theme/DocContent/index.js
// Custom DocContent theme component that adds personalization to documentation

import React from 'react';
import DocContent from '@theme-original/DocContent';
import PersonalizeButton from '../../components/PersonalizeButton';

export default function DocContentWrapper(props) {
  // Get the current document ID to use as a content key
  const { content: DocContentComponent } = props;
  const { metadata } = DocContentComponent;

  return (
    <>
      <PersonalizeButton contentKey={metadata?.id}>
        <DocContent {...props} />
      </PersonalizeButton>
    </>
  );
}