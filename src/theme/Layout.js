import React from 'react';
import OriginalLayout from '@theme-original/Layout';
import RAGChatbot from '../components/RAGChatbot/RAGChatbot';
import GlobalSearch from '../components/SearchBar/GlobalSearch';

export default function Layout(props) {
  return (
    <>
      <OriginalLayout {...props} />
      <RAGChatbot />
      <GlobalSearch />
    </>
  );
}